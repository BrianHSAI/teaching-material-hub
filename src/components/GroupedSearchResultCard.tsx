
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Video, Globe, ChevronDown, Download, Save } from "lucide-react";
import { FileData } from "@/pages/Index";

interface GroupedSearchResultCardProps {
  title: string;
  language: string;
  format: string;
  files: FileData[];
  onSave: (file: FileData) => void;
}

export const GroupedSearchResultCard = ({
  title,
  language,
  format,
  files,
  onSave,
}: GroupedSearchResultCardProps) => {
  const [selectedFile, setSelectedFile] = useState<FileData>(files[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const getFileIcon = (format: string) => {
    switch (format) {
      case "pdf": return <FileText className="h-5 w-5 text-red-400" />;
      case "word": return <FileText className="h-5 w-5 text-blue-400" />;
      case "video": return <Video className="h-5 w-5 text-purple-400" />;
      case "youtube": return <Video className="h-5 w-5 text-red-400" />;
      case "link": return <Globe className="h-5 w-5 text-green-400" />;
      default: return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "let": return "bg-green-100 text-green-800 border-green-300";
      case "mellem": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "svær": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {getFileIcon(selectedFile.format)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-semibold text-gray-900 truncate" title={title}>{title}</h4>
              {files.length > 1 && (
                <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                      {files.length} versioner
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {files.map((file) => (
                      <DropdownMenuItem
                        key={file.id}
                        onClick={() => {
                          setSelectedFile(file);
                          setShowDropdown(false);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.format)}
                          <span>{file.author} ({file.genre})</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm text-gray-600">{selectedFile.author}</p>
            {selectedFile.source && (
              <p className="text-xs text-gray-500 italic">{selectedFile.source}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{selectedFile.format}</span>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{language}</span>
            <span className={`inline-block text-xs px-2 py-1 rounded-full border ${getDifficultyColor(selectedFile.difficulty)}`}>{selectedFile.difficulty}</span>
            <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{selectedFile.classLevel}</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => window.open(selectedFile.fileUrl, '_blank')}>
                <Download className="h-4 w-4 mr-1" />
                Vis
            </Button>
            <Button size="sm" onClick={() => onSave(selectedFile)} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-1" />
                Gem
            </Button>
        </div>
      </div>
      
      {selectedFile.tags && selectedFile.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">Tags: {selectedFile.tags.join(", ")}</p>
        </div>
      )}
       <p className="text-xs text-gray-500 mt-1">Downloadet {selectedFile.downloadCount} gange</p>
    </div>
  );
};
