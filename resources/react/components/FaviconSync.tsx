/**
 * FaviconSync — dynamically updates the browser's <link rel="icon"> tags
 * whenever the faviconUrl changes in the settings store.
 *
 * This ensures the favicon shown in browser tabs ALWAYS matches what the
 * admin has uploaded in Dashboard → Settings → Logo & Favicon.
 */
import { useEffect } from 'react';
import { useStore } from '@/store/dataStore';

export function FaviconSync() {
  const faviconUrl: string = useStore(s => s.settings?.faviconUrl ?? '');

  useEffect(() => {
    if (!faviconUrl) return; // No custom favicon set — keep the static one

    // Helper: find or create a <link> tag by rel + sizes attributes
    function setFaviconLink(rel: string, sizes: string | null, href: string) {
      const selector = sizes
        ? `link[rel="${rel}"][sizes="${sizes}"]`
        : `link[rel="${rel}"]:not([sizes])`;
      let el = document.head.querySelector<HTMLLinkElement>(selector);
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        if (sizes) el.setAttribute('sizes', sizes);
        document.head.appendChild(el);
      }
      el.href = href;
    }

    // Update all favicon variants to point to the same uploaded image
    // (The browser will use whichever fits best)
    setFaviconLink('icon',             null,       faviconUrl);
    setFaviconLink('icon',             '32x32',    faviconUrl);
    setFaviconLink('icon',             '16x16',    faviconUrl);
    setFaviconLink('shortcut icon',    null,       faviconUrl);
    setFaviconLink('apple-touch-icon', '180x180',  faviconUrl);
  }, [faviconUrl]);

  // This component renders nothing — it only manages <head> side effects
  return null;
}
