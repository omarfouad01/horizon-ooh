import dictionary from './publicArabic.json';

const normalize = (text: string) => text.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const entries = dictionary as Record<string, string>;
const phrases = Object.entries(entries).filter(([key]) => /\s|[-/]/.test(key)).sort((a, b) => b[0].length - a[0].length);
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const replacements = phrases.map(([key, value]) => [new RegExp(`(?<![A-Za-z])${escape(key).replace(/ /g, '\\s+')}(?![A-Za-z])`, 'gi'), value] as const);
const cache = new Map<string, string>();

/** Display translation only: never apply to URLs, form values, IDs or API payloads. */
export function arabicText(text: string): string {
  if (!/[A-Za-z]/.test(text)) return text;
  const hit = cache.get(text); if (hit !== undefined) return hit;
  const exact = entries[normalize(text)];
  if (exact) { const translated = (text.match(/^\s*/)?.[0] || '') + exact + (text.match(/\s*$/)?.[0] || ''); cache.set(text, translated); return translated; }
  // Keep contact destinations and inventory/location identifiers exact.
  const protectedValues: string[] = [];
  let result = text.replace(/https?:\/\/[^\s<>]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b[A-Z]{1,3}-\d+\b|\b[A-Z0-9]{4,8}\+[A-Z0-9]{2,5}\b/gi, value => {
    protectedValues.push(value); return `\uE000${protectedValues.length - 1}\uE001`;
  });
  const fieldName = (field: string) => entries[normalize(field.replace(/_/g, ' '))] || 'هذا الحقل';
  result = result.replace(/The (.+?) field is required\./gi, (_, field) => `${fieldName(field)} مطلوب.`)
    .replace(/The (.+?) has already been taken\./gi, (_, field) => `${fieldName(field)} مستخدم بالفعل.`)
    .replace(/The (.+?) field must be a valid email address\./gi, () => 'يرجى إدخال بريد إلكتروني صحيح.')
    .replace(/The (.+?) must be at least (\d+) characters\./gi, (_, field, length) => `يجب أن يتكون ${fieldName(field)} من ${length} أحرف على الأقل.`)
    .replace(/The (.+?) field confirmation does not match\./gi, () => 'تأكيد كلمة المرور غير متطابق.');
  result = result.replace(/(\d)(?:st|nd|rd|th)\b/gi, '$1').replace(/(\d)M\+?/g, '$1 مليون+');
  for (const [pattern, value] of replacements) result = result.replace(pattern, () => value);
  result = result.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, word => entries[normalize(word)] || word);
  result = result.replace(/\uE000(\d+)\uE001/g, (_, index) => protectedValues[Number(index)]);
  result = result.replace(/الـ[\s-]+(?=ال)/g, '').replace(/الـ[\s-]+(?=[\u0600-\u06ff])/g, 'ال');
  if (cache.size > 20000) cache.clear(); cache.set(text, result);
  return result;
}

export function arabicHtml(html: string): string {
  // Only text between tags is translated; links, image URLs and markup stay exact.
  return html.split(/(<[^>]*>)/g).map(part => part.startsWith('<') ? part : arabicText(part)).join('');
}

export function publicMessage(text: string): string {
  if (typeof window === 'undefined' || !/^\/ar(?:\/|$)/.test(window.location.pathname)) return text;
  const translated = arabicText(String(text));
  const prose = translated.replace(/https?:\/\/[^\s<>]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b[A-Z]{1,3}-\d+\b/gi, '');
  return /[A-Za-z]/.test(prose) ? 'تعذر إكمال الطلب. يرجى مراجعة البيانات والمحاولة مرة أخرى.' : translated;
}

export function arabicHref(value: string): string {
  if (!value.startsWith('/') && !value.startsWith('https://horizonooh.com/')) return value;
  if (value.startsWith('//')) return value;
  const absolute = value.startsWith('https://');
  const url = new URL(value, 'https://horizonooh.com');
  if (url.origin !== 'https://horizonooh.com') return value;
  if (url.pathname === '/' || /^\/(?:about|contact|services|projects|locations|blog|privacy|terms|design-simulator|login|signup|profile)(?:\/|$)/.test(url.pathname)) {
    return (absolute ? url.origin : '') + (url.pathname === '/' ? '/ar' : '/ar' + url.pathname) + url.search + url.hash;
  }
  return value;
}

export function publicPath(value: string): string {
  return typeof window !== 'undefined' && /^\/ar(?:\/|$)/.test(window.location.pathname) ? arabicHref(value) : value;
}
