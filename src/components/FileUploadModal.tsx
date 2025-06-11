import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileData, FolderData } from "@/pages/Index";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (fileData: FileData) => void;
  folders: FolderData[];
}

export const FileUploadModal = ({ open, onClose, onUpload, folders }: FileUploadModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    source: "",
    format: "",
    genre: "",
    language: "",
    difficulty: "",
    classLevel: "",
    tags: "",
    isPublic: true,
    folderId: "",
    fileUrl: "",
    gdprCompliant: false,
  });

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Fejl",
        description: "Du skal være logget ind for at uploade filer",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('materials')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke uploade filen",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, uploadType: 'file' | 'link') => {
    e.preventDefault();
    
    if (!formData.gdprCompliant) {
      toast({
        title: "Fejl",
        description: "Du skal bekræfte at materialet overholder GDPR og ophavsret",
        variant: "destructive"
      });
      return;
    }

    let fileUrl = formData.fileUrl;

    if (uploadType === 'file') {
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (!file) {
        toast({
          title: "Fejl",
          description: "Du skal vælge en fil at uploade",
          variant: "destructive"
        });
        return;
      }

      fileUrl = await handleFileUpload(file);
      if (!fileUrl) return;
    } else if (!fileUrl) {
      toast({
        title: "Fejl",
        description: "Du skal indsætte et link til materialet",
        variant: "destructive"
      });
      return;
    }

    const fileData: FileData = {
      ...formData,
      id: "",
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      folderId: formData.folderId || undefined,
      createdAt: new Date(),
      downloadCount: 0,
      fileUrl
    };

    onUpload(fileData);
    
    // Reset form
    setFormData({
      title: "",
      author: "",
      source: "",
      format: "",
      genre: "",
      language: "",
      difficulty: "",
      classLevel: "",
      tags: "",
      isPublic: true,
      folderId: "",
      fileUrl: "",
      gdprCompliant: false,
    });

    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tilføj nyt undervisningsmateriale</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload fil
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Indsæt link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <form onSubmit={(e) => handleSubmit(e, 'file')} className="space-y-4">
              <div>
                <Label htmlFor="file-input">Vælg fil *</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.avi,.mov,.mp3,.wav"
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Understøttede formater: PDF, Word, PowerPoint, Video, Audio
                </p>
              </div>

              {/* Common form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title-upload">Titel *</Label>
                  <Input
                    id="title-upload"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="author-upload">Forfatter *</Label>
                  <Input
                    id="author-upload"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="source-upload">Kilde (valgfri)</Label>
                <Input
                  id="source-upload"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format-upload">Format *</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="word">Word</SelectItem>
                      <SelectItem value="powerpoint">PowerPoint</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="other">Andet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="genre-upload">Genre *</Label>
                  <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artikel">Artikel</SelectItem>
                      <SelectItem value="novelle">Novelle</SelectItem>
                      <SelectItem value="digt">Digt</SelectItem>
                      <SelectItem value="opgave">Opgave</SelectItem>
                      <SelectItem value="præsentation">Præsentation</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="andet">Andet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language-upload">Sprog *</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg sprog" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dansk">Dansk</SelectItem>
                      <SelectItem value="engelsk">Engelsk</SelectItem>
                      <SelectItem value="tysk">Tysk</SelectItem>
                      <SelectItem value="fransk">Fransk</SelectItem>
                      <SelectItem value="spansk">Spansk</SelectItem>
                      <SelectItem value="andet">Andet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty-upload">Sværhedsgrad *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg sværhedsgrad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="let">Let</SelectItem>
                      <SelectItem value="mellem">Mellem</SelectItem>
                      <SelectItem value="svær">Svær</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="classLevel-upload">Klassetrin *</Label>
                <Input
                  id="classLevel-upload"
                  placeholder="f.eks. 7. klasse, 2.g, osv."
                  value={formData.classLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, classLevel: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags-upload">Tags (kommasepareret)</Label>
                <Textarea
                  id="tags-upload"
                  placeholder="f.eks. grammatik, romantik, historie"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              {folders.length > 0 && (
                <div>
                  <Label htmlFor="folder-upload">Gem i mappe (valgfri)</Label>
                  <Select value={formData.folderId} onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg mappe eller lad stå tom for skrivebord" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Skrivebord</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic-upload"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
                />
                <Label htmlFor="isPublic-upload">
                  Gør materialet synligt for andre brugere (anbefalet)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gdprCompliant-upload"
                  checked={formData.gdprCompliant}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprCompliant: !!checked }))}
                  required
                />
                <Label htmlFor="gdprCompliant-upload" className="text-sm">
                  Jeg bekræfter at materialet overholder GDPR og ophavsret samt er lovligt *
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuller
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                  {uploading ? "Uploader..." : "Upload materiale"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="link">
            <form onSubmit={(e) => handleSubmit(e, 'link')} className="space-y-4">
              <div>
                <Label htmlFor="fileUrl-link">Link til materiale *</Label>
                <Input
                  id="fileUrl-link"
                  type="url"
                  placeholder="https://example.com/dokument.pdf"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Indsæt link til Google Drive, OneDrive, YouTube, eller andre platforme
                </p>
              </div>

              {/* Common form fields - same as upload tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title-link">Titel *</Label>
                  <Input
                    id="title-link"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="author-link">Forfatter *</Label>
                  <Input
                    id="author-link"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="source-link">Kilde (valgfri)</Label>
                <Input
                  id="source-link"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format-link">Format *</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="word">Word</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="other">Andet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="genre-link">Genre *</Label>
                  <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artikel">Artikel</SelectItem>
                      <SelectItem value="novelle">Novelle</SelectItem>
                      <SelectItem value="digt">Digt</SelectItem>
                      <SelectItem value="opgave">Opgave</SelectItem>
                      <SelectItem value="præsentation">Præsentation</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="andet">Andet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language-link">Sprog *</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg sprog" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dansk">Dansk</SelectItem>
                      <SelectItem value="engelsk">Engelsk</SelectItem>
                      <SelectItem value="tysk">Tysk</SelectItem>
                      <SelectItem value="fransk">Fransk</SelectItem>
                      <SelectItem value="spansk">Spansk</SelectItem>
                      <SelectItem value="andet">Andet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty-link">Sværhedsgrad *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg sværhedsgrad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="let">Let</SelectItem>
                      <SelectItem value="mellem">Mellem</SelectItem>
                      <SelectItem value="svær">Svær</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="classLevel-link">Klassetrin *</Label>
                <Input
                  id="classLevel-link"
                  placeholder="f.eks. 7. klasse, 2.g, osv."
                  value={formData.classLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, classLevel: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags-link">Tags (kommasepareret)</Label>
                <Textarea
                  id="tags-link"
                  placeholder="f.eks. grammatik, romantik, historie"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              {folders.length > 0 && (
                <div>
                  <Label htmlFor="folder-link">Gem i mappe (valgfri)</Label>
                  <Select value={formData.folderId} onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg mappe eller lad stå tom for skrivebord" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Skrivebord</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic-link"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
                />
                <Label htmlFor="isPublic-link">
                  Gør materialet synligt for andre brugere (anbefalet)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gdprCompliant-link"
                  checked={formData.gdprCompliant}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprCompliant: !!checked }))}
                  required
                />
                <Label htmlFor="gdprCompliant-link" className="text-sm">
                  Jeg bekræfter at materialet overholder GDPR og ophavsret samt er lovligt *
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuller
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Upload materiale
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
