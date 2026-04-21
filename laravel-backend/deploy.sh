#!/usr/bin/env bash
# ============================================================
# HORIZON OOH – Laravel Backend Deployment Script
# Run this after uploading the laravel-backend directory
# to your server.
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
fail() { echo -e "${RED}✘ $1${NC}"; exit 1; }

# ── 1. Check .env ────────────────────────────────────────────────────────────
step "Checking .env"
[ -f .env ] || fail ".env not found — copy .env.example to .env and fill in your values"
ok ".env exists"

# ── 2. Install PHP dependencies ───────────────────────────────────────────────
step "Installing Composer dependencies (production)"
composer install --no-dev --optimize-autoloader --no-interaction
ok "Composer done"

# ── 3. App key ───────────────────────────────────────────────────────────────
APP_KEY=$(grep -E "^APP_KEY=" .env | cut -d= -f2)
if [ -z "$APP_KEY" ]; then
    step "Generating application key"
    php artisan key:generate --force
    ok "App key generated"
else
    ok "App key already set"
fi

# ── 4. JWT secret ────────────────────────────────────────────────────────────
JWT_SECRET=$(grep -E "^JWT_SECRET=" .env | cut -d= -f2)
if [ -z "$JWT_SECRET" ]; then
    step "Generating JWT secret"
    php artisan jwt:secret --force
    ok "JWT secret generated"
else
    ok "JWT secret already set"
fi

# ── 5. Migrate & seed ────────────────────────────────────────────────────────
step "Running database migrations"
php artisan migrate --force
ok "Migrations complete"

step "Seeding default data (safe — uses firstOrCreate)"
php artisan db:seed --force
ok "Seed complete"

# ── 6. Storage symlink ───────────────────────────────────────────────────────
step "Creating storage symlink"
php artisan storage:link --force
ok "Storage linked → public/storage"

# ── 7. Clear & warm caches ───────────────────────────────────────────────────
step "Optimizing for production"
php artisan config:cache
php artisan route:cache
php artisan view:cache
ok "Caches warmed"

# ── 8. File permissions ───────────────────────────────────────────────────────
step "Setting file permissions"
chmod -R 775 storage bootstrap/cache
ok "Permissions set"

echo -e "\n${GREEN}════════════════════════════════════════"
echo "  HORIZON OOH API deployment complete!"
echo "  Health check: curl https://your-domain.com/api/health"
echo -e "════════════════════════════════════════${NC}\n"
