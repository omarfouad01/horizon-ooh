
// ─────────────────────────────────────────────────────────────────────────────
// HORIZON OOH — Central Data Store (localStorage-backed)
// All website content is read from here. The /admin panel writes to here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  LOCATIONS, SERVICES, PROJECTS, BLOG_POSTS,
  TRUST_STATS, CLIENT_BRANDS, PROCESS, RESULTS,
  type Location, type Service, type Project, type BlogPost,
} from '../data/index'

// ── Types ────────────────────────────────────────────────────────────────────
export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  createdAt: string
}

export interface SiteSettings {
  companyName: string
  tagline: string
  email: string
  phone: string
  address: string
  whatsapp: string
  metaDescription: string
}

export interface TrustStat { id: string; value: string; label: string }
export interface ProcessStep { id: string; step: string; label: string; description: string }

export interface StoreState {
  locations:    Location[]
  services:     Service[]
  projects:     Project[]
  blogPosts:    BlogPost[]
  contacts:     Contact[]
  settings:     SiteSettings
  trustStats:   TrustStat[]
  clientBrands: string[]
  process:      ProcessStep[]
  results:      { value: string; label: string; sublabel: string }[]
}

// ── Default data (from existing static files) ────────────────────────────────
const DEFAULT_SETTINGS: SiteSettings = {
  companyName:     'HORIZON OOH',
  tagline:         "Egypt's Premier Out-of-Home Media Company",
  email:           'hello@horizonooh.com',
  phone:           '+20 2 1234 5678',
  address:         'Cairo, Egypt',
  whatsapp:        '+201234567890',
  metaDescription: "Egypt's leading outdoor advertising company. Premium billboard, DOOH, mall, and airport advertising across Cairo, Alexandria, and nationwide.",
}

const DEFAULT_TRUST_STATS: TrustStat[] = TRUST_STATS.map((s, i) => ({ id: String(i+1), ...s }))
const DEFAULT_PROCESS: ProcessStep[]   = PROCESS.map((p, i) => ({ id: String(i+1), ...p }))

function defaultState(): StoreState {
  return {
    locations:    LOCATIONS,
    services:     SERVICES,
    projects:     PROJECTS,
    blogPosts:    BLOG_POSTS,
    contacts:     [],
    settings:     DEFAULT_SETTINGS,
    trustStats:   DEFAULT_TRUST_STATS,
    clientBrands: CLIENT_BRANDS,
    process:      DEFAULT_PROCESS,
    results:      RESULTS,
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const KEY = 'horizon_store'

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<StoreState>
    const def    = defaultState()
    // Merge — use saved data where present, fall back to defaults
    return {
      locations:    parsed.locations    ?? def.locations,
      services:     parsed.services     ?? def.services,
      projects:     parsed.projects     ?? def.projects,
      blogPosts:    parsed.blogPosts    ?? def.blogPosts,
      contacts:     parsed.contacts     ?? def.contacts,
      settings:     parsed.settings     ?? def.settings,
      trustStats:   parsed.trustStats   ?? def.trustStats,
      clientBrands: parsed.clientBrands ?? def.clientBrands,
      process:      parsed.process      ?? def.process,
      results:      parsed.results      ?? def.results,
    }
  } catch {
    return defaultState()
  }
}

