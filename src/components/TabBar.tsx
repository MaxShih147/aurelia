import { X } from 'lucide-react';
import type { Tab } from '../hooks/useTabs';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSwitch: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onNew: () => void;
}

export default function TabBar({ tabs, activeTabId, onSwitch, onClose, onNew }: TabBarProps) {
  if (tabs.length <= 1) return null;

  return (
    <div className="flex items-center h-8 bg-black/20 border-b border-white/5 overflow-x-auto select-none shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isDirty = tab.content !== tab.savedContent;
        const name = tab.path ? tab.path.split('/').pop() : 'Untitled';

        return (
          <button
            key={tab.id}
            onClick={() => onSwitch(tab.id)}
            className={`group flex items-center gap-1.5 px-3 h-full text-xs border-r border-white/5 transition-colors cursor-pointer shrink-0 max-w-[160px] ${
              isActive
                ? 'bg-white/5 text-[var(--deep-sea-text)]'
                : 'text-[var(--deep-sea-text-muted)] hover:bg-white/3'
            }`}
          >
            <span className="truncate">{name}</span>
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--deep-sea-accent)] shrink-0" />
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={10} />
            </span>
          </button>
        );
      })}

      <button
        onClick={onNew}
        className="px-2 h-full text-xs opacity-30 hover:opacity-60 transition-opacity cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
