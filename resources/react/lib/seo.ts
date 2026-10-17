export const SITE_URL = 'https://horizonooh.com';
export const hasArabic = (value: unknown) => typeof value === 'string' && /[\u0600-\u06ff]/.test(value);
export function summary(value: string, limit = 160): string {
  const clean = (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit - 1); const space = cut.lastIndexOf(' ');
  return cut.slice(0, space > limit * .6 ? space : cut.length).replace(/[،,;:—-]+$/, '').trim() + '…';
}
const pages: Record<string, [string, string]> = {
  '/': ['هورايزون | شركة إعلانات خارجية ولوحات إعلانية في مصر', 'حملات لوحات إعلانية وشاشات رقمية وإنتاج فيديو في القاهرة والإسكندرية ومختلف أنحاء مصر مع هورايزون.'],
  '/about': ['عن هورايزون | شركة إعلانات خارجية في مصر', 'تعرف على هورايزون، شريك الإعلانات الخارجية واللوحات الإعلانية والشاشات الرقمية والإنتاج الإعلامي في مصر منذ عام 2013.'],
  '/services': ['خدمات الإعلانات الخارجية في مصر | هورايزون', 'اكتشف خدمات هورايزون للإعلانات الخارجية واللوحات الإعلانية والشاشات الرقمية وإعلانات المولات والمطارات وإنتاج الفيديو في مصر.'],
  '/projects': ['مشروعات وحملات الإعلانات الخارجية | هورايزون', 'استكشف مشروعات هورايزون وحملات اللوحات الإعلانية والشاشات الرقمية للعلامات التجارية في القاهرة ومختلف أنحاء مصر.'],
  '/locations': ['مواقع اللوحات الإعلانية في مصر | هورايزون', 'تصفح مواقع اللوحات الإعلانية في القاهرة والجيزة والإسكندرية ومختلف محافظات مصر، واختر الموقع والشكل المناسب لحملتك.'],
  '/blog': ['مقالات وأفكار عن الإعلانات الخارجية | هورايزون', 'اقرأ مقالات هورايزون عن اللوحات الإعلانية والشاشات الرقمية وتخطيط الحملات وتصميم الإعلانات الخارجية في مصر.'],
  '/contact': ['تواصل مع هورايزون | الإعلانات الخارجية في مصر', 'تواصل مع فريق هورايزون للاستفسار عن حجز اللوحات الإعلانية والشاشات الرقمية وتخطيط وتنفيذ حملات الإعلانات الخارجية في مصر.'],
  '/privacy': ['سياسة الخصوصية | هورايزون', 'تعرف على سياسة الخصوصية واستخدام البيانات عند التواصل مع هورايزون والاستفسار عن خدمات الإعلانات الخارجية.'],
  '/terms': ['شروط الاستخدام | هورايزون', 'اطلع على شروط استخدام موقع هورايزون ومعلومات خدمات الإعلانات الخارجية والتواصل مع فريق العمل.'],
};
const articles: Record<string, string> = {
  'airport-advertising-in-egypt':'إعلانات المطارات في مصر', 'billboard-design-best-practices':'أفضل ممارسات تصميم اللوحات الإعلانية',
  'brand-activations-in-egypt':'تنشيط العلامات التجارية في مصر', 'cinema-advertising-in-egypt':'إعلانات السينما في مصر',
  'commercial-video-production-outdoor-dooh-campaigns':'إنتاج الفيديو لحملات الإعلانات الخارجية والشاشات الرقمية',
  'dooh-advertising-in-egypt':'الإعلانات الرقمية الخارجية في مصر',
  'how-thndrs-billboard-campaign-became-one-of-egypts-most-viral-ooh-marketing-moments':'كيف انتشرت حملة لوحات ثاندر الإعلانية في مصر',
  'mall-advertising-in-egypt':'إعلانات المولات في مصر', 'outdoor-advertising-in-egypt':'الإعلانات الخارجية في مصر: دليل العلامات التجارية',
  'the-future-of-outdoor-advertising-in-egypt':'مستقبل الإعلانات الخارجية في مصر', 'why-billboard-advertising-still-works-in-2026':'لماذا تستمر فعالية اللوحات الإعلانية في 2026',
};
export function metadata(route: string, ar: boolean, input: {title: string; description: string; titleAr?: string; descriptionAr?: string}) {
  if (!ar) return {title: input.title, description: summary(input.description)};
  const path = route.replace(/^\/ar(?=\/|$)/, '') || '/';
  const topic = articles[path.split('/').pop() || ''] || input.title.replace(/\s*\|.*$/, '');
  const category = path.startsWith('/blog/') ? 'مقالات الإعلانات الخارجية' : path.startsWith('/services/') ? 'خدمات الإعلانات الخارجية' : path.startsWith('/projects/') ? 'حملات الإعلانات الخارجية' : 'اللوحات الإعلانية في مصر';
  const fallback = pages[path] || [`${category}: ${topic} | هورايزون`, `تعرف على ${topic} مع هورايزون، واطلع على معلومات ${category} وتخطيط الحملات الإعلانية في مصر.`];
  return {title: input.titleAr?.trim() || (hasArabic(input.title) ? input.title : fallback[0]),
    description: summary(input.descriptionAr?.trim() || (hasArabic(input.description) ? input.description : fallback[1]))};
}
function absolute(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value || /^(data:|blob:)/.test(value)) return;
  try {const url = new URL(value, SITE_URL); return /^https?:$/.test(url.protocol) ? url.href : undefined;} catch {return;}
}
export function businessGraph(settings: Record<string, any>, ar: boolean) {
  const phone = String(settings.phone || '').replace(/[^+\d]/g, '');
  const telephone = phone.startsWith('0') ? '+20' + phone.slice(1) : phone.startsWith('20') ? '+' + phone : phone || undefined;
  return {'@context':'https://schema.org','@graph':[
    {'@type':['Organization','LocalBusiness'],'@id':SITE_URL+'/#organization', name:settings.companyName || settings.site_name || 'HORIZON OOH', url:SITE_URL,
      foundingDate:'2013', telephone, email:settings.email || undefined,
      address:settings.address ? {'@type':'PostalAddress',streetAddress:settings.address,addressCountry:'EG'} : undefined,
      logo:absolute(settings.headerLogoUrl || settings.logoUrl || settings.footerLogoUrl),
      description:summary((ar ? settings.metaDescriptionAr : settings.metaDescription) || (ar ? settings.taglineAr : settings.tagline) || ''),
      areaServed:{'@type':'Country',name:'Egypt'}, sameAs:[...new Set([...['facebook','instagram','linkedin','twitter','youtube','tiktok'].map(key=>settings[key]), ...(Array.isArray(settings.socialLinks) ? settings.socialLinks.map((item: any)=>item.url || item.href) : Object.values(settings.socialLinks || {}))].map(absolute).filter(Boolean))]},
    {'@type':'WebSite','@id':SITE_URL+'/#website',url:SITE_URL,name:settings.companyName || settings.site_name || 'HORIZON OOH',publisher:{'@id':SITE_URL+'/#organization'},inLanguage:['en','ar']}
  ]};
}
