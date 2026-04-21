# HORIZON OOH — Premium Outdoor Advertising Website

A full-stack website for HORIZON OOH, Egypt's premier outdoor advertising company.

**Frontend:** React 18 + Vite 5 + TypeScript + Tailwind CSS v4 + Framer Motion  
**Backend:** Laravel 12 (PHP 8.4) REST API with JWT Authentication  
**Database:** MySQL 8 / MariaDB 10.6+

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — 11 sections, hero, statement, services, locations, CTA |
| `/about` | About page — company story, why choose us, key numbers |
| `/services` | Services listing grid |
| `/services/:slug` | Service detail page (Billboard, DOOH, Mall, Airport, Street, Production) |
| `/locations` | Locations listing with city cards |
| `/locations/:slug` | Location detail — formats, featured billboards |
| `/locations/:city/billboards/:slug` | Individual billboard product page with full specs |
| `/blog` | Blog listing — featured + grid |
| `/blog/:slug` | Full blog article with sidebar |
| `/contact` | Contact form → PHP API → MySQL + Email |

---

## Project Structure

```
horizon_ooh/
├── index.html               # SPA shell
├── .htaccess                # Apache SPA routing + /api proxy
├── .env.example             # Environment variable template
├── vite.config.ts           # Vite config
│
├── src/                     # React frontend
│   ├── App.tsx              # Router + all routes
│   ├── pages/               # One file per page
│   ├── components/
│   │   ├── Layout.tsx       # Navbar + Footer
│   │   └── UI.tsx           # Shared primitives (Reveal, Eyebrow, CTABanner…)
│   ├── data/index.ts        # All site content (services, locations, blog)
│   └── lib/routes.ts        # Route constants + helper functions
│
├── backend/                 # Legacy PHP backend (kept for reference)
│   └── ...                  # Superseded by laravel-backend/
│
└── laravel-backend/         # ★ Laravel 12 API backend
    ├── app/
    │   ├── Http/Controllers/Api/   # All API controllers
    │   │   ├── AuthController.php
    │   │   ├── BillboardController.php
    │   │   ├── LocationController.php
    │   │   ├── ServiceController.php
    │   │   ├── ProjectController.php
    │   │   ├── BlogController.php
    │   │   ├── ContactController.php
    │   │   ├── SettingController.php
    │   │   └── ...
    │   └── Models/          # Eloquent models
    ├── database/
    │   ├── migrations/      # All table schemas
    │   └── seeders/         # Default data (admin user, formats, stats)
    ├── routes/
    │   └── api.php          # All 50+ API routes
    ├── config/
    │   ├── auth.php         # JWT guard configuration
    │   └── cors.php         # CORS settings
    ├── .env.example         # Environment template
    ├── deploy.sh            # One-command deployment script
    └── nginx.conf.example   # Nginx vhost configuration
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/horizon-ooh.git
cd horizon-ooh
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment

```bash
cp .env.example .env
# Edit .env — set VITE_API_URL to point to your Laravel API
# e.g. VITE_API_URL=https://api.horizonooh.com/api
```

### 4. Configure Laravel backend

```bash
cd laravel-backend
cp .env.example .env
# Edit .env — set DB credentials, JWT_SECRET, SMTP, APP_URL
php artisan key:generate
php artisan jwt:secret
```

### 5. Run development server

```bash
# Terminal 1 – React frontend
npm run dev
# http://localhost:5173

# Terminal 2 – Laravel API (dev)
cd laravel-backend
php artisan serve
# http://localhost:8000/api
```

### 6. Build for production

```bash
npm run build
# Output: dist/
```

---

## Laravel Backend – Full API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/auth/login` | No | Login → returns JWT token |
| POST | `/auth/logout` | Yes | Invalidate token |
| GET | `/auth/me` | Yes | Current user info |

**Login request:**
```json
{ "email": "admin@horizonooh.com", "password": "admin123" }
```
**Login response:**
```json
{ "token": "eyJ...", "user": { "id": 1, "name": "Admin", "email": "...", "role": "admin" } }
```

All authenticated requests must include the header:
```
Authorization: Bearer <token>
```

### Content Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/locations` | All locations with billboards |
| GET | `/locations/{slug}` | Single location |
| GET | `/billboards` | All billboards (filterable) |
| GET | `/billboards/{slug}` | Single billboard |
| GET | `/services` | All services |
| GET | `/services/{slug}` | Single service |
| GET | `/projects` | All projects (portfolio) |
| GET | `/projects/{slug}` | Single project |
| GET | `/blog` | Blog posts (published only) |
| GET | `/blog/{slug}` | Single blog post |
| GET | `/ad-formats` | Billboard format types |
| GET | `/clients` | Client brand logos |
| GET | `/trust-stats` | Homepage stats |
| GET | `/process-steps` | How-it-works steps |
| GET | `/settings` | Site-wide settings |
| POST | `/contact` | Submit contact/enquiry form |

### Admin Endpoints (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Dashboard counters |
| PUT | `/settings` | Bulk-update site settings |
| POST/PUT/DELETE | `/locations/{id}` | Manage locations |
| GET/POST/PUT/DELETE | `/districts` | Manage districts |
| POST/PUT/DELETE | `/billboards/{id}` | Manage billboards + images |
| DELETE | `/billboards/{id}/images` | Remove a billboard image |
| POST/PUT/DELETE | `/services/{id}` | Manage services |
| POST/PUT/DELETE | `/projects/{id}` | Manage projects |
| POST/PUT/DELETE | `/blog/{id}` | Manage blog posts |
| GET/PUT/DELETE | `/contacts/{id}` | View/manage contact enquiries |
| POST/PUT/DELETE | `/clients/{id}` | Manage client brands |
| POST/PUT/DELETE | `/trust-stats/{id}` | Manage homepage stats |
| POST/PUT/DELETE | `/process-steps/{id}` | Manage how-it-works steps |
| GET/POST/PUT/DELETE | `/suppliers` | Manage suppliers |
| GET/POST/PUT/DELETE | `/customers` | Manage customers |
| GET/POST/PUT/DELETE | `/users` | Manage admin users |

