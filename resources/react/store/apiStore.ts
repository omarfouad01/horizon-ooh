/**
 * apiStore.ts — Unified store with robust API integration + demo fallback.
 *
 * Strategy:
 *  1. Always try real API (on any non-localhost host OR if VITE_API_URL is set)
 *  2. Use Promise.allSettled so one failing API never crashes the whole load
 *  3. Normalize every response so slug/id/array fields are always present
 *  4. Fall back to demo static data only if ALL API calls fail
 */
import axios from 'axios';
import { create } from 'zustand';
import {
  locationsApi, adFormatsApi, billboardFormatsApi, servicesApi, projectsApi,
  blogApi, trustStatsApi, processStepsApi, clientBrandsApi,
  settingsApi, districtsApi,
  suppliersApi, customersApi, contactsApi,
  billboardSizesApi, simulatorTemplatesApi, designUploadsApi,
} from '@/api';
import { LOCATIONS, SERVICES, PROJECTS, BLOG_POSTS, TRUST_STATS, PROCESS, CLIENT_BRANDS } from '@/data';

// ─── Runtime API detection ────────────────────────────────────────────────────
const _envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const _PREVIEW_HOSTS = ['skywork.website', 'skywork.ai', 'vercel.app', 'netlify.app', 'pages.dev', 'surge.sh', 'github.io'];
const _hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const _isPreview = _PREVIEW_HOSTS.some(h => _hostname === h || _hostname.endsWith('.' + h));
const _isLocalhost = _hostname === 'localhost' || _hostname === '127.0.0.1' ||
  _hostname.startsWith('192.168.') || _hostname.startsWith('10.');
const _isRealHost = !_isLocalhost && !_isPreview;
export const HAS_API = !!(_envApiUrl && _envApiUrl.trim() && _envApiUrl !== '/api') || _isRealHost;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdFormatType {
  id: string; name: string; slug: string; label?: string;
  description?: string; width_m?: number; height_m?: number;
}
export interface ClientBrand {
  id: string; name: string; nameAr?: string; logo?: string; logoUrl?: string;
  industry?: string; website?: string; description?: string; descriptionAr?: string;
}
export interface BillboardSize {
  id: string; label: string; widthM?: number; heightM?: number; notes?: string;
}
export interface SimCorner { x: number; y: number }
export type SimPanel = [SimCorner, SimCorner, SimCorner, SimCorner];
export interface SimulatorTemplate {
  id: string; typeName: string; sizeLabel: string;
  mockupUrl?: string; notes?: string;
  panels?: SimPanel[];   // multi-panel (double decker etc)
  corners?: SimPanel;    // legacy single-panel
}
export interface DesignUpload {
  id: string; userId?: string; userName?: string; userEmail?: string; userPhone?: string;
  designUrl?: string; templateId?: string; typeName?: string; sizeLabel?: string;
  productId?: string; productName?: string; status?: string; notes?: string; createdAt?: string;
}
export interface Supplier {
  id: string; name: string; contact?: string; email?: string; phone?: string;
  category?: string; notes?: string; description?: string;
}
export interface Customer {
  id: string; createdAt?: string; name: string; email?: string; phone?: string;
  company?: string; industry?: string; notes?: string;
}
export interface SiteUser {
  id: string; email: string; name?: string; phone?: string;
  source?: string; notes?: string; createdAt?: string; lastSeen?: string; role?: string;
}
export interface WhyChooseItem {
  id: string; icon?: string; title: string; description?: string;
  num?: string; desc?: string; [key: string]: any;
}
export interface AboutStat { id: string; value: string; label: string; sub?: string; }
export interface AboutContent {
  headline?: string; story?: string; mission?: string; vision?: string;
  heroEyebrow?: string; heroTitle?: string; heroAccent?: string;
  introHeadline?: string; introParagraph1?: string; introParagraph2?: string;
  seoHeading?: string; seoParagraph?: string;
  darkTitle?: string; darkAccent?: string; darkParagraphs?: string[];
  whyTitle?: string; whyAccent?: string; whyItems?: WhyChooseItem[];
  keyStats?: AboutStat[]; stats?: AboutStat[]; whyChoose?: WhyChooseItem[];
  teamImages?: string[]; [key: string]: any;
}
export interface ContactEntry {
  id: any; name: string; email: string; phone?: string; company?: string;
  subject?: string; message: string; status: 'new' | 'read' | 'replied';
  created_at: string; createdAt?: string;
}
export interface ProcessStep {
  id: string; step: number | string; title: string; description: string;
  label?: string; icon?: string; [key: string]: any;
}
export interface ResultStat {
  id: string; label: string; value: string; description?: string;
  sublabel?: string; [key: string]: any;
}
export interface LocationsPageContent {
  // ── Keys the website (Locations.tsx) reads directly ──
  eyebrow?: string;        eyebrowAr?: string;
  title?: string;          titleAr?: string;
  titleAccent?: string;    titleAccentAr?: string;
  subtitle?: string;       subtitleAr?: string;
  ctaHelpText?: string;    ctaHelpTextAr?: string;
  ctaButton?: string;      ctaButtonAr?: string;
  ctaWhatsApp?: string;
  noResultsTitle?: string; noResultsTitleAr?: string;
  noResultsHint?: string;  noResultsHintAr?: string;
  // ── Legacy aliases (kept for backward compat) ──
  heroEyebrow?: string;    heroEyebrowAr?: string;
  heroTitle?: string;      heroTitleAr?: string;
  heroSubtitle?: string;   heroSubtitleAr?: string;
  ctaHelpTextLegacy?: string;
  ctaTalkText?: string;    ctaTalkTextAr?: string;
  noResultsText?: string;
  locationDetailEyebrow?: string; locationDetailEyebrowAr?: string;
  locationDetailCta?: string;     locationDetailCtaAr?: string;
  [key: string]: any;
}
export interface ContactPageContent {
  heroTitle?: string; heroTitleAr?: string;
  heroSubtitle?: string; heroSubtitleAr?: string;
  formTitle?: string; formTitleAr?: string;
  whatsappNumber?: string; phone?: string; email?: string; address?: string;
  addressAr?: string; mapEmbedUrl?: string;
  [key: string]: any;
}

