import { useEffect } from 'react';

interface KeyboardActions {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onToggleCommandPalette: () => void;
  onToggleSidebar: () => void;
  onTogglePreview: () => void;
  onToggleOutline: () => void;
  onToggleFullScreen: () => void;
  onToggleSettings: () => void;
}

export function useKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          if (!e.shiftKey) {
            e.preventDefault();
            actions.onNewFile();
          }
          break;
        case 'o':
          if (e.shiftKey) {
            e.preventDefault();
            actions.onToggleOutline();
          } else {
            e.preventDefault();
            actions.onOpenFile();
          }
          break;
        case 's':
          e.preventDefault();
          if (e.shiftKey) {
            actions.onSaveAs();
          } else {
            actions.onSave();
          }
          break;
        case 'k':
          e.preventDefault();
          actions.onToggleCommandPalette();
          break;
        case 'b':
          e.preventDefault();
          actions.onToggleSidebar();
          break;
        case 'p':
          e.preventDefault();
          actions.onTogglePreview();
          break;
        case 'f':
          if (e.ctrlKey) {
            e.preventDefault();
            actions.onToggleFullScreen();
          }
          break;
        case ',':
          e.preventDefault();
          actions.onToggleSettings();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
