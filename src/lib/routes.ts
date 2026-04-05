// ─── HORIZON OOH — Route constants ────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  SERVICES: "/services",
  SERVICE_DETAIL: "/services/:slug",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:slug",
  LOCATIONS: "/locations",
  LOCATION_DETAIL: "/locations/:slug",
  PRODUCT: "/locations/:city/billboards/:slug",
  BLOG: "/blog",
  BLOG_ARTICLE: "/blog/:slug",
  CONTACT: "/contact",
};

export const serviceHref  = (slug: string) => `/services/${slug}`;
export const projectHref  = (slug: string) => `/projects/${slug}`;
export const locationHref = (slug: string) => `/locations/${slug}`;
export const productHref  = (city: string, slug: string) => `/locations/${city}/billboards/${slug}`;
export const blogHref     = (slug: string) => `/blog/${slug}`;

// ─── Brand tokens ─────────────────────────────────────────────────────────
export const NAVY = "#0B0F1A";
export const RED = "#D90429";
export const WHITE = "#FFFFFF";

// ─── Shared animation ease ─────────────────────────────────────────────────
export const ease = [0.16, 1, 0.3, 1] as const;

// ─── Shared scroll utility ─────────────────────────────────────────────────
export const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
