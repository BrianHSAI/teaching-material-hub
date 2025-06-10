
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
  "#fbbf24", // Gold
  "#f59e0b", // Amber  
  "#d97706", // Orange
  "#dc2626", // Red
  "#7c3aed", // Purple
  "#2563eb", // Blue
  "#059669", // Green
  "#0891b2", // Cyan
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
      <DialogContent className="max-w-md glass-effect border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Opret ny mappe</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="folder-name" className="text-foreground font-medium">Mappenavn *</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="f.eks. Dansk, Matematik, 9. klasse..."
              required
              className="mt-2 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          <div>
            <Label className="text-foreground font-medium">Mappefarve</Label>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {folderColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                    selectedColor === color ? 'border-foreground shadow-lg scale-110' : 'border-border/30'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-background/50 border-border/50 hover:bg-muted/50"
            >
              Annuller
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Opret mappe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
