import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Homepage CSS is small when compressed; inlining avoids a blocking mobile round trip. */
export function inlineHomeCss(html, publicDir) {
  const match = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="(\/assets\/index-[^"]+\.css)"[^>]*>/);
  if (!match) return html;
  const css = readFileSync(resolve(publicDir, '.' + match[1]), 'utf8');
  html = html.replace(match[0], () => `<style data-horizon-critical-css>\n${css}\n</style>`);
  return html.replace(/<link\b[^>]*rel="preload"[^>]*as="style"[^>]*>/g, '');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const publicDir = resolve('public');
  for (const file of ['ssg/index.html', 'ssg/ar/index.html']) {
    const path = resolve(publicDir, file);
    writeFileSync(path, inlineHomeCss(readFileSync(path, 'utf8'), publicDir));
  }
  console.log('Inlined homepage CSS for English and Arabic.');
}
