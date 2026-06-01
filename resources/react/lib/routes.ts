// ─── HORIZON OOH — Route constants ────────────────────────────────────────
import type { Lang } from '@/i18n/LangContext';

// ── Raw path segments (no lang prefix) ───────────────────────────────────
export const PATHS = {
  HOME:            "/",
  ABOUT:           "/about",
  SERVICES:        "/services",
  SERVICE_DETAIL:  "/services/:slug",
  PROJECTS:        "/projects",
  PROJECT_DETAIL:  "/projects/:slug",
  LOCATIONS:       "/locations",
  LOCATION_DETAIL: "/locations/:slug",
  PRODUCT:         "/locations/:city/billboards/:slug",
  BLOG:            "/blog",
  BLOG_ARTICLE:    "/blog/:slug",
  CONTACT:         "/contact",
  LOGIN:           "/login",
  SIGNUP:          "/signup",
  PROFILE:         "/profile",
  DESIGN_SIMULATOR:"/design-simulator",
} as const;

// ── Prefix a raw path with /ar when lang === 'ar' ─────────────────────────
export function langPath(lang: Lang, path: string): string {
  if (lang === 'ar') {
    // "/" becomes "/ar", "/about" becomes "/ar/about"
    return path === '/' ? '/ar' : `/ar${path}`;
  }
  return path;
}

// ── Convenience: build a concrete href ────────────────────────────────────
export const serviceHref  = (lang: Lang, slug: string) => langPath(lang, `/services/${slug}`);
export const projectHref  = (lang: Lang, slug: string) => langPath(lang, `/projects/${slug}`);
export const locationHref = (lang: Lang, slug: string) => langPath(lang, `/locations/${slug}`);
export const productHref  = (lang: Lang, city: string, slug: string) => langPath(lang, `/locations/${city}/billboards/${slug}`);
export const blogHref     = (lang: Lang, slug: string) => langPath(lang, `/blog/${slug}`);

// ── ROUTES: always returns paths for the CURRENT language ─────────────────
// Use in components that already have `lang` from useLang()
export function makeRoutes(lang: Lang) {
  return {
    HOME:             langPath(lang, '/'),
    ABOUT:            langPath(lang, '/about'),
    SERVICES:         langPath(lang, '/services'),
    SERVICE_DETAIL:   langPath(lang, '/services/:slug'),
    PROJECTS:         langPath(lang, '/projects'),
    PROJECT_DETAIL:   langPath(lang, '/projects/:slug'),
    LOCATIONS:        langPath(lang, '/locations'),
    LOCATION_DETAIL:  langPath(lang, '/locations/:slug'),
    PRODUCT:          langPath(lang, '/locations/:city/billboards/:slug'),
    BLOG:             langPath(lang, '/blog'),
    BLOG_ARTICLE:     langPath(lang, '/blog/:slug'),
    CONTACT:          langPath(lang, '/contact'),
    LOGIN:            langPath(lang, '/login'),
    SIGNUP:           langPath(lang, '/signup'),
    PROFILE:          langPath(lang, '/profile'),
    DESIGN_SIMULATOR: langPath(lang, '/design-simulator'),
  };
}

// ── Legacy ROUTES constant — English paths (backward compat) ──────────────
// Prefer makeRoutes(lang) in components that need lang-aware links.
export const ROUTES = makeRoutes('en');

// ─── Brand tokens ─────────────────────────────────────────────────────────
export const NAVY = "#0B0F1A";
export const RED = "#D90429";
export const WHITE = "#FFFFFF";

// ─── Shared animation ease ─────────────────────────────────────────────────
export const ease = [0.16, 1, 0.3, 1] as const;

// ─── Shared scroll utility ─────────────────────────────────────────────────
export const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
