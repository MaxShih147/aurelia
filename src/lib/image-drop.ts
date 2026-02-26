import { EditorView } from '@codemirror/view';
import { copyImage } from './tauri';

export function createImageDropHandler(getFilePath: () => string | null) {
  return EditorView.domEventHandlers({
    drop(event, view) {
      const filePath = getFilePath();
      if (!filePath) return false;

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return false;

      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (imageFiles.length === 0) return false;

      event.preventDefault();

      // Get directory of current file
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? view.state.selection.main.from;

      (async () => {
        const inserts: string[] = [];
        for (const file of imageFiles) {
          // The file path from drag is available via webkitGetAsEntry or the File object
          // In Tauri, dropped files have a path property
          const path = (file as File & { path?: string }).path;
          if (!path) continue;

          try {
            const relativePath = await copyImage(path, dir);
            inserts.push(`![${file.name}](${relativePath})`);
          } catch {
            // Fallback: just insert the original path
            inserts.push(`![${file.name}](${path})`);
          }
        }

        if (inserts.length > 0) {
          const text = '\n' + inserts.join('\n') + '\n';
          view.dispatch({
            changes: { from: pos, insert: text },
            selection: { anchor: pos + text.length },
          });
        }
      })();

      return true;
    },
  });
}
