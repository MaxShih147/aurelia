import { useState, useCallback } from 'react';
import { open, save, confirm } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, addRecentFile } from '../lib/tauri';

export interface UseFileReturn {
  path: string | null;
  content: string;
  savedContent: string;
  isDirty: boolean;
  filename: string | null;
  updateContent: (newContent: string) => void;
  newFile: () => Promise<void>;
  openFile: (filePath?: string) => Promise<void>;
  saveFile: () => Promise<boolean>;
  saveFileAs: () => Promise<boolean>;
}

export function useFile(): UseFileReturn {
  const [path, setPath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');

  const isDirty = content !== savedContent;
  const filename = path ? path.split('/').pop() ?? null : null;

  const promptSaveIfDirty = useCallback(async (): Promise<boolean> => {
    if (content === savedContent) return true;
    const shouldSave = await confirm(
      'You have unsaved changes. Do you want to save them?',
      { title: 'Unsaved Changes', kind: 'warning' }
    );
    if (shouldSave) {
      if (path) {
        await writeFile(path, content);
        setSavedContent(content);
      } else {
        const chosen = await save({
          filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
        });
        if (chosen) {
          await writeFile(chosen, content);
          setPath(chosen);
          setSavedContent(content);
        }
      }
    }
    return true;
  }, [content, savedContent, path]);

  const newFile = useCallback(async () => {
    await promptSaveIfDirty();
    setContent('');
    setSavedContent('');
    setPath(null);
  }, [promptSaveIfDirty]);

  const openFile = useCallback(async (filePath?: string) => {
    await promptSaveIfDirty();

    let targetPath = filePath;
    if (!targetPath) {
      const selected = await open({
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
        multiple: false,
      });
      if (!selected) return;
      targetPath = selected;
    }

    const fileContent = await readFile(targetPath);
    setContent(fileContent);
    setSavedContent(fileContent);
    setPath(targetPath);

    const name = targetPath.split('/').pop() ?? 'Untitled';
    await addRecentFile({
      path: targetPath,
      name,
      modified: Math.floor(Date.now() / 1000),
    });
  }, [promptSaveIfDirty]);

  const saveFile = useCallback(async (): Promise<boolean> => {
    if (!path) return saveFileAs();
    await writeFile(path, content);
    setSavedContent(content);
    return true;
  }, [path, content]);

  const saveFileAs = useCallback(async (): Promise<boolean> => {
    const chosen = await save({
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
    });
    if (!chosen) return false;
    await writeFile(chosen, content);
    setPath(chosen);
    setSavedContent(content);

    const name = chosen.split('/').pop() ?? 'Untitled';
    await addRecentFile({
      path: chosen,
      name,
      modified: Math.floor(Date.now() / 1000),
    });
    return true;
  }, [content]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  return {
    path,
    content,
    savedContent,
    isDirty,
    filename,
    updateContent,
    newFile,
    openFile,
    saveFile,
    saveFileAs,
  };
}
