#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh  —  safe one-command deploy for horizonooh server
#
# Pull the canonical branch, install production dependencies when needed,
# rebuild the hydrated client + SSG pages, then clear Laravel caches.
#
# Usage (on the server):
#   bash deploy.sh
#
# The client bundle remains committed for hosts that deploy directly from Git.
# SSG route files are generated during deployment because they contain a
# build-time snapshot of the current public API content.
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── Step 1: Register merge drivers (idempotent — safe to run multiple times) ──

# 'incoming' driver: always take the remote (GitHub) version.
# Used for public/index.html and public/assets/*.js/.css
# "true" as the driver command means: accept the merge result as-is
# (git pre-fills %A with the incoming/theirs content when driver returns 0)
git config merge.incoming.name "Always take incoming (GitHub) version"
git config merge.incoming.driver "cp %B %A"

# 'binary' driver: skip merge entirely for compressed binary files (.br/.gz)
# These can't be text-merged anyway; the incoming file is always correct.
git config merge.binary.name "Binary files — always take incoming"
git config merge.binary.driver "cp %B %A"

echo "✅ Merge drivers registered (incoming + binary)"

# ── Step 2: Pull latest from GitHub ──────────────────────────────────────────
git pull origin laravel
echo "✅ git pull complete — no conflicts on built assets"

# ── Step 3: Install/build frontend ───────────────────────────────────────────
if command -v npm &> /dev/null; then
  npm ci
  SSG_API_BASE="${SSG_API_BASE:-https://horizonooh.com/api}" npm run build
  npm run test:ssg
  echo "✅ React client + SSG pages built"
else
  echo "⚠️  npm is unavailable — using the committed frontend build"
fi

# ── Step 4: Install PHP dependencies ─────────────────────────────────────────
if command -v composer &> /dev/null; then
  composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
  echo "✅ PHP dependencies installed"
fi

# ── Step 5: Clear Laravel caches ─────────────────────────────────────────────
if command -v php &> /dev/null; then
  php artisan optimize:clear 2>/dev/null && echo "✅ Laravel caches cleared" || true
fi

echo ""
echo "🚀 Deploy complete. horizonooh.com is up to date."
