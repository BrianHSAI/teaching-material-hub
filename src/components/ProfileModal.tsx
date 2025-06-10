
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Min profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{files.length}</div>
              <div className="text-sm text-gray-600">Uploadede materialer</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{totalDownloads}</div>
              <div className="text-sm text-gray-600">Samlede downloads</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{publicFiles.length}</div>
              <div className="text-sm text-gray-600">Offentlige materialer</div>
            </div>
          </div>

          {/* Materials List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mine materialer</h3>
            
            {files.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Du har ikke uploadet nogen materialer endnu.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {files.map(file => (
                  <div key={file.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{file.title}</h4>
                        <p className="text-sm text-gray-600">
                          {file.format} • {file.language} • {file.classLevel}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{file.downloadCount} downloads</span>
                          <span>{file.isPublic ? "Offentlig" : "Privat"}</span>
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
