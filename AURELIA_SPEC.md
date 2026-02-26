# Aurelia — Deep Sea Markdown Editor

## Complete Development Specification

> **Target**: A lightweight, visually stunning Markdown editor for macOS with a deep-sea jellyfish aesthetic.
> **Stack**: Tauri v2 + React + TypeScript + Vite + Tailwind CSS v4
> **Goal**: Build a fully functional app ready for Mac App Store submission.

---

## 1. Project Identity

| Field | Value |
|---|---|
| App Name | Aurelia |
| Bundle Identifier | `com.aurelia.editor` |
| Concept | 水母（Jellyfish）— 輕盈、透明、深海感 |
| Target Platform | macOS (Apple Silicon + Intel universal) |
| Package Size Target | < 10 MB |
| Startup Time Target | < 0.5s |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  Tauri v2 (Rust)             │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ File I/O    │  │ Window Management    │  │
│  │ (commands)  │  │ (transparent, vibrancy│  │
│  └──────┬──────┘  └──────────┬───────────┘  │
│         │    IPC (invoke)    │               │
│  ┌──────┴────────────────────┴───────────┐  │
│  │        React Frontend (WebView)       │  │
│  │  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ Editor   │  │ Preview (render) │   │  │
│  │  │ (textarea│  │ (react-markdown) │   │  │
│  │  │  / CM6)  │  │                  │   │  │
│  │  └──────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 3. Project Setup

### 3.1 Initialize

```bash
# Use Tauri v2 CLI
npm create tauri-app@latest aurelia -- --template react-ts

cd aurelia

# Core dependencies
npm install react-markdown remark-gfm rehype-highlight lucide-react clsx tailwind-merge

# Dev dependencies
npm install -D tailwindcss @tailwindcss/postcss @tailwindcss/typography postcss autoprefixer
```

### 3.2 Tauri Cargo Dependencies

In `src-tauri/Cargo.toml`, ensure these are present:

```toml
[dependencies]
tauri = { version = "2", features = ["macos-private-api"] }
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

---

## 4. Tauri Configuration

### 4.1 `src-tauri/tauri.conf.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-cli/schema.json",
  "productName": "Aurelia",
  "version": "1.0.0",
  "identifier": "com.aurelia.editor",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Aurelia",
        "width": 960,
        "height": 680,
        "minWidth": 600,
        "minHeight": 400,
        "transparent": true,
        "decorations": true,
        "titleBarStyle": "Overlay"
      }
    ],
    "macOSPrivateApi": true,
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["app", "dmg"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "macOS": {
      "entitlements": "./entitlements.plist",
      "minimumSystemVersion": "11.0"
    }
  },
  "plugins": {
    "fs": {
      "scope": {
        "allow": ["$HOME/**", "$DOCUMENT/**", "$DESKTOP/**"],
        "deny": ["$HOME/.ssh/**"]
      }
    },
    "dialog": {
      "open": true,
      "save": true
    }
  }
}
```

### 4.2 `src-tauri/entitlements.plist` (for App Store sandboxing)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.files.bookmarks.app-scope</key>
    <true/>
</dict>
</plist>
```

---

## 5. Rust Backend (`src-tauri/src/`)

### 5.1 `src-tauri/src/main.rs`

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::write_file,
            commands::get_recent_files,
            commands::add_recent_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Aurelia");
}
```

### 5.2 `src-tauri/src/commands.rs`

Implement these Tauri commands:

```rust
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone)]
pub struct RecentFile {
    pub path: String,
    pub name: String,
    pub modified: u64, // unix timestamp
}

/// Read a file's content as UTF-8 string
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// Write content to a file (create or overwrite)
#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| e.to_string())
}

