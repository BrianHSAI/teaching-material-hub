
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Download, Globe, FileText, Video } from "lucide-react";
import { FileData } from "@/pages/Index";
import { useMaterials } from "@/hooks/useMaterials";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSaveFile: (file: FileData) => void;
}

export const SearchModal = ({ open, onClose, onSaveFile }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<FileData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { materials } = useMaterials();

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Search through user's materials
    const filteredMaterials = materials.filter(material => {
      const searchLower = searchTerm.toLowerCase();
      
      // Search in title, author, genre, language, difficulty, class_level, and tags
      return (
        material.title.toLowerCase().includes(searchLower) ||
        material.author.toLowerCase().includes(searchLower) ||
        material.genre.toLowerCase().includes(searchLower) ||
        material.language.toLowerCase().includes(searchLower) ||
        material.difficulty.toLowerCase().includes(searchLower) ||
        material.class_level.toLowerCase().includes(searchLower) ||
        (material.source && material.source.toLowerCase().includes(searchLower)) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });

    // Convert to FileData format
    const results: FileData[] = filteredMaterials.map(material => ({
      id: material.id,
      title: material.title,
      author: material.author,
      source: material.source,
      format: material.format,
      genre: material.genre,
      language: material.language,
      difficulty: material.difficulty,
      classLevel: material.class_level,
      tags: material.tags,
      isPublic: material.is_public,
      fileUrl: material.file_url,
      folderId: material.folder_id,
      createdAt: new Date(material.created_at),
      downloadCount: material.download_count
    }));

    setSearchResults(results);
    setIsSearching(false);
  }, [searchTerm, materials]);

  const getFileIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-400" />;
      case "word":
        return <FileText className="h-6 w-6 text-blue-400" />;
      case "video":
        return <Video className="h-6 w-6 text-purple-400" />;
      case "youtube":
        return <Video className="h-6 w-6 text-red-400" />;
      case "link":
        return <Globe className="h-6 w-6 text-green-400" />;
      case "document":
        return <FileText className="h-6 w-6 text-blue-400" />;
      default:
        return <FileText className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Søg i dine materialer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Søg efter titel, forfatter, emne, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {isSearching && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Søger...</p>
              </div>
            )}

            {!isSearching && searchTerm.trim() !== "" && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">Ingen materialer fundet for "{searchTerm}"</p>
              </div>
            )}

            {searchResults.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.format)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{file.title}</h3>
                    <p className="text-sm text-gray-600">{file.author}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {file.format}
                      </span>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {file.genre}
                      </span>
                      {file.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => window.open(file.fileUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Åbn
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
