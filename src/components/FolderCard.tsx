
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Folder, FolderOpen, MoreVertical, Trash2 } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";
import { FileCard } from "./FileCard";

interface FolderCardProps {
  folder: FolderData;
  files: FileData[];
  onMoveFile: (fileId: string, folderId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export const FolderCard = ({ folder, files, onMoveFile, onDeleteFile, onDeleteFolder }: FolderCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fileId = e.dataTransfer.getData("text/plain");
    onMoveFile(fileId, folder.id);
  };

  return (
    <div>
      <Card 
        className={`p-6 cursor-pointer glass-effect hover-glow neon-border transition-all duration-300 relative ${
          isDragOver ? 'ring-2 ring-primary scale-105' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          backgroundColor: isDragOver ? 'rgba(251, 191, 36, 0.1)' : undefined,
          borderColor: folder.color + '60'
        }}
      >
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-background/50"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-effect border-border/50">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
                className="hover:bg-red-500/20 focus:bg-red-500/20 transition-colors text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slet mappe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center space-y-3">
          {isOpen ? (
            <FolderOpen className="h-10 w-10 drop-shadow-lg" style={{ color: folder.color }} />
          ) : (
            <Folder className="h-10 w-10 drop-shadow-lg" style={{ color: folder.color }} />
          )}
          <div className="text-center">
            <h3 className="font-bold text-base text-foreground drop-shadow-sm">{folder.name}</h3>
            <p className="text-sm text-muted-foreground">{files.length} filer</p>
          </div>
        </div>
      </Card>
      
      {isOpen && files.length > 0 && (
        <div className="mt-4 ml-6 space-y-3 animate-fade-in">
          {files.map(file => (
            <div key={file.id} className="scale-95 transform">
              <FileCard
                file={file}
                onMoveToFolder={onMoveFile}
                onDelete={onDeleteFile}
                folders={[]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
