/**
 * dataStore.ts — API-aware mutation shims.
 *
 * All writes go to the real API when HAS_API=true, then reload the store.
 * In demo/preview mode, writes update in-memory Zustand + localStorage.
 */
export { useApiStore as useStore } from './apiStore';
export { useApiStore } from './apiStore';
export { HAS_API } from './apiStore';

// Re-export types
export type {
  ApiState, AdFormatType, ClientBrand, Supplier, Customer, SiteUser,
  WhyChooseItem, AboutStat, AboutContent, ContactEntry, ProcessStep, ResultStat,
  BillboardSize, SimulatorTemplate, SimCorner, SimPanel, DesignUpload,
  LocationsPageContent, ContactPageContent,
} from './apiStore';

// Product type used by AdminBillboards
export interface Product {
  id: string; code: string; title?: string; slug?: string;
  locationId?: string; citySlug?: string; district?: string;
  format?: string; width?: number; height?: number; price?: number;
  availability?: string; illuminated?: boolean; lat?: number; lng?: number;
  images?: string[]; description?: string; [key: string]: any;
}

import { useApiStore } from './apiStore';
import type { BillboardSize, SimulatorTemplate, DesignUpload } from './apiStore';
export const getState = () => useApiStore.getState();

// ─── API imports ──────────────────────────────────────────────────────────────
import {
  locationsApi, districtsApi, servicesApi, projectsApi,
  blogApi, adFormatsApi, clientBrandsApi, trustStatsApi,
  processStepsApi, settingsApi, contactsApi, billboardsApi,
  suppliersApi, customersApi, usersApi,
  billboardSizesApi, simulatorTemplatesApi, designUploadsApi,
} from '@/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const _envApiUrl  = import.meta.env.VITE_API_URL as string | undefined;
const _isRealHost = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.startsWith('192.168.');
const HAS_API_LOCAL = !!(_envApiUrl && _envApiUrl.trim() && _envApiUrl !== '/api') || _isRealHost;

const uid    = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const s      = () => useApiStore.getState();
const set    = useApiStore.setState;
const reload = () => useApiStore.getState().reload();

/** Call apiCall() if on a real server, else fallback() */
async function apiOrLocal<T>(
  apiCall: () => Promise<T>,
  fallback: () => void,
): Promise<T | void> {
  if (HAS_API_LOCAL) {
    try {
      const res = await apiCall();
      await reload();
      return res;
    } catch (err) {
      console.error('[dataStore] API call failed:', err);
      throw err;
    }
  } else {
    fallback();
  }
}

// ─── localStorage helpers (simulator data persistence) ───────────────────────
const LS_SIZES     = 'horizon_billboard_sizes';
const LS_TEMPLATES = 'horizon_simulator_templates';
const LS_UPLOADS   = 'horizon_design_uploads';

function lsGet<T>(key: string, fallback: T[]): T[] {
  try { const r = localStorage.getItem(key); if (!r) return fallback; const p = JSON.parse(r); return Array.isArray(p) ? p : fallback; } catch { return fallback; }
}
function lsSet(key: string, data: any[]) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

// Always seed simulator data from localStorage on boot (works in preview + real server before API loads)
setTimeout(() => {
  const savedSizes     = lsGet<BillboardSize>(LS_SIZES, []);
  const savedTemplates = lsGet<SimulatorTemplate>(LS_TEMPLATES, []);
  const savedUploads   = lsGet<DesignUpload>(LS_UPLOADS, []);
  const cur = s();
  if (!( cur as any).simulatorTemplates?.length && (savedSizes.length || savedTemplates.length || savedUploads.length)) {
    set(() => ({
      billboardSizes:     savedSizes,
      simulatorTemplates: savedTemplates,
      designUploads:      savedUploads,
    }));
  }
}, 200);

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsStore = {
  update: (data: any) => apiOrLocal(() => settingsApi.update(data), () => set(() => ({ settings: data }))),
};

// ─── Home content ─────────────────────────────────────────────────────────────
export const homeStore = {
  update: (data: any) => apiOrLocal(() => settingsApi.updateHomeContent(data), () => set(() => ({ homeContent: data }))),
};

