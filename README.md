# HORIZON OOH — Premium Outdoor Advertising Website

A full-stack website for HORIZON OOH, Egypt's premier outdoor advertising company.

**Frontend:** React 18 + Vite 5 + TypeScript + Tailwind CSS v4 + Framer Motion  
**Backend:** PHP 8.1+ REST API  
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
└── backend/                 # PHP backend
    ├── .htaccess            # Apache rules for backend
    ├── api/
    │   ├── index.php        # API router  (GET /health, POST /contact)
    │   └── contact.php      # Contact form handler
    ├── config/
    │   └── config.example.php   # Config template (copy → config.php)
    └── lib/
        ├── bootstrap.php    # Bootstrap: config load, CORS, helpers
        ├── Cors.php         # CORS handler
        ├── Validator.php    # Input validation & sanitisation
        ├── Database.php     # PDO singleton wrapper
        ├── Mailer.php       # Email notifications (notification + ack)
        └── RateLimiter.php  # File-based rate limiter (10 req/hr/IP)
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

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set VITE_API_URL, DB credentials, SMTP settings
```

### 4. Configure PHP backend

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
