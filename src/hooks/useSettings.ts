import { useState, useCallback, useEffect } from 'react';

export interface Settings {
  editorFont: string;
  previewFont: string;
  fontSize: number;
  spellCheck: boolean;
  syncScroll: boolean;
  focusMode: boolean;
  theme: string;
}

const DEFAULTS: Settings = {
  editorFont: '"SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
  previewFont: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
  fontSize: 14,
  spellCheck: false,
  syncScroll: true,
  focusMode: false,
  theme: 'deep-sea',
};

const STORAGE_KEY = 'aurelia-settings';

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { settings, update };
}
