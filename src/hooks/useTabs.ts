import { useState, useCallback, useRef } from 'react';
import { open, save, confirm } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, addRecentFile } from '../lib/tauri';

export interface Tab {
  id: string;
  path: string | null;
  content: string;
  savedContent: string;
  scrollPosition?: number;
}

export interface UseTabsReturn {
  tabs: Tab[];
  activeTabId: string;
  activeTab: Tab;
  isDirty: boolean;
  filename: string | null;
  path: string | null;
  content: string;
  savedContent: string;
  updateContent: (content: string) => void;
  newFile: () => void;
  openFile: (filePath?: string) => Promise<void>;
  saveFile: () => Promise<boolean>;
  saveFileAs: () => Promise<boolean>;
  closeTab: (tabId: string) => Promise<void>;
  switchTab: (tabId: string) => void;
  nextTab: () => void;
  prevTab: () => void;
}

let tabCounter = 0;
function nextId() { return `tab-${++tabCounter}`; }

function createTab(path: string | null = null, content = '', savedContent = ''): Tab {
  return { id: nextId(), path, content, savedContent };
}

export function useTabs(): UseTabsReturn {
  const [tabs, setTabs] = useState<Tab[]>(() => [createTab()]);
  const [activeTabId, setActiveTabId] = useState(() => tabs[0].id);
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const isDirty = activeTab.content !== activeTab.savedContent;
  const filename = activeTab.path ? activeTab.path.split('/').pop() ?? null : null;

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  }, []);

  const updateContent = useCallback((content: string) => {
    updateTab(activeTabId, { content });
  }, [activeTabId, updateTab]);

  const newFile = useCallback(() => {
    const tab = createTab();
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const promptSaveIfDirty = useCallback(async (tab: Tab): Promise<boolean> => {
    if (tab.content === tab.savedContent) return true;
    const shouldSave = await confirm(
      'You have unsaved changes. Do you want to save them?',
      { title: 'Unsaved Changes', kind: 'warning' }
    );
    if (shouldSave) {
      if (tab.path) {
        await writeFile(tab.path, tab.content);
        updateTab(tab.id, { savedContent: tab.content });
      } else {
        const chosen = await save({
          filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
        });
        if (chosen) {
          await writeFile(chosen, tab.content);
          updateTab(tab.id, { path: chosen, savedContent: tab.content });
        }
      }
    }
    return true;
  }, [updateTab]);

  const openFile = useCallback(async (filePath?: string) => {
    let targetPath = filePath;
    if (!targetPath) {
      const selected = await open({
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
        multiple: false,
      });
      if (!selected) return;
      targetPath = selected;
    }

    // Check if file is already open in a tab
    const existing = tabsRef.current.find((t) => t.path === targetPath);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const fileContent = await readFile(targetPath);

    // If the active tab is empty and untouched, reuse it
    const current = tabsRef.current.find((t) => t.id === activeTabId);
    if (current && !current.path && current.content === '' && current.savedContent === '') {
      updateTab(activeTabId, { path: targetPath, content: fileContent, savedContent: fileContent });
    } else {
      const tab = createTab(targetPath, fileContent, fileContent);
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tab.id);
    }

    const name = targetPath.split('/').pop() ?? 'Untitled';
    await addRecentFile({
      path: targetPath,
      name,
      modified: Math.floor(Date.now() / 1000),
    });
  }, [activeTabId, updateTab]);

  const saveFile = useCallback(async (): Promise<boolean> => {
    const tab = tabsRef.current.find((t) => t.id === activeTabId);
    if (!tab) return false;
    if (!tab.path) return saveFileAs();
    await writeFile(tab.path, tab.content);
    updateTab(tab.id, { savedContent: tab.content });
    return true;
  }, [activeTabId, updateTab]);

  const saveFileAs = useCallback(async (): Promise<boolean> => {
    const tab = tabsRef.current.find((t) => t.id === activeTabId);
    if (!tab) return false;
    const chosen = await save({
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
    });
    if (!chosen) return false;
    await writeFile(chosen, tab.content);
    updateTab(tab.id, { path: chosen, savedContent: tab.content });

    const name = chosen.split('/').pop() ?? 'Untitled';
    await addRecentFile({
      path: chosen,
      name,
      modified: Math.floor(Date.now() / 1000),
    });
    return true;
  }, [activeTabId, updateTab]);

  const closeTab = useCallback(async (tabId: string) => {
    const tab = tabsRef.current.find((t) => t.id === tabId);
    if (!tab) return;

    if (tab.content !== tab.savedContent) {
      await promptSaveIfDirty(tab);
    }

    const remaining = tabsRef.current.filter((t) => t.id !== tabId);
    if (remaining.length === 0) {
      // Always keep at least one tab
      const newTab = createTab();
      setTabs([newTab]);
      setActiveTabId(newTab.id);
      return;
    }

    setTabs(remaining);
    if (activeTabId === tabId) {
      const idx = tabsRef.current.findIndex((t) => t.id === tabId);
      const newIdx = Math.min(idx, remaining.length - 1);
      setActiveTabId(remaining[newIdx].id);
    }
  }, [activeTabId, promptSaveIfDirty]);

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const nextTab = useCallback(() => {
    const idx = tabsRef.current.findIndex((t) => t.id === activeTabId);
    const next = (idx + 1) % tabsRef.current.length;
    setActiveTabId(tabsRef.current[next].id);
  }, [activeTabId]);

  const prevTab = useCallback(() => {
    const idx = tabsRef.current.findIndex((t) => t.id === activeTabId);
    const prev = (idx - 1 + tabsRef.current.length) % tabsRef.current.length;
    setActiveTabId(tabsRef.current[prev].id);
  }, [activeTabId]);

  return {
    tabs,
    activeTabId,
    activeTab,
    isDirty,
    filename,
    path: activeTab.path,
    content: activeTab.content,
    savedContent: activeTab.savedContent,
    updateContent,
    newFile,
    openFile,
    saveFile,
    saveFileAs,
    closeTab,
    switchTab,
    nextTab,
    prevTab,
  };
}
