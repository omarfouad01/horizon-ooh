import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inlineHomeCss } from "./inline-home-css.mjs";
import { compactPublicSnapshot } from "./compact-public-snapshot.mjs";
import { locationPageContent, projectPageContent } from "./public-page-content.mjs";
import { gzipSync, brotliCompressSync, constants as zlibConstants } from "node:zlib";

const projectRoot = resolve(import.meta.dirname, "..");
const publicDir = resolve(projectRoot, "public");
const shellPath = resolve(publicDir, "index.html");
const runtimeDir = process.env.SSG_RUNTIME_DIR || resolve(projectRoot, ".skywork/runtime/ssg");
const serverEntry = resolve(runtimeDir, "entry-server.mjs");
const routeManifestPath = resolve(runtimeDir, "ssg-routes.mjs");
const outputDir = process.env.SSG_OUTPUT_DIR ? resolve(process.env.SSG_OUTPUT_DIR) : resolve(publicDir, "ssg");

if (!existsSync(shellPath)) throw new Error(`Client build not found: ${shellPath}`);
if (!existsSync(serverEntry)) throw new Error(`SSG server bundle not found: ${serverEntry}`);
if (!existsSync(routeManifestPath)) throw new Error(`SSG route bundle not found: ${routeManifestPath}`);

const [{ render }, { getStaticPublicRoutes }] = await Promise.all([
  import(`${pathToFileURL(serverEntry).href}?v=${Date.now()}`),
  import(`${pathToFileURL(routeManifestPath).href}?v=${Date.now()}`),
]);

function publicImage(value, fallback = "/images/hero-1600.webp") {
  if (typeof value !== "string" || !value || value.startsWith("data:") || value.startsWith("blob:")) {
    return fallback;
  }
  return value;
}

function publicImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => {
      if (typeof image === "string") return publicImage(image, "");
      if (!image || typeof image !== "object") return null;
      const url = publicImage(image.url, "");
      return url ? { ...image, url } : null;
    })
    .filter(Boolean);
}

function apiArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

