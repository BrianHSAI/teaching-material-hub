
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Globe, Download, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FileData, FolderData } from "@/pages/Index";

const SharedFolder = () => {
  const { id } = useParams<{ id: string }>();
  const [folder, setFolder] = useState<FolderData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedFolder = async () => {
      if (!id) return;

      try {
        // Fetch folder details
        const { data: folderData, error: folderError } = await supabase
          .from('folders')
          .select('*')
          .eq('id', id)
          .single();

        if (folderError) throw folderError;

        // Fetch public files in this folder
        const { data: filesData, error: filesError } = await supabase
          .from('materials')
          .select('*')
          .eq('folder_id', id)
          .eq('is_public', true);

        if (filesError) throw filesError;

        setFolder({
          id: folderData.id,
          name: folderData.name,
          createdAt: new Date(folderData.created_at),
          color: folderData.color
        });

        setFiles(filesData.map(file => ({
          id: file.id,
          title: file.title,
          author: file.author,
          source: file.source,
          format: file.format,
          genre: file.genre,
          language: file.language,
          difficulty: file.difficulty,
          classLevel: file.class_level,
          tags: file.tags || [],
          isPublic: file.is_public,
          fileUrl: file.file_url,
          folderId: file.folder_id,
          createdAt: new Date(file.created_at),
          downloadCount: file.download_count || 0
        })));
      } catch (error) {
        console.error('Error fetching shared folder:', error);
        setError('Kunne ikke indlæse den delte mappe');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFolder();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Indlæser delt mappe...</p>
        </div>
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mappe ikke fundet</h1>
          <p className="text-gray-600">{error || 'Den ønskede mappe kunne ikke findes eller er ikke offentligt tilgængelig'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Folder className="h-8 w-8" style={{ color: folder.color }} />
              <h1 className="text-2xl font-bold text-gray-900">Delt mappe: {folder.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {files.length} offentlige filer i denne mappe
          </h2>
          <p className="text-gray-600">
            Disse materialer er delt offentligt og kan downloades
          </p>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingen offentlige filer</h3>
              <p className="text-gray-600">
                Denne mappe indeholder ingen offentligt tilgængelige filer
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map(file => (
              <Card key={file.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-3">
                  {getFileIcon(file.format)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{file.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Af {file.author}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {file.format}
                      </span>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {file.language}
                      </span>
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {file.difficulty}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        Tags: {file.tags.length > 0 ? file.tags.join(", ") : "Ingen tags"}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => window.open(file.fileUrl, '_blank')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download materiale
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedFolder;
