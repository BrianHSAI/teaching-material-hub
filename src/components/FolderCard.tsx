
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Folder, FolderOpen } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";
import { FileCard } from "./FileCard";

interface FolderCardProps {
  folder: FolderData;
  files: FileData[];
  onMoveFile: (fileId: string, folderId: string) => void;
}

export const FolderCard = ({ folder, files, onMoveFile }: FolderCardProps) => {
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
        className={`p-4 cursor-pointer hover:shadow-md transition-all ${
          isDragOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ backgroundColor: isDragOver ? undefined : folder.color + '20' }}
      >
        <div className="flex flex-col items-center space-y-2">
          {isOpen ? (
            <FolderOpen className="h-8 w-8" style={{ color: folder.color }} />
          ) : (
            <Folder className="h-8 w-8" style={{ color: folder.color }} />
          )}
          <div className="text-center">
            <h3 className="font-medium text-sm">{folder.name}</h3>
            <p className="text-xs text-gray-500">{files.length} filer</p>
          </div>
        </div>
      </Card>
      
      {isOpen && files.length > 0 && (
        <div className="mt-2 ml-4 space-y-2">
          {files.map(file => (
            <div key={file.id} className="scale-90">
              <FileCard
                file={file}
                onMoveToFolder={onMoveFile}
                folders={[]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
