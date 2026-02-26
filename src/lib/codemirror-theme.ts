import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export const deepSeaTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--deep-sea-text)',
    fontFamily: '"SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
    fontSize: '14px',
    lineHeight: '1.7',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-content': {
    padding: '32px',
    caretColor: 'var(--deep-sea-accent)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--deep-sea-accent)',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(56, 189, 248, 0.2) !important',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
    color: 'rgba(148, 163, 184, 0.3)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'rgba(148, 163, 184, 0.6)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 16px',
    minWidth: '32px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: 'var(--deep-sea-accent) !important',
  },
  // Search panel styling
  '.cm-panel.cm-search': {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 12px',
  },
  '.cm-panel.cm-search input, .cm-panel.cm-search button': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: 'var(--deep-sea-text)',
    padding: '4px 8px',
    fontSize: '12px',
  },
  '.cm-panel.cm-search button:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '.cm-panel.cm-search label': {
    color: 'var(--deep-sea-text-muted)',
    fontSize: '12px',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: '2px',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
  },
  '.cm-placeholder': {
    color: 'var(--deep-sea-text-muted)',
  },
  '.cm-foldGutter': {
    color: 'rgba(148, 163, 184, 0.3)',
  },
}, { dark: true });

export const deepSeaHighlightStyle = syntaxHighlighting(HighlightStyle.define([
  // Headings
  { tag: tags.heading1, color: 'rgba(241, 245, 249, 1)', fontWeight: 'bold', fontSize: '1.4em' },
  { tag: tags.heading2, color: 'rgba(241, 245, 249, 0.95)', fontWeight: 'bold', fontSize: '1.25em' },
  { tag: tags.heading3, color: 'rgba(241, 245, 249, 0.9)', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: [tags.heading4, tags.heading5, tags.heading6], color: 'rgba(241, 245, 249, 0.85)', fontWeight: 'bold' },

  // Emphasis
  { tag: tags.emphasis, fontStyle: 'italic', color: 'rgba(203, 213, 225, 0.9)' },
  { tag: tags.strong, fontWeight: 'bold', color: 'rgba(241, 245, 249, 0.95)' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: 'rgba(148, 163, 184, 0.5)' },

  // Code
  { tag: tags.monospace, color: 'rgba(56, 189, 248, 0.9)', fontFamily: '"SF Mono", Menlo, monospace' },

  // Links
  { tag: tags.link, color: 'var(--deep-sea-accent)', textDecoration: 'underline' },
  { tag: tags.url, color: 'rgba(56, 189, 248, 0.6)' },

  // Meta / markers (# , - , * , > , etc.)
  { tag: tags.processingInstruction, color: 'rgba(148, 163, 184, 0.4)' },
  { tag: tags.meta, color: 'rgba(148, 163, 184, 0.4)' },

  // Quotes
  { tag: tags.quote, color: 'rgba(148, 163, 184, 0.7)', fontStyle: 'italic' },

  // Lists
  { tag: tags.list, color: 'var(--deep-sea-accent)' },

  // Comments / HTML
  { tag: tags.comment, color: 'rgba(148, 163, 184, 0.3)' },

  // Code block languages (fenced)
  { tag: tags.keyword, color: '#c792ea' },
  { tag: tags.string, color: '#c3e88d' },
  { tag: tags.number, color: '#f78c6c' },
  { tag: tags.bool, color: '#ff5370' },
  { tag: tags.variableName, color: '#82aaff' },
  { tag: tags.function(tags.variableName), color: '#82aaff' },
  { tag: tags.typeName, color: '#ffcb6b' },
  { tag: tags.operator, color: 'rgba(203, 213, 225, 0.7)' },
  { tag: tags.punctuation, color: 'rgba(203, 213, 225, 0.5)' },
]));