async function fetchJson(base, path) {
  const response = await fetch(`${base.replace(/\/$/, "")}/${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.json();
}

async function loadPublicSnapshot() {
  const base = process.env.SSG_API_BASE?.trim();
  if (!base) return null;

  const [
    rawLocations,
    rawServices,
    rawProjects,
    rawBlog,
    settings,
    homeContent,
    aboutContent, rawClients, rawStats, rawSteps, rawFormats, rawBillboardFormats, rawSimulatorTemplates,
  ] = await Promise.all([
    fetchJson(base, "locations?full=1"),
    fetchJson(base, "services"),
    fetchJson(base, "projects"),
    fetchJson(base, "blog?full=1"),
    fetchJson(base, "settings"),
    fetchJson(base, "home-content"),
    fetchJson(base, "about-content"),
    fetchJson(base, "clients"), fetchJson(base, "trust-stats"), fetchJson(base, "process-steps"),
    fetchJson(base, "ad-formats"), fetchJson(base, "billboard-formats"), fetchJson(base, "simulator-templates"),
  ]);

  const projectList = apiArray(rawProjects);
  const projects = await Promise.all(projectList.map(async (project) => {
    try {
      return await fetchJson(base, `projects/${encodeURIComponent(project.slug)}`);
    } catch {
      return project;
    }
  }));

  const locations = apiArray(rawLocations).map((location) => ({
    ...location,
    image: publicImage(location.image),
    products: apiArray(location.products).map((product) => {
      const images = publicImages(product.images);
      const image = publicImage(product.image || images[0]?.url);
      const name = product.name || product.nameEn || product.title || product.code || "Billboard";
      return {
        ...product,
        name,
        nameEn: product.nameEn || name,
        image,
        images,
        fullAddress: product.fullAddress || product.full_address || product.location || "",
      };
    }),
  }));

  const services = apiArray(rawServices).map((service) => ({
    ...service,
    title: service.title || service.name || service.shortTitle || "Service",
    shortTitle: service.shortTitle || service.name || service.title || "Service",
    image: publicImage(service.image),
  }));

  const blogPosts = apiArray(rawBlog).map((post) => ({
    ...post,
    image: publicImage(post.image),
  }));

  const safeProjects = projects.map((project) => ({
    ...project,
    coverImage: publicImage(project.coverImage),
    heroImage: publicImage(project.heroImage || project.coverImage),
    galleryImages: publicImages(project.galleryImages),
  }));

  const districts = locations.flatMap((location) =>
    apiArray(location.districts).map((district) => ({
      ...district,
      locationId: district.locationId || location.id,
      location_slug: location.slug,
      cityAr: location.cityAr || "",
    })),
  );

  const snapshot = {
    loaded: true,
    loading: false,
    usingDemo: false,
    error: null,
    locations,
    simulatorTemplates: apiArray(rawSimulatorTemplates).map(t => ({...t, id: String(t.id), typeName: t.typeName ?? t.type_name ?? '', sizeLabel: t.sizeLabel ?? t.size_label ?? '', mockupUrl: t.mockupUrl ?? t.mockup_url ?? '', panels: apiArray(t.panels).length ? t.panels : (t.corners ? [t.corners] : [])})),
    districts,
    clientBrands: apiArray(rawClients), trustStats: apiArray(rawStats),
    process: apiArray(rawSteps), processSteps: apiArray(rawSteps),
    adFormats: apiArray(rawFormats).map(f => ({...f, label:f.label || f.name})),
    billboardFormats: apiArray(rawBillboardFormats).map(f => ({...f, label:f.label || f.name})),
    results: homeContent?.results || [],
    services,
    projects: safeProjects,
    blogPosts,
    settings: settings?.data || settings || {},
    locationsContent: locationPageContent(settings?.data || settings || {}),
    projectsContent: projectPageContent(settings?.data || settings || {}),
    homeContent: homeContent?.data || homeContent || {},
    about: aboutContent?.data || aboutContent || {},
    aboutContent: aboutContent?.data || aboutContent || {},
  };

  // Never duplicate embedded base64/blob media into every HTML page. Public
  // content remains complete and those assets refresh from the API after
  // hydration; stable HTTP(S)/root-relative images remain in first paint.
  return JSON.parse(JSON.stringify(snapshot, (_key, value) => {
    if (typeof value === "string" && (value.startsWith("data:") || value.startsWith("blob:"))) {
      return "";
    }
    return value;
  }));
}

let snapshot = null;
try {
  snapshot = await loadPublicSnapshot();
  if (snapshot) {
    console.log(`Loaded build-time public data from ${process.env.SSG_API_BASE}`);
  }
} catch (error) {
  console.warn(`SSG API snapshot unavailable; using repository data: ${error.message}`);
}

const routes = getStaticPublicRoutes(snapshot);
const shell = readFileSync(shellPath, "utf8");

function stripArabicPrefix(route) {
  if (route === "/ar") return "/";
  return route.startsWith("/ar/") ? route.slice(3) : route;
}

function publicBase(source) {
  if (!source) return null;

  // Most public routes only need a small amount of shared data for the
  // header/footer. Keep the full record only on the route that renders it.
  // This prevents repeating unrelated blog, project, district, and CMS data
  // in every one of the thousands of billboard HTML files.
  const settings = Object.fromEntries([
    "companyName",
    "tagline",
    "headerLogoUrl",
    "footerLogoUrl",
    "faviconUrl",
    "phone",
    "email",
    "address",
    "whatsapp",
    "socialLinks", "site_name", "taglineAr", "metaDescription", "metaDescriptionAr",
    "facebook", "instagram", "linkedin", "twitter", "youtube", "tiktok",
  ].filter((key) => source.settings?.[key] != null).map((key) => [key, source.settings[key]]));
  const footerServices = source.services.slice(0, 6).map((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    nameAr: service.nameAr,
    title: service.title,
    titleAr: service.titleAr,
    shortTitle: service.shortTitle,
    shortTitleAr: service.shortTitleAr,
  }));
  const footerLocations = source.locations.slice(0, 4).map((location) => ({
    id: location.id,
    slug: location.slug,
    city: location.city,
    cityAr: location.cityAr,
    name: location.name,
    nameAr: location.nameAr,
    products: [],
  }));

  return {
    loaded: true,
    loading: false,
    usingDemo: false,
    error: null,
    settings,
    homeContent: {},
    about: {},
    aboutContent: {},
    services: footerServices,
    projects: [],
    blogPosts: [],
    locations: footerLocations,
    districts: [],
  };
}

function snapshotForRoute(source, route) {
  if (!source) return null;
  const path = stripArabicPrefix(route);
  const scoped = publicBase(source);

  if (path === "/") {
    scoped.settings = source.settings;
    scoped.homeContent = source.homeContent;
    scoped.locations = source.locations.map((location) => ({
      ...location,
      productCount: location.productCount ?? location.products.length,
      products: location.products.slice(0, 12).map(({images, ...product}) => ({...product, images: (images || []).slice(0, 1)})),
    }));
    scoped.clientBrands = source.clientBrands; scoped.trustStats = source.trustStats;
    scoped.process = source.process; scoped.processSteps = source.processSteps; scoped.results = source.results;
    scoped.adFormats = source.adFormats; scoped.billboardFormats = source.billboardFormats;
    scoped.services = source.services;
    scoped.projects = source.projects;
    scoped.blogPosts = source.blogPosts.map(({body, bodyAr, content, ...card}) => card);
    scoped.districts = source.districts;
    return scoped;
  }

  if (path === "/design-simulator") {
    scoped.homeContent = source.homeContent;
    scoped.simulatorTemplates = source.simulatorTemplates || [];
  } else if (path === "/about") {
    scoped.about = source.about;
    scoped.aboutContent = source.aboutContent;
  } else if (path === "/contact") {
    scoped.settings = source.settings;
    const contact = source.settings?.contact_page_content;
    scoped.contactContent = typeof contact === 'string' ? JSON.parse(contact || '{}') : (contact || {});
  } else if (path === "/services") {
    scoped.services = source.services;
  } else if (path.startsWith("/services/")) {
    const slug = path.split("/")[2];
    const target = source.services.find((item) => item.slug === slug);
    scoped.services = [target, ...source.services.filter((item) => item.slug !== slug).slice(0, 3)].filter(Boolean);
  } else if (path === "/projects") {
    scoped.projects = source.projects;
    scoped.projectsContent = source.projectsContent;
  } else if (path.startsWith("/projects/")) {
    const slug = path.split("/")[2];
    const target = source.projects.find((item) => item.slug === slug);
    scoped.projects = [target, ...source.projects.filter((item) => item.slug !== slug).slice(0, 3)].filter(Boolean);
  } else if (path === "/blog") {
    scoped.blogPosts = source.blogPosts;
  } else if (path.startsWith("/blog/")) {
    const slug = path.split("/")[2];
    const target = source.blogPosts.find((item) => item.slug === slug);
    scoped.blogPosts = [target, ...source.blogPosts.filter((item) => item.slug !== slug).slice(0, 3)].filter(Boolean);
  } else if (path === "/locations") {
    scoped.locationsContent = source.locationsContent;
    scoped.locations = source.locations;
    scoped.districts = source.districts;
  } else {
    const productMatch = path.match(/^\/locations\/([^/]+)\/billboards\/([^/]+)$/);
    const locationMatch = path.match(/^\/locations\/([^/]+)$/);
    const citySlug = productMatch?.[1] || locationMatch?.[1];
    const city = source.locations.find((location) => location.slug === citySlug);

    if (city) {
      let targetCity = locationMatch
        ? { ...city, products: city.products.slice(0, 24) }
        : city;
      if (productMatch) {
        const productSlug = productMatch[2];
        const product = city.products.find((item) => item.slug === productSlug);
        targetCity = {
          ...city,
          products: [product, ...city.products.filter((item) => item.slug !== productSlug).slice(0, 2)].filter(Boolean),
        };
      }
      scoped.locations = [
        targetCity,
        ...source.locations
          .filter((location) => location.slug !== citySlug)
          .slice(0, 3)
          .map((location) => ({ ...location, products: [] })),
      ];
      if (productMatch) {
        scoped.districts = source.districts.filter((district) =>
          String(district.locationId || district.location_id) === String(city.id)
        );
      }
    }
  }

  return scoped;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceMeta(html, selector, tag) {
  const next = html.replace(selector, tag);
  return next === html ? html.replace("</head>", `    ${tag}\n  </head>`) : next;
}

function injectMetadata(html, metadata, route) {
  const canonicalPath = stripArabicPrefix(metadata.canonical || route);
  const englishUrl = `https://horizonooh.com${canonicalPath === "/" ? "" : canonicalPath}`;
  const canonicalUrl = metadata.canonicalUrl || `https://horizonooh.com${route === "/" ? "" : route}`;
  const routeUrl = canonicalUrl;
  const arPath = canonicalPath === "/" ? "/ar" : `/ar${canonicalPath}`;
  const arUrl = `https://horizonooh.com${arPath}`;
  const lang = route === "/ar" || route.startsWith("/ar/") ? "ar" : "en";

  html = html
    .replace('<html lang="en">', `<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}" data-ssg>`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);

  html = replaceMeta(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = replaceMeta(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${escapeHtml(metadata.robots || "index, follow")}" />`,
  );
  html = replaceMeta(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
  );
  html = replaceMeta(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = replaceMeta(
    html,
    /<meta property="og:type" content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${escapeHtml(metadata.type || "website")}" />`,
  );
  html = replaceMeta(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(routeUrl)}" />`,
  );
  html = replaceMeta(
    html,
    /<meta property="og:image" content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(metadata.image)}" />`,
  );
  html = replaceMeta(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
  );
  html = replaceMeta(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = replaceMeta(
    html,
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(metadata.image)}" />`,
  );

  html = replaceMeta(html, /<meta property="og:locale" content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale" content="${lang === 'ar' ? 'ar_EG' : 'en_US'}" />`);
  const seoTags = [
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(englishUrl)}" />`,
    `<link rel="alternate" hreflang="ar" href="${escapeHtml(arUrl)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(englishUrl)}" />`,
  ].join("\n    ");

  return html.replace(
    "<!-- canonical + hreflang injected server-side per route (see routes/web.php) -->",
    seoTags,
  );
}

rmSync(outputDir, { recursive: true, force: true });

for (const route of routes) {
  const routeSnapshot = compactPublicSnapshot(snapshotForRoute(snapshot, route), route);
  const markup = render(route, routeSnapshot);
  const marker = markup.match(/<script type="application\/json" data-horizon-seo="">([\s\S]*?)<\/script>/);
  if (!marker) throw new Error(`Missing SEO marker for route ${route}`);

  const metadata = JSON.parse(marker[1]);
  let html = shell.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  if (routeSnapshot) {
    const serializedSnapshot = JSON.stringify(routeSnapshot).replace(/</g, "\\u003c");
    html = html.replace(
      '</body>',
      `<script id="horizon-ssg-state" type="application/json">${serializedSnapshot}</script>\n  </body>`,
    );
  }
  html = injectMetadata(html, metadata, route);
  if (route === '/ar' || route.startsWith('/ar/')) html = html.replace('title="Sitemap"', 'title="خريطة الموقع"');
  if (['/', '/about', '/contact', '/services', '/projects', '/locations', '/blog', '/design-simulator'].includes(stripArabicPrefix(route))) html = inlineHomeCss(html, publicDir);

  const routePath = route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
  const target = resolve(outputDir, routePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  writeFileSync(target + ".gz", gzipSync(html, { level: 6 }));
  writeFileSync(target + ".br", brotliCompressSync(html, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } }));
}

const manifest = {
  version: 1,
  routeCount: routes.length,
  routes,
};
writeFileSync(resolve(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${routes.length} SSG routes in public/ssg`);
