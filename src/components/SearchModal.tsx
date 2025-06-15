import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileData, FolderData } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Folder, FolderPlus } from "lucide-react";
import { GroupedSearchResultCard } from "./GroupedSearchResultCard";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSaveFile: (fileData: FileData) => void;
}

interface GroupedResult {
  title: string;
  language: string;
  format: string;
  files: FileData[];
}

export const SearchModal = ({ open, onClose, onSaveFile }: SearchModalProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterClassLevel, setFilterClassLevel] = useState("all");
  const [filterTags, setFilterTags] = useState("");
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([]);
  const [folderResults, setFolderResults] = useState<(FolderData & { fileCount: number })[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPublicMaterials = async () => {
    // Don't search if no criteria are provided
    if (!searchTerm && filterFormat === "all" && filterLanguage === "all" && filterDifficulty === "all" && filterClassLevel === "all" && !filterTags) {
      toast({
        title: "Søgekriterie påkrævet",
        description: "Indtast mindst ét søgekriterie for at søge",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Search for materials
      let query = supabase
        .from('materials')
        .select('*')
        .eq('is_public', true);

      // Apply search term filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
      }

      // Apply format filter
      if (filterFormat && filterFormat !== "all") {
        query = query.eq('format', filterFormat);
      }

      // Apply language filter  
      if (filterLanguage && filterLanguage !== "all") {
        query = query.eq('language', filterLanguage);
      }

      // Apply difficulty filter
      if (filterDifficulty && filterDifficulty !== "all") {
        query = query.eq('difficulty', filterDifficulty);
      }

      // Apply class level filter
      if (filterClassLevel && filterClassLevel !== "all") {
        query = query.eq('class_level', filterClassLevel);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public materials:', error);
        toast({
          title: "Fejl",
          description: "Kunne ikke hente offentlige materialer",
          variant: "destructive"
        });
        return;
      }

      // Filter by tags if specified
      let filteredResults = data || [];
      if (filterTags) {
        const tagSearchTerms = filterTags.toLowerCase().split(',').map(tag => tag.trim());
        filteredResults = filteredResults.filter(material => 
          material.tags && material.tags.some(tag => 
            tagSearchTerms.some(searchTag => 
              tag.toLowerCase().includes(searchTag)
            )
          )
        );
      }

      // Convert and Group database materials
      const grouped = (filteredResults || []).reduce((acc, material) => {
        const key = `${material.title}-${material.language}-${material.format}`;
        if (!acc[key]) {
            acc[key] = {
                title: material.title,
                language: material.language,
                format: material.format,
                files: [],
            };
        }
        acc[key].files.push({
            id: material.id,
            title: material.title,
            author: material.author,
            source: material.source,
            format: material.format,
            genre: material.genre,
            language: material.language,
            difficulty: material.difficulty,
            classLevel: material.class_level,
            tags: material.tags || [],
            isPublic: material.is_public,
            fileUrl: material.file_url,
            folderId: material.folder_id,
            createdAt: new Date(material.created_at),
            downloadCount: material.download_count || 0,
        });
        return acc;
      }, {} as Record<string, GroupedResult>);
      
      setGroupedResults(Object.values(grouped));

      // Search for folders if search term is provided
      if (searchTerm) {
        // First, get folders that match the search term
        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('*')
          .ilike('name', `%${searchTerm}%`);

        if (foldersError) {
          console.error('Error fetching folders:', foldersError);
        } else if (foldersData) {
          // For each folder, count how many public files it contains
          const foldersWithCounts = await Promise.all(
            foldersData.map(async (folder) => {
              const { count, error: countError } = await supabase
                .from('materials')
                .select('*', { count: 'exact', head: true })
                .eq('folder_id', folder.id)
                .eq('is_public', true);

              if (countError) {
                console.error('Error counting files for folder:', folder.id, countError);
                return null;
              }

              return {
                id: folder.id,
                name: folder.name,
                createdAt: new Date(folder.created_at),
                color: folder.color,
                fileCount: count || 0
              };
            })
          );

          // Filter out null results and folders with no public files
          const validFolders = foldersWithCounts
            .filter((folder): folder is FolderData & { fileCount: number } => 
              folder !== null && folder.fileCount > 0
            );

          setFolderResults(validFolders);
        }
      } else {
        setFolderResults([]);
      }
    } catch (error) {
      console.error('Error in fetchPublicMaterials:', error);
      toast({
        title: "Fejl",
        description: "Der opstod en fejl ved søgning",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setHasSearched(true);
    fetchPublicMaterials();
  };

  const handleSaveMaterial = (material: FileData) => {
    // Create a copy with new ID for user's collection and make it private
    const newMaterial = {
      ...material,
      id: Date.now().toString(),
      folderId: undefined, // Save to desktop by default
      isPublic: false, // Make saved materials private by default
    };
    onSaveFile(newMaterial);
    toast({
      title: "Materiale gemt",
      description: `"${material.title}" er blevet gemt til dine materialer som privat`
    });
  };

  const handleSaveFolder = async (folder: FolderData & { fileCount: number }) => {
    try {
      // Get all public files from this folder
      const { data: folderFiles, error } = await supabase
        .from('materials')
        .select('*')
        .eq('folder_id', folder.id)
        .eq('is_public', true);

      if (error) throw error;

      // Save all files from the folder
      for (const file of folderFiles || []) {
        const newMaterial: FileData = {
          id: `${Date.now()}-${Math.random()}`,
          title: file.title,
          author: file.author,
          source: file.source,
          format: file.format,
          genre: file.genre,
          language: file.language,
          difficulty: file.difficulty,
          classLevel: file.class_level,
          tags: file.tags || [],
          isPublic: false, // Make saved materials private
          fileUrl: file.file_url,
          folderId: undefined, // Save to desktop by default
          createdAt: new Date(file.created_at),
          downloadCount: file.download_count || 0,
        };
        onSaveFile(newMaterial);
      }

      toast({
        title: "Mappe gemt",
        description: `Alle ${folderFiles?.length || 0} filer fra "${folder.name}" er blevet gemt til dine materialer`
      });
    } catch (error) {
      console.error('Error saving folder:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke gemme mappen",
        variant: "destructive"
      });
    }
  };

  // Reset search when modal closes
  const handleClose = () => {
    setSearchTerm("");
    setFilterFormat("all");
    setFilterLanguage("all");
    setFilterDifficulty("all");
    setFilterClassLevel("all");
    setFilterTags("");
    setGroupedResults([]);
    setFolderResults([]);
    setHasSearched(false);
    onClose();
  };

  const totalMaterials = groupedResults.reduce((sum, group) => sum + group.files.length, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Søg i offentlige undervisningsmaterialer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Form */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <Label htmlFor="search">Søg efter titel, forfatter eller mappenavn</Label>
              <Input
                id="search"
                placeholder="f.eks. grammatik, dansk, matematik, eventyr..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div>
              <Label htmlFor="tags">Søg efter tags (adskil med komma)</Label>
              <Input
                id="tags"
                placeholder="f.eks. grammatik, romantik, algebra..."
                value={filterTags}
                onChange={(e) => setFilterTags(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="format-filter">Format</Label>
                <Select value={filterFormat} onValueChange={setFilterFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle formater" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle formater</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="word">Word</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language-filter">Sprog</Label>
                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle sprog" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle sprog</SelectItem>
                    <SelectItem value="dansk">Dansk</SelectItem>
                    <SelectItem value="engelsk">Engelsk</SelectItem>
                    <SelectItem value="tysk">Tysk</SelectItem>
                    <SelectItem value="fransk">Fransk</SelectItem>
                    <SelectItem value="spansk">Spansk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty-filter">Sværhedsgrad</Label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle sværhedsgrader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle sværhedsgrader</SelectItem>
                    <SelectItem value="let">Let</SelectItem>
                    <SelectItem value="mellem">Mellem</SelectItem>
                    <SelectItem value="svær">Svær</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class-level-filter">Klassetrin</Label>
                <Select value={filterClassLevel} onValueChange={setFilterClassLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle klassetrin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle klassetrin</SelectItem>
                    <SelectItem value="0-3">0-3 klasse</SelectItem>
                    <SelectItem value="4-6">4-6 klasse</SelectItem>
                    <SelectItem value="7-9">7-9 klasse</SelectItem>
                    <SelectItem value="gymnasie">Gymnasie</SelectItem>
                    <SelectItem value="voksen">Voksenundervisning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Søger..." : "Søg materialer og mapper"}
            </Button>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Søgeresultater ({totalMaterials} materialer og {folderResults.length} mapper fundet)
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Søger efter materialer og mapper...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Folder Results */}
                  {folderResults.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold mb-3 text-gray-800">Mapper</h4>
                      <div className="space-y-3">
                        {folderResults.map(folder => (
                          <div key={folder.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3 flex-1">
                                <Folder className="h-8 w-8" style={{ color: folder.color }} />
                                <div>
                                  <h5 className="text-lg font-semibold text-gray-900">{folder.name}</h5>
                                  <p className="text-sm text-gray-600">{folder.fileCount} offentlige filer</p>
                                </div>
                              </div>
                              
                              <div className="ml-4 flex flex-col space-y-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveFolder(folder)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <FolderPlus className="h-4 w-4 mr-2" />
                                  Gem alle filer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/shared/folder/${folder.id}`, '_blank')}
                                >
                                  Se mappe
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material Results */}
                  {groupedResults.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold mb-3 text-gray-800">Individuelle materialer</h4>
                      <div className="space-y-3">
                        {groupedResults.map(group => (
                          <GroupedSearchResultCard
                            key={`${group.title}-${group.language}-${group.format}`}
                            title={group.title}
                            language={group.language}
                            format={group.format}
                            files={group.files}
                            onSave={handleSaveMaterial}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedResults.length === 0 && folderResults.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Ingen materialer eller mapper fundet. Prøv at ændre dine søgekriterier.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
