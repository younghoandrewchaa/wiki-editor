# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is M Note

M Note is a macOS desktop markdown editor built with Electron, React, and Tiptap. It opens `.md`/`.markdown` files (via double-click, drag-and-drop, or CLI args), provides rich-text editing with a toolbar, and saves back as markdown. It checks GitHub releases for updates and shows an in-app banner.

## Commands

- `npm start` — launch the dev app (Electron Forge + Vite HMR)
- `npm test` — run tests (Vitest)
- `npx vitest run src/__tests__/foo.test.ts` — run a single test
- `npm run lint` — ESLint
- `npm run build:dmg` — build macOS DMG (calls `scripts/build-dmg.sh`)
- `npm run release` — full release pipeline: version bump, commit, tag, build DMG, push, GitHub release via `gh`

## Rules

- When fixing a bug or issue, always write a unit test that reproduces the problem before implementing the fix. Tests go in `src/__tests__/`.

## Architecture

**Electron process split:**
- `src/main.ts` — main process. Creates windows, handles IPC (`read-file`, `save-file`, `check-for-update`, `open-external`), listens for `open-file` events (macOS file association for `.md`/`.markdown`).
- `src/preload.ts` — exposes `window.electronAPI` to the renderer via `contextBridge`. All renderer↔main communication goes through this API.
- `src/renderer.tsx` → `src/App.tsx` → `SimpleEditor` — the entire renderer is a single Tiptap editor.

**Editor (`src/components/tiptap-templates/simple/simple-editor.tsx`):**
The central component. Configures all Tiptap extensions, wires up file open/save/dirty-tracking, drag-and-drop, keyboard shortcuts (Cmd+S), and the update banner. The toolbar adapts between desktop and mobile layouts.

**Component organisation under `src/components/`:**
- `tiptap-ui-primitive/` — generic UI atoms (Button, Toolbar, Popover, etc.)
- `tiptap-ui/` — editor-specific toolbar buttons and popovers (bold, link, headings, save, copy-markdown, etc.)
- `tiptap-node/` — custom Tiptap node extensions with their styles (code-block, image-upload, horizontal-rule, etc.)
- `tiptap-extension/` — custom Tiptap extensions (e.g. node background)
- `tiptap-icons/` — SVG icon components

**Styling:** SCSS with variables in `src/styles/_variables.scss`. Each node/component has a co-located `.scss` file. The renderer Vite config uses `sass` with the `modern-compiler` API.

**Path alias:** `@/` maps to `src/` (configured in both `tsconfig.json` and `vite.renderer.config.ts`).

**File handling flow:** macOS `open-file` event or CLI arg → main process `createWindow(filePath)` → renderer receives `file-opened` IPC → editor loads markdown content. Save: renderer calls `saveFile` IPC → main process writes to disk. On window close, a `save-before-close` IPC round-trip ensures unsaved changes are persisted.

**Update checker (`src/update-checker.ts`):** Polls the GitHub releases API for `younghoandrewchaa/m-note`, compares semver, and surfaces a DMG download link.

**Build:** Electron Forge with Vite plugin. Three Vite configs: `vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`. The app is code-signed and notarised for macOS (keychain profile `sprout-pomodoro`).
