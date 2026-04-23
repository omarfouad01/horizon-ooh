/**
 * apiStore.ts — Live API store with demo fallback.
 * When VITE_API_URL is configured, fetches real data from Laravel backend.
 * Falls back to static demo data only when API is unreachable.
 */
import { create } from 'zustand';
import {
  locationsApi, adFormatsApi, servicesApi, projectsApi,
  blogApi, trustStatsApi, processStepsApi, clientBrandsApi,
  settingsApi, districtsApi,
} from '@/api';
import { LOCATIONS, SERVICES, PROJECTS, BLOG_POSTS, TRUST_STATS, PROCESS, CLIENT_BRANDS } from '@/data';

// ─── Types must be declared FIRST ────────────────────────────────────────────
export interface AdFormatType {
  id: string;
  name: string;
  slug: string;
  label?: string;
  description?: string;
  width_m?: number;
  height_m?: number;
}

// ─── Default ad formats for demo mode ────────────────────────────────────────
const AD_FORMATS_DEFAULT: AdFormatType[] = [
  { id:'1', name:'Unipole',      slug:'unipole',      label:'Unipole',      description:'Large single-pole billboard', width_m:12, height_m:6 },
  { id:'2', name:'Mega Unipole', slug:'mega-unipole', label:'Mega Unipole', description:'Extra-large highway format',  width_m:18, height_m:8 },
  { id:'3', name:'Bridge Banner',slug:'bridge-banner',label:'Bridge Banner',description:'Spanning bridge format',     width_m:20, height_m:4 },
  { id:'4', name:'DOOH Screen',  slug:'dooh-screen',  label:'DOOH Screen',  description:'Digital LED screen',         width_m:6,  height_m:4 },
  { id:'5', name:'Mall Banner',  slug:'mall-banner',  label:'Mall Banner',  description:'Indoor mall banner',         width_m:3,  height_m:6 },
  { id:'6', name:'Trivision',    slug:'trivision',    label:'Trivision',    description:'Three-sided rotating panel', width_m:12, height_m:4 },
];

// ─── More Types ──────────────────────────────────────────────────────────────
export interface ClientBrand {
  id: string;
  name: string;
  logo?: string;
  logoUrl?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  category?: string;
  notes?: string;
  description?: string;
}

export interface Customer {
  id: string;
  createdAt?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  industry?: string;
  notes?: string;
}

export interface SiteUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
  lastSeen?: string;
  updated_at?: string;
}

export interface WhyChooseItem {
  id: string;
  icon?: string;
  title: string;
  description?: string;
  num?: string;
  desc?: string;
  [key: string]: any;
}

export interface AboutStat {
  id: string;
  value: string;
  label: string;
  sub?: string;
}

export interface AboutContent {
  headline?: string;
  story?: string;
  mission?: string;
  vision?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroAccent?: string;
  introHeadline?: string;
  introParagraph1?: string;
  introParagraph2?: string;
  seoHeading?: string;
  seoParagraph?: string;
  darkTitle?: string;
  darkAccent?: string;
  darkParagraphs?: string[];
  whyTitle?: string;
  whyAccent?: string;
  whyItems?: WhyChooseItem[];
  keyStats?: AboutStat[];
  stats?: AboutStat[];
  whyChoose?: WhyChooseItem[];
  teamImages?: string[];
  [key: string]: any;
}

export interface ContactEntry {
  id: any;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
  createdAt?: string;
}

export interface ProcessStep {
  id: string;
  step: number | string;
  title: string;
  description: string;
  label?: string;
  icon?: string;
  [key: string]: any;
}

export interface ResultStat {
  id: string;
  label: string;
  value: string;
  description?: string;
  sublabel?: string;
  [key: string]: any;
}

