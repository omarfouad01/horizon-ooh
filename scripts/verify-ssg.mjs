import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const manifest = JSON.parse(read("public/ssg/manifest.json"));

assert.equal(manifest.routeCount, manifest.routes.length, "manifest route count must match");
assert.ok(manifest.routeCount >= 20, "expected English and Arabic public route coverage");
assert.equal(
  manifest.routes.some((route) => /\/(?:admin|login|signup|profile|design-simulator)(?:\/|$)/.test(route)),
  false,
  "private/interactive-only routes must not be generated",
);

const coreChecks = [
  {
    file: "public/ssg/index.html",
    title: "HORIZON OOH | Outdoor Advertising Agency in Egypt",
    canonical: "https://horizonooh.com",
    content: "Outdoor Advertising Agency",
  },
  { file: "public/ssg/about/index.html", title: "About HORIZON OOH", canonical: "https://horizonooh.com/about" },
  { file: "public/ssg/services/index.html", title: "Our Services", canonical: "https://horizonooh.com/services" },
  { file: "public/ssg/projects/index.html", title: "Projects", canonical: "https://horizonooh.com/projects" },
  { file: "public/ssg/locations/index.html", title: "Locations", canonical: "https://horizonooh.com/locations" },
  { file: "public/ssg/blog/index.html", title: "Blog", canonical: "https://horizonooh.com/blog" },
];

for (const check of coreChecks) {
  const html = read(check.file);
  assert.ok(html.includes("<html lang=\"en\""), `${check.file} must be English HTML`);
  assert.ok(html.includes("data-ssg"), `${check.file} must be marked as generated`);
  assert.ok(html.includes(check.title), `${check.file} must contain route title`);
  assert.ok(html.includes(`rel="canonical" href="${check.canonical}"`), `${check.file} must contain canonical`);
  if (check.content) assert.ok(html.includes(check.content), `${check.file} must contain meaningful page content`);
  assert.ok(/<div id="root"><div/.test(html), `${check.file} must contain rendered React markup`);
  assert.ok(!html.includes("canonical + hreflang injected server-side"), `${check.file} must not retain the shell placeholder`);
}

const representativePatterns = [
  /^\/services\/[^/]+$/,
  /^\/projects\/[^/]+$/,
  /^\/locations\/[^/]+$/,
  /^\/blog\/[^/]+$/,
];

for (const pattern of representativePatterns) {
  const route = manifest.routes.find((candidate) => pattern.test(candidate));
  assert.ok(route, `manifest must contain a route matching ${pattern}`);
  const html = read(`public/ssg${route}/index.html`);
  assert.ok(/<title>[^<]{5,}<\/title>/.test(html), `${route} must have a specific title`);
  assert.ok(/<h1[^>]*>[\s\S]*?<\/h1>/.test(html), `${route} must have rendered H1 content`);
  assert.ok(html.includes(`rel="canonical" href="https://horizonooh.com${route}"`), `${route} must have a route canonical`);
}

const arabic = read("public/ssg/ar/about/index.html");
assert.ok(arabic.includes('<html lang="ar" dir="rtl" data-ssg>'), "Arabic page must be RTL Arabic HTML");
assert.ok(arabic.includes('hreflang="ar" href="https://horizonooh.com/ar/about"'), "Arabic alternate must exist");
assert.ok(arabic.includes('rel="canonical" href="https://horizonooh.com/about"'), "Arabic canonical must point to English preferred route");

console.log(`SSG verification passed for ${manifest.routeCount} generated routes.`);
