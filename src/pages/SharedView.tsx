
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Video, Globe, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  title: string;
  author: string;
  source?: string;
  format: string;
  genre: string;
  language: string;
  difficulty: string;
  class_level: string;
  tags: string[];
  file_url: string;
  download_count: number;
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
}

const SharedView = () => {
  const { type, id } = useParams();
  const [material, setMaterial] = useState<Material | null>(null);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        if (type === 'material') {
          // Fetch single material
          const { data, error } = await supabase
            .from('materials')
            .select('*')
            .eq('id', id)
            .eq('is_public', true)
            .single();

          if (error) {
            setError('Materialet blev ikke fundet eller er ikke offentligt tilgængeligt');
            return;
          }

          setMaterial(data);
        } else if (type === 'folder') {
          // Fetch folder and its materials
          const { data: folderData, error: folderError } = await supabase
            .from('folders')
            .select('*')
            .eq('id', id)
            .single();

          if (folderError) {
            setError('Mappen blev ikke fundet');
            return;
          }

          const { data: materialsData, error: materialsError } = await supabase
            .from('materials')
            .select('*')
            .eq('folder_id', id)
            .eq('is_public', true);

          if (materialsError) {
            setError('Kunne ikke hente materialer fra mappen');
            return;
          }

          setFolder(folderData);
          setMaterials(materialsData || []);
        }
      } catch (err) {
        console.error('Error fetching shared content:', err);
        setError('Der opstod en fejl ved indlæsning af indholdet');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSharedContent();
    }
  }, [type, id]);

  const getFileIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-10 w-10 text-red-400" />;
      case "word":
        return <FileText className="h-10 w-10 text-blue-400" />;
      case "video":
        return <Video className="h-10 w-10 text-purple-400" />;
      case "youtube":
        return <Video className="h-10 w-10 text-red-400" />;
      case "link":
        return <Globe className="h-10 w-10 text-green-400" />;
      case "document":
        return <FileText className="h-10 w-10 text-blue-400" />;
      default:
        return <FileText className="h-10 w-10 text-gray-400" />;
    }
  };

  const handleDownload = async (materialId: string, fileUrl: string) => {
    try {
      // Update download count
      await supabase
        .from('materials')
        .update({ download_count: supabase.rpc('increment_download_count', { material_id: materialId }) })
        .eq('id', materialId);

      // Open file
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading material:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke downloade materialet",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Indlæser...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Indhold ikke fundet</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Delt undervisningsmateriale</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {type === 'material' && material && (
          <div className="max-w-md mx-auto">
            <Card className="p-6">
              <div className="flex flex-col items-center space-y-4">
                {getFileIcon(material.format)}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">{material.title}</h2>
                  <p className="text-gray-600">Af {material.author}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {material.format}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {material.language}
                    </span>
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {material.difficulty}
                    </span>
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                      {material.class_level}
                    </span>
                  </div>
                  {material.tags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Tags: {material.tags.join(", ")}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Downloadet {material.download_count} gange
                  </p>
                </div>
                <Button
                  onClick={() => handleDownload(material.id, material.file_url)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download materiale
                </Button>
              </div>
            </Card>
          </div>
        )}

        {type === 'folder' && folder && (
          <div>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Folder className="h-12 w-12 mr-3" style={{ color: folder.color }} />
                <h2 className="text-3xl font-bold text-gray-900">{folder.name}</h2>
              </div>
              <p className="text-gray-600">{materials.length} materialer i denne mappe</p>
            </div>

            {materials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Ingen offentlige materialer i denne mappe</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {materials.map(material => (
                  <Card key={material.id} className="p-6">
                    <div className="flex flex-col items-center space-y-3">
                      {getFileIcon(material.format)}
                      <div className="text-center">
                        <h3 className="font-bold text-base">{material.title}</h3>
                        <p className="text-sm text-gray-600">{material.author}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {material.format}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(material.id, material.file_url)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedView;
