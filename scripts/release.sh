#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# --- Require GITHUB_TOKEN (fall back to gh CLI) ---
if [ -z "${GITHUB_TOKEN:-}" ]; then
  if command -v gh &>/dev/null; then
    GITHUB_TOKEN="$(gh auth token 2>/dev/null)"
  fi
fi
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: no GitHub token found. Run 'gh auth login' or set GITHUB_TOKEN."
  exit 1
fi
export GITHUB_TOKEN

# --- Require clean working tree ---
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree has uncommitted changes. Commit or stash them first."
  exit 1
fi

# --- Bump patch version ---
NEW_VERSION=$(npm version patch --no-git-tag-version | sed 's/^v//')
echo "Version bumped to $NEW_VERSION"

# --- Commit and tag ---
git add package.json package-lock.json
git commit -m "v${NEW_VERSION}"
git tag "v${NEW_VERSION}"
echo "Created commit and tag v${NEW_VERSION}"

# --- Build and publish ---
echo "Building and publishing..."
npm run publish

# --- Push commit and tag ---
git push
git push --tags
echo ""
echo "Released v${NEW_VERSION} — check GitHub for the draft release."
