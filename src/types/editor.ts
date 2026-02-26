import type { EditorView } from '@codemirror/view';

export interface EditorHandle {
  getView(): EditorView | null;
  focus(): void;
}
