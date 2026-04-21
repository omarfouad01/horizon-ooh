import { useState } from 'react'
import { useStore, supplierStore, type Supplier } from '@/store/dataStore'
import { Btn, Field, TA, PageHeader } from '../ui'
import { Plus, Trash2, Pencil, X, Search, Building2, Phone, Mail, Tag, FileText } from 'lucide-react'

// ── Modal ──────────────────────────────────────────────────────────────────────
function SupplierModal({ open, supplier, onClose }: { open:boolean; supplier:Supplier|null; onClose:()=>void }) {
  const empty: Omit<Supplier,'id'> = { name:'', contact:'', email:'', phone:'', description:'', category:'' }
  const [form, setForm] = useState<Omit<Supplier,'id'>>(supplier ? { ...supplier } : empty)

  if (!open) return null

  function p(key: keyof Omit<Supplier,'id'>) {
    return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function submit() {
    if (!form.name.trim()) return
    if (supplier) supplierStore.update(supplier.id, form)
    else          supplierStore.add(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.55)'}}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-[15px] font-bold text-gray-900">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Field label="Company Name *" value={form.name} onChange={p('name')} placeholder="e.g. Al Nile Print Co."/>
          <Field label="Category / Type" value={form.category} onChange={p('category')} placeholder="e.g. Printing, Installation, Electrical…"/>
          <Field label="Contact Person" value={form.contact} onChange={p('contact')} placeholder="Full name of main contact"/>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={form.email} onChange={p('email')} placeholder="contact@company.com"/>
            <Field label="Phone" value={form.phone} onChange={p('phone')} placeholder="+20 1X XXXX XXXX"/>
          </div>
          <TA    label="Description / Notes" value={form.description} onChange={p('description')} rows={3} placeholder="Services provided, terms, special notes…"/>
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          <Btn onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Btn>
          <Btn onClick={submit}>{supplier ? 'Save Changes' : 'Add Supplier'}</Btn>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminSuppliers() {
  const store = useStore()
  const [search,   setSearch]   = useState('')
  const [catFilter,setCatFilter]= useState('All')
  const [modal,    setModal]    = useState<{ open:boolean; supplier:Supplier|null }>({ open:false, supplier:null })
  const [delId,    setDelId]    = useState<string|null>(null)

  const categories = ['All', ...Array.from(new Set(store.suppliers.map(s => s.category).filter(Boolean)))]

  const filtered = store.suppliers.filter(s => {
    const q = search.toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    const matchC = catFilter === 'All' || s.category === catFilter
    return matchQ && matchC
  })

  function confirmDelete(id: string) {
    if (delId === id) { supplierStore.remove(id); setDelId(null) }
    else setDelId(id)
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Suppliers"
        subtitle={`${store.suppliers.length} supplier${store.suppliers.length !== 1 ? 's' : ''} in your network`}
        action={
          <Btn onClick={()=>setModal({open:true,supplier:null})} className="flex items-center gap-2">
            <Plus size={14}/> Add Supplier
          </Btn>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name, contact, or category…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-gray-400 bg-white"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-shrink-0 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={()=>setCatFilter(c)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={catFilter===c ? {background:'white',color:'#0B0F1A',boxShadow:'0 1px 3px rgba(11,15,26,0.1)'} : {color:'rgba(11,15,26,0.4)'}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-gray-300"/>
          </div>
          <p className="text-[15px] font-semibold text-gray-400">
            {store.suppliers.length === 0 ? 'No suppliers yet' : 'No results found'}
          </p>
          <p className="text-[13px] text-gray-300 mt-1">
            {store.suppliers.length === 0 ? 'Add your first supplier to get started.' : 'Try a different search or category.'}
          </p>
          {store.suppliers.length === 0 && (
            <Btn onClick={()=>setModal({open:true,supplier:null})} className="mt-5 mx-auto flex items-center gap-2">
              <Plus size={14}/> Add Supplier
            </Btn>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:border-gray-200 transition-colors shadow-sm group"
               style={{boxShadow:'0 1px 4px rgba(11,15,26,0.06)'}}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(217,4,41,0.08)'}}>
                  <Building2 size={18} style={{color:'#D90429'}}/>
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">{s.name}</p>
                  {s.category && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
                      <Tag size={9}/>{s.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>setModal({open:true,supplier:s})} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={13}/></button>
                <button
                  onClick={()=>confirmDelete(s.id)}
                  className={`p-1.5 rounded-lg transition-colors ${delId===s.id ? 'bg-red-500 text-white' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                  title={delId===s.id ? 'Click again to confirm delete' : 'Delete'}
                ><Trash2 size={13}/></button>
              </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-1.5">
              {s.contact && (
                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                  <FileText size={11} className="text-gray-400 flex-shrink-0"/>
                  <span className="truncate">{s.contact}</span>
                </div>
              )}
              {s.phone && (
                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                  <Phone size={11} className="text-gray-400 flex-shrink-0"/>
                  <a href={`tel:${s.phone.replace(/\s/g,'')}`} className="truncate hover:text-gray-900 transition-colors">{s.phone}</a>
                </div>
              )}
              {s.email && (
                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                  <Mail size={11} className="text-gray-400 flex-shrink-0"/>
                  <a href={`mailto:${s.email}`} className="truncate hover:text-gray-900 transition-colors">{s.email}</a>
                </div>
              )}
            </div>

            {/* Description */}
            {s.description && (
              <p className="text-[12px] text-gray-500 leading-[1.65] line-clamp-3 border-t border-gray-50 pt-2">
                {s.description}
              </p>
            )}

            {/* Delete confirm hint */}
            {delId === s.id && (
              <p className="text-[11px] text-red-500 font-semibold bg-red-50 rounded-lg px-3 py-2">
                Click 🗑 again to confirm deletion
              </p>
            )}
          </div>
        ))}
      </div>

      <SupplierModal
        open={modal.open}
        supplier={modal.supplier}
        onClose={()=>setModal({open:false,supplier:null})}
      />
    </div>
  )
}
