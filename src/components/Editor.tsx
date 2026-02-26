import { useCallback, type KeyboardEvent } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

// TODO: Replace with CodeMirror 6 for syntax highlighting
export default function Editor({ content, onChange }: EditorProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      // Restore cursor position after React re-renders
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  }, [content, onChange]);

  return (
    <textarea
      className="flex-1 bg-transparent resize-none outline-none border-none font-mono text-base leading-relaxed p-8 h-full w-full"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Start writing..."
      spellCheck={false}
    />
  );
}
