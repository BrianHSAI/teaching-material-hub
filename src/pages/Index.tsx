import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, LogOut } from "lucide-react";
import { FileUploadModal } from "@/components/FileUploadModal";
import { SearchModal } from "@/components/SearchModal";
import { ProfileModal } from "@/components/ProfileModal";
import { FileCard } from "@/components/FileCard";
import { FolderCard } from "@/components/FolderCard";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import { useAuth } from "@/contexts/AuthContext";
import { useMaterials, Material } from "@/hooks/useMaterials";
import { useFolders, Folder } from "@/hooks/useFolders";
import { GroupedFileCard } from "@/components/GroupedFileCard";

// Legacy types for compatibility with existing components
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
  description?: string;
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

// Convert database types to legacy types for component compatibility
export const convertMaterialToFileData = (material: Material): FileData => ({
  id: material.id,
  title: material.title,
  author: material.author,
  source: material.source,
  format: material.format,
  genre: material.genre,
  language: material.language,
  difficulty: material.difficulty,
  classLevel: material.class_level,
  tags: material.tags,
  description: material.description,
  isPublic: material.is_public,
  fileUrl: material.file_url,
  folderId: material.folder_id,
  createdAt: new Date(material.created_at),
  downloadCount: material.download_count
});

export const convertFolderToFolderData = (folder: Folder): FolderData => ({
  id: folder.id,
  name: folder.name,
  createdAt: new Date(folder.created_at),
  color: folder.color
});

