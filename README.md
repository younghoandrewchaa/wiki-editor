# M Note

A markdown editor built with Electron, React, and Tiptap.

## Development

```bash
npm start
```

## Scripts

### Release

```bash
npm run release
```

Requires a clean working tree and the [GitHub CLI](https://cli.github.com/) (`gh`).

Runs the full release pipeline in sequence:

1. **Preflight** — checks `gh` is installed and there are no uncommitted changes
2. **Version bump** — `npm version patch --no-git-tag-version` increments the patch number in `package.json` / `package-lock.json`
3. **Commit & tag** — commits the version files and creates a `vX.Y.Z` git tag
4. **Build DMG** (`scripts/build-dmg.sh`) — generates the app icon if missing, cleans `out/`, runs Electron Forge (`npm run make -- --targets @electron-forge/maker-dmg`), and verifies the `.dmg` exists
5. **Push** — pushes the commit and tag to the remote
6. **GitHub Release** — `gh release create` uploads the DMG and publishes with auto-generated notes

### Build DMG (local only)

```bash
npm run build:dmg
```

Builds the DMG without bumping the version or publishing. Useful for local testing.

### Package

```bash
npm run package:mac
```

Builds and packages the app as a `.app` bundle, with an option to install to `~/Applications`.
