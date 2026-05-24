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

Runs the full release pipeline:

1. Bumps the patch version
2. Commits and tags the new version
3. Builds a DMG
4. Pushes the commit and tag to GitHub
5. Creates a GitHub Release with the DMG attached

Requires the [GitHub CLI](https://cli.github.com/) (`gh`).

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
