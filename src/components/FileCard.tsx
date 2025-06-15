
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { FileText, Download, MoreVertical, FolderOpen, Video, Globe, Trash2, Share2, Copy, Eye, EyeOff } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileCardProps {
  file: FileData;
  onMoveToFolder: (fileId: string, folderId: string) => void;
  onDelete: (fileId: string) => void;
  onUpdateVisibility: (fileId: string, isPublic: boolean) => void;
  folders: FolderData[];
  isSharedView?: boolean;
}

export const FileCard = ({ file, onMoveToFolder, onDelete, onUpdateVisibility, folders, isSharedView = false }: FileCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", file.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleShare = async () => {
    try {
      // Make the material public first
      const { error } = await supabase
        .from('materials')
        .update({ is_public: true })
        .eq('id', file.id);

      if (error) throw error;

      onUpdateVisibility(file.id, true);

      // Generate share URL
      const shareUrl = `${window.location.origin}/shared/file/${file.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Materiale delt",
        description: "Link kopieret til udklipsholder. Materialet er nu offentligt tilgængeligt."
      });
    } catch (error) {
      console.error('Error sharing material:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke dele materialet",
        variant: "destructive"
      });
    }
  };

  const handleShareOtp = async () => {
    try {
      // Make the material public first to ensure it's accessible after OTP
      const { error } = await supabase
        .from('materials')
        .update({ is_public: true })
        .eq('id', file.id);

      if (error) throw error;

      onUpdateVisibility(file.id, true);

      // Generér og kopier OTP-link
      const otpLink = `${window.location.origin}/shared/file/${file.id}-otp`;
      await navigator.clipboard.writeText(otpLink);

      toast({
        title: "OTP-link kopieret",
        description: "Del-link med kode er kopieret. Materialet er nu offentligt tilgængeligt.",
      });
    } catch (error) {
      console.error('Error sharing material with OTP:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke oprette OTP-delingslink",
        variant: "destructive"
      });
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const newVisibility = !file.isPublic;
      const { error } = await supabase
        .from('materials')
        .update({ is_public: newVisibility })
        .eq('id', file.id);

      if (error) throw error;

      onUpdateVisibility(file.id, newVisibility);
      
      toast({
        title: newVisibility ? "Materiale gjort offentligt" : "Materiale gjort privat",
        description: newVisibility 
          ? "Materialet er nu synligt for andre" 
          : "Materialet er nu kun synligt for dig"
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke ændre synlighed",
        variant: "destructive"
      });
    }
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
      case "document":
        return <FileText className="h-10 w-10 text-blue-400 drop-shadow-lg" />;
      default:
        return <FileText className="h-10 w-10 text-gray-400 drop-shadow-lg" />;
    }
  };

  const FileContent = () => (
    <Card 
      className={`p-6 ${!isSharedView ? 'cursor-move' : ''} glass-effect hover-glow neon-border transition-all duration-300 relative ${
        isDragging ? 'opacity-60 scale-95' : ''
      }`}
      draggable={!isSharedView}
      onDragStart={!isSharedView ? handleDragStart : undefined}
      onDragEnd={!isSharedView ? handleDragEnd : undefined}
    >
      {/* Visibility indicator */}
      {!isSharedView && (
        <div className="absolute top-2 left-2 z-10">
          {file.isPublic ? (
            <Eye className="h-4 w-4 text-green-500" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      )}

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
        
        <div className="flex space-x-2 z-10" style={{ pointerEvents: 'auto' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.open(file.fileUrl, '_blank');
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="h-8 px-3 text-xs bg-background/50 border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {!isSharedView && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 px-3 bg-background/50 border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-200 shadow-lg z-50">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleVisibility();
                  }}
                  className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
                >
                  {file.isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {file.isPublic ? "Gør privat" : "Gør offentligt"}
                </DropdownMenuItem>
                {/* Fast "Del fil" (offentligt) */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleShare();
                  }}
                  className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Del (offentligt link)
                </DropdownMenuItem>
                {/* Ny mulighed for "midlertidigt login-link" */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleShareOtp();
                  }}
                  className="transition-colors rounded-lg px-3 py-2 my-1 font-bold text-white bg-black hover:bg-zinc-900 focus:bg-zinc-900 text-center"
                  style={{justifyContent: "center", fontWeight: "bold"}}
                >
                  Få adgang med midlertidigt login-link
                </DropdownMenuItem>
                {/* Flyt til-muligheder */}
                {folders.length > 0 && folders.map(folder => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onMoveToFolder(file.id, folder.id);
                    }}
                    className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Flyt til {folder.name}
                  </DropdownMenuItem>
                ))}
                {file.folderId && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onMoveToFolder(file.id, "desktop");
                    }}
                    className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Flyt til skrivebord
                  </DropdownMenuItem>
                )}
                {/* Slet fil */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(file.id);
                  }}
                  className="hover:bg-red-500/20 focus:bg-red-500/20 transition-colors text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Slet materiale
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );

  if (isSharedView) {
    return <FileContent />;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <FileContent />
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
        <ContextMenuItem
          onClick={() => handleToggleVisibility()}
          className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
        >
          {file.isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {file.isPublic ? "Gør privat" : "Gør offentligt"}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => handleShare()}
          className="hover:bg-primary/20 focus:bg-primary/20 transition-colors text-gray-900"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Del materiale
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDelete(file.id)}
          className="hover:bg-red-500/20 focus:bg-red-500/20 transition-colors text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Slet materiale
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
