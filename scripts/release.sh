#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Error: script failed at line $LINENO" >&2' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
cd "$ROOT"

APP_NAME="M Note"

# --- Require gh CLI ---
if ! command -v gh &>/dev/null; then
  echo "Error: gh CLI is required. Install it: brew install gh"
  exit 1
fi

# --- Require clean working tree ---
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree has uncommitted changes. Commit or stash them first."
  exit 1
fi

# --- Bump patch version ---
NEW_VERSION=$(npm version patch --no-git-tag-version | sed 's/^v//')
echo "==> Version bumped to $NEW_VERSION"

# --- Commit and tag ---
git add package.json package-lock.json
git commit -m "v${NEW_VERSION}"
git tag "v${NEW_VERSION}"
echo "==> Created commit and tag v${NEW_VERSION}"

# --- Build DMG ---
sh "$SCRIPT_DIR/build-dmg.sh"

# --- Find DMG ---
DMG_PATH=$(find out/make -name "*.dmg" -maxdepth 3 | head -1)
if [ -z "$DMG_PATH" ]; then
  echo "Error: DMG not found in out/make/"
  exit 1
fi

# --- Push commit and tag ---
echo "==> Pushing to remote..."
git push
git push --tags

# --- Publish to GitHub ---
TAG="v${NEW_VERSION}"
echo "==> Creating GitHub release $TAG..."
gh release create "$TAG" "$DMG_PATH" \
  --title "$APP_NAME $TAG" \
  --generate-notes

echo ""
echo "Released $APP_NAME $TAG"
echo "  DMG: $DMG_PATH"
echo "  Release: $(gh release view "$TAG" --json url -q .url)"
