import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { findBacklinks, type Backlink } from '../lib/wikilinks';

interface BacklinksPanelProps {
  filePath: string | null;
  onOpenFile: (path: string) => void;
}

export default function BacklinksPanel({ filePath, onOpenFile }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);

  useEffect(() => {
    if (!filePath) {
      setBacklinks([]);
      return;
    }

    const fileName = filePath.split('/').pop()?.replace(/\.md$/i, '') ?? '';
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));

    findBacklinks(fileName, dir).then(setBacklinks).catch(() => setBacklinks([]));
  }, [filePath]);

  if (backlinks.length === 0) {
    return (
      <div className="px-3 py-2 text-xs opacity-30">No backlinks found</div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {backlinks.map((bl, i) => (
        <button
          key={`${bl.sourcePath}-${i}`}
          onClick={() => onOpenFile(bl.sourcePath)}
          className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <ArrowLeft size={10} className="opacity-30 shrink-0" />
            <span className="text-xs truncate">{bl.sourceName}</span>
          </div>
          <div className="text-[10px] opacity-30 truncate mt-0.5 ml-4">
            {bl.context}
          </div>
        </button>
      ))}
    </div>
  );
}