// ─── Demo defaults ────────────────────────────────────────────────────────────
const DEMO_SETTINGS = {
  site_name:       'HORIZON OOH',
  companyName:     'HORIZON OOH',
  tagline:         "Egypt's Premium Out-of-Home Advertising Partner",
  taglineAr:       'الشريك الأول في الإعلانات الخارجية في مصر',
  phone:           '+20 100 123 4567',
  email:           'info@horizonooh.com',
  address:         'Smart Village, Km 28, Cairo–Alexandria Desert Road, Cairo, Egypt',
  hqLabel:         'Cairo HQ',
  whatsapp:        '+201234567890',
  metaDescription: "HORIZON OOH is Egypt's #1 outdoor advertising company — billboards, DOOH, mall, airport and transit advertising across all 27 governorates.",
  facebook:        'https://facebook.com/horizonooh',
  instagram:       'https://instagram.com/horizonooh',
  linkedin:        'https://linkedin.com/company/horizonooh',
  youtube:         '',
  twitter:         '',
  headerLogoUrl:   '',
  footerLogoUrl:   '',
  faviconUrl:      '',
};

const DEMO_HOME = {
  hero_headline: 'Own Every Road.\nDominate Every Screen.',
  hero_subheadline: "Egypt's most trusted OOH advertising partner.",
  hero_cta_primary: 'Explore Locations',
  hero_cta_secondary: 'View Case Studies',
  heroEyebrow:        "Egypt's #1 OOH Agency",
  heroTitleLines:     ['Visibility', 'That Moves'],
  heroStatement:      "We plan, place, and deliver outdoor advertising campaigns across Egypt.",
  heroChannels:       ['Billboard', 'DOOH', 'Mall', 'Airport', 'Transit'],
  searchTitle:        'Find Your Billboard Location',
  statementEyebrow:   'Our Mission',
  statementLines:     ["We engineer", "visibility."],
  statementBrand:     'HORIZON OOH',
  featureEyebrow:     'Why HORIZON OOH',
  featureTitleLine1:  'Outdoor advertising',
  featureTitleLine2:  'that performs.',
  featureImage:       'https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1200&q=85',
  featureBullets:     ["9,500+ premium locations nationwide", "Egypt's most experienced OOH team", "Full-service: strategy, production, installation"],
  featureButtonText:  'Get a Quote',
  featureStatsValue:  '9,500+',
  featureStatsLabel:  'Billboard Locations',
  signatureEyebrow:   'Our Commitment',
  signatureLines:     ["We don't sell space.", "We engineer visibility."],
  finalCtaEyebrow:    'Ready to be seen?',
  finalCtaTitleLine1: 'Start your campaign',
  finalCtaTitleLine2: 'today.',
  finalCtaTitleLine:  'Start your campaign',
  finalCtaSubtext:    "Let's plan your next outdoor advertising campaign.",
  finalCtaPrimaryText:   'Get a Quote',
  finalCtaSecondaryText: 'Explore Locations',
  finalCtaBadges:     ['Billboard', 'DOOH', 'Mall', 'Airport'],
};

const DEMO_ABOUT: AboutContent = {
  headline: 'About HORIZON OOH',
  heroEyebrow: 'Who We Are',
  heroTitle: 'Egypt\'s Premier',
  heroAccent: 'OOH Partner',
  introHeadline: 'We put your brand on every major road in Egypt',
  introParagraph1: 'HORIZON OOH is Egypt\'s leading outdoor advertising company, delivering premium billboard and DOOH solutions across all 27 governorates.',
  introParagraph2: 'Founded on precision planning and creative excellence, we help brands own the streets.',
  seoHeading: 'Outdoor Advertising in Egypt',
  seoParagraph: 'From Cairo Ring Road unipoles to Alexandria coastal bridges, HORIZON OOH covers every key route.',
  darkTitle: 'Our',
  darkAccent: 'Mission',
  darkParagraphs: ['To connect brands with audiences at scale through precision-placed, premium outdoor media.'],
  whyTitle: 'Why Choose',
  whyAccent: 'HORIZON OOH',
  whyItems: [
    { id:'1', icon:'MapPin', title:'Nationwide Coverage', description:'All 27 governorates covered', num:'01', desc:'27 Governorates' },
    { id:'2', icon:'Eye',    title:'Premium Locations',  description:'High-traffic, high-visibility sites', num:'02', desc:'Premium Sites' },
    { id:'3', icon:'Zap',    title:'Fast Execution',     description:'72-hour installation guarantee', num:'03', desc:'72h Install' },
  ],
  keyStats: [
    { id:'1', value:'500+', label:'Billboards', sub:'Active sites' },
    { id:'2', value:'27',   label:'Governorates', sub:'Full coverage' },
    { id:'3', value:'15M+', label:'Daily Reach', sub:'Unique impressions' },
  ],
};

