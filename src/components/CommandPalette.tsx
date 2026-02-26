import { useState, useEffect, useRef, useMemo } from 'react';

interface Action {
  label: string;
  shortcut: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Action[];
}

export default function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      actions.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase())
      ),
    [actions, query]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after mount
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20%]"
      onClick={onClose}
    >
      <div
        className="w-[400px] bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command..."
          className="w-full px-4 py-3 bg-transparent border-b border-white/10 text-sm outline-none"
        />
        <div className="max-h-[300px] overflow-y-auto py-1">
          {filtered.map((action, i) => (
            <button
              key={action.label}
              className={`w-full text-left px-4 py-2 flex items-center justify-between text-sm cursor-pointer transition-colors ${
                i === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              onClick={() => {
                action.action();
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span>{action.label}</span>
              <span className="text-xs opacity-40">{action.shortcut}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-xs opacity-40">No matching commands</div>
          )}
        </div>
      </div>
    </div>
  );
}
