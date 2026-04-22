/**
 * LangContext.tsx
 * Global language context — 'en' | 'ar'
 * - Persists to localStorage
 * - Sets html[dir] and html[lang] automatically
 * - Loads Cairo + Tajawal Arabic Google Fonts on first AR switch
 */
import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'en' | 'ar';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  isAr: boolean;
  t: (key: string) => string;
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  isAr: false,
  t: (k) => k,
});

// ─── Static UI translations ───────────────────────────────────────────────────
export const UI: Record<string, Record<Lang, string>> = {
  // ── Navbar ──
  'nav.services':    { en: 'Services',   ar: 'خدماتنا' },
  'nav.projects':    { en: 'Projects',   ar: 'مشاريعنا' },
  'nav.locations':   { en: 'Locations',  ar: 'المواقع' },
  'nav.blog':        { en: 'Blog',       ar: 'المدونة' },
  'nav.about':       { en: 'About',      ar: 'من نحن' },
  'nav.contact':     { en: 'Contact',    ar: 'تواصل معنا' },
  'nav.login':       { en: 'Login',      ar: 'تسجيل الدخول' },
  'nav.getQuote':    { en: 'Get a Quote', ar: 'اطلب عرض سعر' },

  // ── Footer ──
  'footer.services':       { en: 'Services',      ar: 'الخدمات' },
  'footer.locations':      { en: 'Locations',     ar: 'المواقع' },
  'footer.company':        { en: 'Company',       ar: 'الشركة' },
  'footer.contact':        { en: 'Contact',       ar: 'تواصل معنا' },
  'footer.billboard':      { en: 'Billboard',     ar: 'لوحات إعلانية' },
  'footer.dooh':           { en: 'DOOH',          ar: 'شاشات رقمية' },
  'footer.mall':           { en: 'Mall Advertising', ar: 'إعلانات المولات' },
  'footer.airport':        { en: 'Airport',       ar: 'إعلانات المطارات' },
  'footer.streetFurniture':{ en: 'Street Furniture', ar: 'الأثاث الحضري' },
  'footer.cairo':          { en: 'Cairo',         ar: 'القاهرة' },
  'footer.giza':           { en: 'Giza',          ar: 'الجيزة' },
  'footer.alexandria':     { en: 'Alexandria',    ar: 'الإسكندرية' },
  'footer.northCoast':     { en: 'North Coast',   ar: 'الساحل الشمالي' },
  'footer.allLocations':   { en: 'All Locations', ar: 'جميع المواقع' },
  'footer.about':          { en: 'About Us',      ar: 'من نحن' },
  'footer.blog':           { en: 'Blog',          ar: 'المدونة' },
  'footer.rights':         { en: 'All rights reserved', ar: 'جميع الحقوق محفوظة' },
  'footer.madeIn':         { en: 'Made in Egypt', ar: 'صُنع في مصر' },
  'footer.privacy':        { en: 'Privacy',       ar: 'الخصوصية' },
  'footer.terms':          { en: 'Terms',         ar: 'الشروط' },
  'footer.sitemap':        { en: 'Sitemap',       ar: 'خريطة الموقع' },
  'footer.estd':           { en: 'Est. 2008, Cairo', ar: 'تأسست 2008، القاهرة' },

  // ── Home ──
  'home.trustedBy':        { en: 'Trusted by 100+ brands', ar: 'يثق بنا أكثر من 100 علامة تجارية' },
  'home.searchPlaceholder':{ en: 'Find a Billboard Location', ar: 'ابحث عن موقع إعلاني' },
  'home.city':             { en: 'City',          ar: 'المدينة' },
  'home.district':         { en: 'District',      ar: 'المنطقة' },
  'home.format':           { en: 'Format',        ar: 'النوع' },
  'home.search':           { en: 'Search',        ar: 'بحث' },
  'home.reset':            { en: 'Reset',         ar: 'إعادة تعيين' },
  'home.viewLocations':    { en: 'View All Locations', ar: 'عرض جميع المواقع' },
  'home.exploreLocations': { en: 'Explore Locations',  ar: 'استكشف المواقع' },
  'home.viewCaseStudies':  { en: 'View Case Studies',  ar: 'عرض دراسات الحالة' },

  // ── Services ──
  'services.whatWeDo':     { en: 'What We Do',    ar: 'ما نقدمه' },
  'services.title':        { en: 'Our Services.', ar: 'خدماتنا.' },
  'services.titleAccent':  { en: 'Full-spectrum OOH.', ar: 'إعلانات خارجية شاملة.' },
  'services.subtitle':     { en: 'From roadside billboards to airport video walls — we own every outdoor touchpoint that matters in Egypt.', ar: 'من اللوحات الإعلانية على الطرق إلى جدران الفيديو في المطارات — نمتلك كل نقطة تواصل خارجية مهمة في مصر.' },
  'services.learnMore':    { en: 'Learn More',    ar: 'اعرف أكثر' },
  'services.getQuote':     { en: 'Get a Quote',   ar: 'اطلب عرض سعر' },
  'services.eyebrow':      { en: 'What We Offer', ar: 'ما نقدمه' },
  'services.exploreService':{ en: 'Explore Service', ar: 'استكشف الخدمة' },

  // ── Projects ──
  'projects.eyebrow':      { en: 'Projects',      ar: 'المشاريع' },
  'projects.title':        { en: 'Clients first.', ar: 'العملاء أولاً.' },
  'projects.titleAccent':  { en: 'Then every campaign we delivered.', ar: 'ثم كل حملة نفذناها.' },
  'projects.subtitle':     { en: 'Browse by client. Each client card opens the projects and campaigns we executed for that brand.', ar: 'تصفح حسب العميل. تعرض كل بطاقة مشاريع وحملات نفذناها لكل علامة تجارية.' },
  'projects.caseStudy':    { en: 'View Case Study', ar: 'عرض دراسة الحالة' },
  'projects.allProjects':  { en: 'All Projects',  ar: 'جميع المشاريع' },
  'projects.client':       { en: 'Client',        ar: 'العميل' },
  'projects.location':     { en: 'Location',      ar: 'الموقع' },
  'projects.duration':     { en: 'Duration',      ar: 'المدة' },
  'projects.overview':     { en: 'Overview',      ar: 'نظرة عامة' },
  'projects.theBrief':     { en: 'The brief.',    ar: 'ملخص المشروع.' },
  'projects.aboutClient':  { en: 'About the client.', ar: 'عن العميل.' },
  'projects.objective':    { en: 'Objective',     ar: 'الهدف' },
  'projects.execution':    { en: 'Execution',     ar: 'التنفيذ' },
  'projects.campaignPhotos':{ en: 'Campaign Photos', ar: 'صور الحملة' },
  'projects.galleryTitle': { en: 'Outdoor advertising campaign photos.', ar: 'صور حملة الإعلانات الخارجية.' },
  'projects.results':      { en: 'Campaign Results', ar: 'نتائج الحملة' },
  'projects.numbers':      { en: 'The numbers', ar: 'الأرقام' },
  'projects.dontLie':      { en: "don't lie.", ar: 'لا تكذب.' },
  'projects.campaigns':    { en: 'Campaigns',     ar: 'الحملات' },
  'projects.markets':      { en: 'Markets',       ar: 'الأسواق' },
  'projects.backToProjects':{ en: '← Back to Projects', ar: '← العودة إلى المشاريع' },
  'projects.notFound':     { en: 'Case study not found.', ar: 'دراسة الحالة غير موجودة.' },
  'projects.relatedWork':  { en: 'Related Work',  ar: 'أعمال ذات صلة' },
  'projects.moreWork':     { en: 'More work from', ar: 'المزيد من أعمال' },
  'projects.startCampaign':{ en: 'Start Your Campaign', ar: 'ابدأ حملتك الإعلانية' },

  // ── Locations ──
  'locations.ourNetwork':  { en: 'Our Network',   ar: 'شبكتنا' },
  'locations.title':       { en: 'Advertising Locations', ar: 'مواقع إعلانية' },
  'locations.titleAccent': { en: 'Across Egypt.',  ar: 'في جميع أنحاء مصر.' },
  'locations.subtitle':    { en: "9,500+ premium outdoor advertising locations — from Cairo's Ring Road to Alexandria's Corniche.", ar: 'أكثر من 9,500 موقع إعلاني متميز — من الطريق الدائري في القاهرة إلى كورنيش الإسكندرية.' },
  'locations.billboards':  { en: 'Billboards',    ar: 'اللوحات الإعلانية' },
  'locations.viewMap':     { en: 'View on Map',   ar: 'عرض على الخريطة' },
  'locations.bookNow':     { en: 'Book Now',      ar: 'احجز الآن' },
  'locations.availableFormats':{ en: 'Available Formats', ar: 'الأشكال المتاحة' },
  'locations.coverage':    { en: 'Coverage',      ar: 'التغطية' },

  // ── Blog ──
  'blog.insights':         { en: 'Insights & Strategy', ar: 'رؤى واستراتيجية' },
  'blog.titleAccent':      { en: 'Insights & Articles.', ar: 'رؤى ومقالات.' },
  'blog.subtitle':         { en: 'Expert guides, industry analysis, and creative strategy for OOH advertising in Egypt.', ar: 'أدلة متخصصة، وتحليلات صناعية، واستراتيجيات إبداعية للإعلانات الخارجية في مصر.' },
  'blog.title':            { en: 'Blog',          ar: 'المدونة' },
  'blog.readArticle':      { en: 'Read Article',  ar: 'اقرأ المقال' },
  'blog.readMore':         { en: 'Read More',     ar: 'اقرأ المزيد' },
  'blog.backToBlog':       { en: '← Back to Blog', ar: '← العودة إلى المدونة' },
  'blog.minRead':          { en: 'min read',      ar: 'دقيقة قراءة' },

  // ── About ──
  'about.title':           { en: 'About Us',      ar: 'من نحن' },
  'about.ourStory':        { en: 'Our Story',     ar: 'قصتنا' },
  'about.ourMission':      { en: 'Our Mission',   ar: 'مهمتنا' },
  'about.ourTeam':         { en: 'Our Team',      ar: 'فريقنا' },
  'about.whyChoose':       { en: 'Why Choose Us', ar: 'لماذا تختارنا' },

  // ── Contact ──
  'contact.title':         { en: 'Contact Us',    ar: 'تواصل معنا' },
  'contact.name':          { en: 'Full Name',     ar: 'الاسم الكامل' },
  'contact.email':         { en: 'Email',         ar: 'البريد الإلكتروني' },
  'contact.phone':         { en: 'Phone',         ar: 'رقم الهاتف' },
  'contact.company':       { en: 'Company',       ar: 'الشركة' },
  'contact.message':       { en: 'Message',       ar: 'الرسالة' },
  'contact.send':          { en: 'Send Message',  ar: 'إرسال الرسالة' },
  'contact.subject':       { en: 'Subject',       ar: 'الموضوع' },
  'contact.address':       { en: 'Address',       ar: 'العنوان' },

  // ── Product (Billboard detail) ──
  'product.specifications':{ en: 'Specifications',   ar: 'المواصفات' },
  'product.outdoorIn':     { en: 'Outdoor Advertising in', ar: 'إعلانات خارجية في' },
  'product.description':   { en: 'Description',      ar: 'الوصف' },
  'product.getQuote':      { en: 'Get a Quote',       ar: 'اطلب عرض سعر' },
  'product.whatsappEnquiry':{ en: 'WhatsApp Enquiry', ar: 'استفسار واتساب' },
  'product.billboardLocation':{ en: 'Billboard Location', ar: 'موقع اللوحة الإعلانية' },
  'product.findIt':        { en: 'Find it on',        ar: 'ابحث عنها على' },
  'product.theMap':        { en: 'the map.',           ar: 'الخريطة.' },
  'product.openGoogleMaps':{ en: 'Open in Google Maps →', ar: 'افتح في خرائط جوجل ←' },
  'product.keyBenefits':   { en: 'Key Benefits',      ar: 'المزايا الرئيسية' },
  'product.whyThis':       { en: 'Why this',           ar: 'لماذا هذا' },
  'product.locationWorks': { en: 'location works.',    ar: 'الموقع مناسب.' },
  'product.bookLocation':  { en: 'Book this Location', ar: 'احجز هذا الموقع' },
  'product.bookToday':     { en: 'today.',              ar: 'اليوم.' },
  'product.contactTeam':   { en: 'Contact our team for availability, pricing, and campaign packages.', ar: 'تواصل مع فريقنا للتوفر والأسعار وباقات الحملات.' },
  'product.relatedBillboards':{ en: 'Related Billboard Locations', ar: 'مواقع لوحات إعلانية مشابهة' },
  'product.viewAllIn':     { en: 'View all in',        ar: 'عرض الكل في' },
  'product.getDirections': { en: 'Get Directions',     ar: 'الحصول على الاتجاهات' },
  'product.market':        { en: 'Market',             ar: 'السوق' },
  'product.zone':          { en: 'Zone',               ar: 'المنطقة' },
  'product.format':        { en: 'Format',             ar: 'النوع' },
  'product.premiumCorridor':{ en: 'Premium corridor',  ar: 'ممر متميز' },
  'product.illuminated':   { en: 'Illuminated',        ar: 'مضاء' },
  'product.notFound':      { en: 'Billboard not found.', ar: 'اللوحة الإعلانية غير موجودة.' },
  'product.backToLocations':{ en: 'Back to Locations', ar: 'العودة إلى المواقع' },
  // spec row labels
  'spec.code':             { en: 'Code',               ar: 'الكود' },
  'spec.type':             { en: 'Type',               ar: 'النوع' },
  'spec.sides':            { en: 'Sides',              ar: 'الأوجه' },
  'spec.size':             { en: 'Size',               ar: 'الحجم' },
  'spec.quantity':         { en: 'Quantity',           ar: 'الكمية' },
  'spec.governorate':      { en: 'Governorate',        ar: 'المحافظة' },
  'spec.district':         { en: 'District',           ar: 'المنطقة' },
  'spec.lightning':        { en: 'Lightning',          ar: 'الإضاءة' },
  'spec.sqm':              { en: 'Square meter',       ar: 'متر مربع' },
  'spec.adFormat':         { en: 'Ad Format',          ar: 'شكل الإعلان' },
  'spec.billboardCode':    { en: 'billboard code',     ar: 'كود اللوحة' },
  'spec.scrollToZoom':     { en: 'Scroll inside map to zoom', ar: 'مرر داخل الخريطة للتكبير' },

  // ── Common ──
  'common.learnMore':      { en: 'Learn More',    ar: 'اعرف أكثر' },
  'common.getStarted':     { en: 'Get Started',   ar: 'ابدأ الآن' },
  'common.viewAll':        { en: 'View All',      ar: 'عرض الكل' },
  'common.loading':        { en: 'Loading…',      ar: 'جارٍ التحميل…' },
  'common.seeAll':         { en: 'See All',       ar: 'رؤية الكل' },
};

// ─── Font loader (run once) ───────────────────────────────────────────────────
let fontsLoaded = false;
function loadArabicFonts() {
  if (fontsLoaded || typeof document === 'undefined') return;
  fontsLoaded = true;
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap';
  document.head.appendChild(link);
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('horizon_lang') as Lang | null;
    return saved === 'ar' ? 'ar' : 'en';
  });

  const setLang = (l: Lang) => {
    localStorage.setItem('horizon_lang', l);
    setLangState(l);
    if (l === 'ar') loadArabicFonts();
  };

  // Keep html[dir] + html[lang] in sync
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir',  lang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang === 'ar' ? 'ar'  : 'en');
    if (lang === 'ar') loadArabicFonts();
  }, [lang]);

  const t = (key: string): string => UI[key]?.[lang] ?? UI[key]?.['en'] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, isAr: lang === 'ar', t }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLang() {
  return useContext(LangContext);
}