import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Custom bioluminescent I-beam cursor
const CURSOR_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24">' +
  '<line x1="8" y1="2" x2="8" y2="22" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="5" y1="2" x2="11" y2="2" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="5" y1="22" x2="11" y2="22" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>' +
  '</svg>'
);

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
    cursor: `url("data:image/svg+xml,${CURSOR_SVG}") 8 12, text`,
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
    color: 'rgba(148, 163, 184, 0.35)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'rgba(148, 163, 184, 0.7)',
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

  // Fold gutter — brighter so details are visible
  '.cm-foldGutter': {
    color: 'rgba(148, 163, 184, 0.5)',
    width: '16px',
  },
  '.cm-foldGutter .cm-gutterElement': {
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  '.cm-foldGutter .cm-gutterElement:hover': {
    color: 'var(--deep-sea-accent)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    borderRadius: '4px',
    color: 'var(--deep-sea-accent)',
    padding: '0 6px',
    margin: '0 4px',
  },

  // Search panel — polished UI
  '.cm-panel.cm-search': {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
    padding: '12px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    fontSize: '13px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignItems: 'center',
  },
  '.cm-panel.cm-search input': {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    color: 'var(--deep-sea-text)',
    padding: '6px 10px',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  '.cm-panel.cm-search input:focus': {
    borderColor: 'var(--deep-sea-accent)',
    boxShadow: '0 0 0 2px rgba(56, 189, 248, 0.15)',
  },
  '.cm-panel.cm-search button': {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: 'var(--deep-sea-text)',
    padding: '5px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  '.cm-panel.cm-search button:hover': {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  '.cm-panel.cm-search button[name="close"]': {
    border: 'none',
    background: 'transparent',
    color: 'var(--deep-sea-text-muted)',
    padding: '4px 6px',
    fontSize: '14px',
    borderRadius: '4px',
  },
  '.cm-panel.cm-search button[name="close"]:hover': {
    color: 'var(--deep-sea-text)',
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'transparent',
  },
  '.cm-panel.cm-search label': {
    color: 'var(--deep-sea-text-muted)',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  '.cm-panel.cm-search label:hover': {
    color: 'var(--deep-sea-text)',
  },
  '.cm-panel.cm-search input[type="checkbox"]': {
    appearance: 'none',
    width: '14px',
    height: '14px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    position: 'relative',
  },
  '.cm-panel.cm-search input[type="checkbox"]:checked': {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: 'var(--deep-sea-accent)',
  },
  // Use br to separate search rows cleanly
  '.cm-panel.cm-search br': {
    display: 'block',
    content: '""',
    marginTop: '4px',
  },

  // Search match highlights — high contrast amber
  '.cm-searchMatch': {
    backgroundColor: 'rgba(250, 204, 21, 0.25)',
    outline: '1px solid rgba(250, 204, 21, 0.4)',
    borderRadius: '2px',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(250, 204, 21, 0.45)',
    outline: '2px solid rgba(250, 204, 21, 0.7)',
    borderRadius: '2px',
  },

  '.cm-placeholder': {
    color: 'var(--deep-sea-text-muted)',
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
