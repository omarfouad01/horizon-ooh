/** Use the already generated public page state during navigation, while APIs refresh. */
const publicFields = ['locations', 'districts', 'adFormats', 'billboardFormats', 'services',
  'projects', 'blogPosts', 'trustStats', 'processSteps', 'process', 'results', 'clientBrands',
  'settings', 'homeContent', 'about', 'aboutContent', 'projectsContent', 'locationsContent',
  'contactContent', 'simulatorTemplates'] as const;
const mainPage = /^\/(?:ar(?:\/|$))?(?:about|contact|services|projects|locations|blog|privacy|terms|design-simulator)?\/?$/;
const snapshots = new Map<string, { data: Record<string, any>; savedAt: number }>();
const pending = new Map<string, Promise<Record<string, any> | null>>();

export function isSnapshotRoute(path: string): boolean { return mainPage.test(path); }

export function parsePublicSnapshot(html: string): Record<string, any> | null {
  const match = html.match(/<script\b[^>]*\bid=["']horizon-ssg-state["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  try {
    const value = JSON.parse(match[1]);
    if (!value || value.loaded !== true || value.usingDemo !== false || !value.settings || Array.isArray(value.settings)) return null;
    const clean = Object.fromEntries(publicFields.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
    if (Array.isArray(clean.blogPosts)) clean.blogPosts = clean.blogPosts.filter((post: any) => post.published === true || post.published === 1);
    return clean;
  } catch { return null; }
}

export function rememberPublicSnapshot(path: string, data: Record<string, any>): void {
  snapshots.set(path, { data, savedAt: Date.now() });
  if (snapshots.size > 16) snapshots.delete(snapshots.keys().next().value!);
}

export function cachedPublicSnapshot(path: string): Record<string, any> | null {
  const entry = snapshots.get(path);
  return entry && Date.now() - entry.savedAt < 60_000 ? entry.data : null;
}

export function loadPublicSnapshot(path: string): Promise<Record<string, any> | null> {
  if (!isSnapshotRoute(path)) return Promise.resolve(null);
  const cached = cachedPublicSnapshot(path);
  if (cached) return Promise.resolve(cached);
  if (pending.has(path)) return pending.get(path)!;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  const request = fetch(path, { headers: { Accept: 'text/html' }, signal: controller.signal, credentials: 'omit' })
    .then(async response => response.ok && !response.redirected ? parsePublicSnapshot(await response.text()) : null)
    .then(data => { if (data) rememberPublicSnapshot(path, data); return data; })
    .catch(() => null)
    .finally(() => { clearTimeout(timer); pending.delete(path); });
  pending.set(path, request);
  return request;
}
