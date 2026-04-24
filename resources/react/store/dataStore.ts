/**
 * dataStore.ts — API-AWARE SHIMS
 *
 * When VITE_API_URL is configured:
 *   - mutations call the real Laravel API
 *   - on success the store is reloaded from the API
 * When VITE_API_URL is NOT configured (demo mode):
 *   - mutations update the in-memory Zustand store only
 */
export { useApiStore as useStore } from './apiStore';
export { useApiStore } from './apiStore';

// Re-export types
export type {
  ApiState, AdFormatType, ClientBrand, Supplier, Customer,
  SiteUser, WhyChooseItem, AboutStat, AboutContent,
  ContactEntry, ProcessStep, ResultStat,
  BillboardSize, SimulatorTemplate, DesignUpload,
} from './apiStore';

// Local imports for store implementations
import type { BillboardSize, SimulatorTemplate, DesignUpload } from './apiStore';

// Product type used by AdminBillboards
export interface Product {
  id: string;
  code: string;
  title?: string;
  slug?: string;
  locationId?: string;
  citySlug?: string;
  district?: string;
  format?: string;
  width?: number;
  height?: number;
  price?: number;
  availability?: string;
  illuminated?: boolean;
  lat?: number;
  lng?: number;
  images?: string[];
  description?: string;
  [key: string]: any;
}

// Re-export getState for legacy imports
import { useApiStore } from './apiStore';
export const getState = () => useApiStore.getState();

// ─── API imports ──────────────────────────────────────────────────────────────
import {
  locationsApi, districtsApi, servicesApi, projectsApi,
  blogApi, adFormatsApi, clientBrandsApi, trustStatsApi,
  processStepsApi, settingsApi, contactsApi,
} from '@/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const _envApiUrl  = import.meta.env.VITE_API_URL as string | undefined;
const _isRealHost = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.startsWith('192.168.');
const HAS_API = !!(_envApiUrl && _envApiUrl !== '/api') || _isRealHost;
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const s    = () => useApiStore.getState();
const set  = useApiStore.setState;
const reload = () => useApiStore.getState().reload();

