const CACHE_KEY = 'horizon:public-data:v1';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const MAX_BYTES = 2 * 1024 * 1024;
const fields = new Set(['locations', 'districts', 'adFormats', 'billboardFormats', 'services',
  'projects', 'blogPosts', 'trustStats', 'processSteps', 'process', 'results', 'clientBrands',
  'settings', 'homeContent', 'about', 'aboutContent', 'projectsContent', 'locationsContent',
  'contactContent', 'billboardSizes', 'simulatorTemplates']);

function publicBrowser() {
  return typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin');
}

function publicDataOnly(data: Record<string, any>): Record<string, any> {
  const clean = Object.fromEntries(Object.entries(data).filter(([key]) => fields.has(key)));
  if (Array.isArray(clean.blogPosts)) {
    clean.blogPosts = clean.blogPosts.filter((post: any) => post.published === true || post.published === 1);
  }
  return clean;
}

export function readPublicCache(): Record<string, any> | null {
  if (!publicBrowser()) return null;
  // SSG must hydrate with the exact server snapshot, rather than browser data.
  if (document.getElementById('horizon-ssg-state')) return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw || raw.length > MAX_BYTES) return null;
    const cache = JSON.parse(raw);
    if (cache.version !== 1 || !Number.isFinite(cache.savedAt) ||
        cache.savedAt > Date.now() || Date.now() - cache.savedAt > MAX_AGE ||
        !cache.data || typeof cache.data !== 'object' || Array.isArray(cache.data) ||
        !cache.data.settings || typeof cache.data.settings !== 'object') return null;
    return publicDataOnly(cache.data);
  } catch { return null; }
}

export function writePublicCache(data: Record<string, any>): void {
  if (!publicBrowser()) return;
  try {
    const publicData = publicDataOnly(data);
    const raw = JSON.stringify({ version: 1, savedAt: Date.now(), data: publicData });
    if (raw.length <= MAX_BYTES) localStorage.setItem(CACHE_KEY, raw);
  } catch { /* Storage restrictions/quota must never prevent live API loading. */ }
}
