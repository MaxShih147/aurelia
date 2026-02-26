import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import TitleBar from './components/TitleBar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import CommandPalette from './components/CommandPalette';
import { useFile } from './hooks/useFile';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboard } from './hooks/useKeyboard';
import type { EditorHandle } from './types/editor';

function dispatchEditorAction(action: string) {
  window.dispatchEvent(new CustomEvent('editor-action', { detail: action }));
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const editorRef = useRef<EditorHandle>(null);

  const file = useFile();

  const handleAutoSaved = useCallback(() => {
    // Auto-save writes directly; the savedIndicator handles the visual feedback
  }, []);

  const savedIndicator = useAutoSave(
    file.path,
    file.content,
    file.savedContent,
    handleAutoSaved
  );

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((v) => !v);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((v) => !v);
  }, []);

  const togglePreview = useCallback(() => {
    setPreviewOpen((v) => !v);
  }, []);

  // Listen for native menu events from Rust
  useEffect(() => {
    const unlisten = listen<string>('menu-event', (event) => {
      switch (event.payload) {
        case 'new_file':
          file.newFile();
          break;
        case 'open_file':
          file.openFile();
          break;
        case 'save_file':
          file.saveFile();
          break;
        case 'save_as':
          file.saveFileAs();
          break;
        case 'toggle_sidebar':
          setSidebarOpen((v) => !v);
          break;
        case 'toggle_preview':
          setPreviewOpen((v) => !v);
          break;
        case 'command_palette':
          setCommandPaletteOpen((v) => !v);
          break;
        case 'undo':
          dispatchEditorAction('undo');
          break;
        case 'redo':
          dispatchEditorAction('redo');
          break;
        case 'find':
          dispatchEditorAction('find');
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [file]);

  const keyboardActions = useMemo(
    () => ({
      onNewFile: file.newFile,
      onOpenFile: () => file.openFile(),
      onSave: file.saveFile,
      onSaveAs: file.saveFileAs,
      onToggleCommandPalette: toggleCommandPalette,
      onToggleSidebar: toggleSidebar,
      onTogglePreview: togglePreview,
    }),
    [file, toggleCommandPalette, toggleSidebar, togglePreview]
  );

  useKeyboard(keyboardActions);

  const commandActions = useMemo(
    () => [
      { label: 'New File', shortcut: '⌘N', action: file.newFile },
      { label: 'Open File', shortcut: '⌘O', action: () => file.openFile() },
      { label: 'Save', shortcut: '⌘S', action: file.saveFile },
      { label: 'Save As', shortcut: '⇧⌘S', action: file.saveFileAs },
      { label: 'Toggle Sidebar', shortcut: '⌘B', action: toggleSidebar },
      { label: 'Toggle Preview', shortcut: '⌘P', action: togglePreview },
      { label: 'Find & Replace', shortcut: '⌘F', action: () => dispatchEditorAction('find') },
    ],
    [file, toggleSidebar, togglePreview]
  );

  const handleOpenRecent = useCallback(
    (path: string) => {
      file.openFile(path);
    },
    [file]
  );

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ background: 'var(--deep-sea-bg)' }}
    >
      <TitleBar filename={file.filename} isDirty={file.isDirty} />

      <div className="flex flex-1 min-h-0">
        <Sidebar isOpen={sidebarOpen} onOpenFile={handleOpenRecent} />

        <Editor ref={editorRef} content={file.content} onChange={file.updateContent} />

        {previewOpen && <Preview content={file.content} />}
      </div>

      <StatusBar
        content={file.content}
        filePath={file.path}
        savedIndicator={savedIndicator}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        actions={commandActions}
      />
    </div>
  );
}
