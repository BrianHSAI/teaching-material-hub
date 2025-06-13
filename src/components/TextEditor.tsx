
import { useState, useRef, useEffect } from "react";
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

  // Set initial content when value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleFormatChange = (formats: string[]) => {
    setActiveFormats(formats);
    
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
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
      editorRef.current.focus();
      // Apply font size to selected text or current cursor position
      document.execCommand('fontSize', false, '7');
      const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
      fontElements.forEach(element => {
        element.removeAttribute('size');
        (element as HTMLElement).style.fontSize = `${size}px`;
      });
    }
    updateContent();
  };

  const insertTable = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent drag behavior when typing
    e.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent drag behavior when clicking in editor
    e.stopPropagation();
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
        {/* Font Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Størrelse:</label>
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="px-3 py-2 border rounded text-sm bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary min-w-[80px]"
            onMouseDown={(e) => e.stopPropagation()}
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
          <ToggleGroupItem value="bold" size="sm" onMouseDown={(e) => e.stopPropagation()}>
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" size="sm" onMouseDown={(e) => e.stopPropagation()}>
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" size="sm" onMouseDown={(e) => e.stopPropagation()}>
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" size="sm" onMouseDown={(e) => e.stopPropagation()}>
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Insert Table */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={insertTable}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Table className="h-4 w-4 mr-2" />
          Indsæt tabel
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        style={{ 
          fontSize: `${fontSize}px`,
          direction: 'ltr',
          textAlign: 'left'
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
    </Card>
  );
};
