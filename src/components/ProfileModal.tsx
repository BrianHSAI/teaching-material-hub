
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileData } from "@/pages/Index";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  files: FileData[];
}

export const ProfileModal = ({ open, onClose, files }: ProfileModalProps) => {
  const totalDownloads = files.reduce((sum, file) => sum + file.downloadCount, 0);
  const publicFiles = files.filter(file => file.isPublic);
  const privateFiles = files.filter(file => !file.isPublic);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl glass-effect border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Min profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect p-6 rounded-xl text-center hover-glow">
              <div className="text-3xl font-bold text-primary drop-shadow-lg">{files.length}</div>
              <div className="text-sm text-muted-foreground font-medium">Uploadede materialer</div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl text-center hover-glow">
              <div className="text-3xl font-bold text-green-400 drop-shadow-lg">{totalDownloads}</div>
              <div className="text-sm text-muted-foreground font-medium">Samlede downloads</div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl text-center hover-glow">
              <div className="text-3xl font-bold text-purple-400 drop-shadow-lg">{publicFiles.length}</div>
              <div className="text-sm text-muted-foreground font-medium">Offentlige materialer</div>
            </div>
          </div>

          {/* Materials List */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-foreground">Mine materialer</h3>
            
            {files.length === 0 ? (
              <div className="glass-effect p-8 rounded-xl text-center">
                <p className="text-muted-foreground">
                  Du har ikke uploadet nogen materialer endnu.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {files.map(file => (
                  <div key={file.id} className="glass-effect p-4 rounded-xl hover-glow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground">{file.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {file.format} • {file.language} • {file.classLevel}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                            {file.downloadCount} downloads
                          </span>
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            file.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {file.isPublic ? "Offentlig" : "Privat"}
                          </span>
                          <span>{file.createdAt.toLocaleDateString("da-DK")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
