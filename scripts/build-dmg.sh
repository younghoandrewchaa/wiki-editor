#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Error: script failed at line $LINENO" >&2' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
cd "$ROOT"

VERSION=$(node -p "require('./package.json').version")

# --- Icon ---
if [ ! -f resources/icon.icns ]; then
  echo "==> Generating icon..."
  sh scripts/generate-icon.sh
fi

# --- Clean previous build ---
rm -rf out/

# --- Build DMG ---
echo "==> Building DMG for v${VERSION}..."
npx electron-forge make --targets @electron-forge/maker-dmg

# --- Find DMG ---
DMG_PATH=$(find out/make -name "*.dmg" -maxdepth 3 | head -1)
if [ -z "$DMG_PATH" ]; then
  echo "Error: DMG not found in out/make/"
  exit 1
fi

echo "==> DMG built: $DMG_PATH"
