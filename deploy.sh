#!/usr/bin/env bash
##############################################################################
# deploy.sh — Horizon OOH Full-Stack Deployment Script
#
# This script deploys the unified Laravel + React project.
# Run from the PROJECT ROOT (same directory as artisan & package.json).
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh [--seed]          # --seed to run fresh migrations + demo data
#
# Prerequisites on the server:
#   - PHP 8.3+   with extensions: pdo_mysql, mbstring, openssl, json, tokenizer
#   - Composer   (global install)
#   - Node.js 20+ and npm
#   - MySQL 8.0+ database created
#   - .env file configured (copy from .env.example)
##############################################################################

set -e

SEED=false
for arg in "$@"; do
  [[ "$arg" == "--seed" ]] && SEED=true
done

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   HORIZON OOH — Deployment Script           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Verify we're in the right directory ───────────────────────────────────
if [[ ! -f "artisan" ]]; then
  echo "✗ ERROR: Run this script from the Laravel project root (where artisan lives)"
  exit 1
fi

if [[ ! -f ".env" ]]; then
  echo "✗ ERROR: .env file not found. Copy .env.example to .env and configure it."
  exit 1
fi

# ── 2. PHP / Composer dependencies ───────────────────────────────────────────
echo "▸ Installing PHP dependencies (composer)..."
#composer install --no-dev --optimize-autoloader --no-interaction --quiet
PHP_BIN="/usr/bin/php"
COMPOSER_BIN="$(which composer)"

$PHP_BIN -d register_argc_argv=0 $COMPOSER_BIN install \
  --no-dev \
  --optimize-autoloader \
  --no-interaction \
  --quiet
  echo "  ✓ Composer done"

# ── 3. Laravel setup ─────────────────────────────────────────────────────────
echo "▸ Generating application key (if not set)..."
php artisan key:generate --force --no-interaction
echo "  ✓ App key ready"

echo "▸ Generating JWT secret (if not set)..."
php artisan jwt:secret --force --no-interaction 2>/dev/null || true
echo "  ✓ JWT secret ready"

echo "▸ Running database migrations..."
if [[ "$SEED" == "true" ]]; then
  echo "  → Fresh migration with demo seed data..."
  php artisan migrate:fresh --seed --force --no-interaction
else
  php artisan migrate --force --no-interaction
fi
echo "  ✓ Database up to date"

echo "▸ Creating storage symlink..."
php artisan storage:link --force --no-interaction 2>/dev/null || true
echo "  ✓ Storage linked"

# ── 4. Node.js / Frontend build ───────────────────────────────────────────────
echo "▸ Installing Node.js dependencies (npm)..."
npm ci --silent
echo "  ✓ npm dependencies installed"

echo "▸ Building React frontend..."
npm run build
echo "  ✓ Frontend built → public/app/"

# ── 5. Laravel optimisation ──────────────────────────────────────────────────
echo "▸ Optimising Laravel config/routes/views cache..."
php artisan config:cache --no-interaction
php artisan route:cache  --no-interaction
php artisan view:cache   --no-interaction
php artisan event:cache  --no-interaction
echo "  ✓ Caches warmed"

# ── 6. File permissions ───────────────────────────────────────────────────────
echo "▸ Setting file permissions..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
echo "  ✓ Permissions set"

# ── 7. Done ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✓ Deployment complete!                                 ║"
echo "║                                                         ║"
echo "║  Website:   https://your-domain.com/                   ║"
echo "║  Admin:     https://your-domain.com/#/admin/login       ║"
echo "║  API:       https://your-domain.com/api/health          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
