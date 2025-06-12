
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bold, Italic, Underline, List, Table } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TextEditor = ({ value, onChange, placeholder = "Skriv dit indhold her..." }: TextEditorProps) => {
  const [fontSize, setFontSize] = useState("16");
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFormatChange = (formats: string[]) => {
    setActiveFormats(formats);
    
    formats.forEach(format => {
      switch (format) {
        case "bold":
          document.execCommand("bold", false);
          break;
        case "italic":
          document.execCommand("italic", false);
          break;
        case "underline":
          document.execCommand("underline", false);
          break;
        case "list":
          document.execCommand("insertUnorderedList", false);
          break;
      }
    });
    
    updateContent();
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${size}px`;
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Celle 1</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Celle 2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Celle 3</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Celle 4</td>
        </tr>
      </table>
    `;
    
    document.execCommand("insertHTML", false, tableHTML);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
        {/* Font Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Størrelse:</label>
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
          </select>
        </div>

        {/* Format Toggles */}
        <ToggleGroup 
          type="multiple" 
          value={activeFormats} 
          onValueChange={handleFormatChange}
          className="flex gap-1"
        >
          <ToggleGroupItem value="bold" size="sm">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" size="sm">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" size="sm">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" size="sm">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Insert Table */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={insertTable}
        >
          <Table className="h-4 w-4 mr-2" />
          Indsæt tabel
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        style={{ fontSize: `${fontSize}px` }}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </Card>
  );
};
