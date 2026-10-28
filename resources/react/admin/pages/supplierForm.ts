import type { Supplier } from '@/store/dataStore'

export const supplierFields = ['name', 'contact', 'email', 'phone', 'category', 'description', 'notes'] as const
export type SupplierField = typeof supplierFields[number]
export type SupplierForm = Record<SupplierField, string>
export type SupplierErrors = Partial<Record<SupplierField, string>>

export function toSupplierForm(supplier: Partial<Supplier> | null): SupplierForm {
  return Object.fromEntries(supplierFields.map(key => [key, String(supplier?.[key] ?? '')])) as SupplierForm
}

export function supplierPayload(form: SupplierForm, initial?: SupplierForm): Partial<SupplierForm> {
  const values = { ...form, name: form.name.trim() }
  return Object.fromEntries(supplierFields
    .filter(key => !initial || values[key] !== initial[key])
    .map(key => [key, values[key]]))
}

export function normalizeSupplierSearch(value: unknown): string {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\s+/g, ' ').trim()
}

export function matchesSupplier(supplier: Supplier, query: string, category = 'All'): boolean {
  if (category !== 'All' && String(supplier.category ?? '').trim() !== category) return false
  const q = normalizeSupplierSearch(query)
  if (!q) return true
  const haystack = supplierFields.map(key => normalizeSupplierSearch(supplier[key])).join(' ')
  if (q.split(' ').every(word => haystack.includes(word))) return true
  if (/^[+\d\s().-]+$/.test(q)) {
    const digits = q.replace(/\D/g, '')
    const phone = String(supplier.phone ?? '').replace(/\D/g, '')
    if (digits.length >= 3 && phone.includes(digits)) return true
    if (digits.length >= 4 && digits.startsWith('0') && phone.startsWith('20')) {
      return phone.slice(2).includes(digits.slice(1))
    }
  }
  return false
}

export function supplierRequestError(error: unknown, fallback: string): { message: string; fields: SupplierErrors } {
  const body = (error as any)?.response?.data
  const fields: SupplierErrors = {}
  for (const key of supplierFields) {
    const value = body?.errors?.[key]
    if (Array.isArray(value) && value.length) fields[key] = String(value[0])
    else if (typeof value === 'string') fields[key] = value
  }
  return { message: typeof body?.message === 'string' ? body.message : fallback, fields }
}
