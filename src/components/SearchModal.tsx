import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileData } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSaveFile: (fileData: FileData) => void;
}

export const SearchModal = ({ open, onClose, onSaveFile }: SearchModalProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterClassLevel, setFilterClassLevel] = useState("all");
  const [filterTags, setFilterTags] = useState("");
  const [results, setResults] = useState<FileData[]>([]);
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

      // Convert database materials to FileData format
      const convertedResults: FileData[] = filteredResults.map(material => ({
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
      }));

      setResults(convertedResults);
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
    onClose();
    toast({
      title: "Materiale gemt",
      description: `"${material.title}" er blevet gemt til dine materialer som privat`
    });
  };

  // Reset search when modal closes
  const handleClose = () => {
    setSearchTerm("");
    setFilterFormat("all");
    setFilterLanguage("all");
    setFilterDifficulty("all");
    setFilterClassLevel("all");
    setFilterTags("");
    setResults([]);
    setHasSearched(false);
    onClose();
  };

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
              <Label htmlFor="search">Søg efter titel eller forfatter</Label>
              <Input
                id="search"
                placeholder="f.eks. grammatik, dansk, matematik..."
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
              {loading ? "Søger..." : "Søg materialer"}
            </Button>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Søgeresultater ({results.length} materialer fundet)
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Søger efter materialer...</p>
                </div>
              ) : results.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Ingen materialer fundet. Prøv at ændre dine søgekriterier.
                </p>
              ) : (
                <div className="space-y-3">
                  {results.map(material => (
                    <div key={material.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{material.title}</h4>
                          <p className="text-sm text-gray-600">Af {material.author}</p>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {material.format}
                            </span>
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {material.language}
                            </span>
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              {material.difficulty}
                            </span>
                            <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                              {material.classLevel}
                            </span>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Tags: {material.tags.length > 0 ? material.tags.join(", ") : "Ingen tags"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Downloadet {material.downloadCount} gange
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveMaterial(material)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Gem til mine materialer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(material.fileUrl, '_blank')}
                          >
                            Vis materiale
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
