
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Folder, FolderOpen, MoreVertical, Trash2, Share2, ChevronDown, ChevronRight } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";
import { FileCard } from "./FileCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FolderCardProps {
  folder: FolderData;
  files: FileData[];
  onMoveFile: (fileId: string, folderId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onUpdateFileVisibility: (fileId: string, isPublic: boolean) => void;
}

export const FolderCard = ({ folder, files, onMoveFile, onDeleteFile, onDeleteFolder, onUpdateFileVisibility }: FolderCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

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

  const handleShareFolder = async () => {
    try {
      // Make all files in the folder public
      const { error } = await supabase
        .from('materials')
        .update({ is_public: true })
        .eq('folder_id', folder.id);

      if (error) throw error;

      // Generate share URL for folder
      const shareUrl = `${window.location.origin}/shared/folder/${folder.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Mappe delt",
        description: "Link kopieret til udklipsholder. Alle filer i mappen er nu offentligt tilgængelige."
      });
    } catch (error) {
      console.error('Error sharing folder:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke dele mappen",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full">
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
            <DropdownMenuContent className="glass-effect border-border/50 bg-white z-50">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareFolder();
                }}
                className="hover:bg-primary/20 focus:bg-primary/20 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Del mappe
              </DropdownMenuItem>
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

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            {isOpen ? (
              <FolderOpen className="h-8 w-8 drop-shadow-lg" style={{ color: folder.color }} />
            ) : (
              <Folder className="h-8 w-8 drop-shadow-lg" style={{ color: folder.color }} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-foreground drop-shadow-sm">{folder.name}</h3>
            <p className="text-sm text-muted-foreground">{files.length} filer</p>
          </div>
        </div>
      </Card>
      
      {isOpen && files.length > 0 && (
        <div className="mt-4 bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map(file => (
              <div key={file.id} className="transform transition-all duration-200 hover:scale-105">
                <FileCard
                  file={file}
                  onMoveToFolder={onMoveFile}
                  onDelete={onDeleteFile}
                  onUpdateVisibility={onUpdateFileVisibility}
                  folders={[]}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