const DEMO_RESULTS: ResultStat[] = [
  { id:'1', label:'Billboards Installed', value:'500+', description:'Across Egypt' },
  { id:'2', label:'Daily Impressions',    value:'15M+', description:'Combined reach' },
  { id:'3', label:'Happy Clients',        value:'200+', description:'Brands served' },
];

// In-memory contacts for demo mode
const _demoContacts: ContactEntry[] = [];

// ─── Check if a real API URL is configured ────────────────────────────────────
const HAS_API = !!(import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '/api');

// ─── State interface ──────────────────────────────────────────────────────────
const DEMO_PROJECTS_CONTENT = {
  heroEyebrow:    'Projects',
  heroTitle:      'Clients first.',
  heroTitleAccent: 'Then every campaign we delivered.',
  heroParagraph:  'Browse by client. Each client card opens the projects and campaigns we executed for that brand, so repeat work with the same client is grouped together instead of being split into unrelated cards.',
  whyEyebrow:     'Why It Works',
  whyTitle:       'Why outdoor advertising works in Egypt.',
  whyTitleAccent: 'in Egypt.',
  whyParagraph1:  "Egypt's outdoor advertising market is among the fastest-growing in the MENA region — driven by rapid urbanisation, a young and mobile population, and a commuter culture that places millions of consumers in front of billboards, DOOH screens, and mall formats every single day. Unlike digital advertising, outdoor advertising in Egypt cannot be skipped, blocked, or scrolled past.",
  whyParagraph2:  'Our billboard campaigns in Cairo, DOOH campaigns across New Cairo and Sheikh Zayed, and airport advertising at Cairo International consistently outperform digital channel benchmarks on brand recall, purchase intent, and consumer trust. Across 100+ campaigns delivered in 2024–2025, the average brand recall lift was <strong>+178%</strong> — and the average campaign ROI was <strong>4.1×</strong>.',
  stat1Value: '+178%', stat1Label: 'Avg. brand recall lift',   stat1Sub: 'Across all 2025 campaigns',
  stat2Value: '4.1×',  stat2Label: 'Average campaign ROI',     stat2Sub: 'vs. media investment',
  stat3Value: '100+',  stat3Label: 'Campaigns delivered',      stat3Sub: 'In 2024–2025',
  ctaTitle:  'Ready to be our next success story?',
  ctaSubtitle: "Let's plan a campaign tailored to your audience, locations, and business goals.",
  ctaButton:  'Start Your Campaign',
};

// ─── Simulator types ──────────────────────────────────────────────────────────
export interface BillboardSize {
  id: string;
  label: string;      // e.g. "8×16 m"
  widthM?: number;
  heightM?: number;
  notes?: string;
}

export interface SimCorner { x: number; y: number }

export interface SimulatorTemplate {
  id: string;
  typeName:   string;   // billboard type (e.g. "Unipole")
  sizeLabel:  string;   // matches BillboardSize.label
  mockupUrl:  string;   // street photo URL
  // panels: array of 4-corner sets. 1 panel = single billboard, 2 panels = double decker, etc.
  panels: SimCorner[][];  // each entry is [TL, TR, BR, BL] as fractions 0..1
  // LEGACY: single corners array — auto-converted to panels on load
  corners?: SimCorner[];
  notes?: string;
}

// Helper: normalise a template so it always has panels[] populated
export function normTemplate(t: any): SimulatorTemplate {
  const panels: SimCorner[][] = Array.isArray(t.panels) && t.panels.length > 0
    ? t.panels
    : Array.isArray(t.corners) && t.corners.length === 4
      ? [t.corners]
      : [[{ x:0.15,y:0.2 },{x:0.85,y:0.2},{x:0.85,y:0.75},{x:0.15,y:0.75}]];
  return { ...t, panels };
}

export interface DesignUpload {
  id: string;
  userId:      string;
  userName:    string;
  userEmail:   string;
  userPhone?:  string;
  designUrl:   string;
  templateId:  string;
  typeName:    string;
  sizeLabel:   string;
  productId?:  string;
  productName?: string;
  status:      'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt:   string;
  notes?:      string;
}

