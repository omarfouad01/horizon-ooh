/**
 * Rewrites same-origin /images/<file> URLs to the resizing proxy so the
 * browser downloads a WebP sized for its display box instead of the
 * full-resolution upload. External URLs pass through unchanged.
 * Falsy input (null/undefined/empty) is passed through as-is so callers
 * that rely on React omitting the src attribute keep that behavior.
 */
export function thumb(url: string | undefined | null, w: number, h: number): string | undefined | null {
  if (!url) return url;
  const marker = '/images/';
  const idx = url.lastIndexOf(marker);
  if (idx === -1) return url;
  let filename = url.slice(idx + marker.length);
  const qIdx = filename.search(/[?#]/);
  if (qIdx !== -1) filename = filename.slice(0, qIdx);
  if (!filename) return url;
  return `/img-proxy.php?src=${encodeURIComponent(filename)}&w=${w}&h=${h}`;
}
