import type { Settings } from '../hooks/useSettings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const EDITOR_FONTS = [
  { label: 'SF Mono', value: '"SF Mono", Menlo, Monaco, monospace' },
  { label: 'Menlo', value: 'Menlo, Monaco, monospace' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Fira Code', value: '"Fira Code", monospace' },
  { label: 'Cascadia Code', value: '"Cascadia Code", monospace' },
];

const PREVIEW_FONTS = [
  { label: 'System Default', value: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Charter', value: 'Charter, Georgia, serif' },
  { label: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, sans-serif' },
];

export default function SettingsPanel({ isOpen, onClose, settings, onUpdate }: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-[420px] bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-medium">Settings</h2>
        </div>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Font Size */}
          <div>
            <label className="text-xs opacity-50 block mb-2">Font Size</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={24}
                step={1}
                value={settings.fontSize}
                onChange={(e) => onUpdate('fontSize', Number(e.target.value))}
                className="flex-1 accent-sky-400"
              />
              <span className="text-xs w-8 text-right">{settings.fontSize}px</span>
            </div>
          </div>

          {/* Editor Font */}
          <div>
            <label className="text-xs opacity-50 block mb-2">Editor Font</label>
            <select
              value={settings.editorFont}
              onChange={(e) => onUpdate('editorFont', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs outline-none"
            >
              {EDITOR_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Preview Font */}
          <div>
            <label className="text-xs opacity-50 block mb-2">Preview Font</label>
            <select
              value={settings.previewFont}
              onChange={(e) => onUpdate('previewFont', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs outline-none"
            >
              {PREVIEW_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <Toggle label="Spell Check" checked={settings.spellCheck} onChange={(v) => onUpdate('spellCheck', v)} />
            <Toggle label="Sync Scroll" checked={settings.syncScroll} onChange={(v) => onUpdate('syncScroll', v)} />
            <Toggle label="Focus Mode" checked={settings.focusMode} onChange={(v) => onUpdate('focusMode', v)} />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-sky-500/60' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </label>
  );
}
