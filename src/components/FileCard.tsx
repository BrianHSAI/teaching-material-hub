
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Download, MoreVertical, FolderOpen, Video, Globe, Trash2, Eye, EyeOff, Share, ExternalLink } from "lucide-react";
import { FileData, FolderData } from "@/pages/Index";
import { useMaterials } from "@/hooks/useMaterials";
import { useToast } from "@/hooks/use-toast";

interface FileCardProps {
  file: FileData;
  onMoveToFolder: (fileId: string, folderId: string) => void;
  onDelete: (fileId: string) => void;
  onOpenDocument?: (file: FileData) => void;
  folders: FolderData[];
}

export const FileCard = ({ file, onMoveToFolder, onDelete, onOpenDocument, folders }: FileCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { updateMaterial } = useMaterials();
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", file.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleToggleVisibility = async () => {
    await updateMaterial(file.id, { is_public: !file.isPublic });
    toast({
      title: "Synlighed ændret",
      description: file.isPublic ? "Materialet er nu privat" : "Materialet er nu offentligt"
    });
  };

  const handleShareFile = async () => {
    const shareUrl = `${window.location.origin}/shared/${file.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link kopieret",
      description: "Delings-linket er kopieret til udklipsholderen"
    });
  };

  const handleOpenFile = () => {
    if (file.format === "document" && onOpenDocument) {
      onOpenDocument(file);
    } else {
      window.open(file.fileUrl, '_blank');
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
            {file.isPublic ? (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Offentlig
              </span>
            ) : (
              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                Privat
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2 z-10" style={{ pointerEvents: 'auto' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleOpenFile();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="h-8 px-3 text-xs bg-background/50 border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
          >
            {file.format === "document" ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          </Button>
          
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
            <DropdownMenuContent className="glass-effect border-border/50">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggleVisibility();
                }}
                className="hover:bg-primary/20 focus:bg-primary/20 transition-colors"
              >
                {file.isPublic ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Gør privat
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Gør offentlig
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleShareFile();
                }}
                className="hover:bg-primary/20 focus:bg-primary/20 transition-colors"
              >
                <Share className="h-4 w-4 mr-2" />
                Del fil
              </DropdownMenuItem>
              {folders.length > 0 && folders.map(folder => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveToFolder(file.id, folder.id);
                  }}
                  className="hover:bg-primary/20 focus:bg-primary/20 transition-colors"
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
                  className="hover:bg-primary/20 focus:bg-primary/20 transition-colors"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Flyt til skrivebord
                </DropdownMenuItem>
              )}
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
        </div>
      </div>
    </Card>
  );
};
