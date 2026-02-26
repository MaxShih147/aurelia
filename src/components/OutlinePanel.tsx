import { useMemo } from 'react';
import { Hash } from 'lucide-react';
import { extractHeadings } from '../lib/markdown-utils';

interface OutlinePanelProps {
  content: string;
  onScrollToLine: (line: number) => void;
}

export default function OutlinePanel({ content, onScrollToLine }: OutlinePanelProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) {
    return (
      <div className="px-3 py-2 text-xs opacity-30">No headings found</div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {headings.map((heading, i) => (
        <button
          key={`${heading.line}-${i}`}
          onClick={() => onScrollToLine(heading.line)}
          className="w-full text-left py-1 flex items-center gap-1.5 hover:bg-white/5 transition-colors cursor-pointer group"
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px`, paddingRight: '12px' }}
        >
          <Hash size={10} className="opacity-30 shrink-0" />
          <span
            className="text-xs truncate"
            style={{
              opacity: heading.level <= 2 ? 0.9 : 0.6,
              fontWeight: heading.level <= 2 ? 500 : 400,
            }}
          >
            {heading.text}
          </span>
        </button>
      ))}
    </div>
  );
}
