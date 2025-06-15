
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextEditor } from "./TextEditor";
import { FileData, FolderData } from "@/pages/Index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (document: Omit<FileData, 'id' | 'createdAt' | 'downloadCount'>) => void;
  folders: FolderData[];
  editingDocument?: FileData | null;
}

export const DocumentModal = ({ open, onClose, onSave, folders, editingDocument }: DocumentModalProps) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("desktop");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("Dansk");
  const [difficulty, setDifficulty] = useState("Begynder");
  const [classLevel, setClassLevel] = useState("1. klasse");

  useEffect(() => {
    if (editingDocument) {
      setTitle(editingDocument.title);
      setAuthor(editingDocument.author);
      setContent(editingDocument.fileUrl || "");
      setSelectedFolder(editingDocument.folderId || "desktop");
      setGenre(editingDocument.genre);
      setLanguage(editingDocument.language);
      setDifficulty(editingDocument.difficulty);
      setClassLevel(editingDocument.classLevel);
    } else {
      // Reset form
      setTitle("");
      setAuthor("");
      setContent("");
      setSelectedFolder("desktop");
      setGenre("");
      setLanguage("Dansk");
      setDifficulty("Begynder");
      setClassLevel("1. klasse");
    }
  }, [editingDocument, open]);

  const handleSave = () => {
    if (!title.trim()) return;

    const documentData: Omit<FileData, 'id' | 'createdAt' | 'downloadCount'> = {
      title: title.trim(),
      author: author.trim(),
      format: "document",
      genre: genre.trim(),
      language,
      difficulty,
      classLevel,
      tags: [],
      isPublic: false,
      fileUrl: content,
      folderId: selectedFolder === "desktop" ? undefined : selectedFolder
    };

    onSave(documentData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingDocument ? "Rediger dokument" : "Opret nyt dokument"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Skriv titel på dokumentet..."
              />
            </div>
            <div>
              <Label htmlFor="author">Forfatter</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Dit navn..."
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Genre/Emne</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Vælg genre..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artikel">Artikel</SelectItem>
                  <SelectItem value="novelle">Novelle</SelectItem>
                  <SelectItem value="roman">Roman</SelectItem>
                  <SelectItem value="digt">Digt</SelectItem>
                  <SelectItem value="fagtekst">Fagtekst</SelectItem>
                  <SelectItem value="matematik">Matematik</SelectItem>
                  <SelectItem value="dansk">Dansk</SelectItem>
                  <SelectItem value="naturvidenskab">Naturvidenskab</SelectItem>
                  <SelectItem value="historie">Historie</SelectItem>
                  <SelectItem value="andet">Andet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="folder">Mappe</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Vælg mappe (valgfrit)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Gem på skrivebord</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Properties */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="language">Sprog</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dansk">Dansk</SelectItem>
                  <SelectItem value="Engelsk">Engelsk</SelectItem>
                  <SelectItem value="Tysk">Tysk</SelectItem>
                  <SelectItem value="Fransk">Fransk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Sværhedsgrad</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Begynder">Begynder</SelectItem>
                  <SelectItem value="Øvet">Øvet</SelectItem>
                  <SelectItem value="Avanceret">Avanceret</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="classLevel">Klassetrin</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={`${i + 1}. klasse`}>
                      {i + 1}. klasse
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Editor */}
          <div>
            <Label>Indhold</Label>
            <TextEditor
              value={content}
              onChange={setContent}
              placeholder="Skriv dit dokument her..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuller
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {editingDocument ? "Gem ændringer" : "Opret dokument"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
