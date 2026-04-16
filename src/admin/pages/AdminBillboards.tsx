import { useState } from 'react'
import { useStore, locationStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, Sel, ArrayEditor } from '../ui'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

function BillboardForm({ editing, locationId, onClose }: any) {
  const { locations } = useStore()
  const init = editing || { name:'', location:'', city:'', district:'', type:'Unipole Billboard', size:'', visibility:'', traffic:'', image:'', lat:'', lng:'', specs:[], benefits:[] }
  const [f, setF] = useState({...init})
  const [specs, setSpecs]       = useState<{label:string;value:string}[]>(init.specs||[])
  const [benefits, setBenefits] = useState<string[]>((init.benefits||[]))
  const [locId, setLocId]       = useState(locationId || '')
  const set = (k:string,v:any) => setF((p:any)=>({...p,[k]:v}))

  const save = (e:React.FormEvent) => {
    e.preventDefault()
    const billboard = { ...f, specs, benefits, lat: parseFloat(f.lat)||0, lng: parseFloat(f.lng)||0,
      slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      relatedSlugs: [] }
    if (editing) {
      const loc = locations.find(l => (l.products||[]).some((p:any) => p.id === editing.id))
      if (loc) locationStore.update(loc.id, { products: (loc.products||[]).map((p:any) => p.id===editing.id ? {...billboard,id:editing.id} : p) })
      toast.success('Billboard updated')
    } else {
      const loc = locations.find(l => l.id === locId)
      if (loc) locationStore.update(loc.id, { products: [...(loc.products||[]), {...billboard, id: Date.now().toString(36)}] })
      toast.success('Billboard created')
    }
    onClose()
  }
  const addSpec = () => setSpecs(s=>[...s,{label:'',value:''}])
  const updateSpec = (i:number,k:string,v:string) => setSpecs(s=>s.map((x,j)=>j===i?{...x,[k]:v}:x))

  return (
    <form onSubmit={save} className="space-y-4">
      {!editing&&<Sel label="Location (City) *" value={locId} onChange={(e:any)=>setLocId(e.target.value)} required>
        <option value="">Select location…</option>
        {locations.map(l=><option key={l.id} value={l.id}>{l.city}</option>)}
      </Sel>}
      <Field label="Name *" value={f.name} onChange={(e:any)=>set('name',e.target.value)} required/>
      <Field label="Full Address *" value={f.location} onChange={(e:any)=>set('location',e.target.value)} required/>
      <div className="grid grid-cols-3 gap-3">
        <Field label="City *"     value={f.city}     onChange={(e:any)=>set('city',e.target.value)}     required/>
        <Field label="District *" value={f.district}  onChange={(e:any)=>set('district',e.target.value)}  required/>
        <Field label="Type *"     value={f.type}     onChange={(e:any)=>set('type',e.target.value)}     required/>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Size *"       value={f.size}       onChange={(e:any)=>set('size',e.target.value)}       required placeholder="12m × 6m"/>
        <Field label="Visibility *" value={f.visibility} onChange={(e:any)=>set('visibility',e.target.value)} required placeholder="1.2km"/>
        <Field label="Traffic *"    value={f.traffic}    onChange={(e:any)=>set('traffic',e.target.value)}    required placeholder="420,000+ daily"/>
      </div>
      <Field label="Image URL" value={f.image} onChange={(e:any)=>set('image',e.target.value)}/>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude"  value={f.lat} onChange={(e:any)=>set('lat',e.target.value)} placeholder="30.0722"/>
        <Field label="Longitude" value={f.lng} onChange={(e:any)=>set('lng',e.target.value)} placeholder="31.3987"/>
      </div>
      {/* Specs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Specifications</label>
          <Btn type="button" variant="ghost" size="sm" onClick={addSpec}><Plus size={12}/>Add</Btn>
        </div>
        <div className="space-y-2">
          {specs.map((s,i)=>(
            <div key={i} className="flex gap-2 items-center">
              <input placeholder="Label" value={s.label} onChange={e=>updateSpec(i,'label',e.target.value)} className="flex-1 h-8 px-3 rounded-xl border border-gray-200 text-sm outline-none"/>
              <input placeholder="Value" value={s.value} onChange={e=>updateSpec(i,'value',e.target.value)} className="flex-1 h-8 px-3 rounded-xl border border-gray-200 text-sm outline-none"/>
              <button type="button" onClick={()=>setSpecs(s=>s.filter((_,j)=>j!==i))} className="text-gray-400 hover:text-red-500 p-1"><X size={13}/></button>
            </div>
          ))}
        </div>
      </div>
      <ArrayEditor label="Benefits" value={benefits} onChange={setBenefits} placeholder="Add a benefit…"/>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing?'Save Changes':'Create Billboard'}</Btn>
      </div>
    </form>
  )
}

export default function AdminBillboards() {
  const { locations } = useStore()
  const allBillboards = locations.flatMap(l => (l.products||[]).map((p:any)=>({...p, _locId: l.id})))
  const [form, setForm] = useState(false)
  const [edit, setEdit] = useState<any>(null)
  const [del,  setDel]  = useState<any>(null)

  const deleteBb = (bb: any) => {
    const loc = locations.find(l => l.id === bb._locId)
    if (loc) locationStore.update(loc.id, { products: (loc.products||[]).filter((p:any) => p.id !== bb.id) })
    toast.success('Deleted')
    setDel(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Billboards" subtitle={`${allBillboards.length} billboard locations`}
        action={<Btn onClick={()=>{setEdit(null);setForm(true)}}><Plus size={13}/>Add Billboard</Btn>}/>
      <Tbl>
        <thead><tr><Th>Name</Th><Th>City / District</Th><Th>Type</Th><Th>Size</Th><Th>Traffic</Th><Th className="w-24">Actions</Th></tr></thead>
        <tbody>
          {allBillboards.length===0&&<tr><Td colSpan={6} className="text-center py-10 text-xs text-gray-400">No billboards yet</Td></tr>}
          {allBillboards.map(b=>(
            <Tr key={b.id}>
              <Td><div className="font-semibold">{b.name}</div><div className="text-[11px] text-gray-400 mt-0.5">{b.location?.split(',')[0]}</div></Td>
              <Td><div className="text-sm">{b.city}</div><div className="text-xs text-gray-400">{b.district}</div></Td>
              <Td><Badge color="navy">{b.type}</Badge></Td>
              <Td className="font-mono text-xs">{b.size}</Td>
              <Td className="text-xs text-green-700 font-semibold">{(b.traffic||'').split(' ').slice(0,2).join(' ')}</Td>
              <Td><div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={()=>{setEdit(b);setForm(true)}}><Pencil size={13}/></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={()=>setDel(b)}><Trash2 size={13}/></button>
              </div></Td>
            </Tr>
          ))}
        </tbody>
      </Tbl>
      <Modal open={form} onClose={()=>setForm(false)} title={edit?`Edit — ${edit.name}`:'New Billboard'} size="xl">
        <BillboardForm editing={edit} onClose={()=>setForm(false)}/>
      </Modal>
      <Confirm open={!!del} title="Delete Billboard" message={`Delete "${del?.name}"?`}
        onConfirm={()=>deleteBb(del)} onCancel={()=>setDel(null)}/>
    </div>
  )
}
