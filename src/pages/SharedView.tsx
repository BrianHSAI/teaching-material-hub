
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileData, FolderData, convertMaterialToFileData, convertFolderToFolderData } from '@/pages/Index';
import { FileCard } from '@/components/FileCard';
import { MaterialEditModal } from '@/components/MaterialEditModal';
import { Material } from '@/hooks/useMaterials';
import { FolderIcon, File as FileIcon, Home, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SharedView = () => {
  const { type, id: idParam } = useParams<{ type: 'file' | 'folder'; id: string }>();
  const id = idParam?.replace(/-otp$/, ""); // Fjern "-otp" hvis det er med
  const [item, setItem] = useState<FileData | FolderData | null>(null);
  const [filesInFolder, setFilesInFolder] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allFolders, setAllFolders] = useState<FolderData[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!type || !id) {
      setError("Ugyldigt delehlink.");
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        if (type === 'file') {
          const { data, error: itemError } = await supabase
            .from('materials')
            .select('*')
            .eq('id', id)
            .eq('is_public', true)
            .single();

          if (itemError || !data) {
            setError('Kunne ikke finde den delte fil, eller den er ikke offentlig.');
          } else {
            setItem(convertMaterialToFileData(data));
          }
        } else if (type === 'folder') {
          // A folder is only "shared" if it contains public materials.
          // First, fetch the folder info to get its name.
          const { data: folderData, error: folderError } = await supabase
            .from('folders')
            .select('*')
            .eq('id', id)
            .single();

          if (folderError || !folderData) {
            setError('Kunne ikke finde den delte mappe.');
            setLoading(false);
            return;
          }

          // Then, fetch public files within that folder.
          const { data: filesData, error: filesError } = await supabase
            .from('materials')
            .select('*')
            .eq('folder_id', id)
            .eq('is_public', true);
          
          if (filesError) {
            setError('Kunne ikke hente filer i mappen.');
          } else if (filesData && filesData.length > 0) {
            setItem(convertFolderToFolderData(folderData));
            setFilesInFolder(filesData.map(convertMaterialToFileData));
            // Fetch all folders for moving files between them, if needed by FileCard
            const { data: allFoldersData } = await supabase.from('folders').select('*').eq('user_id', folderData.user_id);
            if (allFoldersData) {
              setAllFolders(allFoldersData.map(convertFolderToFolderData));
            }
          } else {
            setError('Denne mappe er tom eller indeholder ingen offentligt delte filer.');
          }
        }
      } catch (e) {
        setError('Der opstod en uventet fejl.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [type, id]);

  const handleEditMaterial = (material: Material) => {
    setMaterialToEdit(material);
    setEditModalOpen(true);
  };

  const handleUpdateMaterial = async (updates: Partial<Material>) => {
    if (!materialToEdit) return;

    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', materialToEdit.id)
        .select()
        .single();

      if (error) throw error;

      // Update the local state
      if (type === 'file' && item) {
        setItem(convertMaterialToFileData(data));
      } else if (type === 'folder') {
        setFilesInFolder(prev => prev.map(file => 
          file.id === materialToEdit.id ? convertMaterialToFileData(data) : file
        ));
      }

      toast({
        title: "Materiale opdateret",
        description: "Dine ændringer er blevet gemt"
      });
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke opdatere materialet",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Tilbage til forsiden
            </Link>
          </Button>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Fejl</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        ) : item ? (
          <div>
            {type === 'folder' && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <FolderIcon className="h-10 w-10 text-yellow-500" />
                  <h1 className="text-3xl font-bold text-gray-800">{(item as FolderData).name}</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {filesInFolder.map(file => (
                    <FileCard 
                      key={file.id} 
                      file={file} 
                      folders={allFolders} 
                      onMoveToFolder={() => {}} 
                      onDelete={() => {}} 
                      onUpdateVisibility={() => {}}
                      isSharedView={true} 
                    />
                  ))}
                </div>
              </>
            )}
            {type === 'file' && (
               <div className="bg-white rounded-lg shadow-md p-8">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-4">
                     <FileIcon className="h-10 w-10 text-blue-500" />
                     <h1 className="text-3xl font-bold text-gray-800">{(item as FileData).title}</h1>
                   </div>
                   <Button 
                     variant="outline" 
                     onClick={() => {
                       // Convert FileData to Material for editing
                       const material: Material = {
                         id: (item as FileData).id,
                         title: (item as FileData).title,
                         author: (item as FileData).author,
                         format: (item as FileData).format,
                         genre: (item as FileData).genre,
                         language: (item as FileData).language,
                         difficulty: (item as FileData).difficulty,
                         class_level: (item as FileData).classLevel,
                         tags: (item as FileData).tags,
                         is_public: (item as FileData).isPublic,
                         file_url: (item as FileData).fileUrl,
                         folder_id: (item as FileData).folderId,
                         created_at: (item as FileData).createdAt.toISOString(),
                         download_count: (item as FileData).downloadCount,
                         user_id: '', // Will be handled by database
                         description: ''
                       };
                       handleEditMaterial(material);
                     }}
                   >
                     <Edit2 className="h-4 w-4 mr-2" />
                     Rediger
                   </Button>
                 </div>
                 <p className="text-gray-600 mb-4">Forfatter: {(item as FileData).author}</p>
                 <div className="flex gap-2">
                   <Button asChild>
                     <a href={(item as FileData).fileUrl} target="_blank" rel="noopener noreferrer">
                       Åbn materiale
                     </a>
                   </Button>
                 </div>
               </div>
            )}
          </div>
        ) : null}

        {materialToEdit && (
          <MaterialEditModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setMaterialToEdit(null);
            }}
            onUpdate={handleUpdateMaterial}
            material={materialToEdit}
          />
        )}
      </div>
    </div>
  );
};

export default SharedView;
