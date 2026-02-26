import { useEffect, useRef, useCallback } from 'react';
import type { EditorView } from '@codemirror/view';

export function useSyncScroll(
  enabled: boolean,
  getEditorView: () => EditorView | null,
  previewRef: React.RefObject<HTMLDivElement | null>
) {
  const scrollSource = useRef<'editor' | 'preview' | null>(null);
  const rafId = useRef(0);

  const syncEditorToPreview = useCallback(() => {
    if (scrollSource.current === 'preview') return;
    scrollSource.current = 'editor';

    const view = getEditorView();
    const preview = previewRef.current;
    if (!view || !preview) return;

    const editorScroll = view.scrollDOM;
    const scrollTop = editorScroll.scrollTop;
    const scrollHeight = editorScroll.scrollHeight - editorScroll.clientHeight;
    if (scrollHeight <= 0) return;

    const ratio = scrollTop / scrollHeight;
    const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
    preview.scrollTop = ratio * previewScrollHeight;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      scrollSource.current = null;
    });
  }, [getEditorView, previewRef]);

  const syncPreviewToEditor = useCallback(() => {
    if (scrollSource.current === 'editor') return;
    scrollSource.current = 'preview';

    const view = getEditorView();
    const preview = previewRef.current;
    if (!view || !preview) return;

    const scrollTop = preview.scrollTop;
    const scrollHeight = preview.scrollHeight - preview.clientHeight;
    if (scrollHeight <= 0) return;

    const ratio = scrollTop / scrollHeight;
    const editorScroll = view.scrollDOM;
    const editorScrollHeight = editorScroll.scrollHeight - editorScroll.clientHeight;
    editorScroll.scrollTop = ratio * editorScrollHeight;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      scrollSource.current = null;
    });
  }, [getEditorView, previewRef]);

  useEffect(() => {
    if (!enabled) return;

    const view = getEditorView();
    const preview = previewRef.current;
    if (!view || !preview) return;

    const editorScroll = view.scrollDOM;
    editorScroll.addEventListener('scroll', syncEditorToPreview);
    preview.addEventListener('scroll', syncPreviewToEditor);

    return () => {
      editorScroll.removeEventListener('scroll', syncEditorToPreview);
      preview.removeEventListener('scroll', syncPreviewToEditor);
    };
  }, [enabled, getEditorView, previewRef, syncEditorToPreview, syncPreviewToEditor]);
}
