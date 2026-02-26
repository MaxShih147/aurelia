import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor } from '@codemirror/view';
import { defaultKeymap, indentWithTab, history, historyKeymap, undo, redo } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { search, searchKeymap, openSearchPanel } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { deepSeaTheme, deepSeaHighlightStyle } from '../lib/codemirror-theme';
import type { EditorHandle } from '../types/editor';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Patterns for list item matching
const ORDERED_ITEM_RE = /^(\s*)(\d+)\.\s(.*)$/;
const UNORDERED_ITEM_RE = /^(\s*)([-*+])\s(.*)$/;
const CHECKBOX_ITEM_RE = /^(\s*)([-*+])\s\[[ x]\]\s(.*)$/;

function handleListContinuation(view: EditorView): boolean {
  const state = view.state;
  const { from, to } = state.selection.main;
  if (from !== to) return false; // has selection, use default

  const line = state.doc.lineAt(from);
  const lineText = line.text;

  // Check checkbox (before unordered)
  const checkboxMatch = lineText.match(CHECKBOX_ITEM_RE);
  if (checkboxMatch) {
    const [, indent, bullet, text] = checkboxMatch;
    if (text.trim() === '') {
      // Empty → remove marker
      view.dispatch({ changes: { from: line.from, to: line.to, insert: '' } });
      return true;
    }
    const continuation = `\n${indent}${bullet} [ ] `;
    view.dispatch({
      changes: { from, insert: continuation },
      selection: { anchor: from + continuation.length },
    });
    return true;
  }

  // Check ordered list
  const orderedMatch = lineText.match(ORDERED_ITEM_RE);
  if (orderedMatch) {
    const [, indent, numStr, text] = orderedMatch;
    if (text.trim() === '') {
      view.dispatch({ changes: { from: line.from, to: line.to, insert: '' } });
      return true;
    }
    const nextNum = parseInt(numStr) + 1;
    const continuation = `\n${indent}${nextNum}. `;
    view.dispatch({
      changes: { from, insert: continuation },
      selection: { anchor: from + continuation.length },
    });
    return true;
  }

  // Check unordered list
  const unorderedMatch = lineText.match(UNORDERED_ITEM_RE);
  if (unorderedMatch) {
    const [, indent, bullet, text] = unorderedMatch;
    if (text.trim() === '') {
      view.dispatch({ changes: { from: line.from, to: line.to, insert: '' } });
      return true;
    }
    const continuation = `\n${indent}${bullet} `;
    view.dispatch({
      changes: { from, insert: continuation },
      selection: { anchor: from + continuation.length },
    });
    return true;
  }

  return false; // Not in a list, use default Enter
}

const Editor = forwardRef<EditorHandle, EditorProps>(function Editor({ content, onChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Track whether the last change was internal (from CM6) to avoid feedback loops
  const isInternalChange = useRef(false);

  useImperativeHandle(ref, () => ({
    getView: () => viewRef.current,
    focus: () => viewRef.current?.focus(),
  }));

  // Create the editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        isInternalChange.current = true;
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const listContinuationKeymap = keymap.of([
      { key: 'Enter', run: handleListContinuation },
    ]);

    const state = EditorState.create({
      doc: content,
      extensions: [
        // List continuation must come before default keymap
        listContinuationKeymap,
        // Core
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        foldGutter(),
        history(),
        search(),
        // Markdown language
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        // Theme
        deepSeaTheme,
        deepSeaHighlightStyle,
        // Keymaps
        keymap.of([
          ...closeBracketsKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
          ...defaultKeymap,
        ]),
        // Placeholder
        placeholder('Start writing...'),
        // Sync changes to React
        updateListener,
        // Editor config
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external content changes (file open, new file, etc.)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // Skip if this change originated from CM6 itself
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== content) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: content },
      });
    }
  }, [content]);

  // Expose undo/redo/search for menu events
  const handleMenuAction = useCallback((action: string) => {
    const view = viewRef.current;
    if (!view) return;
    switch (action) {
      case 'undo':
        undo(view);
        break;
      case 'redo':
        redo(view);
        break;
      case 'find':
        openSearchPanel(view);
        break;
    }
  }, []);

  // Listen for menu events that target the editor
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      handleMenuAction(e.detail);
    };
    window.addEventListener('editor-action', handler as EventListener);
    return () => window.removeEventListener('editor-action', handler as EventListener);
  }, [handleMenuAction]);

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full min-w-0 overflow-hidden"
    />
  );
});

export default Editor;
