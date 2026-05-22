#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SVG="$ROOT_DIR/resources/icon.svg"
TMP_DIR="$(mktemp -d)"
ICONSET="$ROOT_DIR/resources/icon.iconset"
ICNS="$ROOT_DIR/resources/icon.icns"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "Generating icon from $SVG..."

# Convert SVG → 1024×1024 PNG using qlmanage (built-in macOS tool)
qlmanage -t -s 1024 -o "$TMP_DIR" "$SVG" 2>/dev/null || true

# qlmanage appends .png to the original filename
MASTER_PNG="$TMP_DIR/icon.svg.png"
if [ ! -f "$MASTER_PNG" ]; then
  echo "Error: qlmanage did not produce a PNG. Make sure you're on macOS." >&2
  exit 1
fi

# Build iconset with all required sizes
rm -rf "$ICONSET"
mkdir -p "$ICONSET"

sips -z 16   16   "$MASTER_PNG" --out "$ICONSET/icon_16x16.png"      -s format png >/dev/null
sips -z 32   32   "$MASTER_PNG" --out "$ICONSET/icon_16x16@2x.png"   -s format png >/dev/null
sips -z 32   32   "$MASTER_PNG" --out "$ICONSET/icon_32x32.png"       -s format png >/dev/null
sips -z 64   64   "$MASTER_PNG" --out "$ICONSET/icon_32x32@2x.png"   -s format png >/dev/null
sips -z 128  128  "$MASTER_PNG" --out "$ICONSET/icon_128x128.png"     -s format png >/dev/null
sips -z 256  256  "$MASTER_PNG" --out "$ICONSET/icon_128x128@2x.png" -s format png >/dev/null
sips -z 256  256  "$MASTER_PNG" --out "$ICONSET/icon_256x256.png"     -s format png >/dev/null
sips -z 512  512  "$MASTER_PNG" --out "$ICONSET/icon_256x256@2x.png" -s format png >/dev/null
sips -z 512  512  "$MASTER_PNG" --out "$ICONSET/icon_512x512.png"     -s format png >/dev/null
sips -z 1024 1024 "$MASTER_PNG" --out "$ICONSET/icon_512x512@2x.png" -s format png >/dev/null

# Convert iconset → .icns
iconutil -c icns "$ICONSET" -o "$ICNS"
rm -rf "$ICONSET"

echo "Icon ready: $ICNS"
