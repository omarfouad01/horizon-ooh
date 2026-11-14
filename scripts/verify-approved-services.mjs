import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const approved = JSON.parse(readFileSync(resolve(root, 'resources/react/lib/approvedServices.json'), 'utf8'));
const output = resolve(root, process.env.SSG_OUTPUT_DIR || 'public/ssg');
const read = route => readFileSync(resolve(output, '.' + route, 'index.html'), 'utf8');
const decode = value => value.replace(/&(?:amp|quot|#39|#x27|lt|gt);/g, entity =>
  ({'&amp;':'&','&quot;':'"','&#39;':"'",'&#x27;':"'",'&lt;':'<','&gt;':'>'})[entity]);
const clean = value => decode(value.replace(/<!--.*?-->|<[^>]+>/gs, '')).replace(/\s+/g, ' ').trim();
const origin = 'https://horizonooh.com';
const failures = [];
function check(route, fn) {
  try { fn(); console.log('PASS', route); }
  catch (error) { failures.push(route); console.error('FAIL', route, error.message); }
}
for (const locale of ['en', 'ar']) {
  const prefix = locale === 'ar' ? '/ar' : '';
  function page(route, copy) {
    const html = read(route);
    const text = clean(html);
    const tag = (name, type = 'name') => decode(html.match(new RegExp('<meta '+type+'="'+name+'" content="([^"]*)"'))?.[1] ?? '');
    const h1 = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/g)].map(match => clean(match[1]));
    assert.deepEqual(h1, [copy.heading]);
    assert.equal(clean(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? ''), copy.title);
    assert.equal(tag('description'), copy.description);
    assert.equal(tag('og:title', 'property'), copy.title);
    assert.equal(tag('og:description', 'property'), copy.description);
    assert(html.includes('rel="canonical" href="' + origin + route + '"'), 'canonical');
    for (const language of ['en', 'ar']) {
      const destination = origin + (language === 'ar' ? '/ar' : '') + route.replace(/^\/ar/, '');
      assert(html.includes('hreflang="' + language + '" href="' + destination + '"'), 'hreflang ' + language);
    }
    assert(text.includes(copy.intro), 'introduction');
    for (const val of Object.values(copy.cta)) assert(text.includes(val), 'CTA ' + val);
    assert(!/Advertising Advertising|Launch your (ERP Solutions|Website Development|Mobile Applications) campaign/i.test(text), 'placeholder');
    return {html, text};
  }
  check(prefix + '/services', () => {
    const {html, text} = page(prefix + '/services', approved.directory[locale]);
    for (const category of approved.directory[locale].categories) {
      assert(text.includes(category.heading) && text.includes(category.text), category.heading);
    }
    for (const [slug, service] of Object.entries(approved.services)) {
      const href = prefix + '/services/' + slug;
      assert(html.includes('href="' + href + '"') && existsSync(resolve(output, '.' + href, 'index.html')), href);
      assert(text.includes(service[locale].card), service[locale].card);
    }
  });
  for (const [slug, entry] of Object.entries(approved.services)) {
    const route = prefix + '/services/' + slug;
    check(route, () => {
      const {html, text} = page(route, entry[locale]);
      const body = html.split('data-approved-service="' + slug + '"')[1]?.split('</main>')[0];
      assert(body?.startsWith(' dir="' + (locale === 'ar' ? 'rtl' : 'ltr') + '" lang="' + locale + '"'), 'locale wrapper');
      const headings = [...body.matchAll(/<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/g)].map(match => clean(match[1]));
      assert.deepEqual(headings.slice(0, 5), entry[locale].sections.map(section => section.heading));
      assert.equal(headings.at(-1), entry[locale].cta.heading);
      for (const section of entry[locale].sections) for (const item of section.items) {
        assert(text.includes(item.text), item.text);
        if (item.label) assert(text.includes(item.label), item.label);
      }
      const related = headings[5];
      const start = body.lastIndexOf('<h2', body.indexOf(related));
      const block = body.slice(start, body.indexOf("</section>", start));
      assert.deepEqual([...block.matchAll(/href="([^"]+)"/g)].map(match => match[1]), entry.related.map(target => prefix + '/services/' + target));
      for (const target of entry.related) read(prefix + '/services/' + target);
      assert(html.includes('href="' + prefix + '/contact?source=service&amp;service=' + slug + '"'), 'quote link');
      read(prefix + '/contact');
      if (/erp-solutions|website-development|mobile-applications/.test(slug)) {
        assert(!/campaign process|site selection to campaign reporting|where we deploy it/i.test(clean(body)), 'software boilerplate');
      }
      const graphs = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
      const types = graphs.flatMap(graph => graph['@graph'] ?? [graph]).map(node => node['@type']);
      for (const expected of ['Organization', 'WebPage', 'Service', 'BreadcrumbList']) assert(types.includes(expected), expected);
    });
  }
}
assert.equal(failures.length, 0, 'Failed routes: ' + failures.join(', '));
