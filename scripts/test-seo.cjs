const assert = require('node:assert/strict');
const fs = require('node:fs');
const manifest = JSON.parse(fs.readFileSync('public/ssg/manifest.json'));
for (const route of manifest.routes) {
  const html = fs.readFileSync(`public/ssg${route === '/' ? '' : route}/index.html`, 'utf8');
  const expected = `https://horizonooh.com${route === '/' ? '' : route}`;
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(canonicals.length, 1, `${route}: canonical count`);
  assert.equal(canonicals[0][1], expected, `${route}: self canonical`);
  assert.match(html, /<title>[^<]+<\/title>/, `${route}: title`);
  assert.match(html, /<meta name="description" content="[^"]+"/, `${route}: description`);
  assert.match(html, /<h1[ >]/, `${route}: crawlable H1`);
  const english = route.replace(/^\/ar(?=\/|$)/,'') || '/';
  const enUrl = `https://horizonooh.com${english === '/' ? '' : english}`;
  const arUrl = `https://horizonooh.com${english === '/' ? '/ar' : `/ar${english}`}`;
  for (const [language, url] of [['en',enUrl],['ar',arUrl],['x-default',enUrl]]) assert.ok(html.includes(`hreflang="${language}" href="${url}"`), `${route}: alternate ${language}`);
  for (const script of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(script[1]);
}
const home=fs.readFileSync('public/ssg/index.html','utf8');
assert.ok(!home.includes('Open interactive map'), 'Map must not require activation');
assert.ok(home.includes('https://schema.org'), 'Homepage organization/site structured data');
console.log(`PASS: SEO head, reciprocal alternates, crawlable H1 and valid JSON-LD across ${manifest.routes.length} routes`);