const LOGO = "/lovable-uploads/70b7bcd1-e7d9-4faf-baf5-855b246bb838.png";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  console.log("Index component - user:", user);
  console.log("Index component - authLoading:", authLoading);
  
  const { materials, loading: materialsLoading, createMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const { folders, loading: foldersLoading, createFolder, deleteFolder } = useFolders();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isDragOverDesktop, setIsDragOverDesktop] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    console.log("Index useEffect - authLoading:", authLoading, "user:", user);
    if (!authLoading && !user) {
      console.log("Redirecting to /auth because user is not logged in");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    console.log("Showing auth loading screen");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Indlæser...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not logged in (redirect should happen)
  if (!user) {
    console.log("No user found, should redirect to auth");
    return null;
  }

  const handleFileUpload = async (fileData: FileData) => {
    await createMaterial({
      title: fileData.title,
      author: fileData.author,
      source: fileData.source,
      format: fileData.format,
      genre: fileData.genre,
      language: fileData.language,
      difficulty: fileData.difficulty,
      class_level: fileData.classLevel,
      tags: fileData.tags,
      description: fileData.description,
      is_public: fileData.isPublic,
      file_url: fileData.fileUrl || "",
      folder_id: fileData.folderId
    });
    setShowUploadModal(false);
  };

  const handleCreateFolder = async (name: string, color: string) => {
    await createFolder(name, color);
    setShowCreateFolderModal(false);
  };

  const handleMoveFileToFolder = async (fileId: string, folderId: string) => {
    await updateMaterial(fileId, { folder_id: folderId === "desktop" ? null : folderId });
  };

  const handleDeleteFile = async (fileId: string) => {
    await deleteMaterial(fileId);
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder(folderId);
  };

  const handleUpdateFileVisibility = async (fileId: string, isPublic: boolean) => {
    await updateMaterial(fileId, { is_public: isPublic });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Desktop drag and drop handlers
  const handleDesktopDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDesktop(true);
  };

  const handleDesktopDragLeave = (e: React.DragEvent) => {
    // Only set to false if we're leaving the desktop area completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverDesktop(false);
    }
  };

  const handleDesktopDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDesktop(false);
    const fileId = e.dataTransfer.getData("text/plain");
    handleMoveFileToFolder(fileId, "desktop");
  };

  // Convert database types to legacy types for component compatibility
  const legacyFiles = materials.map(convertMaterialToFileData);
  const legacyFolders = folders.map(convertFolderToFolderData);
  const desktopFiles = legacyFiles.filter(file => !file.folderId);

  // Group files by title, language, and format - Fixed grouping logic
  const groupedFiles = desktopFiles.reduce((acc, file) => {
    // Skip files with null or undefined title, language, or format
    if (!file.title || !file.language || !file.format) {
      console.warn('Skipping file with missing data:', file);
      return acc;
    }
    
    const key = `${file.title.toLowerCase()}-${file.language.toLowerCase()}-${file.format.toLowerCase()}`;
    if (!acc[key]) {
      acc[key] = {
        title: file.title,
        language: file.language,
        format: file.format,
        files: []
      };
    }
    acc[key].files.push(file);
    return acc;
  }, {} as Record<string, { title: string; language: string; format: string; files: FileData[] }>);

  const groupedFilesList = Object.values(groupedFiles);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo og titel */}
            <div className="flex items-center">
              <img src={LOGO} alt="Logo" className="h-8 w-8 rounded mr-2" />
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
                        Tilføj materiale
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

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Log ud</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {materialsLoading || foldersLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Indlæser materialer...</p>
          </div>
        ) : desktopFiles.length === 0 && legacyFolders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Velkommen til dine undervisningsmaterialer!</h2>
              <p className="text-gray-600 mb-6">
                Kom i gang ved at tilføje dit første materiale eller oprette en mappe til at organisere dine filer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tilføj materiale
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
              
              {/* Folders */}
              {legacyFolders.length > 0 && (
                <div className="space-y-4 mb-6">
                  {legacyFolders.map(folder => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      files={legacyFiles.filter(file => file.folderId === folder.id)}
                      onMoveFile={handleMoveFileToFolder}
                      onDeleteFile={handleDeleteFile}
                      onDeleteFolder={handleDeleteFolder}
                      onUpdateFileVisibility={handleUpdateFileVisibility}
                    />
                  ))}
                </div>
              )}

              {/* Desktop Files */}
              <div 
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-all duration-300 ${
                  isDragOverDesktop 
                    ? 'border-blue-400 bg-blue-50/50' 
                    : 'border-gray-200 bg-transparent'
                }`}
                onDragOver={handleDesktopDragOver}
                onDragLeave={handleDesktopDragLeave}
                onDrop={handleDesktopDrop}
              >
                {/* Grouped Files on desktop */}
                {groupedFilesList.map(group => {
                  console.log('Rendering group:', group.title, 'files:', group.files.length);
                  return group.files.length === 1 ? (
                    <FileCard
                      key={group.files[0].id}
                      file={group.files[0]}
                      onMoveToFolder={handleMoveFileToFolder}
                      onDelete={handleDeleteFile}
                      onUpdateVisibility={handleUpdateFileVisibility}
                      folders={legacyFolders}
                    />
                  ) : (
                    <GroupedFileCard
                      key={`${group.title}-${group.language}-${group.format}`}
                      title={group.title}
                      language={group.language}
                      format={group.format}
                      files={group.files}
                      onMoveToFolder={handleMoveFileToFolder}
                      onDelete={handleDeleteFile}
                      onUpdateVisibility={handleUpdateFileVisibility}
                      folders={legacyFolders}
                    />
                  );
                })}

                {/* Drop zone hint when dragging */}
                {isDragOverDesktop && (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <p className="text-blue-600 font-medium">Slip for at flytte til skrivebord</p>
                  </div>
                )}
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
        folders={legacyFolders}
      />

      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSaveFile={handleFileUpload}
      />

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        files={legacyFiles}
      />

      <CreateFolderModal
        open={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={handleCreateFolder}
      />

      {/* Fjernet knap til midlertidigt login-link fra forsiden */}
      {/* 
      <div className="flex justify-center mt-4">
        <Button onClick={() => navigate("/magic-link")} variant="outline">
          Få adgang med midlertidigt login-link
        </Button>
      </div>
      */}
    </div>
  );
};

export default Index;
