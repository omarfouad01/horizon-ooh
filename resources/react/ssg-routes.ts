import { BLOG_POSTS, LOCATIONS, PROJECTS, SERVICES } from "./data";

const STATIC_PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/locations",
  "/blog",
  "/contact",
] as const;

function normalizeRoute(route: string): string | null {
  if (typeof route !== "string") return null;
  const clean = `/${route}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  if (!clean.startsWith("/") || clean.includes("..") || clean.includes("?") || clean.includes("#")) {
    return null;
  }
  if (/^\/(?:ar\/)?(?:admin|login|signup|profile|design-simulator)(?:\/|$)/.test(clean)) {
    return null;
  }
  return clean;
}

function addArabic(route: string): string {
  return route === "/" ? "/ar" : `/ar${route}`;
}

interface PublicSnapshot {
  services?: Array<{ slug?: string }>;
  projects?: Array<{ slug?: string }>;
  locations?: Array<{ slug?: string; products?: Array<{ slug?: string }> }>;
  blogPosts?: Array<{ slug?: string }>;
}

export function getStaticPublicRoutes(snapshot?: PublicSnapshot | null): string[] {
  const routes = new Set<string>(STATIC_PUBLIC_ROUTES);
  const services = snapshot?.services?.length ? snapshot.services : SERVICES;
  const projects = snapshot?.projects?.length ? snapshot.projects : PROJECTS;
  const locations = snapshot?.locations?.length ? snapshot.locations : LOCATIONS;
  const blogPosts = snapshot?.blogPosts?.length ? snapshot.blogPosts : BLOG_POSTS;

  services.forEach((service) => service.slug && routes.add(`/services/${service.slug}`));
  projects.forEach((project) => project.slug && routes.add(`/projects/${project.slug}`));
  blogPosts.forEach((post) => post.slug && routes.add(`/blog/${post.slug}`));

  locations.forEach((location) => {
    if (!location.slug) return;
    routes.add(`/locations/${location.slug}`);
    (location.products || []).forEach((product) => {
      if (product.slug) routes.add(`/locations/${location.slug}/billboards/${product.slug}`);
    });
  });

  const englishRoutes = [...routes]
    .map(normalizeRoute)
    .filter((route): route is string => Boolean(route) && route !== "/ar" && !route.startsWith("/ar/"))
    .sort((a, b) => a.localeCompare(b));

  return [...englishRoutes, ...englishRoutes.map(addArabic)];
}