// Generic async-or-sync helper:
// calls apiCall() if HAS_API, then reloads; otherwise calls fallback()
async function apiOrLocal(apiCall: () => Promise<any>, fallback: () => void) {
  if (HAS_API) {
    try {
      await apiCall();
      await reload();
    } catch (err: any) {
      console.error('[dataStore] API call failed:', err?.response?.data ?? err?.message ?? err);
      throw err; // re-throw so admin pages can show toast.error
    }
  } else {
    fallback();
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsStore = {
  update: async (data: any) => {
    if (HAS_API) {
      try { await settingsApi.update(data); await reload(); } catch { /* ignore */ }
    }
    set(st => ({ settings: { ...st.settings, ...data } }));
  },
};

// ─── Home content ──────────────────────────────────────────────────────────────
export const homeStore = {
  update: async (data: any) => {
    if (HAS_API) {
      try { await settingsApi.updateHomeContent(data); await reload(); } catch { /* ignore */ }
    }
    set(st => ({ homeContent: { ...st.homeContent, ...data } }));
  },
};

// ─── Locations page content ────────────────────────────────────────────────────
export const locationsContentStore = {
  update: async (data: any) => {
    if (HAS_API) {
      try { await settingsApi.update({ locationsContent: data }); await reload(); } catch { /* ignore */ }
    }
    set(st => ({ locationsContent: { ...st.locationsContent, ...data } }));
  },
};

// ─── Contact page content ─────────────────────────────────────────────────────
export const contactContentStore = {
  update: async (data: any) => {
    if (HAS_API) {
      try { await settingsApi.update({ contactContent: data }); await reload(); } catch { /* ignore */ }
    }
    set(st => ({ contactContent: { ...st.contactContent, ...data } }));
  },
};

// ─── Projects page content ─────────────────────────────────────────────────────
export const projectsContentStore = {
  update: (data: any) => {
    set(st => ({ projectsContent: { ...st.projectsContent, ...data } }));
  },
};

// ─── About content ─────────────────────────────────────────────────────────────
export const aboutStore = {
  update: async (data: any) => {
    if (HAS_API) {
      try { await settingsApi.updateAboutContent(data); await reload(); } catch { /* ignore */ }
    }
    set(st => ({ about: { ...st.about, ...data }, aboutContent: { ...st.aboutContent, ...data } }));
  },
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationStore = {
  add: (data: any) => apiOrLocal(
    () => locationsApi.create(data),
    () => { set(st => ({ locations: [...st.locations, { ...data, id: data.id ?? uid() }] })); }
  ),
  update: (id: any, data: any) => apiOrLocal(
    () => locationsApi.update(id, data),
    () => { set(st => ({ locations: st.locations.map((l: any) => l.id === id ? { ...l, ...data } : l) })); }
  ),
  remove: (id: any) => apiOrLocal(
    () => locationsApi.remove(id),
    () => { set(st => ({ locations: st.locations.filter((l: any) => l.id !== id) })); }
  ),
};

// ─── Districts ────────────────────────────────────────────────────────────────
export const districtStore = {
  add: (data: any) => apiOrLocal(
    () => districtsApi.create(data),
    () => { set(st => ({ districts: [...st.districts, { ...data, id: data.id ?? uid() }] })); }
  ),
  update: (id: any, data: any) => apiOrLocal(
    () => districtsApi.update(id, data),
    () => { set(st => ({ districts: st.districts.map((d: any) => d.id === id ? { ...d, ...data } : d) })); }
  ),
  remove: (id: any) => apiOrLocal(
    () => districtsApi.remove(id),
    () => { set(st => ({ districts: st.districts.filter((d: any) => d.id !== id) })); }
  ),
};

// ─── Billboards (stored inside locations[].products) ──────────────────────────
// Note: AdminBillboards calls locationStore.update() for billboard CRUD via
// billboardsApi directly; billboardStore is kept for legacy callers.
export const billboardStore = {
  add: (locationId: any, data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    locationStore.update(locationId, {
      products: [...((s().locations.find((l: any) => l.id === locationId) as any)?.products ?? []), item],
    });
  },
  update: (locationId: any, billboardId: any, data: any) => {
    const loc = s().locations.find((l: any) => l.id === locationId) as any;
    if (!loc) return;
    locationStore.update(locationId, {
      products: (loc.products ?? []).map((p: any) => p.id === billboardId ? { ...p, ...data } : p),
    });
  },
  remove: (locationId: any, billboardId: any) => {
    const loc = s().locations.find((l: any) => l.id === locationId) as any;
    if (!loc) return;
    locationStore.update(locationId, {
      products: (loc.products ?? []).filter((p: any) => p.id !== billboardId),
    });
  },
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const serviceStore = {
  add:    (data: any) => apiOrLocal(() => servicesApi.create(data), () => { set(st => ({ services: [...st.services, { ...data, id: data.id ?? uid() }] })); }),
  update: (id: any, data: any) => apiOrLocal(() => servicesApi.update(id, data), () => { set(st => ({ services: st.services.map((x: any) => x.id === id ? { ...x, ...data } : x) })); }),
  remove: (id: any) => apiOrLocal(() => servicesApi.remove(id), () => { set(st => ({ services: st.services.filter((x: any) => x.id !== id) })); }),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
// Build a FormData from a plain project object so the API multipart endpoint works.
function buildProjectFormData(data: any): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v) || typeof v === 'object') {
      fd.append(k, JSON.stringify(v));
    } else {
      fd.append(k, String(v));
    }
  });
  return fd;
}

export const projectStore = {
  add:    (data: any) => apiOrLocal(() => projectsApi.create(buildProjectFormData(data)), () => { set(st => ({ projects: [...st.projects, { ...data, id: data.id ?? uid() }] })); }),
  update: (id: any, data: any) => apiOrLocal(() => projectsApi.update(id, buildProjectFormData(data)), () => { set(st => ({ projects: st.projects.map((x: any) => x.id === id ? { ...x, ...data } : x) })); }),
  remove: (id: any) => apiOrLocal(() => projectsApi.remove(id), () => { set(st => ({ projects: st.projects.filter((x: any) => x.id !== id) })); }),
};

// ─── Blog posts ───────────────────────────────────────────────────────────────
export const blogStore = {
  add:    (data: any) => apiOrLocal(() => blogApi.create(data), () => { set(st => ({ blogPosts: [...st.blogPosts, { ...data, id: data.id ?? uid() }] })); }),
  update: (id: any, data: any) => apiOrLocal(() => blogApi.update(id, data), () => { set(st => ({ blogPosts: st.blogPosts.map((x: any) => x.id === id ? { ...x, ...data } : x) })); }),
  remove: (id: any) => apiOrLocal(() => blogApi.remove(id), () => { set(st => ({ blogPosts: st.blogPosts.filter((x: any) => x.id !== id) })); }),
};