export interface ApiState {
  locations:       any[];
  districts:       any[];
  adFormats:       AdFormatType[];
  services:        any[];
  projects:        any[];
  blogPosts:       any[];
  trustStats:      any[];
  processSteps:    ProcessStep[];
  clientBrands:    ClientBrand[];
  suppliers:       Supplier[];
  customers:       Customer[];
  siteUsers:       SiteUser[];
  contacts:        ContactEntry[];
  results:         ResultStat[];
  process:         ProcessStep[];
  settings:        any;
  homeContent:     any;
  projectsContent: any;
  about:           AboutContent;
  aboutContent:    AboutContent;
  loaded:          boolean;
  loading:         boolean;
  error:           string | null;
  usingDemo:          boolean;
  billboardSizes:     BillboardSize[];
  simulatorTemplates: SimulatorTemplate[];
  designUploads:      DesignUpload[];
  reload:             () => Promise<void>;
}

// ─── Pre-compute demo data ────────────────────────────────────────────────────
// CLIENT_BRANDS is a plain string array — convert each string to a brand object
const _demoBrands: ClientBrand[] = (CLIENT_BRANDS as any[]).map((b: any, i: number) => {
  if (typeof b === 'string') {
    return { id: String(i + 1), name: b, logoUrl: '', logo: '' };
  }
  return { id: b.id ?? String(i + 1), name: b.name ?? b, logoUrl: b.logoUrl ?? b.logo ?? '', logo: b.logo ?? '' };
});
const _demoProcess: ProcessStep[] = (PROCESS as any[]).map((p: any, i: number) => ({
  id: p.id ?? String(i + 1), step: p.step ?? (i + 1),
  title: p.title ?? '', description: p.description ?? p.desc ?? '', icon: p.icon ?? '',
}));
const _demoDistricts: any[] = [];
(LOCATIONS as any[]).forEach((loc: any, _li: number) => {
  (loc.districts ?? []).forEach((d: any, di: number) => {
    const name   = typeof d === 'string' ? d : (d.name ?? String(d));
    const nameAr = typeof d === 'object' ? (d.nameAr ?? '') : '';
    _demoDistricts.push({
      id: `${loc.id}-district-${di + 1}`,
      name,
      nameAr,
      locationId:    loc.id,      // camelCase for dashboard UI
      location_id:   loc.id,      // snake_case for API compatibility
      location_slug: loc.slug,
      cityAr:        loc.cityAr ?? '',
    });
  });
});

