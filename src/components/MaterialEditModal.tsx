import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Material } from "@/hooks/useMaterials";

interface MaterialEditModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (materialData: Partial<Material>) => void;
  material: Material;
}

export const MaterialEditModal = ({ open, onClose, onUpdate, material }: MaterialEditModalProps) => {
  const [formData, setFormData] = useState({
    title: material.title,
    author: material.author,
    format: material.format,
    genre: material.genre,
    language: material.language,
    difficulty: material.difficulty,
    class_level: material.class_level,
    tags: material.tags.join(", "),
    description: material.description || "",
    is_public: material.is_public,
    file_url: material.file_url,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: Partial<Material> = {
      title: formData.title,
      author: formData.author,
      format: formData.format,
      genre: formData.genre,
      language: formData.language,
      difficulty: formData.difficulty,
      class_level: formData.class_level,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      description: formData.description,
      is_public: formData.is_public,
      file_url: formData.file_url,
    };

    onUpdate(updateData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger materiale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fileUrl">Link til materiale *</Label>
            <Input
              id="fileUrl"
              type="url"
              placeholder="https://example.com/dokument.pdf"
              value={formData.file_url}
              onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
              required
            />
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
                  <SelectItem value="redskab">Redskab</SelectItem>
                  <SelectItem value="artikel">Artikel</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="novelle">Novelle</SelectItem>
                  <SelectItem value="roman">Roman</SelectItem>
                  <SelectItem value="digt">Digt</SelectItem>
                  <SelectItem value="fagtekst">Fagtekst</SelectItem>
                  <SelectItem value="film">Film</SelectItem>
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
            <Select value={formData.class_level} onValueChange={(value) => setFormData(prev => ({ ...prev, class_level: value }))}>
              <SelectTrigger id="classLevel">
                <SelectValue placeholder="Vælg klassetrin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle-klassetrin">Alle klassetrin</SelectItem>
                <SelectItem value="0-3">0-3 klasse</SelectItem>
                <SelectItem value="4-6">4-6 klasse</SelectItem>
                <SelectItem value="7-9">7-9 klasse</SelectItem>
                <SelectItem value="gymnasie">Gymnasie</SelectItem>
                <SelectItem value="voksen">Voksenundervisning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Kort beskrivelse (maks. 50 ord)</Label>
            <Textarea
              id="description"
              placeholder="Beskriv kort hvad materialet handler om..."
              value={formData.description}
              onChange={(e) => {
                const words = e.target.value.split(/\s+/).filter(word => word.length > 0);
                if (words.length <= 50) {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                }
              }}
              className="min-h-[80px]"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.split(/\s+/).filter(word => word.length > 0).length}/50 ord
            </p>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
            />
            <Label htmlFor="isPublic">
              Gør materialet synligt for andre brugere (anbefalet)
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuller
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Gem ændringer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};