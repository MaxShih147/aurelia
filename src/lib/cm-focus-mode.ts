import { StateField, StateEffect } from '@codemirror/state';
import { EditorView, Decoration, type DecorationSet, ViewPlugin, type ViewUpdate } from '@codemirror/view';

export const toggleFocusMode = StateEffect.define<boolean>();

export const focusModeField = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(toggleFocusMode)) return e.value;
    }
    return value;
  },
});

const unfocusedDeco = Decoration.line({ class: 'cm-unfocused-line' });

const focusModePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.transactions.some(t => t.effects.some(e => e.is(toggleFocusMode)))) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const enabled = view.state.field(focusModeField);
      if (!enabled) return Decoration.none;

      const { from } = view.state.selection.main;
      const activeLine = view.state.doc.lineAt(from);

      // Find the paragraph bounds (contiguous non-empty lines around cursor)
      let paraStart = activeLine.number;
      let paraEnd = activeLine.number;

      while (paraStart > 1) {
        const prevLine = view.state.doc.line(paraStart - 1);
        if (prevLine.text.trim() === '') break;
        paraStart--;
      }

      const totalLines = view.state.doc.lines;
      while (paraEnd < totalLines) {
        const nextLine = view.state.doc.line(paraEnd + 1);
        if (nextLine.text.trim() === '') break;
        paraEnd++;
      }

      const builder: { from: number; to: number; value: Decoration }[] = [];
      for (let i = 1; i <= totalLines; i++) {
        if (i < paraStart || i > paraEnd) {
          const line = view.state.doc.line(i);
          builder.push({ from: line.from, to: line.from, value: unfocusedDeco });
        }
      }

      return Decoration.set(builder);
    }
  },
  { decorations: (v) => v.decorations }
);

export const focusModeExtension = [focusModeField, focusModePlugin];
