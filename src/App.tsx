import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import TitleBar from './components/TitleBar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import CommandPalette from './components/CommandPalette';
import SettingsPanel from './components/SettingsPanel';
import TableEditor from './components/TableEditor';
import TabBar from './components/TabBar';
import ThemePicker from './components/ThemePicker';
import GraphView from './components/GraphView';
import { useTabs } from './hooks/useTabs';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboard } from './hooks/useKeyboard';
import { useSettings } from './hooks/useSettings';
import { useSyncScroll } from './hooks/useSyncScroll';
import { EditorView } from '@codemirror/view';
import { toggleFullScreen } from './lib/tauri';
import { exportToHTML, exportToPDF } from './lib/export';
import { applyTheme } from './lib/themes';
import type { EditorHandle } from './types/editor';

function dispatchEditorAction(action: string) {
  window.dispatchEvent(new CustomEvent('editor-action', { detail: action }));
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tableEditorOpen, setTableEditorOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [graphViewOpen, setGraphViewOpen] = useState(false);
  const editorRef = useRef<EditorHandle>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const file = useTabs();
  const { settings, update: updateSettings } = useSettings();

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(settings.theme ?? 'deep-sea');
  }, [settings.theme]);

  const handleAutoSaved = useCallback(() => {}, []);

  const savedIndicator = useAutoSave(
    file.path,
    file.content,
    file.savedContent,
    handleAutoSaved
  );

  // Sync scroll between editor and preview
  const getEditorView = useCallback(() => editorRef.current?.getView() ?? null, []);
  useSyncScroll(settings.syncScroll && previewOpen, getEditorView, previewRef);

  const toggleCommandPalette = useCallback(() => setCommandPaletteOpen((v) => !v), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const togglePreview = useCallback(() => setPreviewOpen((v) => !v), []);
  const toggleOutline = useCallback(() => { setOutlineOpen((v) => !v); setSidebarOpen(true); }, []);
  const handleToggleFullScreen = useCallback(() => { toggleFullScreen(); }, []);

  const handleExportHTML = useCallback(() => {
    exportToHTML(file.content, file.filename ?? 'Untitled');
  }, [file.content, file.filename]);

  const handleExportPDF = useCallback(() => {
    exportToPDF(file.content, file.filename ?? 'Untitled');
  }, [file.content, file.filename]);

  const handleToggleSettings = useCallback(() => setSettingsOpen((v) => !v), []);

  const handleToggleFocusMode = useCallback(() => {
    updateSettings('focusMode', !settings.focusMode);
  }, [settings.focusMode, updateSettings]);

  const handleToggleSpellCheck = useCallback(() => {
    updateSettings('spellCheck', !settings.spellCheck);
  }, [settings.spellCheck, updateSettings]);

  const handleInsertTable = useCallback((markdown: string) => {
    const view = editorRef.current?.getView();
    if (!view) return;
    const { from } = view.state.selection.main;
    const insert = '\n' + markdown + '\n';
    view.dispatch({
      changes: { from, insert },
      selection: { anchor: from + insert.length },
    });
    view.focus();
  }, []);

  const handleSelectTheme = useCallback((themeId: string) => {
    updateSettings('theme', themeId);
  }, [updateSettings]);

  const handleWikiLinkClick = useCallback((name: string) => {
    // Try to open a file with this name in the same directory
    if (!file.path) return;
    const dir = file.path.substring(0, file.path.lastIndexOf('/'));
    const targetPath = `${dir}/${name}.md`;
    file.openFile(targetPath);
  }, [file]);

  // Listen for native menu events from Rust
  useEffect(() => {
    const unlisten = listen<string>('menu-event', (event) => {
      switch (event.payload) {
        case 'new_file': file.newFile(); break;
        case 'open_file': file.openFile(); break;
        case 'save_file': file.saveFile(); break;
        case 'save_as': file.saveFileAs(); break;
        case 'toggle_sidebar': setSidebarOpen((v) => !v); break;
        case 'toggle_preview': setPreviewOpen((v) => !v); break;
        case 'export_html': exportToHTML(file.content, file.filename ?? 'Untitled'); break;
        case 'export_pdf': exportToPDF(file.content, file.filename ?? 'Untitled'); break;
        case 'toggle_outline': setOutlineOpen((v) => !v); setSidebarOpen(true); break;
        case 'toggle_fullscreen': toggleFullScreen(); break;
        case 'command_palette': setCommandPaletteOpen((v) => !v); break;
        case 'undo': dispatchEditorAction('undo'); break;
        case 'redo': dispatchEditorAction('redo'); break;
        case 'find': dispatchEditorAction('find'); break;
      }
    });

    return () => { unlisten.then((fn) => fn()); };
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
      onToggleOutline: toggleOutline,
      onToggleFullScreen: handleToggleFullScreen,
    }),
    [file, toggleCommandPalette, toggleSidebar, togglePreview, toggleOutline, handleToggleFullScreen]
  );

  useKeyboard(keyboardActions);

  // Tab keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.metaKey) return;
      if (e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        setGraphViewOpen((v) => !v);
      } else if (e.key === 'w') {
        e.preventDefault();
        file.closeTab(file.activeTabId);
      } else if (e.key === ']' && e.shiftKey) {
        e.preventDefault();
        file.nextTab();
      } else if (e.key === '[' && e.shiftKey) {
        e.preventDefault();
        file.prevTab();
      } else if (e.key === 't') {
        e.preventDefault();
        file.newFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [file]);

  const commandActions = useMemo(
    () => [
      { label: 'New File', shortcut: '⌘N', action: file.newFile },
      { label: 'Open File', shortcut: '⌘O', action: () => file.openFile() },
      { label: 'Save', shortcut: '⌘S', action: file.saveFile },
      { label: 'Save As', shortcut: '⇧⌘S', action: file.saveFileAs },
      { label: 'Close Tab', shortcut: '⌘W', action: () => file.closeTab(file.activeTabId) },
      { label: 'Export HTML', shortcut: '', action: handleExportHTML },
      { label: 'Export PDF', shortcut: '', action: handleExportPDF },
      { label: 'Toggle Sidebar', shortcut: '⌘B', action: toggleSidebar },
      { label: 'Toggle Preview', shortcut: '⌘P', action: togglePreview },
      { label: 'Toggle Outline', shortcut: '⇧⌘O', action: toggleOutline },
      { label: 'Toggle Full Screen', shortcut: '⌃⌘F', action: handleToggleFullScreen },
      { label: 'Focus Mode', shortcut: '⇧⌘F', action: handleToggleFocusMode },
      { label: 'Spell Check', shortcut: '', action: handleToggleSpellCheck },
      { label: 'Change Theme', shortcut: '', action: () => setThemePickerOpen(true) },
      { label: 'Insert Table', shortcut: '', action: () => setTableEditorOpen(true) },
      { label: 'Graph View', shortcut: '⌘G', action: () => setGraphViewOpen(true) },
      { label: 'Settings', shortcut: '⌘,', action: handleToggleSettings },
      { label: 'Find & Replace', shortcut: '⌘F', action: () => dispatchEditorAction('find') },
    ],
    [file, handleExportHTML, handleExportPDF, toggleSidebar, togglePreview, toggleOutline, handleToggleFullScreen, handleToggleFocusMode, handleToggleSpellCheck, handleToggleSettings]
  );

  const handleOpenRecent = useCallback(
    (path: string) => { file.openFile(path); },
    [file]
  );

  const handleScrollToLine = useCallback((line: number) => {
    const view = editorRef.current?.getView();
    if (!view) return;
    const lineInfo = view.state.doc.line(line);
    view.dispatch({
      selection: { anchor: lineInfo.from },
      effects: EditorView.scrollIntoView(lineInfo.from, { y: 'start', yMargin: 50 }),
    });
    view.focus();
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ background: 'var(--deep-sea-bg)' }}
    >
      <TitleBar filename={file.filename} isDirty={file.isDirty} />

      <TabBar
        tabs={file.tabs}
        activeTabId={file.activeTabId}
        onSwitch={file.switchTab}
        onClose={file.closeTab}
        onNew={file.newFile}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          isOpen={sidebarOpen}
          outlineOpen={outlineOpen}
          content={file.content}
          filePath={file.path}
          onOpenFile={handleOpenRecent}
          onScrollToLine={handleScrollToLine}
        />

        <Editor
          key={file.activeTabId}
          ref={editorRef}
          content={file.content}
          onChange={file.updateContent}
          spellCheck={settings.spellCheck}
          focusMode={settings.focusMode}
          fontFamily={settings.editorFont}
          fontSize={settings.fontSize}
          filePath={file.path}
        />

        {previewOpen && (
          <Preview
            ref={previewRef}
            content={file.content}
            fontFamily={settings.previewFont}
            fontSize={settings.fontSize}
            onWikiLinkClick={handleWikiLinkClick}
          />
        )}
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

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />

      <TableEditor
        isOpen={tableEditorOpen}
        onInsert={handleInsertTable}
        onClose={() => setTableEditorOpen(false)}
      />

      <ThemePicker
        isOpen={themePickerOpen}
        currentTheme={settings.theme ?? 'deep-sea'}
        onSelect={handleSelectTheme}
        onClose={() => setThemePickerOpen(false)}
      />

      <GraphView
        isOpen={graphViewOpen}
        filePath={file.path}
        onClose={() => setGraphViewOpen(false)}
        onOpenFile={handleOpenRecent}
      />
    </div>
  );
}
