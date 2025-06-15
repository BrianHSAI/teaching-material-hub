
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Folder, FolderOpen, MoreVertical, Trash2, Share2, ChevronDown, ChevronRight, FileText, Video, Globe, Download } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";
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
        <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Filer i {folder.name}</h4>
            <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mt-2"></div>
          </div>
          <div className="space-y-2">
            {files.map(file => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-gray-100 hover:shadow-md hover:bg-white/80 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(file.format)}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate">{file.title}</h5>
                    <p className="text-sm text-gray-500">{file.author}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium border border-primary/30">
                      {file.format}
                    </span>
                    {file.isPublic && (
                      <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                        Offentlig
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.fileUrl, '_blank');
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border-gray-200 shadow-lg z-50">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateFileVisibility(file.id, !file.isPublic);
                        }}
                        className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        {file.isPublic ? "Gør privat" : "Gør offentligt"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveFile(file.id, "desktop");
                        }}
                        className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Flyt til skrivebord
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(file.id);
                        }}
                        className="hover:bg-red-500/20 focus:bg-red-500/20 transition-colors text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Slet materiale
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
