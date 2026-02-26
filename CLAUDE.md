# Aurelia — Development Guide

## Project Overview

Aurelia is a lightweight, visually stunning Markdown editor for macOS with a deep-sea jellyfish aesthetic. Built with Tauri v2 + React 19 + TypeScript + Vite + Tailwind CSS v4.

- **Bundle ID**: `com.aurelia.editor`
- **Target**: macOS (Apple Silicon + Intel)
- **Design**: Deep-sea bioluminescent theme — dark backgrounds, translucent panels, sky-400 accent glow

## Tech Stack

- **Backend**: Rust (Tauri v2) — file I/O, native menus, window management
- **Frontend**: React 19 + TypeScript — editor UI, state management
- **Build**: Vite 7 + Tailwind CSS v4 + PostCSS
- **Markdown**: react-markdown + remark-gfm + remark-breaks + rehype-highlight

## Architecture

```
src-tauri/src/
  lib.rs              # Tauri setup, plugin init, native menus, event emission
  commands.rs         # Rust IPC commands (read_file, write_file, recent files)
  main.rs             # Entry point

src/
  App.tsx             # Root layout, state orchestration, menu event listener
  main.tsx            # React entry point
  index.css           # Deep-sea theme CSS variables, prose overrides, scrollbar

  components/
    TitleBar.tsx       # Filename display + dirty indicator
    Editor.tsx         # Textarea editor (TODO: CodeMirror 6) with list continuation
    Preview.tsx        # react-markdown live preview with GFM + breaks
    Sidebar.tsx        # Collapsible recent files panel
    StatusBar.tsx      # Word/char/line count + file path + save indicator
    CommandPalette.tsx # Cmd+K fuzzy search overlay

  hooks/
    useFile.ts         # Single-file state: path, content, savedContent, isDirty
    useAutoSave.ts     # 2-second debounced auto-save for named files
    useKeyboard.ts     # Global keyboard shortcut handler

  lib/
    tauri.ts           # Typed wrappers for Tauri invoke calls
    cn.ts              # clsx + tailwind-merge utility

  types/
    index.ts           # RecentFile, FileState interfaces
```

## Key Patterns

- **State**: All file state in `useFile` hook, UI toggles in `App.tsx` useState
- **IPC**: Frontend calls Rust via `invoke()`, menus emit `menu-event` to frontend via `listen()`
- **Styling**: CSS variables for theming (`--deep-sea-*`), Tailwind utility classes, `prose prose-invert` for markdown
- **No external state library**: Hooks + props are sufficient for current scope

## Build & Run

```bash
# Dev
source "$HOME/.cargo/env"
npx @tauri-apps/cli dev

# Production build
source "$HOME/.cargo/env"
npx @tauri-apps/cli build

# Type check only
npx tsc --noEmit
```

## Conventions

- macOS only — no Windows/Linux handling needed
- No external network requests — fully offline editor
- No heavy UI frameworks (MUI, Ant Design)
- Support both English and CJK characters
- Keep bundle < 10 MB when possible
- Textarea is current editor — CodeMirror 6 migration is Phase 1 of the roadmap

## Roadmap — 22 Features (7 Phases)

### Phase 1: CodeMirror 6 Foundation
Replace textarea with CodeMirror 6. This enables syntax highlighting, Find & Replace, Undo/Redo, Focus Mode, and many downstream features.

### Phase 2: P0 Core Features
1. Find & Replace (Cmd+F) — CM6 search extension
2. Undo/Redo — CM6 history extension
3. Full Screen Mode — Tauri window API
4. Outline / TOC Panel — heading extraction + scroll-to

### Phase 3: Export
5. Export HTML — unified/remark pipeline to standalone HTML
6. Export PDF — HTML generation + window.print() (macOS "Save as PDF")

### Phase 4: Writing Experience
7. Focus Mode — CM6 ViewPlugin dimming non-active paragraphs
8. Sync Scroll — proportional editor/preview scroll sync
9. Spell Check — browser native via CM6 contentAttributes
10. Custom Fonts — useSettings hook + font picker UI

### Phase 5: Markdown Extensions
11. Math / KaTeX — remark-math + rehype-katex
12. Mermaid Diagrams — mermaid.js rendering in code blocks
13. Footnotes — remark-gfm or remark-footnotes
14. YAML Front Matter — remark-frontmatter
15. Table Visual Editing — parse/serialize GFM tables + modal editor

### Phase 6: Multi-Tab & Theming
16. Multiple Tabs — refactor useFile → useTabs with per-tab CM6 state
17. Theme Switcher — CSS variable presets (Deep Sea, Moonlight, Sunlight, Forest, Minimal)

### Phase 7: Knowledge Management
18. Drag & Drop Images — copy to assets folder + insert markdown reference
19. Tags System — YAML front matter tags + sidebar tag index
20. WikiLinks / Backlinks — [[Page Name]] linking + backlink scanning
21. Graph View — d3-force network visualization of note connections
