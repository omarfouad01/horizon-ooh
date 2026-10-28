import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useStore, supplierStore, type Supplier } from '@/store/dataStore'
import { Btn, Field, TA, PageHeader } from '../ui'
import { Plus, Trash2, Pencil, X, Search, Building2, Phone, Mail, Tag, FileText, RefreshCw } from 'lucide-react'
import { matchesSupplier, supplierPayload, supplierRequestError, toSupplierForm, type SupplierErrors, type SupplierField } from './supplierForm'

function SupplierModal({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const [initial] = useState(() => toSupplierForm(supplier))
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<SupplierErrors>({})
  const [message, setMessage] = useState('')

  function change(key: SupplierField) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(current => ({ ...current, [key]: e.target.value }))
      setErrors(current => ({ ...current, [key]: undefined }))
      setMessage('')
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    if (!form.name.trim()) { setErrors({ name: 'Company name is required.' }); return }
    const payload = supplierPayload(form, supplier ? initial : undefined)
    if (supplier && Object.keys(payload).length === 0) { onClose(); return }
    setSaving(true)
    setErrors({})
    setMessage('')
    try {
      if (supplier) await supplierStore.update(supplier.id, payload)
      else await supplierStore.add(payload)
      toast.success(supplier ? 'Supplier saved' : 'Supplier added')
      onClose()
    } catch (error) {
      const result = supplierRequestError(error, 'Could not save supplier. Please try again.')
      setErrors(result.fields)
      setMessage(result.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,15,26,0.55)' }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="supplier-modal-title"
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 id="supplier-modal-title" className="text-[15px] font-bold text-gray-900">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close supplier form"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {message && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
          <Field label="Company Name *" aria-label="Company Name" required autoFocus maxLength={255}
            value={form.name} onChange={change('name')} error={errors.name} disabled={saving} placeholder="e.g. Al Nile Print Co."/>
          <Field label="Category / Type" aria-label="Category / Type" maxLength={255}
            value={form.category} onChange={change('category')} error={errors.category} disabled={saving} placeholder="e.g. Printing, Installation, Electrical"/>
          <Field label="Contact Person" aria-label="Contact Person" maxLength={255}
            value={form.contact} onChange={change('contact')} error={errors.contact} disabled={saving} placeholder="Full name of main contact"/>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Email" aria-label="Email" type="email" maxLength={255}
              value={form.email} onChange={change('email')} error={errors.email} disabled={saving} placeholder="contact@company.com"/>
            <Field label="Phone" aria-label="Phone" type="tel" maxLength={255}
              value={form.phone} onChange={change('phone')} error={errors.phone} disabled={saving} placeholder="+20 1X XXXX XXXX"/>
          </div>
          <TA label="Description" aria-label="Description" value={form.description} onChange={change('description')}
            error={errors.description} disabled={saving} rows={3} placeholder="Services provided"/>
          <TA label="Internal Notes" aria-label="Internal Notes" value={form.notes} onChange={change('notes')}
            error={errors.notes} disabled={saving} rows={3} placeholder="Terms and internal notes"/>
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          <Btn type="button" onClick={onClose} disabled={saving} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Btn>
          <Btn type="submit" loading={saving}>{saving ? 'Saving...' : supplier ? 'Save Changes' : 'Add Supplier'}</Btn>
        </div>
      </form>
    </div>
  )
}

export default function AdminSuppliers() {
  const store = useStore()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [modal, setModal] = useState<{ supplier: Supplier | null } | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const suppliers = store.suppliers.map(s => ({ ...s, id: String(s.id) }))
  const categories = ['All', ...Array.from(new Set(suppliers.map(s => String(s.category ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))]
  const filtered = suppliers.filter(s => matchesSupplier(s, search, catFilter))

  function openForm(supplier: Supplier | null) { setDelId(null); setModal({ supplier }) }
  async function confirmDelete(id: string) {
    if (deletingId) return
    if (delId !== id) { setDelId(id); return }
    setDeletingId(id)
    try {
      await supplierStore.remove(id)
      toast.success('Supplier deleted')
      setDelId(null)
    } catch (error) {
      toast.error(supplierRequestError(error, 'Could not delete supplier. Please try again.').message)
      setDelId(null)
    } finally { setDeletingId(null) }
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Suppliers"
        subtitle={`${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''} in your network`}
        action={<Btn type="button" onClick={() => openForm(null)} className="flex items-center gap-2"><Plus size={14}/> Add Supplier</Btn>}/>
      {store.error && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>Could not refresh all dashboard data. Please retry.</span>
          <Btn type="button" variant="ghost" size="sm" onClick={() => void store.reload()} disabled={store.loading}><RefreshCw size={13}/> Retry</Btn>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input aria-label="Search suppliers" value={search} onChange={e => { setSearch(e.target.value); setDelId(null) }}
            placeholder="Search name, contact, phone, email or notes..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-gray-400 bg-white"/>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-shrink-0 flex-wrap">
          {categories.map(category => (
            <button type="button" key={category} onClick={() => { setCatFilter(category); setDelId(null) }}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={catFilter === category ? { background: 'white', color: '#0B0F1A', boxShadow: '0 1px 3px rgba(11,15,26,0.1)' } : { color: 'rgba(11,15,26,0.4)' }}>
              {category}
            </button>
          ))}
        </div>
      </div>
      <p role="status" className="mb-4 text-xs text-gray-400">{store.loading && suppliers.length === 0 ? 'Loading suppliers...' : `${filtered.length} of ${suppliers.length} shown`}</p>
      {!store.loading && !store.error && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4"><Building2 size={28} className="text-gray-300"/></div>
          <p className="text-[15px] font-semibold text-gray-400">{suppliers.length === 0 ? 'No suppliers yet' : 'No results found'}</p>
          <p className="text-[13px] text-gray-300 mt-1">{suppliers.length === 0 ? 'Add your first supplier to get started.' : 'Try a different search or category.'}</p>
          {suppliers.length === 0 && <Btn type="button" onClick={() => openForm(null)} className="mt-5 mx-auto flex items-center gap-2"><Plus size={14}/> Add Supplier</Btn>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:border-gray-200 transition-colors shadow-sm group" style={{ boxShadow: '0 1px 4px rgba(11,15,26,0.06)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(217,4,41,0.08)' }}><Building2 size={18} style={{ color: '#D90429' }}/></div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">{s.name}</p>
                  {s.category && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5"><Tag size={9}/>{s.category}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button type="button" onClick={() => openForm(s)} disabled={Boolean(deletingId)} aria-label={`Edit supplier ${s.name}`} title="Edit Supplier"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={13}/></button>
                <button type="button" onClick={() => void confirmDelete(s.id)} disabled={Boolean(deletingId)} aria-label={`Delete supplier ${s.name}`}
                  className={`p-1.5 rounded-lg transition-colors ${delId === s.id ? 'bg-red-500 text-white' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                  title={delId === s.id ? 'Click again to confirm delete' : 'Delete'}><Trash2 size={13}/></button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {s.contact && <div className="flex items-center gap-2 text-[12px] text-gray-600"><FileText size={11} className="text-gray-400 flex-shrink-0"/><span className="truncate">{s.contact}</span></div>}
              {s.phone && <div className="flex items-center gap-2 text-[12px] text-gray-600"><Phone size={11} className="text-gray-400 flex-shrink-0"/><a href={`tel:${String(s.phone).replace(/\s/g, '')}`} className="truncate hover:text-gray-900 transition-colors">{s.phone}</a></div>}
              {s.email && <div className="flex items-center gap-2 text-[12px] text-gray-600"><Mail size={11} className="text-gray-400 flex-shrink-0"/><a href={`mailto:${s.email}`} className="truncate hover:text-gray-900 transition-colors">{s.email}</a></div>}
            </div>
            {s.description && <p className="text-[12px] text-gray-500 leading-[1.65] line-clamp-3 border-t border-gray-50 pt-2">{s.description}</p>}
            {s.notes && <p className="text-[12px] text-gray-500 leading-[1.65] line-clamp-3"><span className="font-semibold">Notes: </span>{s.notes}</p>}
            {delId === s.id && <p role="status" className="text-[11px] text-red-500 font-semibold bg-red-50 rounded-lg px-3 py-2">{deletingId === s.id ? 'Deleting...' : 'Click Delete again to confirm. Suppliers linked to billboards cannot be deleted.'}</p>}
          </div>
        ))}
      </div>
      {modal && <SupplierModal key={modal.supplier?.id ?? 'new'} supplier={modal.supplier} onClose={() => setModal(null)}/>}
    </div>
  )
}
