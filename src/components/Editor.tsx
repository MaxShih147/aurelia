import { useCallback, type KeyboardEvent } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Patterns for list item matching (indent, marker, content)
const ORDERED_ITEM_RE = /^(\s*)(\d+)\.\s(.*)$/;
const UNORDERED_ITEM_RE = /^(\s*)([-*+])\s(.*)$/;
const CHECKBOX_ITEM_RE = /^(\s*)([-*+])\s\[[ x]\]\s(.*)$/;

function handleEnterInList(
  content: string,
  cursorPos: number
): { newContent: string; newCursor: number } | null {
  // Find the current line
  const beforeCursor = content.substring(0, cursorPos);
  const afterCursor = content.substring(cursorPos);
  const lastNewline = beforeCursor.lastIndexOf('\n');
  const currentLine = beforeCursor.substring(lastNewline + 1);

  // Check for checkbox list (must check before unordered)
  const checkboxMatch = currentLine.match(CHECKBOX_ITEM_RE);
  if (checkboxMatch) {
    const [, indent, bullet, text] = checkboxMatch;
    if (text.trim() === '') {
      // Empty checkbox item → remove the marker
      const lineStart = lastNewline + 1;
      const newContent = content.substring(0, lineStart) + afterCursor;
      return { newContent, newCursor: lineStart };
    }
    // Continue with unchecked checkbox
    const continuation = `\n${indent}${bullet} [ ] `;
    const newContent = beforeCursor + continuation + afterCursor;
    return { newContent, newCursor: cursorPos + continuation.length };
  }

  // Check for ordered list (1. 2. 3.)
  const orderedMatch = currentLine.match(ORDERED_ITEM_RE);
  if (orderedMatch) {
    const [, indent, numStr, text] = orderedMatch;
    if (text.trim() === '') {
      // Empty ordered item → remove the marker
      const lineStart = lastNewline + 1;
      const newContent = content.substring(0, lineStart) + afterCursor;
      return { newContent, newCursor: lineStart };
    }
    // Continue with next number
    const nextNum = parseInt(numStr) + 1;
    const continuation = `\n${indent}${nextNum}. `;
    const newContent = beforeCursor + continuation + afterCursor;
    return { newContent, newCursor: cursorPos + continuation.length };
  }

  // Check for unordered list (- * +)
  const unorderedMatch = currentLine.match(UNORDERED_ITEM_RE);
  if (unorderedMatch) {
    const [, indent, bullet, text] = unorderedMatch;
    if (text.trim() === '') {
      // Empty unordered item → remove the marker
      const lineStart = lastNewline + 1;
      const newContent = content.substring(0, lineStart) + afterCursor;
      return { newContent, newCursor: lineStart };
    }
    // Continue with same bullet
    const continuation = `\n${indent}${bullet} `;
    const newContent = beforeCursor + continuation + afterCursor;
    return { newContent, newCursor: cursorPos + continuation.length };
  }

  return null;
}

// TODO: Replace with CodeMirror 6 for syntax highlighting
export default function Editor({ content, onChange }: EditorProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault();
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && start === end) {
      const result = handleEnterInList(content, start);
      if (result) {
        e.preventDefault();
        onChange(result.newContent);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = result.newCursor;
        });
      }
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