export interface BillboardFormatType {
  id: string; name: string; slug: string; label?: string; sort_order?: number;
}

export interface ApiState {
  loaded: boolean; loading: boolean; usingDemo: boolean; error: string | null;
  locations:       any[];
  districts:       any[];
  adFormats:       AdFormatType[];        // Type dropdown (Unipole, Rooftop…)
  billboardFormats: BillboardFormatType[]; // Ad Format dropdown (Billboard, Digital…)
  services:        any[];
  projects:        any[];
  blogPosts:       any[];
  trustStats:      any[];
  processSteps:    ProcessStep[];
  process:         ProcessStep[];
  results:         ResultStat[];
  clientBrands:    ClientBrand[];
  suppliers:       Supplier[];
  customers:       Customer[];
  siteUsers:       SiteUser[];
  contacts:        ContactEntry[];
  settings:        Record<string, any>;
  homeContent:     Record<string, any>;
  about:           AboutContent;
  aboutContent:    AboutContent;
  projectsContent: Record<string, any>;
  locationsContent: LocationsPageContent;
  contactContent:  ContactPageContent;
  billboardSizes:     BillboardSize[];
  simulatorTemplates: SimulatorTemplate[];
  designUploads:      DesignUpload[];
  reload: () => Promise<void>;
  forceReload: () => Promise<void>;
  // Internal flag: set by forceReload() so reload() skips /auth/me validation
  _skipAuthCheck?: boolean;
}

