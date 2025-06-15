
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Video, Globe, ChevronDown, Download, MoreVertical, Trash2, Share2, FolderOpen } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";

interface GroupedFileCardProps {
  title: string;
  language: string;
  format: string;
  files: FileData[];
  onMoveToFolder: (fileId: string, folderId: string) => void;
  onDelete: (fileId: string) => void;
  onUpdateVisibility: (fileId: string, isPublic: boolean) => void;
  folders: FolderData[];
}

export const GroupedFileCard = ({
  title,
  language,
  format,
  files,
  onMoveToFolder,
  onDelete,
  onUpdateVisibility,
  folders
}: GroupedFileCardProps) => {
  const [selectedFile, setSelectedFile] = useState<FileData>(files[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const getFileIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-400" />;
      case "word":
        return <FileText className="h-5 w-5 text-blue-400" />;
      case "video":
        return <Video className="h-5 w-5 text-purple-400" />;
      case "youtube":
        return <Video className="h-5 w-5 text-red-400" />;
      case "link":
        return <Globe className="h-5 w-5 text-green-400" />;
      case "document":
        return <FileText className="h-5 w-5 text-blue-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "let": return "bg-green-100 text-green-600 border-green-300";
      case "mellem": return "bg-yellow-100 text-yellow-600 border-yellow-300";
      case "svær": return "bg-red-100 text-red-600 border-red-300";
      default: return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  return (
    <Card className="p-4 glass-effect hover-glow neon-border transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          {getFileIcon(selectedFile.format)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {files.length > 1 && (
                <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 px-2">
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-gray-200 shadow-lg z-50">
                    {files.map((file, index) => (
                      <DropdownMenuItem
                        key={file.id}
                        onClick={() => {
                          setSelectedFile(file);
                          setShowDropdown(false);
                        }}
                        className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
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
              <p className="text-xs text-gray-500">{selectedFile.source}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border-gray-200 shadow-lg z-50">
            <DropdownMenuItem
              onClick={() => onUpdateVisibility(selectedFile.id, !selectedFile.isPublic)}
              className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {selectedFile.isPublic ? "Gør privat" : "Gør offentligt"}
            </DropdownMenuItem>
            {folders.map(folder => (
              <DropdownMenuItem
                key={folder.id}
                onClick={() => onMoveToFolder(selectedFile.id, folder.id)}
                className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Flyt til {folder.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => onDelete(selectedFile.id)}
              className="hover:bg-red-500/20 focus:bg-red-500/20 transition-colors text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Slet materiale
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium border border-primary/30">
            {selectedFile.format}
          </span>
          <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
            {selectedFile.genre}
          </span>
          <span className="inline-block bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-medium">
            {language}
          </span>
          <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium border ${getDifficultyColor(selectedFile.difficulty)}`}>
            {selectedFile.difficulty}
          </span>
          {selectedFile.isPublic && (
            <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
              Offentlig
            </span>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => window.open(selectedFile.fileUrl, '_blank')}
          className="flex items-center space-x-1"
        >
          <Download className="h-4 w-4" />
          <span>Åbn</span>
        </Button>
      </div>

      {selectedFile.tags && selectedFile.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {selectedFile.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