// ─── Ad Formats ───────────────────────────────────────────────────────────────
export const adFormatStore = {
  add:    (data: any) => apiOrLocal(() => adFormatsApi.create(data), () => { set(st => ({ adFormats: [...st.adFormats, { ...data, id: data.id ?? uid() }] })); }),
  update: (id: any, data: any) => apiOrLocal(() => adFormatsApi.update(id, data), () => { set(st => ({ adFormats: st.adFormats.map((x: any) => x.id === id ? { ...x, ...data } : x) })); }),
  remove: (id: any) => apiOrLocal(() => adFormatsApi.remove(id), () => { set(st => ({ adFormats: st.adFormats.filter((x: any) => x.id !== id) })); }),
};

// ─── Client brands ────────────────────────────────────────────────────────────
export const brandStore = {
  add: (data: any) => apiOrLocal(
    () => clientBrandsApi.create(data),
    () => {
      const item = { ...data, id: data.id ?? uid(), logoUrl: data.logoUrl ?? data.logo ?? '' };
      set(st => ({ clientBrands: [...st.clientBrands, item] }));
    }
  ),
  update: (id: any, data: any) => apiOrLocal(
    () => clientBrandsApi.update(id, data),
    () => {
      set(st => ({
        clientBrands: st.clientBrands.map((x: any) =>
          x.id === id ? { ...x, ...data, logoUrl: data.logoUrl ?? data.logo ?? x.logoUrl } : x
        ),
      }));
    }
  ),
  remove: (id: any) => apiOrLocal(
    () => clientBrandsApi.remove(id),
    () => { set(st => ({ clientBrands: st.clientBrands.filter((x: any) => x.id !== id) })); }
  ),
};

// ─── Trust stats ──────────────────────────────────────────────────────────────
export const trustStatStore = {
  add:    (data: any) => apiOrLocal(() => trustStatsApi.create(data), () => { set(st => ({ trustStats: [...st.trustStats, { ...data, id: data.id ?? uid() }] })); }),
  update: (id: any, data: any) => apiOrLocal(() => trustStatsApi.update(id, data), () => { set(st => ({ trustStats: st.trustStats.map((x: any) => x.id === id ? { ...x, ...data } : x) })); }),
  remove: (id: any) => apiOrLocal(() => trustStatsApi.remove(id), () => { set(st => ({ trustStats: st.trustStats.filter((x: any) => x.id !== id) })); }),
};

// ─── Process steps ────────────────────────────────────────────────────────────
export const processStore = {
  add: (...args: any[]) => {
    const data = args[0] ?? {};
    return apiOrLocal(
      () => processStepsApi.create(data),
      () => {
        const item = { ...data, id: data.id ?? uid() };
        set(st => ({ processSteps: [...st.processSteps, item], process: [...st.process, item] }));
      }
    );
  },
  update: (id: any, data: any) => apiOrLocal(
    () => processStepsApi.update(id, data),
    () => {
      set(st => ({
        processSteps: st.processSteps.map((x: any) => x.id === id ? { ...x, ...data } : x),
        process:      st.process.map((x: any)      => x.id === id ? { ...x, ...data } : x),
      }));
    }
  ),
  remove: (id: any) => apiOrLocal(
    () => processStepsApi.remove(id),
    () => {
      set(st => ({
        processSteps: st.processSteps.filter((x: any) => x.id !== id),
        process:      st.process.filter((x: any)      => x.id !== id),
      }));
    }
  ),
};

