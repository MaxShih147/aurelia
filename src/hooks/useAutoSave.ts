import { useEffect, useRef, useState } from 'react';
import { writeFile } from '../lib/tauri';

export function useAutoSave(
  path: string | null,
  content: string,
  savedContent: string,
  onSaved: () => void
) {
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only auto-save if the file has a path and content has changed
    if (!path || content === savedContent) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await writeFile(path, content);
        onSaved();
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      } catch {
        // Silent fail for auto-save
      }
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [path, content, savedContent, onSaved]);

  return showSaved;
}