// ─── Store ────────────────────────────────────────────────────────────────────
export const useApiStore = create<ApiState>((set, get) => ({
  // When API is configured: start empty + loading. When demo: pre-fill.
  locations:    HAS_API ? [] : LOCATIONS   as any[],
  districts:    HAS_API ? [] : _demoDistricts,
  adFormats:    HAS_API ? [] : AD_FORMATS_DEFAULT,
  services:     HAS_API ? [] : SERVICES    as any[],
  projects:     HAS_API ? [] : PROJECTS    as any[],
  blogPosts:    HAS_API ? [] : BLOG_POSTS  as any[],
  trustStats:   HAS_API ? [] : TRUST_STATS as any[],
  processSteps: HAS_API ? [] : _demoProcess,
  process:      HAS_API ? [] : _demoProcess,
  results:      HAS_API ? [] : DEMO_RESULTS,
  clientBrands: HAS_API ? [] : _demoBrands,
  suppliers:          [],
  customers:          [],
  siteUsers:          [],
  billboardSizes:     [],
  simulatorTemplates: [],
  designUploads:      [],
  contacts:     HAS_API ? [] : _demoContacts,
  settings:        HAS_API ? {} : DEMO_SETTINGS,
  homeContent:     HAS_API ? {} : DEMO_HOME,
  projectsContent: HAS_API ? {} : DEMO_PROJECTS_CONTENT,
  about:           HAS_API ? {} as AboutContent : DEMO_ABOUT,
  aboutContent:    HAS_API ? {} as AboutContent : DEMO_ABOUT,
  loaded:       !HAS_API,   // demo data is ready immediately; API data is not
  loading:      false,
  error:        null,
  usingDemo:    !HAS_API,

  reload: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });

    try {
      const [locs, dists, fmts, svcs, projs, blog, stats, steps, brands, setts, hc, ac] =
        await Promise.all([
          locationsApi.all(),
          districtsApi.all(),
          adFormatsApi.all(),
          servicesApi.all(),
          projectsApi.all(),
          blogApi.all(),
          trustStatsApi.all(),
          processStepsApi.all(),
          clientBrandsApi.all(),
          settingsApi.all(),
          settingsApi.homeContent(),
          settingsApi.aboutContent(),
        ]);

      const normFmts: AdFormatType[] = (fmts.data || []).map((f: any) => ({ ...f, label: f.label ?? f.name }));

      set({
        locations:       locs.data   || [],
        districts:       dists.data  || [],
        adFormats:       normFmts.length ? normFmts : AD_FORMATS_DEFAULT,
        services:        svcs.data   || [],
        projects:        projs.data  || [],
        blogPosts:       blog.data   || [],
        trustStats:      stats.data  || [],
        processSteps:    steps.data  || [],
        process:         steps.data  || [],
        clientBrands:    (brands.data || []).map((b: any) => ({ ...b, logoUrl: b.logoUrl ?? b.logo })),
        settings:        setts.data  || DEMO_SETTINGS,
        homeContent:     hc.data     || DEMO_HOME,
        projectsContent: DEMO_PROJECTS_CONTENT,
        about:           ac.data     || DEMO_ABOUT,
        aboutContent:    ac.data     || DEMO_ABOUT,
        loaded:    true,
        loading:   false,
        usingDemo: false,
      });
    } catch (_e) {
      console.info('[HORIZON] API unreachable — using demo data');

      const districts: any[] = [];
      (LOCATIONS as any[]).forEach((loc: any) => {
        (loc.districts ?? []).forEach((d: any, di: number) => {
          const name   = typeof d === 'string' ? d : (d.name ?? String(d));
          const nameAr = typeof d === 'object' ? (d.nameAr ?? '') : '';
          districts.push({
            id: `${loc.id}-district-${di + 1}`,
            name,
            nameAr,
            locationId:    loc.id,
            location_id:   loc.id,
            location_slug: loc.slug,
            cityAr:        loc.cityAr ?? '',
          });
        });
      });

      const normBrands: ClientBrand[] = (CLIENT_BRANDS as any[]).map((b: any, i: number) => {
        if (typeof b === 'string') {
          return { id: String(i + 1), name: b, logoUrl: '', logo: '' };
        }
        return { id: b.id ?? String(i + 1), name: b.name ?? b, logoUrl: b.logoUrl ?? b.logo ?? '', logo: b.logo ?? '' };
      });

      const normProcess: ProcessStep[] = (PROCESS as any[]).map((p: any, i: number) => ({
        id: p.id ?? String(i + 1),
        step: p.step ?? (i + 1),
        title: p.title ?? '',
        description: p.description ?? p.desc ?? '',
        icon: p.icon ?? '',
      }));

      set({
        locations:    LOCATIONS as any[],
        districts,
        adFormats:    AD_FORMATS_DEFAULT,
        services:     SERVICES as any[],
        projects:     PROJECTS as any[],
        blogPosts:    BLOG_POSTS as any[],
        trustStats:   TRUST_STATS as any[],
        processSteps: normProcess,
        process:      normProcess,
        results:      DEMO_RESULTS,
        clientBrands: normBrands,
        suppliers:    [],
        customers:    [],
        siteUsers:    [],
        contacts:     _demoContacts,
        settings:     DEMO_SETTINGS,
        homeContent:  DEMO_HOME,
        about:        DEMO_ABOUT,
        aboutContent: DEMO_ABOUT,
        loaded:    true,
        loading:   false,
        usingDemo: true,
        error:     null,
      });
    }
  },
}));

// Auto-load on first import
let _initiated = false;
useApiStore.subscribe((state) => {
  if (!_initiated && !state.loaded && !state.loading) {
    _initiated = true;
    useApiStore.getState().reload();
  }
});
setTimeout(() => {
  const s = useApiStore.getState();
  if (!s.loaded && !s.loading) { _initiated = true; s.reload(); }
  // Also reload if we have API configured but are showing demo data
  if (HAS_API && !s.loading) { _initiated = true; s.reload(); }
}, 0);