// ─── Locations page content ───────────────────────────────────────────────────
export const locationsContentStore = {
  update: (data: any) => apiOrLocal(
    () => settingsApi.update({ locations_page_content: JSON.stringify(data) }),
    () => set(() => ({ locationsContent: data }))
  ),
};

// ─── Contact page content ─────────────────────────────────────────────────────
export const contactContentStore = {
  update: (data: any) => apiOrLocal(
    () => settingsApi.update({ contact_page_content: JSON.stringify(data) }),
    () => set(() => ({ contactContent: data }))
  ),
};

// ─── Projects content ─────────────────────────────────────────────────────────
export const projectsContentStore = {
  update: (data: any) => apiOrLocal(
    () => settingsApi.update({ projects_page_content: JSON.stringify(data) }),
    () => set(() => ({ projectsContent: data }))
  ),
};

// ─── About content ────────────────────────────────────────────────────────────
export const aboutStore = {
  update: (data: any) => apiOrLocal(() => settingsApi.updateAboutContent(data), () => set(() => ({ about: data, aboutContent: data }))),
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationStore = {
  add:    (data: any)        => apiOrLocal(() => locationsApi.create(data),       () => set(st => ({ locations: [...st.locations, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => locationsApi.update(id, data), () => set(st => ({ locations: st.locations.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => locationsApi.remove(id),         () => set(st => ({ locations: st.locations.filter((x: any) => x.id !== id) }))),
};

// ─── Districts ────────────────────────────────────────────────────────────────
export const districtStore = {
  add:    (data: any)        => apiOrLocal(() => districtsApi.create(data),       () => set(st => ({ districts: [...st.districts, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => districtsApi.update(id, data), () => set(st => ({ districts: st.districts.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => districtsApi.remove(id),         () => set(st => ({ districts: st.districts.filter((x: any) => x.id !== id) }))),
};

// ─── Billboards ───────────────────────────────────────────────────────────────
export const billboardStore = {
  add:    (data: FormData | any) => apiOrLocal(
    () => billboardsApi.create(data instanceof FormData ? data : (() => { const fd = new FormData(); Object.entries(data).forEach(([k,v]) => fd.append(k, String(v))); return fd; })()),
    () => set(st => {
      const loc = st.locations.find((l: any) => l.id === data.locationId);
      if (!loc) return {};
      const newBb = { ...data, id: uid() };
      return { locations: st.locations.map((l: any) => l.id === data.locationId ? { ...l, products: [...(l.products??[]), newBb] } : l) };
    })
  ),
  update: (id: any, data: FormData | any) => apiOrLocal(
    () => billboardsApi.update(id, data instanceof FormData ? data : (() => { const fd = new FormData(); Object.entries(data).forEach(([k,v]) => fd.append(k, String(v))); return fd; })()),
    () => set(st => ({ locations: st.locations.map((l: any) => ({ ...l, products: (l.products??[]).map((p: any) => p.id === id ? { ...p, ...data } : p) })) }))
  ),
  remove: (id: any) => apiOrLocal(
    () => billboardsApi.remove(id),
    () => set(st => ({ locations: st.locations.map((l: any) => ({ ...l, products: (l.products??[]).filter((p: any) => p.id !== id) })) }))
  ),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const serviceStore = {
  add:    (data: any)        => apiOrLocal(() => servicesApi.create(data),        () => set(st => ({ services: [...st.services, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => servicesApi.update(id, data),  () => set(st => ({ services: st.services.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => servicesApi.remove(id),          () => set(st => ({ services: st.services.filter((x: any) => x.id !== id) }))),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectStore = {
  add:    (data: FormData | any) => apiOrLocal(() => projectsApi.create(data instanceof FormData ? data : (() => { const fd = new FormData(); Object.entries(data).forEach(([k,v]) => fd.append(k, String(v))); return fd; })()), () => set(st => ({ projects: [...st.projects, { ...data, id: uid() }] }))),
  update: (id: any, data: FormData | any) => apiOrLocal(() => projectsApi.update(id, data instanceof FormData ? data : (() => { const fd = new FormData(); Object.entries(data).forEach(([k,v]) => fd.append(k, String(v))); return fd; })()), () => set(st => ({ projects: st.projects.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any) => apiOrLocal(() => projectsApi.remove(id), () => set(st => ({ projects: st.projects.filter((x: any) => x.id !== id) }))),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogStore = {
  add:    (data: any)        => apiOrLocal(() => blogApi.create(data),            () => set(st => ({ blogPosts: [...st.blogPosts, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => blogApi.update(id, data),      () => set(st => ({ blogPosts: st.blogPosts.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => blogApi.remove(id),              () => set(st => ({ blogPosts: st.blogPosts.filter((x: any) => x.id !== id) }))),
};

// ─── Ad Formats ───────────────────────────────────────────────────────────────
export const adFormatStore = {
  add:    (data: any)        => apiOrLocal(() => adFormatsApi.create(data),       () => set(st => ({ adFormats: [...st.adFormats, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => adFormatsApi.update(id, data), () => set(st => ({ adFormats: st.adFormats.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => adFormatsApi.remove(id),         () => set(st => ({ adFormats: st.adFormats.filter((x: any) => x.id !== id) }))),
};

// ─── Client Brands ────────────────────────────────────────────────────────────
export const brandStore = {
  add:    (data: any)        => apiOrLocal(() => clientBrandsApi.create(data),    () => set(st => ({ clientBrands: [...st.clientBrands, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => clientBrandsApi.update(id, data), () => set(st => ({ clientBrands: st.clientBrands.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => clientBrandsApi.remove(id),      () => set(st => ({ clientBrands: st.clientBrands.filter((x: any) => x.id !== id) }))),
};

// ─── Trust Stats ──────────────────────────────────────────────────────────────
export const trustStatStore = {
  add:    (data: any)        => apiOrLocal(() => trustStatsApi.create(data),      () => set(st => ({ trustStats: [...st.trustStats, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => trustStatsApi.update(id, data),() => set(st => ({ trustStats: st.trustStats.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => trustStatsApi.remove(id),        () => set(st => ({ trustStats: st.trustStats.filter((x: any) => x.id !== id) }))),
};

// ─── Process Steps ────────────────────────────────────────────────────────────
export const processStepStore = {
  add:    (data: any)        => apiOrLocal(() => processStepsApi.create(data),    () => set(st => ({ processSteps: [...st.processSteps, { ...data, id: uid() }], process: [...st.process, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => processStepsApi.update(id, data), () => set(st => ({ processSteps: st.processSteps.map((x: any) => x.id === id ? { ...x, ...data } : x), process: st.process.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any) => apiOrLocal(() => processStepsApi.remove(id), () => { set(st => ({ processSteps: st.processSteps.filter((x: any) => x.id !== id), process: st.process.filter((x: any) => x.id !== id) })); }),
};

// ─── Results ──────────────────────────────────────────────────────────────────
export const resultStore = {
  add:    (data: any) => { set(st => ({ results: [...st.results, { ...data, id: data.id ?? uid() }] })); },
  update: (id: any, data: any) => { set(st => ({ results: st.results.map((x: any) => x.id === id ? { ...x, ...data } : x) })); },
  remove: (id: any) => { set(st => ({ results: st.results.filter((x: any) => x.id !== id) })); },
  set: (data: any[]) => { set(() => ({ results: data })); },
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const supplierStore = {
  add:    (data: any)        => apiOrLocal(() => suppliersApi.create(data),       () => set(st => ({ suppliers: [...st.suppliers, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => suppliersApi.update(id, data), () => set(st => ({ suppliers: st.suppliers.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => suppliersApi.remove(id),         () => set(st => ({ suppliers: st.suppliers.filter((x: any) => x.id !== id) }))),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customerStore = {
  add:    (data: any)        => apiOrLocal(() => customersApi.create(data),       () => set(st => ({ customers: [...st.customers, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => customersApi.update(id, data), () => set(st => ({ customers: st.customers.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => customersApi.remove(id),         () => set(st => ({ customers: st.customers.filter((x: any) => x.id !== id) }))),
};

// ─── Dashboard Users ──────────────────────────────────────────────────────────
export const dashboardUserStore = {
  add:    (data: any)        => apiOrLocal(() => usersApi.create(data),           () => set(st => ({ siteUsers: [...st.siteUsers, { ...data, id: uid() }] }))),
  update: (id: any, data: any) => apiOrLocal(() => usersApi.update(id, data),     () => set(st => ({ siteUsers: st.siteUsers.map((x: any) => x.id === id ? { ...x, ...data } : x) }))),
  remove: (id: any)          => apiOrLocal(() => usersApi.remove(id),             () => set(st => ({ siteUsers: st.siteUsers.filter((x: any) => x.id !== id) }))),
};

// ─── Contact form submissions ─────────────────────────────────────────────────
import type { ContactEntry } from './apiStore';
export const contactStore = {
  add: async (data: any) => {
    const entry: ContactEntry = { ...data, id: data.id ?? Date.now(), status: 'new', created_at: new Date().toISOString(), createdAt: new Date().toISOString() };
    if (HAS_API_LOCAL) {
      try { await contactsApi.submit(data); } catch { /* ignore */ }
    }
    set(st => ({ contacts: [...st.contacts, entry] }));
  },
  update: async (id: any, data: any) => {
    if (HAS_API_LOCAL) { try { await contactsApi.update(id, data); await reload(); } catch { /* ignore */ } }
    set(st => ({ contacts: st.contacts.map((c: any) => c.id === id ? { ...c, ...data } : c) }));
  },
  remove: async (id: any) => {
    if (HAS_API_LOCAL) { try { await contactsApi.remove(id); await reload(); } catch { /* ignore */ } }
    set(st => ({ contacts: st.contacts.filter((c: any) => c.id !== id) }));
  },
  all: () => s().contacts,
};

// ─── Site users (public signups) ──────────────────────────────────────────────
import type { SiteUser } from './apiStore';
export const siteUserStore = {
  upsert: (email: string, data: Partial<SiteUser>) => {
    set(st => {
      const existing = st.siteUsers.find((u: any) => u.email === email);
      if (existing) return { siteUsers: st.siteUsers.map((u: any) => u.email === email ? { ...u, ...data, lastSeen: new Date().toISOString() } : u) };
      return { siteUsers: [...st.siteUsers, { id: uid(), email, ...data, createdAt: new Date().toISOString() }] };
    });
  },
  update: (id: any, data: any) => { set(st => ({ siteUsers: st.siteUsers.map((u: any) => u.id === id ? { ...u, ...data } : u) })); },
  remove: (id: any) => { set(st => ({ siteUsers: st.siteUsers.filter((u: any) => u.id !== id) })); },
  all: () => s().siteUsers,
};

// ─── Billboard Sizes ──────────────────────────────────────────────────────────
export const billboardSizeStore = {
  add: async (data: Omit<BillboardSize, 'id'>) => {
    const item: BillboardSize = { ...data, id: uid() };
    if (HAS_API_LOCAL) {
      try {
        const res = await billboardSizesApi.create(data);
        const saved = res.data?.data ?? res.data ?? item;
        set(st => { const u = [...(st as any).billboardSizes, saved]; lsSet(LS_SIZES, u); return { billboardSizes: u }; });
        return;
      } catch { /* fall through to local */ }
    }
    set(st => { const u = [...(st as any).billboardSizes, item]; lsSet(LS_SIZES, u); return { billboardSizes: u }; });
  },
  update: async (id: string, data: Partial<BillboardSize>) => {
    if (HAS_API_LOCAL) { try { await billboardSizesApi.update(id, data); } catch { /* ignore */ } }
    set(st => { const u = (st as any).billboardSizes.map((x: BillboardSize) => x.id === id ? { ...x, ...data } : x); lsSet(LS_SIZES, u); return { billboardSizes: u }; });
  },
  remove: async (id: string) => {
    if (HAS_API_LOCAL) { try { await billboardSizesApi.remove(id); } catch { /* ignore */ } }
    set(st => { const u = (st as any).billboardSizes.filter((x: BillboardSize) => x.id !== id); lsSet(LS_SIZES, u); return { billboardSizes: u }; });
  },
  all: () => (s() as any).billboardSizes as BillboardSize[],
};

// ─── Simulator Templates ──────────────────────────────────────────────────────
export const simulatorTemplateStore = {
  add: async (data: Omit<SimulatorTemplate, 'id'>) => {
    const item: SimulatorTemplate = { ...data, id: uid() };
    if (HAS_API_LOCAL) {
      try {
        const res = await simulatorTemplatesApi.create(data);
        const saved = res.data?.data ?? res.data ?? item;
        set(st => { const u = [...(st as any).simulatorTemplates, saved]; lsSet(LS_TEMPLATES, u); return { simulatorTemplates: u }; });
        return;
      } catch { /* fall through to local */ }
    }
    set(st => { const u = [...(st as any).simulatorTemplates, item]; lsSet(LS_TEMPLATES, u); return { simulatorTemplates: u }; });
  },
  update: async (id: string, data: Partial<SimulatorTemplate>) => {
    if (HAS_API_LOCAL) { try { await simulatorTemplatesApi.update(id, data); } catch { /* ignore */ } }
    set(st => { const u = (st as any).simulatorTemplates.map((x: SimulatorTemplate) => x.id === id ? { ...x, ...data } : x); lsSet(LS_TEMPLATES, u); return { simulatorTemplates: u }; });
  },
  remove: async (id: string) => {
    if (HAS_API_LOCAL) { try { await simulatorTemplatesApi.remove(id); } catch { /* ignore */ } }
    set(st => { const u = (st as any).simulatorTemplates.filter((x: SimulatorTemplate) => x.id !== id); lsSet(LS_TEMPLATES, u); return { simulatorTemplates: u }; });
  },
  all: () => (s() as any).simulatorTemplates as SimulatorTemplate[],
};

// ─── Design Uploads ───────────────────────────────────────────────────────────
export const designUploadStore = {
  add: async (data: Omit<DesignUpload, 'id' | 'status' | 'createdAt'>) => {
    const item: DesignUpload = { ...data, id: uid(), status: 'pending', createdAt: new Date().toISOString() };
    if (HAS_API_LOCAL) {
      try {
        const res = await designUploadsApi.create(item);
        const saved = res.data?.data ?? res.data ?? item;
        set(st => { const u = [...(st as any).designUploads, saved]; lsSet(LS_UPLOADS, u); return { designUploads: u }; });
        return item;
      } catch { /* fall through to local */ }
    }
    set(st => { const u = [...(st as any).designUploads, item]; lsSet(LS_UPLOADS, u); return { designUploads: u }; });
    return item;
  },
  update: async (id: string, data: Partial<DesignUpload>) => {
    if (HAS_API_LOCAL) { try { await designUploadsApi.update(id, data); } catch { /* ignore */ } }
    set(st => { const u = (st as any).designUploads.map((x: DesignUpload) => x.id === id ? { ...x, ...data } : x); lsSet(LS_UPLOADS, u); return { designUploads: u }; });
  },
  remove: async (id: string) => {
    if (HAS_API_LOCAL) { try { await designUploadsApi.remove(id); } catch { /* ignore */ } }
    set(st => { const u = (st as any).designUploads.filter((x: DesignUpload) => x.id !== id); lsSet(LS_UPLOADS, u); return { designUploads: u }; });
  },
  all: () => (s() as any).designUploads as DesignUpload[],
};

// ─── Misc ─────────────────────────────────────────────────────────────────────
export function resetToDefaults() { useApiStore.getState().reload(); }

export function nextBillboardCode(): string {
  const allProducts = s().locations.flatMap((l: any) => l.products ?? []);
  const codes = allProducts.map((p: any) => parseInt((p.code ?? '').replace(/\D/g, ''), 10)).filter((n: number) => !isNaN(n));
  const next = codes.length ? Math.max(...codes) + 1 : 1;
  return 'H-' + String(next).padStart(4, '0');
}

// Alias exports for backwards compatibility
export const processStore = processStepStore;
