
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Video, Globe, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SharedFile {
  id: string;
  title: string;
  author: string;
  format: string;
  genre: string;
  file_url: string;
  download_count: number;
}

interface SharedFolder {
  id: string;
  name: string;
  color: string;
  files: SharedFile[];
}

const SharedView = () => {
  const { type, id } = useParams();
  const [data, setData] = useState<SharedFile | SharedFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      if (!id) return;

      try {
        if (type === "folder") {
          // Fetch folder and its files
          const { data: folderData, error: folderError } = await supabase
            .from('folders')
            .select('*')
            .eq('id', id)
            .single();

          if (folderError) throw folderError;

          const { data: filesData, error: filesError } = await supabase
            .from('materials')
            .select('*')
            .eq('folder_id', id)
            .eq('is_public', true);

          if (filesError) throw filesError;

          setData({
            ...folderData,
            files: filesData || []
          } as SharedFolder);
        } else {
          // Fetch single file
          const { data: fileData, error: fileError } = await supabase
            .from('materials')
            .select('*')
            .eq('id', id)
            .eq('is_public', true)
            .single();

          if (fileError) throw fileError;

          setData(fileData as SharedFile);
        }
      } catch (err) {
        setError("Indholdet blev ikke fundet eller er ikke tilgængeligt");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [type, id]);

  const handleDownload = async (file: SharedFile) => {
    // Increment download count
    await supabase
      .from('materials')
      .update({ download_count: file.download_count + 1 })
      .eq('id', file.id);

    // Open file
    window.open(file.file_url, '_blank');
  };

  const getFileIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-400" />;
      case "word":
        return <FileText className="h-8 w-8 text-blue-400" />;
      case "video":
        return <Video className="h-8 w-8 text-purple-400" />;
      case "youtube":
        return <Video className="h-8 w-8 text-red-400" />;
      case "link":
        return <Globe className="h-8 w-8 text-green-400" />;
      case "document":
        return <FileText className="h-8 w-8 text-blue-400" />;
      default:
        return <FileText className="h-8 w-8 text-gray-400" />;
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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Indhold ikke fundet</h2>
          <p className="text-gray-600">{error || "Det delte indhold kunne ikke findes."}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Delt materiale</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {type === "folder" ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Folder className="h-8 w-8" style={{ color: (data as SharedFolder).color }} />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{(data as SharedFolder).name}</h2>
                <p className="text-gray-600">{(data as SharedFolder).files.length} filer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(data as SharedFolder).files.map((file) => (
                <Card key={file.id} className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    {getFileIcon(file.format)}
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">{file.title}</h3>
                      <p className="text-gray-600">{file.author}</p>
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mt-2">
                        {file.format}
                      </span>
                    </div>
                    <Button onClick={() => handleDownload(file)} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card className="p-8">
              <div className="flex flex-col items-center space-y-6">
                {getFileIcon((data as SharedFile).format)}
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900">{(data as SharedFile).title}</h2>
                  <p className="text-gray-600 mt-2">{(data as SharedFile).author}</p>
                  <div className="flex justify-center mt-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                      {(data as SharedFile).format}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded ml-2">
                      {(data as SharedFile).genre}
                    </span>
                  </div>
                </div>
                <Button onClick={() => handleDownload(data as SharedFile)} size="lg" className="w-full">
                  <Download className="h-5 w-5 mr-2" />
                  Download fil
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Downloadet {(data as SharedFile).download_count} gange
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedView;
