import { useState } from 'react'
import { useStore, customerStore, type Customer } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA } from '../ui'
import { Plus, Trash2, Pencil, X, Search, User, Phone, Mail, Building2 } from 'lucide-react'

function CustomerModal({ open, customer, onClose }: { open:boolean; customer:Customer|null; onClose:()=>void }) {
  const empty = { name:'', company:'', email:'', phone:'', industry:'', notes:'' }
  const [f, setF] = useState<Omit<Customer,'id'|'createdAt'>>(customer ? { ...customer } : empty)
  if (!open) return null
  const p = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setF(x=>({...x,[k]:e.target.value}))
  const submit = () => {
    if (!f.name.trim()) return
    if (customer) customerStore.update(customer.id, f)
    else          customerStore.add(f)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.55)'}}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-[15px] font-bold text-gray-900">{customer ? 'Edit Customer' : 'Add Customer'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name *"    value={f.name}     onChange={p('name')}     placeholder="e.g. Ahmed Yasser"/>
            <Field label="Company"        value={f.company}  onChange={p('company')}  placeholder="Company name"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"          value={f.email}    onChange={p('email')}    placeholder="client@company.com"/>
            <Field label="Phone"          value={f.phone}    onChange={p('phone')}    placeholder="+20 1X XXXX XXXX"/>
          </div>
          <Field label="Industry / Sector" value={f.industry} onChange={p('industry')} placeholder="e.g. FMCG, Automotive, Real Estate…"/>
          <TA    label="Notes"             value={f.notes}    onChange={p('notes')}    rows={4} placeholder="Campaign history, preferences, follow-up dates…"/>
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          <Btn onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Btn>
          <Btn onClick={submit}>{customer ? 'Save Changes' : 'Add Customer'}</Btn>
        </div>
      </div>
    </div>
  )
}

export default function AdminCustomers() {
  const store = useStore()
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState<{open:boolean;customer:Customer|null}>({open:false,customer:null})
  const [delId,   setDelId]   = useState<string|null>(null)

  const filtered = store.customers.filter(c => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Customers"
        subtitle={`${store.customers.length} customer${store.customers.length!==1?'s':''} in your CRM`}
        action={<Btn onClick={()=>setModal({open:true,customer:null})} className="flex items-center gap-2"><Plus size={14}/>Add Customer</Btn>}
      />
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, company, or email…"
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-gray-400 bg-white"/>
      </div>
      {filtered.length===0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4"><User size={28} className="text-gray-300"/></div>
          <p className="text-[15px] font-semibold text-gray-400">{store.customers.length===0?'No customers yet':'No results'}</p>
          {store.customers.length===0 && <Btn onClick={()=>setModal({open:true,customer:null})} className="mt-5 mx-auto flex items-center gap-2"><Plus size={14}/>Add Customer</Btn>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c=>(
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 group shadow-sm" style={{boxShadow:'0 1px 4px rgba(11,15,26,0.06)'}}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(11,15,26,0.06)'}}>
                    <User size={18} className="text-gray-500"/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">{c.name}</p>
                    {c.company && <p className="text-[11px] text-gray-400 mt-0.5 truncate flex items-center gap-1"><Building2 size={9}/>{c.company}</p>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>setModal({open:true,customer:c})} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={13}/></button>
                  <button onClick={()=>{ if(delId===c.id){customerStore.remove(c.id);setDelId(null)} else setDelId(c.id) }}
                    className={`p-1.5 rounded-lg transition-colors ${delId===c.id?'bg-red-500 text-white':'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}><Trash2 size={13}/></button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {c.phone && <div className="flex items-center gap-2 text-[12px] text-gray-600"><Phone size={11} className="text-gray-400 flex-shrink-0"/><a href={`tel:${c.phone.replace(/\s/g,'')}`} className="truncate hover:text-gray-900">{c.phone}</a></div>}
                {c.email && <div className="flex items-center gap-2 text-[12px] text-gray-600"><Mail size={11} className="text-gray-400 flex-shrink-0"/><a href={`mailto:${c.email}`} className="truncate hover:text-gray-900">{c.email}</a></div>}
                {c.industry && <p className="text-[11px] text-gray-400 tracking-wider uppercase">{c.industry}</p>}
              </div>
              {c.notes && <p className="text-[12px] text-gray-500 leading-[1.65] line-clamp-2 border-t border-gray-50 pt-2">{c.notes}</p>}
              {delId===c.id && <p className="text-[11px] text-red-500 font-semibold bg-red-50 rounded-lg px-3 py-2">Click 🗑 again to confirm deletion</p>}
            </div>
          ))}
        </div>
      )}
      <CustomerModal open={modal.open} customer={modal.customer} onClose={()=>setModal({open:false,customer:null})}/>
    </div>
  )
}
