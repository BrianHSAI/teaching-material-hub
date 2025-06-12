
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Download, MoreVertical, FolderOpen, Video, Globe, Trash2 } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";

interface FileCardProps {
  file: FileData;
  onMoveToFolder: (fileId: string, folderId: string) => void;
  onDelete: (fileId: string) => void;
  folders: FolderData[];
}

export const FileCard = ({ file, onMoveToFolder, onDelete, folders }: FileCardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", file.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getFileIcon = () => {
    switch (file.format) {
      case "pdf":
        return <FileText className="h-10 w-10 text-red-400 drop-shadow-lg" />;
      case "word":
        return <FileText className="h-10 w-10 text-blue-400 drop-shadow-lg" />;
      case "video":
        return <Video className="h-10 w-10 text-purple-400 drop-shadow-lg" />;
      case "youtube":
        return <Video className="h-10 w-10 text-red-400 drop-shadow-lg" />;
      case "link":
        return <Globe className="h-10 w-10 text-green-400 drop-shadow-lg" />;
      default:
        return <FileText className="h-10 w-10 text-gray-400 drop-shadow-lg" />;
    }
  };

  return (
    <Card 
      className={`p-6 cursor-move glass-effect hover-glow neon-border transition-all duration-300 ${
        isDragging ? 'opacity-60 scale-95' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col items-center space-y-3">
        {getFileIcon()}
        <div className="text-center">
          <h3 className="font-bold text-base truncate w-full text-foreground drop-shadow-sm" title={file.title}>
            {file.title}
          </h3>
          <p className="text-sm text-muted-foreground">{file.author}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium border border-primary/30">
              {file.format}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(file.fileUrl, '_blank')}
            className="h-8 px-3 text-xs bg-background/50 border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-3 bg-background/50 border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-effect border-border/50">
              {folders.length > 0 && folders.map(folder => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => onMoveToFolder(file.id, folder.id)}
                  className="hover:bg-primary/20 focus:bg-primary/20 transition-colors"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Flyt til {folder.name}
                </DropdownMenuItem>
              ))}
              {file.folderId && (
                <DropdownMenuItem
                  onClick={() => onMoveToFolder(file.id, "desktop")}
                  className="hover:bg-primary/20 focus:bg-primary/20 transition-colors"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Flyt til skrivebord
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(file.id)}
                className="hover:bg-red-500/20 focus:bg-red-500/20 transition-colors text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slet materiale
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};
