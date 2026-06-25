#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh  —  safe one-command deploy for horizonooh server
#
# Run this ONCE to set up, then use plain `git pull origin laravel` forever.
#
# Usage (on the server):
#   bash deploy.sh
#
# After running this once, plain `git pull origin laravel` will NEVER
# produce conflict markers (<<<) in public/index.html or public/assets/*
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

# ── Step 3: Clear Laravel caches ─────────────────────────────────────────────
if command -v php &> /dev/null; then
  php artisan optimize:clear 2>/dev/null && echo "✅ Laravel caches cleared" || true
fi

echo ""
echo "🚀 Deploy complete. horizonooh.com is up to date."
