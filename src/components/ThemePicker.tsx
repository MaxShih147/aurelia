import { themes } from '../lib/themes';

interface ThemePickerProps {
  isOpen: boolean;
  currentTheme: string;
  onSelect: (themeId: string) => void;
  onClose: () => void;
}

export default function ThemePicker({ isOpen, currentTheme, onSelect, onClose }: ThemePickerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-[320px] bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-medium">Choose Theme</h2>
        </div>

        <div className="p-3 space-y-1">
          {Object.entries(themes).map(([id, theme]) => (
            <button
              key={id}
              onClick={() => { onSelect(id); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${
                currentTheme === id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              {/* Color preview dots */}
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.bg, border: `1px solid ${theme.colors.border}` }} />
                <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.accent }} />
                <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.text }} />
              </div>
              <span className="text-xs">{theme.name}</span>
              {currentTheme === id && (
                <span className="ml-auto text-[10px] opacity-40">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
