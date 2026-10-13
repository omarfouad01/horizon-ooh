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

/**
 * Builds responsive candidates for images served from this application's
 * /images directory. External image URLs are deliberately left untouched: the
 * browser receives their original URL and the visual result stays identical.
 */
export function thumbSrcSet(
  url: string | undefined | null,
  widths: readonly number[],
  aspectRatio: number,
): string | undefined {
  if (!url || !url.includes('/images/') || !Number.isFinite(aspectRatio) || aspectRatio <= 0) return undefined;

  const candidates = widths
    .map((width) => {
      const height = Math.max(1, Math.round(width / aspectRatio));
      const source = thumb(url, width, height);
      return source ? `${source} ${width}w` : null;
    })
    .filter((candidate): candidate is string => Boolean(candidate));

  return candidates.length ? candidates.join(', ') : undefined;
}