---

## Production Deployment

### Option A – One-Command Deploy (recommended)

```bash
# After uploading laravel-backend/ to server:
cd /var/www/horizonooh/laravel-backend
cp .env.example .env
nano .env   # Fill in your DB, SMTP, APP_URL, etc.
chmod +x deploy.sh
./deploy.sh
```

### Option B – Manual Steps

```bash
# 1. Install dependencies
composer install --no-dev --optimize-autoloader

# 2. Generate keys
php artisan key:generate --force
php artisan jwt:secret --force

# 3. Run migrations + seed default data
php artisan migrate --force
php artisan db:seed --force

# 4. Storage symlink
php artisan storage:link

# 5. Optimise
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Permissions
chmod -R 775 storage bootstrap/cache
```

### Nginx Configuration

See `laravel-backend/nginx.conf.example` for a complete Nginx vhost.

### Apache Configuration

The `laravel-backend/public/.htaccess` handles URL rewriting.
Ensure `mod_rewrite` is enabled: `a2enmod rewrite`.

---

## Database

Full schema managed by Laravel migrations in `database/migrations/`.
Default seed data (admin user, ad formats, trust stats, process steps) in `database/seeders/DatabaseSeeder.php`.

**Default admin credentials** (change immediately after first login):
- Email: `admin@horizonooh.com`
- Password: `admin123`

---

## Security

- All admin routes require a valid JWT (`Authorization: Bearer <token>`)
- JWT tokens expire after 24 hours; configurable via `JWT_TTL`
- Input validated with Laravel's `$request->validate()` on every endpoint
- Honeypot field on contact form silently rejects bots
- CORS restricted via `CORS_ALLOWED_ORIGINS` in `.env`
- File uploads stored in `storage/app/public` (outside webroot)
- `.env` is in `.gitignore` — **never commit credentials**

---

## Brand

| Token | Value |
|---|---|
| Navy | `#0B0F1A` |
| White | `#FFFFFF` |
| Accent Red | `#D90429` |
| Font | Inter (Google Fonts) |

---

## License

© 2026 HORIZON OOH. All rights reserved.

```bash
cp backend/config/config.example.php backend/config/config.php
# Edit backend/config/config.php — set DB, mail, and CORS settings
```

### 5. Run development server

```bash
npm run dev
# Frontend: http://localhost:5173
# API calls proxied to /api → backend/api/index.php via vite.config proxy
```

### 6. Build for production

```bash
npm run build
# Output: dist/
```

---

## Backend API Reference

### `GET /api/health`

Health check — returns service name, version, and server time.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "service": "HORIZON OOH API",
    "version": "v1",
    "time": "2026-04-04T12:00:00+02:00"
  }
}
```

---

### `POST /api/contact`

Submit a campaign enquiry form.

**Request body (JSON):**
```json
{
  "name":    "Ahmed Hassan",
  "email":   "ahmed@brand.com",
  "phone":   "+20 10 1234 5678",
  "company": "Brand Egypt",
  "message": "We need billboard coverage on the Ring Road for Q3 2026."
}
```

**Success response `200`:**
```json
{
  "status": "ok",
  "data": {
    "message": "Your message has been received. We will be in touch within 24 hours.",
    "lead_id": 42
  }
}
```

**Validation error `422`:**
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "email": "email must be a valid email address."
  }
}
```

**Rate limit error `429`:**
```json
{
  "status": "error",
  "message": "Too many requests. Please wait 3540 seconds before trying again."
}
```

---

## Database Schema

The `contact_leads` table is auto-created on first form submission:

```sql
CREATE TABLE IF NOT EXISTS contact_leads (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    phone      VARCHAR(30)   NOT NULL DEFAULT '',
    company    VARCHAR(200)  NOT NULL DEFAULT '',
    message    TEXT          NOT NULL,
    ip_address VARCHAR(45)   NOT NULL DEFAULT '',
    user_agent VARCHAR(500)  NOT NULL DEFAULT '',
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email   (email),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Production Deployment (Apache + PHP)

1. Upload the entire repository to your web root (e.g. `/var/www/html/horizonooh.com/`)
2. Run `npm run build` — copy the `dist/` contents to your web root
3. Place `backend/` alongside `index.html`
4. Ensure `mod_rewrite` is enabled on Apache
5. Set correct file permissions: `find backend/ -type f -name "*.php" -exec chmod 644 {} \;`
6. Set `backend/config/config.php` — **never commit this file**

---

## Security Notes

- `config.php` is in `.gitignore` — never commit credentials
- Rate limiter: 10 contact submissions per IP per hour
- All user input is sanitised with `htmlspecialchars` + `strip_tags`
- Honeypot field detects bots silently
- `.htaccess` blocks direct access to all lib/config PHP files
- CORS restricted to configured origin(s) only

---

## Brand

| Token | Value |
|---|---|
| Navy | `#0B0F1A` |
| White | `#FFFFFF` |
| Accent Red | `#D90429` |
| Font | Inter (Google Fonts) |

---

## License

© 2026 HORIZON OOH. All rights reserved.