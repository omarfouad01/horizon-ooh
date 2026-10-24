# Saudi preview

Preview: https://dev.horizonooh.com (English and /ar). Admin: /admin.
Branch: saudi. Egypt remains on laravel.

Independent application: /home/horizon/saudi-site. Independent SQLite preview database, uploads, cache, sessions, app key and JWT key. The existing administrator account is available; other Egypt accounts were not copied. Existing public Horizon contact details are temporarily retained at the owner's request.

Imported only KSA-marked legacy inventory: 369 billboards, 393 verified image files. Source IDs/codes and bilingual details preserved. Source data and import ledger are backed up privately outside Git. Seven source records have invalid/out-of-country coordinates, so their map coordinates are withheld pending review: 3495,3496,3497,3498,3499,3500,3504. No coordinates were invented.

Two bilingual Saudi starter articles and four service pages were prepared. Legacy posts are retained in the private export for editorial review; no Egypt article was published as a Saudi article.

The existing unused dev vhost routes through public/ to the isolated application. Its original public directory and root htaccess are preserved under /home/horizon/deploy-backups/saudi-20261024/dev-original. Egypt production was not repointed or edited.

Staging uses robots Disallow:/, noindex metadata and X-Robots-Tag headers. Before final launch, configure the final hostname, verified Saudi business details, MySQL database, canonical/hreflang origins, robots and sitemap. Then rebuild and verify. Do not remove noindex on the temporary domain.

Generated assets/SSG pages and private database/uploads are deployment artifacts, excluded from source control. Run deploy.sh only in the Saudi checkout. Never execute Egypt's deployment script here.
