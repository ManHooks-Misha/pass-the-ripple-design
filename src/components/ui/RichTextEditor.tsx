import React, { useRef, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline,
  List, ListOrdered, Quote,
  Undo, Redo,
  Type, Code,
  AlignLeft, AlignCenter, AlignRight,
  Palette, Smartphone, Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getPlainText } from '@/utils/textUtils';
import { EMOJI_CATEGORIES } from './emojiData';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// Component to display formatted HTML content
interface FormattedContentProps {
  content: string;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content, className }) => {
  // Sanitize the content by extracting plain text to prevent HTML injection
  const plainText = getPlainText(content);

  return (
    <div
      className={cn("formatted-content", className)}
    >
      {plainText}
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your story...",
  className,
  minHeight = "200px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor with HTML content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      // Convert plain text to HTML if needed
      const htmlContent = value.includes('<') ? value : value.split('\n').map(line =>
        line.trim() ? `<p>${line}</p>` : '<p><br></p>'
      ).join('');

      editorRef.current.innerHTML = htmlContent || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Update editor when value changes externally (like when editing a different story)
  useEffect(() => {
    if (editorRef.current && isInitialized) {
      const currentHTML = editorRef.current.innerHTML;
      const newHTML = value.includes('<') ? value : value.split('\n').map(line =>
        line.trim() ? `<p>${line}</p>` : '<p><br></p>'
      ).join('');

      // Only update if content is different to avoid cursor jumps
      if (currentHTML !== newHTML && currentHTML !== value) {
        editorRef.current.innerHTML = newHTML || '';
      }
    }
  }, [value, isInitialized]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;

      // Clean up the HTML and convert to plain text if it's basically empty
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      // If there's actual content or formatting, save as HTML
      // If it's empty or just whitespace, save as empty string
      if (textContent.trim()) {
        onChange(html);
      } else {
        onChange('');
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertHeading = () => {
    execCommand('formatBlock', 'h3');
  };

  const [activeEmojiTab, setActiveEmojiTab] = useState<string>('smileys_people');

  const insertIcon = (icon: string) => {
    execCommand('insertText', icon);
  };

  const PRESET_COLORS = [
    '#000000', '#4B5563', '#6B7280', '#9CA3AF', '#FFFFFF',
    '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
    '#EA580C', '#F97316', '#FDBA74', '#FFEDD5',
    '#D97706', '#F59E0B', '#FCD34D', '#FEF3C7',
    '#16A34A', '#22C55E', '#4ADE80', '#86EFAC',
    '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
    '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD',
    '#DB2777', '#EC4899', '#F472B6', '#FBCFE8'
  ];

  const FONTS = [
    { name: "Inter", value: "Inter" },
    { name: "Arial", value: "Arial" },
    { name: "Courier New", value: "Courier New" },
    { name: "Georgia", value: "Georgia" },
    { name: "Times New Roman", value: "Times New Roman" },
    { name: "Verdana", value: "Verdana" }
  ];

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-white", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">

        {/* Style Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('bold')} title="Bold (Ctrl+B)"><Bold className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('italic')} title="Italic (Ctrl+I)"><Italic className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('underline')} title="Underline (Ctrl+U)"><Underline className="h-4 w-4" /></Button>
        </div>

        {/* Alignment Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('justifyLeft')} title="Align Left"><AlignLeft className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('justifyCenter')} title="Align Center"><AlignCenter className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('justifyRight')} title="Align Right"><AlignRight className="h-4 w-4" /></Button>
        </div>

        {/* Lists & Format Group */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('insertUnorderedList')} title="Bullet List"><List className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('insertOrderedList')} title="Numbered List"><ListOrdered className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={insertHeading} title="Heading"><Type className="h-4 w-4" /></Button>
        </div>

        {/* Font & Color Group */}
        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <Select onValueChange={(v) => execCommand('fontName', v)}>
            <SelectTrigger className="h-8 w-[100px] text-xs border-0 bg-transparent hover:bg-gray-200 px-2">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map(f => <SelectItem key={f.value} value={f.value}><span style={{ fontFamily: f.value }}>{f.name}</span></SelectItem>)}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" title="Text Color"><Palette className="h-4 w-4" /><div className="sr-only">Color</div></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium mb-2 text-muted-foreground">Presets</div>
                  <div className="grid grid-cols-8 gap-1">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => execCommand('foreColor', color)}
                        type="button"
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs font-medium mb-1 text-muted-foreground">Custom</div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                      <input
                        type="color"
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Click circle to pick</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Insert Group */}
        <div className="flex items-center gap-0.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" title="Insert Icon"><Smile className="h-4 w-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="start">
              <div className="flex border-b bg-muted/30 p-1 gap-1 overflow-x-auto no-scrollbar">
                {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveEmojiTab(key)}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-md transition-colors text-lg hover:bg-muted min-w-[36px]",
                      activeEmojiTab === key ? "bg-white shadow-sm ring-1 ring-border" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                    )}
                    title={category.name}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <div className="h-[250px] overflow-y-auto p-2">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_CATEGORIES[activeEmojiTab as keyof typeof EMOJI_CATEGORIES]?.emojis.map((icon, i) => (
                    <button
                      key={i}
                      className="text-xl h-8 w-8 flex items-center justify-center hover:bg-accent rounded cursor-pointer transition-transform hover:scale-110"
                      onClick={() => insertIcon(icon)}
                      type="button"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 ml-auto" onClick={() => execCommand('undo')} title="Undo"><Undo className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => execCommand('redo')} title="Redo"><Redo className="h-4 w-4" /></Button>
        </div>

      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        [contenteditable] {
          line-height: 1.6;
        }

        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        [contenteditable] p {
          margin-bottom: 0.75rem;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }

        [contenteditable] li {
          margin-bottom: 0.25rem;
        }

        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 0.75rem;
          margin-top: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }

        [contenteditable] strong {
          font-weight: 600;
        }

        [contenteditable] em {
          font-style: italic;
        }

        [contenteditable] br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }

        /* Remove default margins for first/last elements */
        [contenteditable] > *:first-child {
          margin-top: 0;
        }

        [contenteditable] > *:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};