// ─── Demo / default data ──────────────────────────────────────────────────────
const BILLBOARD_FORMATS_DEFAULT: BillboardFormatType[] = [
  { id:'1', name:'Billboard',           slug:'billboard',            label:'Billboard' },
  { id:'2', name:'Digital Screens',     slug:'digital-screens',      label:'Digital Screens' },
  { id:'3', name:'Mall Advertising',    slug:'mall-advertising',     label:'Mall Advertising' },
  { id:'4', name:'Airport Advertising', slug:'airport-advertising',  label:'Airport Advertising' },
  { id:'5', name:'Transit Ads',         slug:'transit-ads',          label:'Transit Ads' },
];
const AD_FORMATS_DEFAULT: AdFormatType[] = [
  { id:'1', name:'Unipole',      slug:'unipole',      label:'Unipole' },
  { id:'2', name:'Mega Unipole', slug:'mega-unipole', label:'Mega Unipole' },
  { id:'3', name:'Bridge Banner',slug:'bridge-banner',label:'Bridge Banner' },
  { id:'4', name:'DOOH Screen',  slug:'dooh-screen',  label:'DOOH Screen' },
  { id:'5', name:'Mall Banner',  slug:'mall-banner',  label:'Mall Banner' },
  { id:'6', name:'Trivision',    slug:'trivision',    label:'Trivision' },
];
const DEMO_SETTINGS = { tagline: 'Egypt\'s #1 Out-of-Home Advertising Network', taglineAr: 'شبكة الإعلانات الخارجية الأولى في مصر' };
const DEMO_HOME: Record<string, any> = { heroHeadline:'Where Brands Come to Life', heroSubheadline:'Egypt\'s largest OOH network', heroCta1:'Explore Locations', heroCta2:'Talk to Us', heroCta1Ar:'استكشف المواقع', heroCta2Ar:'تواصل معنا', heroHeadlineAr:'حيث تحيا العلامات التجارية', heroSubheadlineAr:'أكبر شبكة إعلانات خارجية في مصر', statementTitle:'We don\'t just sell space', statementTitleAr:'لا نبيع مساحات فحسب', signatureItems:[], signatureItemsAr:[], finalCtaHeadline:'Ready to make an impact?', finalCtaHeadlineAr:'هل أنت مستعد؟', finalCtaCta1:'Get Started', finalCtaCta2:'View Locations', finalCtaCta1Ar:'ابدأ الآن', finalCtaCta2Ar:'عرض المواقع' };
const DEMO_ABOUT: AboutContent = { heroTitle:'About Horizon OOH', heroAccent:'We Are Horizon', whyItems:[], keyStats:[], stats:[], whyChoose:[], darkParagraphs:[] };
const DEMO_PROJECTS_CONTENT = { heroEyebrow:'Our Work', heroTitle:'Projects That Make an Impact', featured:null };
const DEMO_LOCATIONS_CONTENT: LocationsPageContent = {
  // Canonical keys matching what Locations.tsx reads
  eyebrow:        'Our Network',
  title:          'Advertising Locations',
  titleAccent:    'across Egypt.',
  subtitle:       'Discover premium outdoor advertising locations across Egypt.',
  ctaHelpText:    'Need help choosing a location?',
  ctaButton:      'Talk to an expert',
  ctaWhatsApp:    '+201000000000',
  noResultsTitle: 'No locations found',
  noResultsHint:  'Try adjusting your filters.',
  // Legacy aliases
  heroEyebrow:    'Our Network',
  heroTitle:      'Advertising Locations',
  heroSubtitle:   'Discover premium outdoor advertising locations across Egypt.',
};
const DEMO_CONTACT_CONTENT: ContactPageContent = { heroTitle:'Contact Us', heroSubtitle:'Get in touch with our team', formTitle:'Send us a message', whatsappNumber:'+201000000000', phone:'+20 2 1234 5678', email:'info@horizonooh.com', address:'Cairo, Egypt' };
const _demoContacts: ContactEntry[] = [];
const _demoProcess: ProcessStep[] = (PROCESS as any[]).map((p: any, i: number) => ({ id: p.id ?? String(i+1), step: p.step ?? (i+1), title: p.title ?? '', description: p.description ?? p.desc ?? '', icon: p.icon ?? '' }));
const DEMO_RESULTS: ResultStat[] = [{ id:'1', label:'Billboards', value:'3,200+', description:'Across Egypt' }, { id:'2', label:'Cities', value:'22', description:'Governorates' }];