function save(state: StoreState): void {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

// ── Reactive store (simple pub/sub) ──────────────────────────────────────────
type Listener = () => void
const listeners = new Set<Listener>()
let _state: StoreState = load()

export function getState(): StoreState { return _state }

function setState(updater: (s: StoreState) => StoreState): void {
  _state = updater(_state)
  save(_state)
  listeners.forEach(l => l())
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetToDefaults(): void {
  _state = defaultState()
  localStorage.removeItem(KEY)
  listeners.forEach(l => l())
}

// ── React hook ────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'

export function useStore(): StoreState {
  const [state, set] = useState<StoreState>(getState)
  useEffect(() => subscribe(() => set(getState())), [])
  return state
}

// ── ID generator ──────────────────────────────────────────────────────────────
function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// ── LOCATIONS ─────────────────────────────────────────────────────────────────
export const locationStore = {
  add: (loc: Omit<Location, 'id'>) =>
    setState(s => ({ ...s, locations: [...s.locations, { ...loc, id: uid() } as Location] })),
  update: (id: string, patch: Partial<Location>) =>
    setState(s => ({ ...s, locations: s.locations.map(l => l.id === id ? { ...l, ...patch } : l) })),
  remove: (id: string) =>
    setState(s => ({ ...s, locations: s.locations.filter(l => l.id !== id) })),
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
export const serviceStore = {
  add: (svc: Omit<Service, 'id'>) =>
    setState(s => ({ ...s, services: [...s.services, { ...svc, id: uid() } as Service] })),
  update: (id: string, patch: Partial<Service>) =>
    setState(s => ({ ...s, services: s.services.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, services: s.services.filter(x => x.id !== id) })),
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
export const projectStore = {
  add: (proj: Omit<Project, 'id'>) =>
    setState(s => ({ ...s, projects: [...s.projects, { ...proj, id: uid() } as Project] })),
  update: (id: string, patch: Partial<Project>) =>
    setState(s => ({ ...s, projects: s.projects.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, projects: s.projects.filter(x => x.id !== id) })),
}

// ── BLOG POSTS ────────────────────────────────────────────────────────────────
export const blogStore = {
  add: (post: Omit<BlogPost, 'id'>) =>
    setState(s => ({ ...s, blogPosts: [...s.blogPosts, { ...post, id: uid() } as BlogPost] })),
  update: (id: string, patch: Partial<BlogPost>) =>
    setState(s => ({ ...s, blogPosts: s.blogPosts.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, blogPosts: s.blogPosts.filter(x => x.id !== id) })),
}

// ── CONTACTS ──────────────────────────────────────────────────────────────────
export const contactStore = {
  add: (c: Omit<Contact, 'id' | 'status' | 'createdAt'>) =>
    setState(s => ({ ...s, contacts: [{ ...c, id: uid(), status: 'new', createdAt: new Date().toISOString() }, ...s.contacts] })),
  update: (id: string, patch: Partial<Contact>) =>
    setState(s => ({ ...s, contacts: s.contacts.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, contacts: s.contacts.filter(x => x.id !== id) })),
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export const settingsStore = {
  update: (patch: Partial<SiteSettings>) =>
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } })),
}

// ── TRUST STATS ───────────────────────────────────────────────────────────────
export const trustStatStore = {
  add: (stat: Omit<TrustStat, 'id'>) =>
    setState(s => ({ ...s, trustStats: [...s.trustStats, { ...stat, id: uid() }] })),
  update: (id: string, patch: Partial<TrustStat>) =>
    setState(s => ({ ...s, trustStats: s.trustStats.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, trustStats: s.trustStats.filter(x => x.id !== id) })),
}

// ── CLIENT BRANDS ─────────────────────────────────────────────────────────────
export const brandStore = {
  set: (brands: string[]) => setState(s => ({ ...s, clientBrands: brands })),
}

// ── PROCESS STEPS ─────────────────────────────────────────────────────────────
export const processStore = {
  add: (step: Omit<ProcessStep, 'id'>) =>
    setState(s => ({ ...s, process: [...s.process, { ...step, id: uid() }] })),
  update: (id: string, patch: Partial<ProcessStep>) =>
    setState(s => ({ ...s, process: s.process.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, process: s.process.filter(x => x.id !== id) })),
  reorder: (steps: ProcessStep[]) => setState(s => ({ ...s, process: steps })),
}

// ── RESULTS STATS ─────────────────────────────────────────────────────────────
export const resultStore = {
  set: (results: StoreState['results']) => setState(s => ({ ...s, results })),
}
