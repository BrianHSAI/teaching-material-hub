
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableInsertModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
}

export const TableInsertModal = ({ open, onClose, onInsert }: TableInsertModalProps) => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  const handleInsert = () => {
    onInsert(rows, cols);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Indsæt tabel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="rows">Antal rækker</Label>
            <Input
              id="rows"
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </div>
          
          <div>
            <Label htmlFor="cols">Antal kolonner</Label>
            <Input
              id="cols"
              type="number"
              min="1"
              max="10"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuller
            </Button>
            <Button onClick={handleInsert}>
              Indsæt tabel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