// ─── Normalizers ──────────────────────────────────────────────────────────────
function toSlug(s: string): string {
  return (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'item';
}
function apiArr(res: any): any[] {
  if (!res) return [];
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}
function apiObj(res: any): Record<string, any> {
  if (!res) return {};
  const d = res?.data ?? res;
  if (d && typeof d === 'object' && !Array.isArray(d)) return d?.data && typeof d.data === 'object' && !Array.isArray(d.data) ? d.data : d;
  return {};
}
function safeArr(v: any): any[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
}
function normProduct(p: any, idx: number): any {
  if (!p) return null;
  const slug = p.slug ?? p.code ?? toSlug(p.title ?? p.name ?? `product-${idx+1}`);
  // Ensure lat/lng are numbers (API may return strings)
  const lat = p.lat !== undefined && p.lat !== null ? parseFloat(String(p.lat)) : undefined;
  const lng = p.lng !== undefined && p.lng !== null ? parseFloat(String(p.lng)) : undefined;
  const safeImages = safeArr(p.images);
  // Normalize image objects: each must be { url, alt, is_primary }
  const normImages = safeImages.map((img: any) =>
    typeof img === 'string' ? { url: img, alt: '', is_primary: false } : img
  ).filter((img: any) => img && typeof img.url === 'string' && img.url.length > 0);
  // Primary image URL for card display — prefer is_primary, fallback first image
  const primaryImg = normImages.find((img: any) => img?.is_primary) ?? normImages[0];
  const imageUrl = primaryImg?.url ?? '';
  // Normalize API field names → frontend field names
  const nameEn = p.nameEn ?? p.title ?? p.name ?? '';
  // format = ad category (Billboard / Digital / Mall…)
  const adFormat = p.adFormat ?? p.format ?? '';
  // type = billboard sub-type (Unipole / Rooftop / Bridge Panel…) — separate from format
  const typeName = p.type ?? '';
  const fullAddress = p.full_address ?? p.location ?? p.spot ?? '';
  return {
    ...p,
    slug, id: p.id ?? slug,
    // Normalize created_at → createdAt for reliable date sorting
    createdAt: p.createdAt ?? p.created_at ?? null,
    title: nameEn,
    name: nameEn,
    nameEn,
    // Keep nameAr from API
    nameAr: p.nameAr ?? p.name_ar ?? '',
    descriptionEn: p.descriptionEn ?? p.description ?? '',
    descriptionAr: p.descriptionAr ?? p.description_ar ?? '',
    // adFormat = broad category (Billboard/Digital/Mall); format = same for backward compat
    adFormat,
    format: adFormat,
    // type = specific subtype (Unipole / Rooftop / …) — from the `type` column, not format
    type: typeName,
    // Address / location
    location: fullAddress,
    full_address: fullAddress,
    spot: fullAddress,
    // District ID mapping (API returns district_id)
    districtId: p.districtId ?? p.district_id ?? '',
      supplierId: p.supplierId != null ? String(p.supplierId) : (p.supplier_id != null ? String(p.supplier_id) : ''),
    quantity: p.quantity ?? 1,
    // Traffic & audience fields
    traffic: p.traffic ?? '',
    visibility: p.visibility ?? '',
    // Safety arrays for Product page — API may not return these
    benefits: safeArr(p.benefits),
    specs: safeArr(p.specs),
    relatedSlugs: safeArr(p.relatedSlugs ?? p.related_slugs),
    // Normalized images array — always objects {url,alt,is_primary}
    images: normImages,
    // Primary image URL for card display
    image: imageUrl,
    lat: lat !== undefined && !isNaN(lat) ? lat : undefined,
    lng: lng !== undefined && !isNaN(lng) ? lng : undefined,
  };
}
function normLoc(loc: any): any {
  if (!loc) return null;
  const slug = loc.slug ?? toSlug(loc.name ?? loc.city ?? `location-${loc.id}`);
  const products = safeArr(loc.products ?? loc.billboards).map((p: any, i: number) => normProduct(p, i)).filter(Boolean);
  return { ...loc, slug, id: loc.id ?? slug, products };
}
function normProject(p: any, i: number): any {
  if (!p) return null;
  const slug = p.slug ?? toSlug(p.title ?? `project-${i+1}`);
  return { ...p, slug, id: p.id ?? slug, title: p.title ?? '', galleryImages: safeArr(p.galleryImages ?? p.gallery_images), results: safeArr(p.results ?? p.results_json), tags: safeArr(p.tags), images: safeArr(p.images) };
}
function normBlogPost(p: any, i: number): any {
  if (!p) return null;
  const slug = p.slug ?? toSlug(p.title ?? `post-${i+1}`);
  return { ...p, slug, id: p.id ?? slug, title: p.title ?? '', body: safeArr(p.body), bodyAr: safeArr(p.bodyAr ?? p.body_ar), tags: safeArr(p.tags) };
}
function normService(s: any, i: number): any {
  if (!s) return null;
  const slug       = s.slug ?? toSlug(s.shortTitle ?? s.short_title ?? s.name ?? `service-${i+1}`);
  // Map API snake_case / name field to what ServiceDetail.tsx expects
  const title      = s.title      ?? s.name      ?? '';
  const shortTitle = s.shortTitle ?? s.short_title ?? title;
  const tagline    = s.tagline    ?? '';
  const longDescription = s.longDescription ?? s.long_description ?? s.description ?? '';
  const whatIs     = s.whatIs     ?? s.what_is    ?? '';
  const whereUsed  = s.whereUsed  ?? s.where_used  ?? '';
  // whyChoose: array of {title,text} objects (3 columns in ServiceDetail)
  const whyChoose  = safeArr(s.whyChoose ?? s.why_choose);
  return {
    ...s,
    slug,
    id:              s.id ?? slug,
    name:            title,
    title,
    shortTitle,
    tagline,
    longDescription,
    whatIs,
    whereUsed,
    benefits:        safeArr(s.benefits),
    process:         safeArr(s.process),
    features:        safeArr(s.features),
    stats:           safeArr(s.stats),
    whyChoose,
  };
}
function normTemplate(t: any): SimulatorTemplate {
  if (!t) return { id: '', typeName: '', sizeLabel: '' };
  const panels: SimPanel[] = safeArr(t.panels);
  const corners = t.corners ?? null;
  return {
    ...t,
    id: String(t.id ?? ''),
    typeName:  t.typeName  ?? t.type_name  ?? '',
    sizeLabel: t.sizeLabel ?? t.size_label ?? '',
    mockupUrl: t.mockupUrl ?? t.mockup_url ?? '',
    panels: panels.length > 0 ? panels : (corners ? [corners] : []),
    corners: corners ?? undefined,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Pre-populate with demo data so the page renders immediately on first load.
// Real API data replaces this once the fetch completes (non-blocking).
// This ensures users NEVER see empty/blank sections while waiting for the API.
const _normDemoBrands = (CLIENT_BRANDS as any[]).map((b: any, i: number) =>
  typeof b === 'string' ? { id: String(i + 1), name: b, logoUrl: '', logo: '' }
    : { id: b.id ?? String(i + 1), name: b.name ?? b, logoUrl: b.logoUrl ?? b.logo ?? '', logo: b.logo ?? '' }
);
export const useApiStore = create<ApiState>((set, get) => ({
  // Start with demo data so sections render instantly before API responds
  loaded: true, loading: false, usingDemo: true, error: null,
  locations: LOCATIONS as any[], districts: [], adFormats: AD_FORMATS_DEFAULT, billboardFormats: BILLBOARD_FORMATS_DEFAULT,
  services: SERVICES as any[], projects: PROJECTS as any[], blogPosts: BLOG_POSTS as any[],
  trustStats: TRUST_STATS as any[], processSteps: _demoProcess, process: _demoProcess,
  results: DEMO_RESULTS, clientBrands: _normDemoBrands, suppliers: [], customers: [],
  siteUsers: [], contacts: _demoContacts,
  settings: DEMO_SETTINGS, homeContent: DEMO_HOME,
  about: DEMO_ABOUT, aboutContent: DEMO_ABOUT,
  projectsContent: DEMO_PROJECTS_CONTENT,
  locationsContent: DEMO_LOCATIONS_CONTENT,
  contactContent: DEMO_CONTACT_CONTENT,
  billboardSizes: [], simulatorTemplates: [], designUploads: [],

  forceReload: async () => {
    // Like reload() but bypasses the loading guard AND skips the /auth/me validation.
    // Called after a confirmed successful login, so the token is known to be valid.
    // We set a flag so reload() skips the /auth/me pre-check.
    set({ loading: false, _skipAuthCheck: true } as any);
    return useApiStore.getState().reload();
  },

  reload: async () => {
    if (get().loading) return;
    // Keep loaded:true and don't clear data during refresh so the page
    // never goes blank. The demo/cached data shown initially stays visible
    // until real API data replaces it.
    set({ loading: true, error: null });

    if (!HAS_API) {
      // Demo mode — use static data
      const districts: any[] = [];
      (LOCATIONS as any[]).forEach((loc: any) => {
        (loc.districts ?? []).forEach((d: any, di: number) => {
          const name   = typeof d === 'string' ? d : (d.name ?? String(d));
          const nameAr = typeof d === 'object' ? (d.nameAr ?? '') : '';
          districts.push({ id:`${loc.id}-district-${di+1}`, name, nameAr, locationId:loc.id, location_id:loc.id, location_slug:loc.slug, cityAr:loc.cityAr??'' });
        });
      });
      const normBrands = (CLIENT_BRANDS as any[]).map((b: any, i: number) =>
        typeof b === 'string' ? { id:String(i+1), name:b, logoUrl:'', logo:'' }
          : { id:b.id??String(i+1), name:b.name??b, logoUrl:b.logoUrl??b.logo??'', logo:b.logo??'' }
      );
      set({
        locations: LOCATIONS as any[], districts, adFormats: AD_FORMATS_DEFAULT, billboardFormats: BILLBOARD_FORMATS_DEFAULT,
        services: SERVICES as any[], projects: PROJECTS as any[], blogPosts: BLOG_POSTS as any[],
        trustStats: TRUST_STATS as any[], processSteps: _demoProcess, process: _demoProcess,
        results: DEMO_RESULTS, clientBrands: normBrands,
        suppliers:[], customers:[], siteUsers:[], contacts: _demoContacts,
        settings: DEMO_SETTINGS, homeContent: DEMO_HOME,
        about: DEMO_ABOUT, aboutContent: DEMO_ABOUT,
        projectsContent: DEMO_PROJECTS_CONTENT,
        locationsContent: DEMO_LOCATIONS_CONTENT,
        contactContent: DEMO_CONTACT_CONTENT,
        loaded: true, loading: false, usingDemo: true, error: null,
      });
      return;
    }

    // Real API mode — use Promise.allSettled so one failure doesn't break everything
    // Admin-only endpoints (suppliers, customers, contacts) require a VALID auth token.
    // We validate the token with a RAW axios call (bypassing our interceptor) so that
    // a stale token doesn't trigger refresh → horizon:auth:expired → logout cascade.
    const authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('horizon_token') : null;
    const mightBeAuthenticated = !!authToken && authToken !== 'demo-token' && authToken !== 'preview-token';

    // Check if forceReload() set a skip flag (called after confirmed login — token is fresh)
    const skipAuthCheck = !!(get() as any)._skipAuthCheck;
    if (skipAuthCheck) set({ _skipAuthCheck: false } as any);

    // Validate token with a PLAIN axios call (no interceptors).
    // Using authApi.me() would go through our Axios interceptor which on 401 tries
    // to refresh the token, then fires horizon:auth:expired → AdminAuth.logout() →
    // isAuth=false → redirect to login. We must avoid that cascade here.
    let isAuthenticated = false;
    if (mightBeAuthenticated) {
      if (skipAuthCheck) {
        // Post-login: token was just issued, we know it's valid — skip the check
        isAuthenticated = true;
      } else {
        try {
          // Raw axios — NO interceptors, NO retry, NO refresh attempt
          const baseURL = authToken ? (typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/api`
            : '/api') : '/api';
          await axios.get(`${baseURL}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
            timeout: 5000,
          });
          isAuthenticated = true;
        } catch {
          // Token is expired or invalid — wipe it so next page load is clean
          // We do NOT dispatch horizon:auth:expired here — this runs on public pages
          // too and we don't want to force-logout a dashboard session just because
          // the public store reloaded. The interceptor handles that for dashboard flows.
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('horizon_token');
            localStorage.removeItem('horizon_user');
          }
          isAuthenticated = false;
        }
      }
    }

    // Admin-only APIs: only called when token is confirmed valid
    const suppliersP     = isAuthenticated ? suppliersApi.all()     : Promise.resolve([]);
    const customersP     = isAuthenticated ? customersApi.all()     : Promise.resolve([]);
    const contactsP      = isAuthenticated ? contactsApi.all()      : Promise.resolve([]);
    const designUploadsP = isAuthenticated ? designUploadsApi.all() : Promise.resolve([]);

    const results = await Promise.allSettled([
      locationsApi.all(),           // 0
      districtsApi.all(),           // 1
      adFormatsApi.all(),           // 2 — Types (Unipole, Rooftop…)
      servicesApi.all(),            // 3
      projectsApi.all(),            // 4
      blogApi.all(),                // 5
      trustStatsApi.all(),          // 6
      processStepsApi.all(),        // 7
      clientBrandsApi.all(),        // 8
      settingsApi.all(),            // 9
      settingsApi.homeContent(),    // 10
      settingsApi.aboutContent(),   // 11
      billboardSizesApi.all(),      // 12
      simulatorTemplatesApi.all(),  // 13
      designUploadsP,               // 14 — design uploads (admin-only)
      suppliersP,                   // 15 — suppliers (admin-only)
      customersP,                   // 16 — customers (admin-only)
      contactsP,                    // 17 — contacts (admin-only)
      billboardFormatsApi.all(),    // 18 — Ad Formats (Billboard, Digital…)
    ]);

    const val = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value : null;

    const locsRaw    = apiArr(val(0));
    const distsRaw   = apiArr(val(1));
    const fmtsRaw    = apiArr(val(2));   // Types (Unipole…)
    const svcsRaw    = apiArr(val(3));
    const projsRaw   = apiArr(val(4));
    const blogRaw    = apiArr(val(5));
    const statsRaw   = apiArr(val(6));
    const stepsRaw   = apiArr(val(7));
    const brandsRaw  = apiArr(val(8));
    const settsRaw   = apiObj(val(9));
    const hcRaw      = apiObj(val(10));
    const acRaw      = apiObj(val(11));
    const sizesRaw   = apiArr(val(12));
    const tplsRaw    = apiArr(val(13));
    const uploadsRaw = apiArr(val(14));
    const suppRaw    = apiArr(val(15));
    const custRaw    = apiArr(val(16));
    const contsRaw   = apiArr(val(17));
    const bbFmtsRaw  = apiArr(val(18));  // Ad Formats (Billboard, Digital…)

    const normLocs   = locsRaw.map(normLoc).filter(Boolean);
    const normSvcs   = svcsRaw.map((s: any, i: number) => normService(s, i)).filter(Boolean);
    const normProjs  = projsRaw.map((p: any, i: number) => normProject(p, i)).filter(Boolean);
    const normBlog   = blogRaw.map((p: any, i: number) => normBlogPost(p, i)).filter(Boolean);
    const normFmts   = fmtsRaw.map((f: any) => ({ ...f, label: f.label ?? f.name }));
    const normBbFmts = bbFmtsRaw.map((f: any) => ({ ...f, label: f.label ?? f.name }));
    const normBrands = brandsRaw.map((b: any) => ({ ...b, logoUrl: b.logoUrl ?? b.logo }));
    const normSteps  = stepsRaw.map((p: any, i: number) => ({
      id:          String(p.id ?? i + 1),
      step:        p.step ?? (i + 1),
      title:       p.title ?? p.label ?? '',
      label:       p.label ?? p.title ?? '',
      description: p.description ?? p.desc ?? '',
      icon:        p.icon ?? '',
      sort_order:  p.sort_order ?? i,
    }));
    const normTpls   = tplsRaw.map((t: any) => normTemplate(t));

    // Districts: prefer API data, fallback to deriving from locations
    const normDists = distsRaw.length > 0 ? distsRaw
      : normLocs.flatMap((loc: any, _li: number) =>
          (loc.districts ?? []).map((d: any, di: number) => {
            const name   = typeof d === 'string' ? d : (d.name ?? String(d));
            const nameAr = typeof d === 'object' ? (d.nameAr ?? '') : '';
            return { id:`${loc.id}-district-${di+1}`, name, nameAr, locationId:loc.id, location_id:loc.id, location_slug:loc.slug, cityAr:loc.cityAr??'' };
          })
        );

    // Preserve existing simulator data if API returned nothing
    const cur = get();

    set({
      locations:          normLocs.length ? normLocs : (LOCATIONS as any[]),
      districts:          normDists,
      adFormats:          normFmts.length   ? normFmts   : AD_FORMATS_DEFAULT,
      billboardFormats:   normBbFmts.length ? normBbFmts : BILLBOARD_FORMATS_DEFAULT,
      services:           normSvcs,
      projects:           normProjs,
      blogPosts:          normBlog,
      trustStats:         statsRaw,
      processSteps:       normSteps.length ? normSteps : _demoProcess,
      process:            normSteps.length ? normSteps : _demoProcess,
      clientBrands:       normBrands,
      settings:           Object.keys(settsRaw).length ? settsRaw : DEMO_SETTINGS,
      homeContent:        Object.keys(hcRaw).length    ? hcRaw    : DEMO_HOME,
      about:              Object.keys(acRaw).length    ? acRaw    : DEMO_ABOUT,
      aboutContent:       Object.keys(acRaw).length    ? acRaw    : DEMO_ABOUT,
      projectsContent:    (() => { try { const v = settsRaw['projects_page_content']; return typeof v === 'string' ? JSON.parse(v) : (v ?? DEMO_PROJECTS_CONTENT); } catch { return DEMO_PROJECTS_CONTENT; } })(),
      locationsContent:   (() => {
        try {
          const v = settsRaw['locations_page_content'];
          const raw: any = typeof v === 'string' ? JSON.parse(v) : (v ?? {});
          if (!raw || !Object.keys(raw).length) return DEMO_LOCATIONS_CONTENT;
          // Normalise: map legacy hero* keys → canonical keys used by Locations.tsx
          return {
            ...raw,
            eyebrow:        raw.eyebrow        ?? raw.heroEyebrow    ?? DEMO_LOCATIONS_CONTENT.eyebrow,
            eyebrowAr:      raw.eyebrowAr      ?? raw.heroEyebrowAr  ?? '',
            title:          raw.title          ?? raw.heroTitle       ?? DEMO_LOCATIONS_CONTENT.title,
            titleAr:        raw.titleAr        ?? raw.heroTitleAr     ?? '',
            titleAccent:    raw.titleAccent    ?? DEMO_LOCATIONS_CONTENT.titleAccent,
            titleAccentAr:  raw.titleAccentAr  ?? '',
            subtitle:       raw.subtitle       ?? raw.heroSubtitle    ?? DEMO_LOCATIONS_CONTENT.subtitle,
            subtitleAr:     raw.subtitleAr     ?? raw.heroSubtitleAr  ?? '',
            ctaHelpText:    raw.ctaHelpText    ?? raw.ctaHelp         ?? DEMO_LOCATIONS_CONTENT.ctaHelpText,
            ctaHelpTextAr:  raw.ctaHelpTextAr  ?? raw.ctaHelpAr      ?? '',
            ctaButton:      raw.ctaButton      ?? raw.ctaTalkText     ?? raw.ctaExpert  ?? DEMO_LOCATIONS_CONTENT.ctaButton,
            ctaButtonAr:    raw.ctaButtonAr    ?? raw.ctaTalkTextAr   ?? raw.ctaExpertAr ?? '',
            ctaWhatsApp:    raw.ctaWhatsApp    ?? raw.whatsappNumber  ?? DEMO_LOCATIONS_CONTENT.ctaWhatsApp,
            noResultsTitle: raw.noResultsTitle ?? raw.noResults       ?? raw.noResultsText ?? DEMO_LOCATIONS_CONTENT.noResultsTitle,
            noResultsTitleAr: raw.noResultsTitleAr ?? raw.noResultsAr ?? '',
            noResultsHint:  raw.noResultsHint  ?? DEMO_LOCATIONS_CONTENT.noResultsHint,
            noResultsHintAr: raw.noResultsHintAr ?? '',
          };
        } catch { return DEMO_LOCATIONS_CONTENT; }
      })(),
      contactContent:     (() => { try { const v = settsRaw['contact_page_content'];  return typeof v === 'string' ? JSON.parse(v) : (v ?? DEMO_CONTACT_CONTENT);  } catch { return DEMO_CONTACT_CONTENT;  } })(),
      suppliers:          suppRaw.map((s: any) => ({ ...s, id: String(s.id) })),
      customers:          custRaw,
      contacts:           contsRaw,
      // Results: prefer those saved in homeContent (via dashboard Results tab), fallback to demo
      results: (() => {
        const hcResults = hcRaw?.results;
        if (Array.isArray(hcResults) && hcResults.length > 0) return hcResults;
        return DEMO_RESULTS;
      })(),
      // Simulator: keep existing store data if API returned nothing (localStorage seeded)
      billboardSizes:     sizesRaw.length  ? sizesRaw  : cur.billboardSizes,
      simulatorTemplates: normTpls.length  ? normTpls  : cur.simulatorTemplates,
      designUploads:      uploadsRaw.length ? uploadsRaw : cur.designUploads,
      loaded:    true,
      loading:   false,
      usingDemo: false,
      error:     null,
    });
  },
}));

// ─── Auto-load on first import ────────────────────────────────────────────────
// Start with demo data (loaded:true) so sections render immediately, then
// immediately fire a real API fetch to replace demo data with live data.
// We do NOT guard on !loaded because loaded starts as true (pre-populated with
// demo data). We only skip if a fetch is already in flight.
if (typeof window !== 'undefined' && HAS_API) {
  // Kick off on next microtask tick so the store object is fully constructed
  // before reload() is called, but still before any React render.
  Promise.resolve().then(() => {
    if (!useApiStore.getState().loading) {
      useApiStore.getState().reload();
    }
  });
}