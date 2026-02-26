import { useMemo } from 'react';

interface StatusBarProps {
  content: string;
  filePath: string | null;
  savedIndicator: boolean;
}

export default function StatusBar({ content, filePath, savedIndicator }: StatusBarProps) {
  const stats = useMemo(() => {
    const lines = content.split('\n').length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    return { lines, words, chars };
  }, [content]);

  return (
    <div className="h-6 flex items-center px-4 gap-4 text-xs opacity-50 shrink-0 select-none">
      <span>{stats.words} words</span>
      <span>{stats.chars} chars</span>
      <span>{stats.lines} lines</span>
      <span className="flex-1" />
      {savedIndicator && (
        <span className="text-[var(--deep-sea-accent)]">Saved</span>
      )}
      <span className="truncate max-w-[300px]">{filePath ?? 'Untitled'}</span>
    </div>
  );
}