/// Get recent files list from app data directory
#[tauri::command]
pub fn get_recent_files(app_handle: tauri::AppHandle) -> Result<Vec<RecentFile>, String> {
    let data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    let recent_path = data_dir.join("recent_files.json");

    if !recent_path.exists() {
        return Ok(vec![]);
    }

    let data = fs::read_to_string(&recent_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

/// Add a file to the recent files list (keep max 20)
#[tauri::command]
pub fn add_recent_file(app_handle: tauri::AppHandle, file: RecentFile) -> Result<(), String> {
    let data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    let recent_path = data_dir.join("recent_files.json");

    let mut files: Vec<RecentFile> = if recent_path.exists() {
        let data = fs::read_to_string(&recent_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        vec![]
    };

    // Remove duplicate, add to front, cap at 20
    files.retain(|f| f.path != file.path);
    files.insert(0, file);
    files.truncate(20);

    let json = serde_json::to_string_pretty(&files).map_err(|e| e.to_string())?;
    fs::write(&recent_path, json).map_err(|e| e.to_string())
}
```

---

## 6. Frontend Structure

```
src/
├── App.tsx                 # Root layout
├── main.tsx                # Entry point
├── index.css               # Tailwind + custom deep-sea theme
├── components/
│   ├── TitleBar.tsx         # Custom macOS-style draggable title bar
│   ├── Editor.tsx           # Markdown text editor (left pane)
│   ├── Preview.tsx          # Live rendered preview (right pane)
│   ├── Sidebar.tsx          # File explorer / recent files (collapsible)
│   ├── StatusBar.tsx        # Bottom bar: word count, line count, file path
│   └── CommandPalette.tsx   # Cmd+K quick actions overlay
├── hooks/
│   ├── useFile.ts           # File open/save/autosave logic
│   ├── useAutoSave.ts       # Debounced auto-save (2s after last keystroke)
│   └── useKeyboard.ts       # Global keyboard shortcut handler
├── lib/
│   ├── tauri.ts             # Typed wrappers around Tauri invoke calls
│   └── cn.ts                # clsx + tailwind-merge utility
└── types/
    └── index.ts             # Shared TypeScript interfaces
```

---

## 7. Component Specifications

### 7.1 `App.tsx` — Root Layout

```
┌──────────────────────────────────────────────┐
│ [TitleBar - drag region, traffic lights]     │  h-8, data-tauri-drag-region
├────────┬─────────────────────┬───────────────┤
│Sidebar │     Editor          │   Preview     │
│(optional│  (textarea/CM6)    │(react-markdown)│
│ 200px) │     flex-1          │   flex-1      │
│        │                     │  bg-white/5   │
│        │                     │  backdrop-blur │
├────────┴─────────────────────┴───────────────┤
│ [StatusBar - word count, line, path]         │  h-6
└──────────────────────────────────────────────┘
```

- Background: fully transparent (Tauri transparent window)
- The entire app uses `bg-transparent` on root, panels use `bg-white/5` or `bg-black/20` with `backdrop-blur-md`

### 7.2 `TitleBar.tsx`

- Height: 32px
- Has `data-tauri-drag-region` attribute for macOS window dragging
- Shows filename in center (or "Untitled" if new file)
- Shows a dot indicator if file has unsaved changes
- Inset padding-left ~70px to avoid macOS traffic light buttons (titleBarStyle: Overlay)

### 7.3 `Editor.tsx`

- A `<textarea>` with:
  - `bg-transparent`, no border, no outline
  - Font: `font-mono`, size `text-base`, `leading-relaxed`
  - Padding: `p-8`
  - Placeholder text: "沉入思緒..." (or "Start writing...")
  - Tab key inserts 2 spaces (prevent focus loss)
  - Full height, scrollable
- **Future upgrade path**: Replace textarea with CodeMirror 6 for syntax highlighting. Leave a comment noting this.

### 7.4 `Preview.tsx`

- Uses `react-markdown` with plugins: `remark-gfm`, `rehype-highlight`
- Container: `bg-white/5 backdrop-blur-md`
- Apply `prose prose-invert` classes from `@tailwindcss/typography`
- Scroll independently from editor
- **Sync scroll** (nice-to-have): when editor scrolls, preview scrolls proportionally

### 7.5 `Sidebar.tsx`

- Collapsible (toggle with `Cmd+B`)
- Width: 200px when open, 0 when closed
- Shows:
  - "Recent Files" list (from `get_recent_files` command)
  - Each item shows filename + relative time
  - Click to open
- Background: `bg-black/30 backdrop-blur-lg`

### 7.6 `StatusBar.tsx`

- Height: 24px
- Shows: word count | character count | line count | current file path (or "Untitled")
- Font: `text-xs opacity-50`
- Background: transparent

### 7.7 `CommandPalette.tsx`

- Triggered by `Cmd+K`
- Floating overlay centered on screen
- Search input + list of actions:
  - "New File" → `Cmd+N`
  - "Open File" → `Cmd+O`
  - "Save" → `Cmd+S`
  - "Save As" → `Cmd+Shift+S`
  - "Toggle Sidebar" → `Cmd+B`
  - "Toggle Preview" → `Cmd+P`
  - "Export HTML" → (future)
- Background: `bg-black/60 backdrop-blur-xl`, rounded, with border `border-white/10`

---

## 8. Hooks Specifications

### 8.1 `useFile.ts`

Manages the current file state:

```typescript
interface FileState {
  path: string | null;       // null = untitled/new file
  content: string;           // current editor content
  savedContent: string;      // last saved content (for dirty detection)
  isDirty: boolean;          // content !== savedContent
}
```

Functions:
- `newFile()` — Reset to empty state. If current file is dirty, prompt to save first.
- `openFile()` — Use Tauri dialog to pick a `.md` file, read content via `read_file` command.
- `saveFile()` — If path exists, write directly. If no path, trigger `saveFileAs()`.
- `saveFileAs()` — Use Tauri save dialog, write to chosen path.
- `updateContent(newContent: string)` — Update content, recalculate isDirty.

### 8.2 `useAutoSave.ts`

- Debounce: 2 seconds after last keystroke
- Only auto-saves if file already has a path (don't auto-save untitled files)
- Shows a subtle "Saved" indicator in StatusBar briefly after save

### 8.3 `useKeyboard.ts`

Register global keyboard shortcuts:

| Shortcut | Action |
|---|---|
| `Cmd+N` | New file |
| `Cmd+O` | Open file |
| `Cmd+S` | Save file |
| `Cmd+Shift+S` | Save as |
| `Cmd+K` | Toggle command palette |
| `Cmd+B` | Toggle sidebar |
| `Cmd+P` | Toggle preview pane |
| `Cmd+,` | Open settings (future) |

---

## 9. Styling & Theme

### 9.1 `index.css`

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Deep Sea color palette */
:root {
  --deep-sea-bg: rgba(8, 12, 24, 0.75);
  --deep-sea-surface: rgba(255, 255, 255, 0.03);
  --deep-sea-border: rgba(255, 255, 255, 0.08);
  --deep-sea-text: rgba(203, 213, 225, 1);       /* slate-300 */
  --deep-sea-text-muted: rgba(148, 163, 184, 0.6); /* slate-400/60 */
  --deep-sea-accent: rgba(56, 189, 248, 0.8);     /* sky-400/80 — bioluminescent */
  --deep-sea-glow: rgba(56, 189, 248, 0.15);
}

/* Ensure full transparency for Tauri */
html, body, #root {
  background: transparent !important;
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  color: var(--deep-sea-text);
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbar — thin and translucent */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Editor textarea */
textarea::placeholder {
  color: var(--deep-sea-text-muted);
}

/* Markdown preview customizations */
.prose {
  --tw-prose-body: var(--deep-sea-text);
  --tw-prose-headings: rgba(241, 245, 249, 1);
  --tw-prose-links: var(--deep-sea-accent);
  --tw-prose-code: rgba(56, 189, 248, 0.9);
  --tw-prose-pre-bg: rgba(0, 0, 0, 0.3);
  --tw-prose-pre-code: var(--deep-sea-text);
  --tw-prose-hr: var(--deep-sea-border);
  --tw-prose-quotes: var(--deep-sea-text-muted);
  --tw-prose-quote-borders: var(--deep-sea-accent);
}

/* Bioluminescent glow effect for headings */
.prose h1, .prose h2 {
  text-shadow: 0 0 20px var(--deep-sea-glow);
}

/* Selection color — ocean blue */
::selection {
  background: rgba(56, 189, 248, 0.3);
}
```

### 9.2 Design Tokens Summary

| Token | Value | Usage |
|---|---|---|
| Background | `rgba(8, 12, 24, 0.75)` | Main app background |
| Surface | `white/3` to `white/5` | Panels |
| Border | `white/8` to `white/10` | Dividers |
| Text Primary | `slate-300` | Body text |
| Text Muted | `slate-400/60` | Placeholder, status |
| Accent | `sky-400/80` | Links, active states |
| Glow | `sky-400/15` | Heading text-shadow |

---

## 10. File Operations Flow

### New File
1. Check if current file is dirty → prompt save dialog if yes
2. Reset editor content to ""
3. Set path to null
4. Title bar shows "Untitled"

### Open File
1. Check if current file is dirty → prompt save dialog if yes
2. Show Tauri open dialog with filter: `*.md, *.markdown, *.txt`
3. Read file via `read_file` command
4. Set content + path
5. Add to recent files via `add_recent_file`
6. Title bar shows filename

### Save
1. If path is null → trigger Save As
2. Else write content via `write_file` command
3. Update `savedContent` = `content`
4. Flash "Saved" in status bar

### Auto Save
1. Fires 2s after last keystroke
2. Only if path is not null
3. Silent save (no dialog)

---

## 11. Build & Distribution

### Development
```bash
npm run tauri dev
```

### Production Build
```bash
npm run tauri build -- --bundles app,dmg
```

### App Store Preparation
1. Build with `--target universal-apple-darwin` for universal binary
2. Ensure `entitlements.plist` is correctly referenced
3. Use `tauri icon` CLI to generate all icon sizes from a 1024x1024 source
4. Upload `.app` via Xcode Transporter to App Store Connect

---

## 12. Implementation Order (Priority)

Build in this exact order:

### Phase 1 — Core Shell (get it running)
1. ✅ Initialize Tauri v2 + React + TypeScript project
2. ✅ Configure `tauri.conf.json` (transparent window, permissions)
3. ✅ Set up Tailwind CSS v4 with deep-sea theme in `index.css`
4. ✅ Build `App.tsx` root layout (title bar + editor + preview)
5. ✅ Implement `TitleBar.tsx` with drag region
6. ✅ Implement `Editor.tsx` (textarea)
7. ✅ Implement `Preview.tsx` (react-markdown + remark-gfm)
8. ✅ Implement `StatusBar.tsx` (word/char/line count)

### Phase 2 — File Operations (make it useful)
9. Write Rust commands in `commands.rs`
10. Implement `useFile.ts` hook
11. Wire up `Cmd+N`, `Cmd+O`, `Cmd+S`, `Cmd+Shift+S`
12. Implement `useAutoSave.ts`
13. Add dirty state indicator in title bar

### Phase 3 — Polish (make it delightful)
14. Implement `Sidebar.tsx` with recent files
15. Implement `CommandPalette.tsx` (`Cmd+K`)
16. Add `useKeyboard.ts` for all shortcuts
17. Add smooth transitions/animations (sidebar toggle, command palette fade)
18. Fine-tune typography and spacing

### Phase 4 — Ship It
19. Generate app icon (jellyfish design, 1024x1024)
20. Configure entitlements for App Store
21. Test sandboxing
22. Build universal binary
23. Submit to App Store Connect

---

## 13. Constraints & Notes

- **No Electron.** Tauri only. Keep it light.
- **No external network requests.** This is a fully offline editor.
- **No database.** Recent files stored as JSON in app data dir.
- **Tauri v2**, not v1. Use the v2 plugin system (`tauri-plugin-fs`, `tauri-plugin-dialog`).
- **macOS only** for now. No need to handle Windows/Linux specifics.
- Textarea is fine for v1. CodeMirror 6 is a future upgrade — leave a `// TODO: Replace with CodeMirror 6` comment.
- Keep the total frontend bundle lean. No heavy UI frameworks (no MUI, no Ant Design).
- All text should support both English and CJK (Chinese/Japanese) characters gracefully.
