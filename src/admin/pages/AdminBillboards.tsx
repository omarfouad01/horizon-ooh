import { useState } from 'react'
import { useStore, locationStore, type District, type Supplier } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, Sel, ArrayEditor } from '../ui'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Billboard Form ────────────────────────────────────────────────────────────
function BillboardForm({ editing, onClose }: any) {
  const { locations, districts, suppliers } = useStore()

  // Determine the owning location for this billboard (when editing)
  const owningLoc = editing
    ? locations.find((l: any) => (l.products || []).some((p: any) => p.id === editing.id))
    : null

  const [locId, setLocId] = useState<string>(owningLoc?.id || '')

  const init = editing || {
    name:'', location:'', city:'', district:'', type:'Unipole Billboard',
    size:'', visibility:'', traffic:'', image:'', lat:'', lng:'', specs:[], benefits:[],
    supplierId:'', supplierNote:''
  }
  const [f, setF]           = useState({ ...init })
  const [specs,    setSpecs]    = useState<{label:string;value:string}[]>(init.specs || [])
  const [benefits,  setBenefits]  = useState<string[]>(init.benefits || [])
  const [supplierId,setSupplierId]= useState<string>(init.supplierId || '')
  const [supplierNote,setSupplierNote]=useState<string>(init.supplierNote || '')
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))

  // Filtered districts for the selected location
  const locDistricts: District[] = locId
    ? districts.filter((d: District) => d.locationId === locId)
    : []

  // When location changes, update city and reset district
  const handleLocChange = (id: string) => {
    setLocId(id)
    const loc = locations.find((l: any) => l.id === id)
    if (loc) {
      set('city', (loc as any).city)
      set('district', '')
    }
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const targetLoc = locations.find((l: any) => l.id === locId)
    const billboard = {
      ...f,
      specs,
      benefits,
      supplierId,
      supplierNote,
      lat:  parseFloat(f.lat)  || 0,
      lng:  parseFloat(f.lng)  || 0,
      city: (targetLoc as any)?.city || f.city,
      slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      relatedSlugs: []
    }
    if (editing) {
      if (owningLoc) {
        locationStore.update(owningLoc.id, {
          products: (owningLoc.products || []).map((p: any) =>
            p.id === editing.id ? { ...billboard, id: editing.id } : p
          )
        })
      }
      toast.success('Billboard updated')
    } else {
      const loc = locations.find((l: any) => l.id === locId)
      if (!loc) { toast.error('Please select a governorate'); return }
      locationStore.update(loc.id, {
        products: [...((loc as any).products || []), { ...billboard, id: Date.now().toString(36) }]
      })
      toast.success('Billboard created')
    }
    onClose()
  }

  const addSpec    = () => setSpecs(s => [...s, { label: '', value: '' }])
  const updateSpec = (i: number, k: string, v: string) =>
    setSpecs(s => s.map((x, j) => j === i ? { ...x, [k]: v } : x))
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, j) => j !== i))

  const AD_TYPES = [
    'Unipole Billboard','Rooftop Billboard','Mega Billboard','Bridge Panel',
    'DOOH Screen','Digital Billboard','Seafront Billboard','Mall Advertising',
    'Airport Advertising','Street Furniture'
  ]

  return (
    <form onSubmit={save} className="space-y-4">
      {/* Governorate selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Governorate *
        </label>
        <select value={locId} onChange={e => handleLocChange(e.target.value)} required
          className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white w-full">
          <option value="">Select governorate…</option>
          {locations.map((l: any) => (
            <option key={l.id} value={l.id}>{l.city}</option>
          ))}
        </select>
      </div>

      <Field label="Billboard Name *" value={f.name}
        onChange={(e: any) => set('name', e.target.value)} required />
      <Field label="Full Address *" value={f.location}
        onChange={(e: any) => set('location', e.target.value)} required
        placeholder="e.g. Ring Road North, km 28 — Nasr City Direction" />

      <div className="grid grid-cols-2 gap-3">
        {/* District — dropdown from selected location's districts */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            District *
            {locDistricts.length === 0 && locId && (
              <span className="ml-2 text-orange-500 normal-case font-normal text-[10px]">
                — No districts yet. Add them in Locations → Districts tab.
              </span>
            )}
          </label>
          <select value={f.district} onChange={e => set('district', e.target.value)} required
            className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white w-full"
            disabled={!locId}>
            <option value="">{locId ? 'Select district…' : 'Select governorate first'}</option>
            {locDistricts.map((d: District) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Type — dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ad Format / Type *</label>
          <select value={f.type} onChange={e => set('type', e.target.value)} required
            className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white w-full">
            {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Size *"       value={f.size}       onChange={(e: any) => set('size', e.target.value)}       required placeholder="12m × 6m" />
        <Field label="Visibility *" value={f.visibility} onChange={(e: any) => set('visibility', e.target.value)} required placeholder="1.2km" />
        <Field label="Traffic *"    value={f.traffic}    onChange={(e: any) => set('traffic', e.target.value)}    required placeholder="420,000+ daily" />
      </div>

      <Field label="Image URL" value={f.image} onChange={(e: any) => set('image', e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude"  value={f.lat} onChange={(e: any) => set('lat', e.target.value)} placeholder="30.0722" />
        <Field label="Longitude" value={f.lng} onChange={(e: any) => set('lng', e.target.value)} placeholder="31.3987" />
      </div>

      {/* Specs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Specifications</label>
          <Btn type="button" variant="ghost" size="sm" onClick={addSpec}><Plus size={12} />Add</Btn>
        </div>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input placeholder="Label" value={s.label} onChange={e => updateSpec(i, 'label', e.target.value)}
                className="flex-1 h-8 px-3 rounded-xl border border-gray-200 text-xs outline-none focus:border-gray-400" />
              <input placeholder="Value" value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)}
                className="flex-1 h-8 px-3 rounded-xl border border-gray-200 text-xs outline-none focus:border-gray-400" />
              <button type="button" onClick={() => removeSpec(i)} className="text-gray-400 hover:text-red-500 p-1">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ArrayEditor label="Benefits" value={benefits} onChange={setBenefits} placeholder="Add a benefit…" />

      {/* Supplier */}
      <div className="border-t border-gray-100 pt-4">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Supplier</label>
        <select value={supplierId} onChange={e=>setSupplierId(e.target.value)}
          className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white w-full mb-3">
          <option value="">— No supplier assigned —</option>
          {suppliers.map((s: Supplier) => (
            <option key={s.id} value={s.id}>
              {s.name}{s.category ? ` · ${s.category}` : ''}{s.phone ? ` — ${s.phone}` : ''}
            </option>
          ))}
        </select>
        {supplierId && (() => {
          const sup = suppliers.find((s: Supplier) => s.id === supplierId)
          return sup ? (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[12px] mb-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{sup.name}</p>
                {sup.contact && <p className="text-gray-500 mt-0.5">Contact: {sup.contact}</p>}
                {sup.email   && <p className="text-gray-500">Email: <a href={`mailto:${sup.email}`} className="text-blue-600 hover:underline">{sup.email}</a></p>}
                {sup.phone   && <p className="text-gray-500">Phone: <a href={`tel:${sup.phone.replace(/\s/g,'')}`} className="text-blue-600 hover:underline">{sup.phone}</a></p>}
              </div>
            </div>
          ) : null
        })()}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Supplier Note</label>
          <textarea value={supplierNote} onChange={e=>setSupplierNote(e.target.value)} rows={2}
            placeholder="e.g. Installation date, contract ref, special terms…"
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 resize-none w-full"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing ? 'Save Changes' : 'Create Billboard'}</Btn>
      </div>
    </form>
  )
}

// ── Main list ──────────────────────────────────────────────────────────────────
export default function AdminBillboards() {
  const store = useStore()
  const { locations, districts } = store
  const allBillboards = locations.flatMap((l: any) =>
    (l.products || []).map((p: any) => ({ ...p, _locId: l.id, _locCity: l.city }))
  )

  const [form,    setForm]    = useState(false)
  const [edit,    setEdit]    = useState<any>(null)
  const [del,     setDel]     = useState<any>(null)
  const [govFilter, setGovFilter] = useState('')

  const filtered = govFilter
    ? allBillboards.filter(b => b._locId === govFilter)
    : allBillboards

  const deleteBb = (bb: any) => {
    const loc = locations.find((l: any) => l.id === bb._locId)
    if (loc) locationStore.update(loc.id, {
      products: ((loc as any).products || []).filter((p: any) => p.id !== bb.id)
    })
    toast.success('Deleted')
    setDel(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Billboards"
        subtitle={`${allBillboards.length} billboard locations across ${locations.length} governorates`}
        action={<Btn onClick={() => { setEdit(null); setForm(true) }}><Plus size={13} />Add Billboard</Btn>}
      />

      {/* Governorate filter */}
      <div className="mb-4 flex items-center gap-3">
        <select value={govFilter} onChange={e => setGovFilter(e.target.value)}
          className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white min-w-[200px]">
          <option value="">All Governorates ({allBillboards.length})</option>
          {locations.map((l: any) => {
            const cnt = (l.products || []).length
            return <option key={l.id} value={l.id}>{l.city} ({cnt})</option>
          })}
        </select>
        {govFilter && (
          <button onClick={() => setGovFilter('')} className="text-xs text-gray-400 hover:text-gray-700 font-semibold">
            Clear
          </button>
        )}
      </div>

      <Tbl>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Governorate</Th>
            <Th>District</Th>
            <Th>Type</Th>
            <Th>Size</Th>
            <Th>Supplier</Th>
            <Th className="w-24">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><Td colSpan={7} className="text-center py-10 text-xs text-gray-400">No billboards yet</Td></tr>
          )}
          {filtered.map((b: any) => (
            <Tr key={b.id}>
              <Td>
                <div className="font-semibold text-gray-900">{b.name}</div>
                <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[180px]">{b.location?.split(',')[0]}</div>
              </Td>
              <Td className="text-sm text-gray-700">{b._locCity || b.city}</Td>
              <Td><Badge color="gray">{b.district || '—'}</Badge></Td>
              <Td><Badge color="navy">{b.type}</Badge></Td>
              <Td className="font-mono text-xs">{b.size}</Td>
              <Td className="text-xs text-gray-600">
                {b.supplierId
                  ? (() => {
                      const sup = locations && (store.suppliers||[]).find((s:any) => s.id === b.supplierId)
                      return sup ? <span className="font-medium">{(sup as any).name}</span> : <span className="text-gray-400">—</span>
                    })()
                  : <span className="text-gray-400">—</span>
                }
              </Td>
              <Td>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    onClick={() => { setEdit(b); setForm(true) }}>
                    <Pencil size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => setDel(b)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Tbl>

      <Modal open={form} onClose={() => setForm(false)} title={edit ? `Edit — ${edit.name}` : 'New Billboard'} size="xl">
        <BillboardForm editing={edit} onClose={() => setForm(false)} />
      </Modal>
      <Confirm open={!!del} title="Delete Billboard" message={`Delete "${del?.name}"?`}
        onConfirm={() => deleteBb(del)} onCancel={() => setDel(null)} />
    </div>
  )
}
