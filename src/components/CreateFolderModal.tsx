
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

const folderColors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export const CreateFolderModal = ({ open, onClose, onCreate }: CreateFolderModalProps) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(folderColors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), selectedColor);
      setName("");
      setSelectedColor(folderColors[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Opret ny mappe</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="folder-name">Mappenavn *</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="f.eks. Dansk, Matematik, 9. klasse..."
              required
            />
          </div>

          <div>
            <Label>Mappefarve</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {folderColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuller
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Opret mappe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
