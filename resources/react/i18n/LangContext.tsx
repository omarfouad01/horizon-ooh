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
  'common.home':           { en: 'Home',          ar: 'الرئيسية' },
  'common.clear':          { en: 'Clear',         ar: 'مسح' },
  'common.clearAll':       { en: 'Clear all',     ar: 'مسح الكل' },
  'common.clearFilters':   { en: 'Clear filters', ar: 'مسح الفلاتر' },
  'common.filter':         { en: 'Filter',        ar: 'تصفية' },
  'common.filters':        { en: 'Filters',       ar: 'الفلاتر' },
  'common.apply':          { en: 'Apply',         ar: 'تطبيق' },
  'common.selected':       { en: 'selected',      ar: 'محدد' },
  'common.contactUs':      { en: 'Contact Us',    ar: 'تواصل معنا' },
  'common.map':            { en: 'Map',           ar: 'الخريطة' },
  'common.list':           { en: 'List',          ar: 'القائمة' },
  'common.billboard':      { en: 'Billboard',     ar: 'لوحة إعلانية' },
  'common.selectedPin':    { en: 'Selected',      ar: 'محدد' },
  'common.locations':      { en: 'locations',     ar: 'موقع' },
  'common.campaigns':      { en: 'campaign',      ar: 'حملة' },
  'common.projects':       { en: 'project',       ar: 'مشروع' },
  'common.in':             { en: 'in',            ar: 'في' },
  'common.pins':           { en: 'pins',          ar: 'دبابيس' },

  // ── Locations page ──
  'locations.filterLabel':    { en: 'Filter:',                  ar: 'تصفية:' },
  'locations.formatLabel':    { en: 'Format',                   ar: 'النوع' },
  'locations.cityLabel':      { en: 'City',                     ar: 'المحافظة' },
  'locations.districtLabel':  { en: 'District',                 ar: 'المنطقة' },
  'locations.premiumBillboards':{ en: 'premium billboard locations', ar: 'مواقع إعلانية متميزة' },
  'locations.premiumIn':      { en: 'premium billboard location', ar: 'موقع إعلاني متميز' },
  'locations.premiumInPlural':{ en: 'premium billboard locations', ar: 'مواقع إعلانية متميزة' },
  'locations.premiumInCity':  { en: 'in',                       ar: 'في' },
  'locations.noResults':      { en: 'No locations match your search', ar: 'لا توجد مواقع تطابق بحثك' },
  'locations.noResultsHint':  { en: 'Let us recommend the best locations for your campaign — our strategists know every market.', ar: 'دعنا نوصي بأفضل المواقع لحملتك — خبراؤنا يعرفون كل سوق.' },
  'locations.showAll':        { en: 'Show All Locations',       ar: 'عرض جميع المواقع' },
  'locations.helpChoosing':   { en: 'Need help choosing the best billboard?', ar: 'تحتاج مساعدة في اختيار أفضل لوحة إعلانية؟' },
  'locations.talkToExpert':   { en: 'Talk to an Expert',        ar: 'تحدث مع خبير' },

  // ── Services page stats ──
  'services.stat1Label':   { en: 'Locations Nationwide',  ar: 'موقع على المستوى الوطني' },
  'services.stat2Label':   { en: 'Media Formats',          ar: 'أشكال إعلانية' },
  'services.stat3Label':   { en: 'Brand Partners',         ar: 'شركاء من العلامات التجارية' },
  'services.ctaTitle':     { en: 'Need help choosing the right format?', ar: 'تحتاج مساعدة في اختيار الشكل المناسب؟' },
  'services.ctaSubtitle':  { en: 'Our media strategists will match the right outdoor mix to your campaign objectives.', ar: 'سيختار خبراؤنا الإعلاميون المزيج الخارجي المناسب لأهداف حملتك.' },
  'services.ctaButton':    { en: 'Talk to Us',             ar: 'تحدث معنا' },

  // ── Projects page ──
  // whyItMatters section
  'projects.whyEyebrow':      { en: 'Why It Works',        ar: 'لماذا ينجح' },
  'projects.whyTitle':        { en: 'Why outdoor advertising works', ar: 'لماذا تنجح الإعلانات الخارجية' },
  'projects.whyTitleAccent':  { en: 'in Egypt.',             ar: 'في مصر.' },
  'projects.whyParagraph1':   { en: "Egypt's outdoor advertising market is among the fastest-growing in the MENA region.", ar: 'سوق الإعلانات الخارجية في مصر من بين أسرع الأسواق نمواً في منطقة الشرق الأوسط وشمال أفريقيا.' },
  'projects.featuredCampaign':{ en: 'Featured Campaign',   ar: 'حملة مميزة' },
  'projects.viewCaseStudy':   { en: 'View Case Study',     ar: 'عرض دراسة الحالة' },
  'projects.latestCampaign':  { en: 'Latest campaign',     ar: 'آخر حملة' },
  'projects.clientsLabel':    { en: 'Clients',             ar: 'العملاء' },
  'projects.clientCampaigns': { en: 'campaigns',           ar: 'حملات' },
  'projects.selectedClient':  { en: 'Selected client',     ar: 'العميل المحدد' },
  'projects.noProjects':      { en: 'No projects found for this category.', ar: 'لا توجد مشاريع لهذا التصنيف.' },
  'projects.selectClient':    { en: 'Select a client to see all projects and campaigns executed for them.', ar: 'اختر عميلاً لعرض جميع المشاريع والحملات المنفذة له.' },
  'projects.filterAll':       { en: 'All Projects',        ar: 'جميع المشاريع' },
  'projects.filterBillboards':{ en: 'Billboards',          ar: 'اللوحات الإعلانية' },
  'projects.filterDOOH':      { en: 'DOOH',                ar: 'الشاشات الرقمية' },
  'projects.filterMalls':     { en: 'Malls',               ar: 'المولات' },
  'projects.filterAirports':  { en: 'Airports',            ar: 'المطارات' },
  'projects.ctaTitle':        { en: 'Ready to be our next success story?', ar: 'هل أنت مستعد لتكون قصة نجاحنا القادمة؟' },
  'projects.ctaSubtitle':     { en: "Let's plan a campaign tailored to your audience, locations, and business goals.", ar: 'دعنا نخطط حملة مصممة لجمهورك ومواقعك وأهدافك التجارية.' },
  'projects.ctaButton':       { en: 'Start Your Campaign', ar: 'ابدأ حملتك' },

  // ── About page ──
  'about.whoWeAre':        { en: 'Who We Are',        ar: 'من نحن' },
  'about.byTheNumbers':    { en: 'By the Numbers',    ar: 'بالأرقام' },
  'about.scaleTitle':      { en: 'The scale behind',  ar: 'الحجم وراء' },
  'about.scaleAccent':     { en: 'every campaign.',   ar: 'كل حملة.' },
  'about.trustedBy':       { en: 'Trusted by 100+ brands across Egypt', ar: 'يثق بنا أكثر من 100 علامة تجارية في مصر' },
  'about.ctaTitle':        { en: 'Ready to make your brand impossible to ignore?', ar: 'هل أنت مستعد لجعل علامتك التجارية لا يمكن تجاهلها؟' },
  'about.ctaSubtitle':     { en: "Talk to our team and we'll build a campaign around your objectives.", ar: 'تحدث مع فريقنا وسنبني حملة حول أهدافك.' },
  'about.ctaButton':       { en: 'Start a Campaign',  ar: 'ابدأ حملة' },
  'about.whyHorizon':      { en: 'Why Horizon OOH',   ar: 'لماذا هورايزون' },

  // ── Blog page ──
  'blog.featuredArticle':  { en: 'Featured Article',  ar: 'مقال مميز' },
  'blog.allArticles':      { en: 'All Articles',       ar: 'جميع المقالات' },
  'blog.ctaTitle':         { en: 'Ready to apply these insights?', ar: 'هل أنت مستعد لتطبيق هذه الرؤى؟' },
  'blog.ctaSubtitle':      { en: 'Talk to our strategists and turn OOH knowledge into campaign results.', ar: 'تحدث مع خبرائنا وحوّل معرفة الإعلانات الخارجية إلى نتائج حملات.' },
  'blog.ctaButton':        { en: 'Get a Quote',        ar: 'اطلب عرض سعر' },

  // ── Simulator ──
  'sim.eyebrow':           { en: 'Ad Design Simulator',              ar: 'محاكي تصميم الإعلانات' },
  'sim.title':             { en: 'See Your Brand on',                ar: 'شاهد علامتك التجارية على' },
  'sim.titleAccent':       { en: 'Any Billboard',                    ar: 'أي لوحة إعلانية' },
  'sim.subtitle':          { en: "Upload your artwork and preview it on Egypt's outdoor advertising network.", ar: 'ارفع تصميمك وشاهده على شبكة الإعلانات الخارجية في مصر.' },
  'sim.step1':             { en: 'Format',                           ar: 'الشكل' },
  'sim.step2':             { en: 'Upload',                           ar: 'رفع' },
  'sim.step3':             { en: 'Preview',                          ar: 'معاينة' },
  'sim.chooseFormat':      { en: 'Choose Your Format',               ar: 'اختر الشكل الإعلاني' },
  'sim.uploadDesign':      { en: 'Upload Your Design',               ar: 'ارفع تصميمك' },
  'sim.uploadDesigns':     { en: 'Upload Your Designs',              ar: 'ارفع تصاميمك' },
  'sim.clickToUpload':     { en: 'Click to upload (JPG / PNG)',       ar: 'اضغط للرفع (JPG / PNG)' },
  'sim.changeDesign':      { en: '↺ Change design',                  ar: '↺ تغيير التصميم' },
  'sim.livePreview':       { en: 'Live Preview',                     ar: 'معاينة مباشرة' },
  'sim.downloadMockup':    { en: 'Download Mockup',                  ar: 'تحميل النموذج' },
  'sim.generating':        { en: 'Generating...',                    ar: 'جارٍ التوليد...' },
  'sim.uploadFirst':       { en: 'Upload your design',               ar: 'ارفع تصميمك' },
  'sim.previewAuto':       { en: 'The preview will appear here automatically', ar: 'ستظهر المعاينة هنا تلقائياً' },
  'sim.doubleDecker':      { en: 'Double Decker',                    ar: 'لوحة مزدوجة' },
  'sim.multiPanel':        { en: 'Multi-Panel',                      ar: 'متعدد الألواح' },
  'sim.designsNeeded':     { en: 'designs needed',                   ar: 'تصاميم مطلوبة' },
  'sim.templatesComingSoon':{ en: 'Simulator Coming Soon',           ar: 'المحاكي قريباً' },
  'sim.comingSoonDesc':    { en: 'Our team is setting up billboard mockups. Check back soon or contact us to book a location.', ar: 'فريقنا يجهز نماذج اللوحات الإعلانية. تحقق مجدداً قريباً أو تواصل معنا لحجز موقع.' },
  'sim.contactTeam':       { en: 'Contact Our Team',                 ar: 'تواصل مع فريقنا' },
  'sim.signInRequired':    { en: 'Sign in to use the Simulator',     ar: 'سجّل دخولك لاستخدام المحاكي' },
  'sim.signInDesc':        { en: 'Create a free account or log in to preview your designs on real billboard formats and download professional mockups.', ar: 'أنشئ حساباً مجانياً أو سجّل دخولك لمعاينة تصاميمك على أشكال اللوحات الإعلانية الحقيقية وتحميل نماذج احترافية.' },
  'sim.loginBtn':          { en: 'Login to My Account',              ar: 'تسجيل الدخول' },
  'sim.createAccount':     { en: 'Create Free Account',              ar: 'إنشاء حساب مجاني' },
  'sim.templatesSetup':    { en: 'Templates are being set up. Check back soon.', ar: 'يتم إعداد النماذج. تحقق مجدداً قريباً.' },
  'sim.cornersNotSet':     { en: 'Template corners not yet configured — contact admin', ar: 'لم يتم ضبط نقاط النموذج بعد — تواصل مع المدير' },
  'sim.panels':            { en: 'panels',                           ar: 'ألواح' },
  'sim.mockupDownloaded':  { en: 'Mockup downloaded!',               ar: 'تم تحميل النموذج!' },
  'sim.downloadFailed':    { en: 'Download failed',                   ar: 'فشل التحميل' },

  // ── Auth / Profile ──
  'auth.profile':          { en: 'My Profile',                       ar: 'ملفي الشخصي' },
  'auth.logout':           { en: 'Logout',                           ar: 'تسجيل الخروج' },
  'auth.signup':           { en: 'Sign Up',                          ar: 'إنشاء حساب' },
  'auth.login':            { en: 'Login',                            ar: 'تسجيل الدخول' },
  'auth.signIn':           { en: 'Sign In',                          ar: 'تسجيل الدخول' },
  'auth.name':             { en: 'Full Name',                        ar: 'الاسم الكامل' },
  'auth.email':            { en: 'Email',                            ar: 'البريد الإلكتروني' },
  'auth.password':         { en: 'Password',                         ar: 'كلمة المرور' },
  'auth.phone':            { en: 'Phone Number',                     ar: 'رقم الهاتف' },
  'auth.alreadyHave':      { en: 'Already have an account?',         ar: 'هل لديك حساب بالفعل؟' },
  'auth.dontHave':         { en: "Don't have an account?",           ar: 'ليس لديك حساب؟' },
  'auth.createOne':        { en: 'Create one',                       ar: 'إنشاء حساب' },
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