#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"

DMG_PATH=$(find out/make -name "*.dmg" -maxdepth 3 | head -1)
if [ -z "$DMG_PATH" ]; then
  echo "Error: DMG not found in out/make/"
  exit 1
fi

echo "==> Creating GitHub release $TAG..."
gh release create "$TAG" "$DMG_PATH" \
  --title "M Note $TAG" \
  --generate-notes

echo "==> Released: $(gh release view "$TAG" --json url -q .url)"
