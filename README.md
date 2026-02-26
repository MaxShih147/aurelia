# Aurelia

A lightweight, visually stunning Markdown editor for macOS with a deep-sea jellyfish aesthetic.

## Vision

Aurelia (水母) — inspired by the translucent beauty of jellyfish drifting through the deep ocean. A Markdown editor that feels as natural as thought itself: minimal, luminous, and fluid.

## Features

### Current (v1)
- Split-pane editor with live Markdown preview
- GitHub Flavored Markdown (tables, task lists, strikethrough)
- Smart list continuation (ordered, unordered, checkbox)
- Native macOS File / Edit / View menus with keyboard shortcuts
- File operations: New, Open, Save, Save As
- Auto-save (2-second debounce)
- Collapsible sidebar with recent files
- Command palette (Cmd+K)
- Word / character / line count
- Deep-sea bioluminescent theme

### Roadmap
- **Phase 1**: CodeMirror 6 editor with syntax highlighting
- **Phase 2**: Find & Replace, Undo/Redo, Full Screen, Outline/TOC
- **Phase 3**: Export PDF & HTML
- **Phase 4**: Focus Mode, Sync Scroll, Spell Check, Custom Fonts
- **Phase 5**: Math/LaTeX, Mermaid Diagrams, Footnotes, YAML Front Matter, Table Editor
- **Phase 6**: Multiple Tabs, Theme Switcher (5 themes)
- **Phase 7**: Drag & Drop Images, Tags, WikiLinks, Backlinks, Graph View

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Tauri v2 (Rust) |
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + @tailwindcss/typography |
| Markdown | react-markdown + remark-gfm + remark-breaks + rehype-highlight |

## Architecture

```
┌─────────────────────────────────────────────┐
│              Tauri v2 (Rust)                │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ File I/O     │  │ Window & Menus     │   │
│  │ (commands)   │  │ (native macOS)     │   │
│  └──────┬───────┘  └─────────┬──────────┘   │
│         │     IPC (invoke)   │              │
│  ┌──────┴────────────────────┴───────────┐  │
│  │       React Frontend (WebView)        │  │
│  │  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ Editor   │  │ Preview          │   │  │
│  │  │(textarea)│  │(react-markdown)  │   │  │
│  │  └──────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| ⌘N | New file |
| ⌘O | Open file |
| ⌘S | Save |
| ⇧⌘S | Save As |
| ⌘K | Command palette |
| ⌘B | Toggle sidebar |
| ⌘P | Toggle preview |

## Development

### Prerequisites
- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) (v20+)

### Setup
```bash
npm install
```

### Dev
```bash
npx @tauri-apps/cli dev
```

### Build
```bash
npx @tauri-apps/cli build
```

Outputs:
- `src-tauri/target/release/bundle/macos/Aurelia.app`
- `src-tauri/target/release/bundle/dmg/Aurelia_1.0.0_aarch64.dmg`

## Design

### Deep Sea Theme
| Token | Value | Usage |
|---|---|---|
| Background | `rgb(8, 12, 24)` | Main app background |
| Surface | `white/3` to `white/5` | Panels |
| Border | `white/8` to `white/10` | Dividers |
| Text | `slate-300` | Body text |
| Accent | `sky-400/80` | Links, active states, bioluminescent glow |

## License

Private — All rights reserved.
