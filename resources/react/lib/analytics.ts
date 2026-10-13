type AnalyticsValue = string | number | boolean | null | undefined;

/** Send useful conversion events through the existing GTM dataLayer. */
export function trackEvent(event: string, details: Record<string, AnalyticsValue> = {}) {
  if (typeof window === 'undefined') return;
  const target = window as Window & { dataLayer?: Record<string, AnalyticsValue>[] };
  target.dataLayer = target.dataLayer || [];
  target.dataLayer.push({ event, ...details });
}
