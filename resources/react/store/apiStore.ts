/**
 * apiStore.ts — Unified store with robust API integration + demo fallback.
 *
 * Strategy:
 *  1. Always try real API (on any non-localhost host OR if VITE_API_URL is set)
 *  2. Use Promise.allSettled so one failing API never crashes the whole load
 *  3. Normalize every response so slug/id/array fields are always present
 *  4. Fall back to demo static data only if ALL API calls fail
 */
import { create } from 'zustand';
import {
  locationsApi, adFormatsApi, servicesApi, projectsApi,
  blogApi, trustStatsApi, processStepsApi, clientBrandsApi,
  settingsApi, districtsApi,
  suppliersApi, customersApi, contactsApi,
  billboardSizesApi, simulatorTemplatesApi, designUploadsApi,
} from '@/api';
import { LOCATIONS, SERVICES, PROJECTS, BLOG_POSTS, TRUST_STATS, PROCESS, CLIENT_BRANDS } from '@/data';

// ─── Runtime API detection ────────────────────────────────────────────────────
const _envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const _isRealHost = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.startsWith('192.168.');
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
  heroEyebrow?: string; heroTitle?: string; heroSubtitle?: string;
  heroEyebrowAr?: string; heroTitleAr?: string; heroSubtitleAr?: string;
  ctaHelpText?: string; ctaHelpTextAr?: string;
  ctaTalkText?: string; ctaTalkTextAr?: string;
  ctaWhatsApp?: string;
  noResultsText?: string; noResultsTextAr?: string;
  locationDetailEyebrow?: string; locationDetailEyebrowAr?: string;
  locationDetailCta?: string; locationDetailCtaAr?: string;
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

export interface ApiState {
  loaded: boolean; loading: boolean; usingDemo: boolean; error: string | null;
  locations:       any[];
  districts:       any[];
  adFormats:       AdFormatType[];
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
}

// ─── Demo / default data ──────────────────────────────────────────────────────
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
const DEMO_LOCATIONS_CONTENT: LocationsPageContent = { heroEyebrow:'Our Network', heroTitle:'Advertising Locations', heroSubtitle:'Discover premium outdoor advertising locations across Egypt.', ctaHelpText:'Need help choosing a location?', ctaTalkText:'Talk to an expert', ctaWhatsApp:'+201000000000', noResultsText:'No locations found', locationDetailEyebrow:'Advertising Location', locationDetailCta:'Get a Quote' };
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
  return { ...p, slug, id: p.id ?? slug, title: p.title ?? p.name ?? '' };
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
  const slug = s.slug ?? toSlug(s.shortTitle ?? s.short_title ?? s.name ?? `service-${i+1}`);
  return { ...s, slug, id: s.id ?? slug, name: s.name ?? '', benefits: safeArr(s.benefits) };
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
export const useApiStore = create<ApiState>((set, get) => ({
  loaded: false, loading: false, usingDemo: false, error: null,
  locations: [], districts: [], adFormats: AD_FORMATS_DEFAULT,
  services: [], projects: [], blogPosts: [],
  trustStats: [], processSteps: _demoProcess, process: _demoProcess,
  results: DEMO_RESULTS, clientBrands: [], suppliers: [], customers: [],
  siteUsers: [], contacts: _demoContacts,
  settings: DEMO_SETTINGS, homeContent: DEMO_HOME,
  about: DEMO_ABOUT, aboutContent: DEMO_ABOUT,
  projectsContent: DEMO_PROJECTS_CONTENT,
  locationsContent: DEMO_LOCATIONS_CONTENT,
  contactContent: DEMO_CONTACT_CONTENT,
  billboardSizes: [], simulatorTemplates: [], designUploads: [],

  reload: async () => {
    if (get().loading) return;
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
        locations: LOCATIONS as any[], districts, adFormats: AD_FORMATS_DEFAULT,
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
    const results = await Promise.allSettled([
      locationsApi.all(),          // 0
      districtsApi.all(),          // 1
      adFormatsApi.all(),          // 2
      servicesApi.all(),           // 3
      projectsApi.all(),           // 4
      blogApi.all(),               // 5
      trustStatsApi.all(),         // 6
      processStepsApi.all(),       // 7
      clientBrandsApi.all(),       // 8
      settingsApi.all(),           // 9
      settingsApi.homeContent(),   // 10
      settingsApi.aboutContent(),  // 11
      billboardSizesApi.all(),     // 12
      simulatorTemplatesApi.all(), // 13
      designUploadsApi.all(),      // 14
      suppliersApi.all(),          // 15
      customersApi.all(),          // 16
      contactsApi.all(),           // 17
    ]);

    const val = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value : null;

    const locsRaw    = apiArr(val(0));
    const distsRaw   = apiArr(val(1));
    const fmtsRaw    = apiArr(val(2));
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

    const normLocs   = locsRaw.map(normLoc).filter(Boolean);
    const normSvcs   = svcsRaw.map((s: any, i: number) => normService(s, i)).filter(Boolean);
    const normProjs  = projsRaw.map((p: any, i: number) => normProject(p, i)).filter(Boolean);
    const normBlog   = blogRaw.map((p: any, i: number) => normBlogPost(p, i)).filter(Boolean);
    const normFmts   = fmtsRaw.map((f: any) => ({ ...f, label: f.label ?? f.name }));
    const normBrands = brandsRaw.map((b: any) => ({ ...b, logoUrl: b.logoUrl ?? b.logo }));
    const normSteps  = stepsRaw.map((p: any, i: number) => ({ id:String(p.id??i+1), step:p.step??(i+1), title:p.title??'', description:p.description??p.desc??'', icon:p.icon??'' }));
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
      adFormats:          normFmts.length ? normFmts : AD_FORMATS_DEFAULT,
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
      projectsContent:    DEMO_PROJECTS_CONTENT,
      locationsContent:   DEMO_LOCATIONS_CONTENT,
      contactContent:     DEMO_CONTACT_CONTENT,
      suppliers:          suppRaw,
      customers:          custRaw,
      contacts:           contsRaw,
      results:            DEMO_RESULTS,
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
let _initiated = false;
useApiStore.subscribe((state) => {
  if (!_initiated && !state.loaded && !state.loading) {
    _initiated = true;
    useApiStore.getState().reload();
  }
});
if (!useApiStore.getState().loaded && !useApiStore.getState().loading) {
  _initiated = true;
  useApiStore.getState().reload();
}
