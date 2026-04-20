/**
 * dataStore.ts — LIVE SHIMS
 * All mutations update the Zustand store (useApiStore) directly.
 * When a real Laravel backend is connected, the API calls in the
 * admin pages will take over — these shims act as the in-memory
 * fallback so the preview/demo site stays fully functional.
 */
export { useApiStore as useStore } from './apiStore';
export { useApiStore } from './apiStore';

// Re-export types
export type {
  ApiState, AdFormatType, ClientBrand, Supplier, Customer,
  SiteUser, WhyChooseItem, AboutStat, AboutContent,
  ContactEntry, ProcessStep, ResultStat,
} from './apiStore';

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

// ─── Helper ────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const s = () => useApiStore.getState();
const set = useApiStore.setState;

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsStore = {
  update: (data: any) => {
    set(st => ({ settings: { ...st.settings, ...data } }));
  },
};

// ─── Home content ──────────────────────────────────────────────────────────────
export const homeStore = {
  update: (data: any) => {
    set(st => ({ homeContent: { ...st.homeContent, ...data } }));
  },
};

// ─── About content ─────────────────────────────────────────────────────────────
export const aboutStore = {
  update: (data: any) => {
    set(st => ({ about: { ...st.about, ...data }, aboutContent: { ...st.aboutContent, ...data } }));
  },
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ locations: [...st.locations, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({
      locations: st.locations.map((l: any) => l.id === id ? { ...l, ...data } : l),
    }));
  },
  remove: (id: any) => {
    set(st => ({ locations: st.locations.filter((l: any) => l.id !== id) }));
  },
};

// ─── Districts ────────────────────────────────────────────────────────────────
export const districtStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ districts: [...st.districts, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({
      districts: st.districts.map((d: any) => d.id === id ? { ...d, ...data } : d),
    }));
  },
  remove: (id: any) => {
    set(st => ({ districts: st.districts.filter((d: any) => d.id !== id) }));
  },
};

// ─── Billboards (stored inside locations[].products) ──────────────────────────
// Note: AdminBillboards calls locationStore.update() directly for billboard CRUD.
// billboardStore is kept as a convenience alias.
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
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ services: [...st.services, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ services: st.services.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ services: st.services.filter((x: any) => x.id !== id) }));
  },
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ projects: [...st.projects, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ projects: st.projects.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ projects: st.projects.filter((x: any) => x.id !== id) }));
  },
};

// ─── Blog posts ───────────────────────────────────────────────────────────────
export const blogStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ blogPosts: [...st.blogPosts, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ blogPosts: st.blogPosts.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ blogPosts: st.blogPosts.filter((x: any) => x.id !== id) }));
  },
};

// ─── Ad Formats ───────────────────────────────────────────────────────────────
export const adFormatStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ adFormats: [...st.adFormats, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ adFormats: st.adFormats.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ adFormats: st.adFormats.filter((x: any) => x.id !== id) }));
  },
};

// ─── Client brands ────────────────────────────────────────────────────────────
export const brandStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid(), logoUrl: data.logoUrl ?? data.logo ?? '' };
    set(st => ({ clientBrands: [...st.clientBrands, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({
      clientBrands: st.clientBrands.map((x: any) =>
        x.id === id ? { ...x, ...data, logoUrl: data.logoUrl ?? data.logo ?? x.logoUrl } : x
      ),
    }));
  },
  remove: (id: any) => {
    set(st => ({ clientBrands: st.clientBrands.filter((x: any) => x.id !== id) }));
  },
};

// ─── Trust stats ──────────────────────────────────────────────────────────────
export const trustStatStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ trustStats: [...st.trustStats, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ trustStats: st.trustStats.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ trustStats: st.trustStats.filter((x: any) => x.id !== id) }));
  },
};

// ─── Process steps ────────────────────────────────────────────────────────────
export const processStore = {
  add: (...args: any[]) => {
    const data = args[0] ?? {};
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ processSteps: [...st.processSteps, item], process: [...st.process, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({
      processSteps: st.processSteps.map((x: any) => x.id === id ? { ...x, ...data } : x),
      process:      st.process.map((x: any)      => x.id === id ? { ...x, ...data } : x),
    }));
  },
  remove: (id: any) => {
    set(st => ({
      processSteps: st.processSteps.filter((x: any) => x.id !== id),
      process:      st.process.filter((x: any)      => x.id !== id),
    }));
  },
};

// ─── Results / stats ──────────────────────────────────────────────────────────
export const resultStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ results: [...st.results, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ results: st.results.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ results: st.results.filter((x: any) => x.id !== id) }));
  },
  // AdminSettings calls resultStore.set(array) for bulk replace
  set: (data: any[]) => {
    set(() => ({ results: data }));
  },
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const supplierStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ suppliers: [...st.suppliers, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ suppliers: st.suppliers.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ suppliers: st.suppliers.filter((x: any) => x.id !== id) }));
  },
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customerStore = {
  add: (data: any) => {
    const item = { ...data, id: data.id ?? uid() };
    set(st => ({ customers: [...st.customers, item] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ customers: st.customers.map((x: any) => x.id === id ? { ...x, ...data } : x) }));
  },
  remove: (id: any) => {
    set(st => ({ customers: st.customers.filter((x: any) => x.id !== id) }));
  },
};

// ─── Contact form submissions ─────────────────────────────────────────────────
import type { ContactEntry } from './apiStore';
export const contactStore = {
  add: (data: any) => {
    const entry: ContactEntry = {
      ...data,
      id: data.id ?? Date.now(),
      status: 'new',
      created_at: new Date().toISOString(),
      createdAt:  new Date().toISOString(),
    };
    set(st => ({ contacts: [...st.contacts, entry] }));
  },
  update: (id: any, data: any) => {
    set(st => ({ contacts: st.contacts.map((c: any) => c.id === id ? { ...c, ...data } : c) }));
  },
  remove: (id: any) => {
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
  return 'HOH-' + String(next).padStart(4, '0');
}
