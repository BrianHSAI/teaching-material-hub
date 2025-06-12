
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileData, FolderData } from "@/pages/Index";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (fileData: FileData) => void;
  folders: FolderData[];
}

export const FileUploadModal = ({ open, onClose, onUpload, folders }: FileUploadModalProps) => {
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
    folderId: "desktop",
    fileUrl: "",
    gdprCompliant: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.gdprCompliant) {
      alert("Du skal bekræfte at materialet overholder GDPR og ophavsret");
      return;
    }

    if (!formData.fileUrl) {
      alert("Du skal indsætte et link til materialet");
      return;
    }

    const fileData: FileData = {
      ...formData,
      id: "",
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      folderId: formData.folderId === "desktop" ? undefined : formData.folderId,
      createdAt: new Date(),
      downloadCount: 0,
      fileUrl: formData.fileUrl
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
      folderId: "desktop",
      fileUrl: "",
      gdprCompliant: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tilføj nyt undervisningsmateriale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fileUrl">Link til materiale *</Label>
            <Input
              id="fileUrl"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="author">Forfatter *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="source">Kilde (valgfri)</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="format">Format *</Label>
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
              <Label htmlFor="genre">Genre *</Label>
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
              <Label htmlFor="language">Sprog *</Label>
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
              <Label htmlFor="difficulty">Sværhedsgrad *</Label>
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
            <Label htmlFor="classLevel">Klassetrin *</Label>
            <Input
              id="classLevel"
              placeholder="f.eks. 7. klasse, 2.g, osv."
              value={formData.classLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, classLevel: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (kommasepareret)</Label>
            <Textarea
              id="tags"
              placeholder="f.eks. grammatik, romantik, historie"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          {folders.length > 0 && (
            <div>
              <Label htmlFor="folder">Gem i mappe (valgfri)</Label>
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
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
            />
            <Label htmlFor="isPublic">
              Gør materialet synligt for andre brugere (anbefalet)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="gdprCompliant"
              checked={formData.gdprCompliant}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprCompliant: !!checked }))}
              required
            />
            <Label htmlFor="gdprCompliant" className="text-sm">
              Jeg bekræfter at materialet overholder GDPR og ophavsret samt er lovligt *
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuller
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Tilføj materiale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