// ─── Results / stats ──────────────────────────────────────────────────────────
export const resultStore = {
  add:    (data: any) => { set(st => ({ results: [...st.results, { ...data, id: data.id ?? uid() }] })); },
  update: (id: any, data: any) => { set(st => ({ results: st.results.map((x: any) => x.id === id ? { ...x, ...data } : x) })); },
  remove: (id: any) => { set(st => ({ results: st.results.filter((x: any) => x.id !== id) })); },
  // AdminSettings calls resultStore.set(array) for bulk replace
  set: (data: any[]) => { set(() => ({ results: data })); },
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const supplierStore = {
  add:    (data: any) => { set(st => ({ suppliers: [...st.suppliers, { ...data, id: data.id ?? uid() }] })); },
  update: (id: any, data: any) => { set(st => ({ suppliers: st.suppliers.map((x: any) => x.id === id ? { ...x, ...data } : x) })); },
  remove: (id: any) => { set(st => ({ suppliers: st.suppliers.filter((x: any) => x.id !== id) })); },
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customerStore = {
  add:    (data: any) => { set(st => ({ customers: [...st.customers, { ...data, id: data.id ?? uid() }] })); },
  update: (id: any, data: any) => { set(st => ({ customers: st.customers.map((x: any) => x.id === id ? { ...x, ...data } : x) })); },
  remove: (id: any) => { set(st => ({ customers: st.customers.filter((x: any) => x.id !== id) })); },
};

// ─── Contact form submissions ─────────────────────────────────────────────────
import type { ContactEntry } from './apiStore';
export const contactStore = {
  add: async (data: any) => {
    const entry: ContactEntry = {
      ...data, id: data.id ?? Date.now(), status: 'new',
      created_at: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    if (HAS_API) {
      try {
        await contactsApi.submit(data);
        // Contacts are submitted by visitors, no reload needed
      } catch { /* ignore in demo mode */ }
    }
    set(st => ({ contacts: [...st.contacts, entry] }));
  },
  update: async (id: any, data: any) => {
    if (HAS_API) {
      try { await contactsApi.update(id, data); await reload(); } catch { /* ignore */ }
    }
    set(st => ({ contacts: st.contacts.map((c: any) => c.id === id ? { ...c, ...data } : c) }));
  },
  remove: async (id: any) => {
    if (HAS_API) {
      try { await contactsApi.remove(id); await reload(); } catch { /* ignore */ }
    }
    set(st => ({ contacts: st.contacts.filter((c: any) => c.id !== id) }));
  },
  all: () => s().contacts,
};

// ─── Site users ───────────────────────────────────────────────────────────────
import type { SiteUser } from './apiStore';
export const siteUserStore = {
  upsert: (email: string, data: Partial<SiteUser>) => {
    set(st => {
      const existing = st.siteUsers.find((u: any) => u.email === email);
      if (existing) {
        return { siteUsers: st.siteUsers.map((u: any) => u.email === email ? { ...u, ...data } : u) };
      }
      return { siteUsers: [...st.siteUsers, { id: uid(), email, ...data }] };
    });
  },
  update: (id: any, data: any) => {
    set(st => ({ siteUsers: st.siteUsers.map((u: any) => u.id === id ? { ...u, ...data } : u) }));
  },
  remove: (id: any) => {
    set(st => ({ siteUsers: st.siteUsers.filter((u: any) => u.id !== id) }));
  },
  all: () => s().siteUsers,
};

// ─── Billboard Sizes ──────────────────────────────────────────────────────────
export const billboardSizeStore = {
  add: (data: Omit<BillboardSize,'id'>) => {
    const item: BillboardSize = { ...data, id: uid() };
    set(st => ({ billboardSizes: [...(st as any).billboardSizes, item] }));
  },
  update: (id: string, data: Partial<BillboardSize>) => {
    set(st => ({ billboardSizes: (st as any).billboardSizes.map((x: BillboardSize) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: string) => {
    set(st => ({ billboardSizes: (st as any).billboardSizes.filter((x: BillboardSize) => x.id !== id) }));
  },
  all: () => (s() as any).billboardSizes as BillboardSize[],
};

// ─── Simulator Templates ──────────────────────────────────────────────────────
export const simulatorTemplateStore = {
  add: (data: Omit<SimulatorTemplate,'id'>) => {
    const item: SimulatorTemplate = { ...data, id: uid() };
    set(st => ({ simulatorTemplates: [...(st as any).simulatorTemplates, item] }));
  },
  update: (id: string, data: Partial<SimulatorTemplate>) => {
    set(st => ({ simulatorTemplates: (st as any).simulatorTemplates.map((x: SimulatorTemplate) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: string) => {
    set(st => ({ simulatorTemplates: (st as any).simulatorTemplates.filter((x: SimulatorTemplate) => x.id !== id) }));
  },
  all: () => (s() as any).simulatorTemplates as SimulatorTemplate[],
};

// ─── Design Uploads ───────────────────────────────────────────────────────────
export const designUploadStore = {
  add: (data: Omit<DesignUpload,'id'|'status'|'createdAt'>) => {
    const item: DesignUpload = {
      ...data,
      id: uid(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set(st => ({ designUploads: [...(st as any).designUploads, item] }));
    return item;
  },
  update: (id: string, data: Partial<DesignUpload>) => {
    set(st => ({ designUploads: (st as any).designUploads.map((x: DesignUpload) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: string) => {
    set(st => ({ designUploads: (st as any).designUploads.filter((x: DesignUpload) => x.id !== id) }));
  },
  all: () => (s() as any).designUploads as DesignUpload[],
};

// ─── Misc ─────────────────────────────────────────────────────────────────────
export function resetToDefaults() {
  useApiStore.getState().reload();
}

export function nextBillboardCode(): string {
  const allProducts = s().locations.flatMap((l: any) => l.products ?? []);
  const codes = allProducts
    .map((p: any) => parseInt((p.code ?? '').replace(/\D/g, ''), 10))
    .filter((n: number) => !isNaN(n));
  const next = codes.length ? Math.max(...codes) + 1 : 1;
  return 'H-' + String(next).padStart(4, '0');
}
