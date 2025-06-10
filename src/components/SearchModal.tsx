
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileData } from "@/pages/Index";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSaveFile: (fileData: FileData) => void;
}

// Mock data for public materials
const mockPublicMaterials: FileData[] = [
  {
    id: "1",
    title: "Dansk grammatik - navneord",
    author: "Anna Hansen",
    source: "Undervisningsportalen",
    format: "pdf",
    genre: "opgave",
    language: "dansk",
    difficulty: "mellem",
    classLevel: "6. klasse",
    tags: ["grammatik", "navneord", "dansk"],
    isPublic: true,
    fileUrl: "https://example.com/file1.pdf",
    createdAt: new Date(),
    downloadCount: 45,
  },
  {
    id: "2", 
    title: "Romantikkens digte",
    author: "Lars Pedersen",
    source: "Litteraturcenter",
    format: "word",
    genre: "digt",
    language: "dansk",
    difficulty: "svær",
    classLevel: "2.g",
    tags: ["romantik", "digte", "litteratur"],
    isPublic: true,
    fileUrl: "https://example.com/file2.docx",
    createdAt: new Date(),
    downloadCount: 32,
  },
  {
    id: "3",
    title: "English Grammar Exercises",
    author: "Sarah Johnson",
    source: "ESL Resources",
    format: "pdf",
    genre: "opgave",
    language: "engelsk",
    difficulty: "let",
    classLevel: "8. klasse",
    tags: ["grammar", "exercises", "english"],
    isPublic: true,
    fileUrl: "https://example.com/file3.pdf",
    createdAt: new Date(),
    downloadCount: 78,
  },
];

export const SearchModal = ({ open, onClose, onSaveFile }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [results, setResults] = useState<FileData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    let filtered = mockPublicMaterials.filter(material => 
      material.isPublic &&
      (searchTerm === "" || 
       material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
       material.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterFormat && filterFormat !== "all") {
      filtered = filtered.filter(material => material.format === filterFormat);
    }
    if (filterLanguage && filterLanguage !== "all") {
      filtered = filtered.filter(material => material.language === filterLanguage);
    }
    if (filterDifficulty && filterDifficulty !== "all") {
      filtered = filtered.filter(material => material.difficulty === filterDifficulty);
    }

    setResults(filtered);
    setHasSearched(true);
  };

  const handleSaveMaterial = (material: FileData) => {
    // Create a copy with new ID for user's collection
    const newMaterial = {
      ...material,
      id: Date.now().toString(),
      folderId: undefined, // Save to desktop by default
    };
    onSaveFile(newMaterial);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Søg i offentlige undervisningsmaterialer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Form */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <Label htmlFor="search">Søg efter titel, forfatter eller tags</Label>
              <Input
                id="search"
                placeholder="f.eks. grammatik, romantik, engelsk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <Button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700">
              Søg materialer
            </Button>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Søgeresultater ({results.length} materialer fundet)
              </h3>
              
              {results.length === 0 ? (
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
                              Tags: {material.tags.join(", ")}
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
