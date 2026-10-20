/** Trim detail-only fields from public listing hydration; originals stay in the API/database. */
export function compactPublicSnapshot(source, route) {
  if (!source) return source;
  const path = route.replace(/^\/ar(?=\/|$)/, '') || '/';
  const snapshot = { ...source };
  if (path === '/' || path === '/locations') {
    snapshot.locations = (source.locations || []).map(location => ({
      ...location,
      products: (location.products || []).map(({ description, descriptionAr, material, brightness, full_address, fullAddress, ...card }) => card),
    }));
  }
  if (path === '/blog') {
    snapshot.blogPosts = (source.blogPosts || []).map(({ body, bodyAr, body_ar, content, ...card }) => card);
  }
  return snapshot;
}
