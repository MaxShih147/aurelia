import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, ViewPlugin, keymap, placeholder, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor } from '@codemirror/view';
import { defaultKeymap, indentWithTab, history, historyKeymap, undo, redo } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { search, searchKeymap, openSearchPanel } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { deepSeaTheme, deepSeaHighlightStyle } from '../lib/codemirror-theme';
import { focusModeExtension, focusModeField, toggleFocusMode } from '../lib/cm-focus-mode';
import { createImageDropHandler } from '../lib/image-drop';
import type { EditorHandle } from '../types/editor';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  spellCheck?: boolean;
  focusMode?: boolean;
  fontFamily?: string;
  fontSize?: number;
  filePath?: string | null;
}

// Patterns for list item matching
const ORDERED_ITEM_RE = /^(\s*)(\d+)\.\s(.*)$/;
const UNORDERED_ITEM_RE = /^(\s*)([-*+])\s(.*)$/;
const CHECKBOX_ITEM_RE = /^(\s*)([-*+])\s\[[ x]\]\s(.*)$/;

function handleListContinuation(view: EditorView): boolean {
  const state = view.state;
  const { from, to } = state.selection.main;
  if (from !== to) return false;

  const line = state.doc.lineAt(from);
  const lineText = line.text;

  const checkboxMatch = lineText.match(CHECKBOX_ITEM_RE);
  if (checkboxMatch) {
    const [, indent, bullet, text] = checkboxMatch;
    if (text.trim() === '') {
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

  return false;
}

// Disable spellcheck/autocapitalize on search panel inputs
const searchInputPatch = ViewPlugin.fromClass(class {
  observer: MutationObserver;
  constructor(view: EditorView) {
    this.observer = new MutationObserver(() => {
      view.dom.querySelectorAll<HTMLInputElement>('.cm-search input[type="text"], .cm-search .cm-textfield').forEach(el => {
        if (el.getAttribute('autocapitalize') !== 'off') {
          el.spellcheck = false;
          el.autocapitalize = 'off';
          el.setAttribute('autocorrect', 'off');
          el.setAttribute('autocomplete', 'off');
        }
      });
    });
    this.observer.observe(view.dom, { childList: true, subtree: true });
  }
  destroy() { this.observer.disconnect(); }
});

// Compartments for dynamic reconfiguration
const spellCheckCompartment = new Compartment();
const fontCompartment = new Compartment();

function makeSpellCheckExtension(enabled: boolean) {
  return EditorView.contentAttributes.of({ spellcheck: enabled ? 'true' : 'false' });
}

function makeFontExtension(fontFamily: string, fontSize: number) {
  return EditorView.theme({
    '&': { fontFamily, fontSize: `${fontSize}px` },
    '.cm-content': { fontFamily },
    '.cm-gutters': { fontSize: `${fontSize}px` },
  });
}

const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { content, onChange, spellCheck = false, focusMode = false, fontFamily, fontSize, filePath },
  ref
) {
  const filePathRef = useRef(filePath);
  filePathRef.current = filePath;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
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
        listContinuationKeymap,
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
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        deepSeaTheme,
        deepSeaHighlightStyle,
        keymap.of([
          ...closeBracketsKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
          ...defaultKeymap,
        ]),
        placeholder('Start writing...'),
        updateListener,
        EditorView.lineWrapping,
        // Dynamic compartments
        spellCheckCompartment.of(makeSpellCheckExtension(spellCheck)),
        fontCompartment.of(makeFontExtension(
          fontFamily || '"SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
          fontSize || 14
        )),
        // Focus mode
        focusModeExtension,
        // Image drop
        createImageDropHandler(() => filePathRef.current ?? null),
        // Patch search inputs to disable spellcheck/autocapitalize
        searchInputPatch,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external content changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
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

  // Update spell check dynamically
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: spellCheckCompartment.reconfigure(makeSpellCheckExtension(spellCheck)),
    });
  }, [spellCheck]);

  // Update font dynamically
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: fontCompartment.reconfigure(makeFontExtension(
        fontFamily || '"SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
        fontSize || 14
      )),
    });
  }, [fontFamily, fontSize]);

  // Update focus mode dynamically
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.field(focusModeField);
    if (current !== focusMode) {
      view.dispatch({ effects: toggleFocusMode.of(focusMode) });
    }
  }, [focusMode]);

  // Expose undo/redo/search for menu events
  const handleMenuAction = useCallback((action: string) => {
    const view = viewRef.current;
    if (!view) return;
    switch (action) {
      case 'undo': undo(view); break;
      case 'redo': redo(view); break;
      case 'find': openSearchPanel(view); break;
    }
  }, []);

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
