
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Download, MoreVertical, FolderOpen } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";

interface FileCardProps {
  file: FileData;
  onMoveToFolder: (fileId: string, folderId: string) => void;
  folders: FolderData[];
}

export const FileCard = ({ file, onMoveToFolder, folders }: FileCardProps) => {
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
        return <FileText className="h-8 w-8 text-red-500" />;
      case "word":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "video":
      case "youtube":
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <Card 
      className={`p-4 cursor-move hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col items-center space-y-2">
        {getFileIcon()}
        <div className="text-center">
          <h3 className="font-medium text-sm truncate w-full" title={file.title}>
            {file.title}
          </h3>
          <p className="text-xs text-gray-500">{file.author}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-1 py-0.5 rounded">
              {file.format}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(file.fileUrl, '_blank')}
            className="h-6 px-2 text-xs"
          >
            <Download className="h-3 w-3" />
          </Button>
          
          {folders.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-6 px-2">
                  <FolderOpen className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {folders.map(folder => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => onMoveToFolder(file.id, folder.id)}
                  >
                    Flyt til {folder.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );
};
