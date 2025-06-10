
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Settings } from "lucide-react";
import { FileUploadModal } from "@/components/FileUploadModal";
import { SearchModal } from "@/components/SearchModal";
import { ProfileModal } from "@/components/ProfileModal";
import { FileCard } from "@/components/FileCard";
import { FolderCard } from "@/components/FolderCard";
import { CreateFolderModal } from "@/components/CreateFolderModal";

export type FileData = {
  id: string;
  title: string;
  author: string;
  source?: string;
  format: string;
  genre: string;
  language: string;
  difficulty: string;
  classLevel: string;
  tags: string[];
  isPublic: boolean;
  fileUrl?: string;
  folderId?: string;
  createdAt: Date;
  downloadCount: number;
};

export type FolderData = {
  id: string;
  name: string;
  createdAt: Date;
  color: string;
};

const Index = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleFileUpload = (fileData: FileData) => {
    setFiles(prev => [...prev, { ...fileData, id: Date.now().toString(), createdAt: new Date(), downloadCount: 0 }]);
    setShowUploadModal(false);
  };

  const handleCreateFolder = (name: string, color: string) => {
    setFolders(prev => [...prev, { 
      id: Date.now().toString(), 
      name, 
      color,
      createdAt: new Date() 
    }]);
    setShowCreateFolderModal(false);
  };

  const handleMoveFileToFolder = (fileId: string, folderId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, folderId } : file
    ));
  };

  const desktopFiles = files.filter(file => !file.folderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Teaching Materials</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearchModal(true)}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Søg materialer</span>
              </Button>

              {/* Add Button with Dropdown */}
              <div className="relative">
                <Button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tilføj</span>
                </Button>
                
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUploadModal(true);
                          setShowAddMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Upload materiale
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateFolderModal(true);
                          setShowAddMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Opret mappe
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Profil</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {desktopFiles.length === 0 && folders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Velkommen til dine undervisningsmaterialer!</h2>
              <p className="text-gray-600 mb-6">
                Kom i gang ved at uploade dit første materiale eller oprette en mappe til at organisere dine filer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload materiale
                </Button>
                <Button variant="outline" onClick={() => setShowCreateFolderModal(true)}>
                  Opret mappe
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Area */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mit skrivebord</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Folders */}
                {folders.map(folder => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    files={files.filter(file => file.folderId === folder.id)}
                    onMoveFile={handleMoveFileToFolder}
                  />
                ))}
                
                {/* Files on desktop */}
                {desktopFiles.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onMoveToFolder={handleMoveFileToFolder}
                    folders={folders}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <FileUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
        folders={folders}
      />

      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSaveFile={handleFileUpload}
      />

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        files={files}
      />

      <CreateFolderModal
        open={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={handleCreateFolder}
      />
    </div>
  );
};

export default Index;
