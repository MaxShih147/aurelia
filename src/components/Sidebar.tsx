import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import type { RecentFile } from '../types';
import { getRecentFiles } from '../lib/tauri';
import OutlinePanel from './OutlinePanel';
import BacklinksPanel from './BacklinksPanel';

interface SidebarProps {
  isOpen: boolean;
  outlineOpen: boolean;
  content: string;
  filePath?: string | null;
  onOpenFile: (path: string) => void;
  onScrollToLine: (line: number) => void;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Sidebar({ isOpen, outlineOpen, content, filePath, onOpenFile, onScrollToLine }: SidebarProps) {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  useEffect(() => {
    if (isOpen) {
      getRecentFiles()
        .then(setRecentFiles)
        .catch(() => setRecentFiles([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="w-[200px] shrink-0 h-full bg-black/30 backdrop-blur-lg border-r border-white/8 flex flex-col overflow-hidden">
      {/* Recent Files */}
      <div className="px-3 pt-10 pb-2 text-[10px] uppercase tracking-wider opacity-40 select-none">
        Recent Files
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: outlineOpen ? '30%' : undefined, flex: outlineOpen ? undefined : 1 }}>
        {recentFiles.length === 0 && (
          <div className="px-3 py-2 text-xs opacity-30">No recent files</div>
        )}
        {recentFiles.map((file) => (
          <button
            key={file.path}
            onClick={() => onOpenFile(file.path)}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <FileText size={14} className="opacity-40 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate">{file.name}</div>
              <div className="text-[10px] opacity-40">{timeAgo(file.modified)}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Outline */}
      {outlineOpen && (
        <>
          <div className="border-t border-white/8" />
          <div className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-wider opacity-40 select-none">
            Outline
          </div>
          <OutlinePanel content={content} onScrollToLine={onScrollToLine} />
        </>
      )}

      {/* Backlinks */}
      {filePath && (
        <>
          <div className="border-t border-white/8" />
          <div className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-wider opacity-40 select-none">
            Backlinks
          </div>
          <BacklinksPanel filePath={filePath} onOpenFile={onOpenFile} />
        </>
      )}
    </div>
  );
}
