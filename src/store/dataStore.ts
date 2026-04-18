/**
 * dataStore.ts — COMPATIBILITY SHIM
 * All data now comes from the Laravel API via useApiStore.
 * This file re-exports everything so all existing component imports still work.
 */
export { useApiStore as useStore } from './apiStore';
export { useApiStore } from './apiStore';

// Re-export types
export type {
  ApiState, AdFormatType, ClientBrand, Supplier, Customer,
  SiteUser, WhyChooseItem, AboutStat, AboutContent,
  ContactEntry, ProcessStep, ResultStat,
} from './apiStore';

// Product type (used by AdminBillboards and other pages)
export interface Product {
  id: string;
  code: string;
  title: string;
  slug: string;
  locationId: string;
  citySlug?: string;
  district?: string;
  format: string;
  width: number;
  height: number;
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

// ─── No-op store shims (accept any args to satisfy callers) ──────────────────
const noop = {
  add:    (..._args: any[]) => {},
  update: (..._args: any[]) => {},
  remove: (..._args: any[]) => {},
  set:    (..._args: any[]) => {},
};
export const locationStore   = noop;
export const districtStore   = noop;
export const billboardStore  = noop;
export const serviceStore    = noop;
export const projectStore    = noop;
export const blogStore       = noop;
export const adFormatStore   = noop;
export const brandStore      = noop;
export const supplierStore   = noop;
export const customerStore   = noop;
export const trustStatStore  = noop;
export const processStore    = noop;
export const resultStore     = noop;
export const aboutStore      = { update: (..._args: any[]) => {} };
export const settingsStore   = { update: (..._args: any[]) => {} };
export const homeStore       = { update: (..._args: any[]) => {} };

export function resetToDefaults() { /* no-op — data lives in DB */ }
export function nextBillboardCode() { return 'HOH-0001'; }

// ─── Contact form (in-memory) ─────────────────────────────────────────────────
import type { ContactEntry } from './apiStore';
const _contacts: ContactEntry[] = [];
export const contactStore = {
  add:    (c: any) => {
    const entry: ContactEntry = { ...c, id: Date.now(), status: 'new', created_at: new Date().toISOString() };
    _contacts.push(entry);
    // Also push into live store so AdminContacts can see it
    useApiStore.setState(s => ({ contacts: [...s.contacts, entry] }));
  },
  update: (id: any, data: any) => {
    const i = _contacts.findIndex(x => x.id === id);
    if (i >= 0) _contacts[i] = { ..._contacts[i], ...data };
    useApiStore.setState(s => ({ contacts: s.contacts.map(c => c.id === id ? { ...c, ...data } : c) }));
  },
  remove: (id: any) => {
    const i = _contacts.findIndex(x => x.id === id);
    if (i >= 0) _contacts.splice(i, 1);
    useApiStore.setState(s => ({ contacts: s.contacts.filter(c => c.id !== id) }));
  },
  all: () => _contacts,
};

// ─── Site user tracking ────────────────────────────────────────────────────────
import type { SiteUser } from './apiStore';
const _users: Record<string, SiteUser> = {};
export const siteUserStore = {
  upsert: (email: string, data: Partial<SiteUser>) => {
    const existing = _users[email] ?? { id: email, email };
    _users[email] = { ...existing, ...data, email, updated_at: new Date().toISOString() };
    useApiStore.setState(s => ({
      siteUsers: Object.values(_users),
    }));
  },
  update: (id: any, data: any) => {
    const key = Object.keys(_users).find(k => _users[k].id === id);
    if (key) { _users[key] = { ..._users[key], ...data }; }
  },
  remove: (id: any) => {
    const key = Object.keys(_users).find(k => _users[k].id === id);
    if (key) delete _users[key];
    useApiStore.setState(s => ({ siteUsers: s.siteUsers.filter(u => u.id !== id) }));
  },
  all: () => Object.values(_users),
};
