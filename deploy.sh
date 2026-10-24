#!/usr/bin/env bash
set -euo pipefail
cd /home/horizon/saudi-site
[ "$(git branch --show-current)" = saudi ] || { echo 'Saudi branch required' >&2; exit 1; }
[ -f database/saudi-preview.sqlite ] || { echo 'Independent preview DB missing' >&2; exit 1; }
[ "$(readlink -f public/storage)" = /home/horizon/saudi-site/storage/app/public ]
backup=/home/horizon/deploy-backups/saudi-preview-$(date +%Y%m%d-%H%M%S)
mkdir -p "$backup"
php -r '$db=new PDO("sqlite:database/saudi-preview.sqlite"); $db->exec("VACUUM INTO ". $db->quote($argv[1]));' "$backup/database.sqlite"
chmod 600 "$backup/database.sqlite"
# Pull only the Saudi branch. Never run Egypt deployment scripts here.
git pull --ff-only origin saudi
php artisan migrate --force
SSG_API_BASE=https://dev.horizonooh.com/api npm run build
npm run test:ssg
php artisan optimize:clear
echo 'Saudi preview deployed. Keep noindex until the final domain and business data are verified.'
