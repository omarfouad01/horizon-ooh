import { useState } from 'react'
import { useStore, locationStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, ArrayEditor } from '../ui'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

function LocationForm({ editing, onClose }: any) {
  const init = editing || { city:'', headline:'', description:'', detail:'', longDescription:'', image:'', availableFormats:[] }
  const [f, setF] = useState({ ...init })
  const [fmts, setFmts] = useState<string[]>(init.availableFormats || [])
  const set = (k: string, v: any) => setF((p:any) => ({ ...p, [k]: v }))
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...f, availableFormats: fmts, products: editing?.products || [], slug: f.city.toLowerCase().replace(/\s+/g, '-') }
    if (editing) locationStore.update(editing.id, data)
    else         locationStore.add(data)
    toast.success(editing ? 'Location updated' : 'Location created')
    onClose()
  }
  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="City *"   value={f.city}   onChange={(e:any)=>set('city',e.target.value)}   required/>
        <Field label="Detail"   value={f.detail}  onChange={(e:any)=>set('detail',e.target.value)}/>
      </div>
      <Field label="Headline *" value={f.headline} onChange={(e:any)=>set('headline',e.target.value)} required/>
      <TA    label="Short Description *" value={f.description}    onChange={(e:any)=>set('description',e.target.value)}    rows={2} required/>
      <TA    label="Long Description *"  value={f.longDescription} onChange={(e:any)=>set('longDescription',e.target.value)} rows={4} required/>
      <Field label="Image URL"  value={f.image}   onChange={(e:any)=>set('image',e.target.value)}/>
      <ArrayEditor label="Available Formats" value={fmts} onChange={setFmts} placeholder="e.g. Unipole Billboard"/>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing ? 'Save Changes' : 'Create'}</Btn>
      </div>
    </form>
  )
}

export default function AdminLocations() {
  const { locations } = useStore()
  const [form, setForm]   = useState(false)
  const [edit, setEdit]   = useState<any>(null)
  const [del,  setDel]    = useState<any>(null)
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Locations" subtitle={`${locations.length} city markets`}
        action={<Btn onClick={()=>{setEdit(null);setForm(true)}}><Plus size={13}/>Add Location</Btn>}/>
      <Tbl>
        <thead><tr><Th>City</Th><Th>Headline</Th><Th>Billboards</Th><Th>Formats</Th><Th className="w-24">Actions</Th></tr></thead>
        <tbody>
          {locations.length===0&&<tr><Td colSpan={5} className="text-center py-10 text-gray-400 text-xs">No locations yet</Td></tr>}
          {locations.map(loc=>(
            <Tr key={loc.id}>
              <Td><span className="font-semibold">{loc.city}</span></Td>
              <Td className="max-w-xs truncate text-gray-500 text-xs">{loc.headline}</Td>
              <Td><span className="font-semibold">{(loc.products||[]).length}</span></Td>
              <Td><div className="flex flex-wrap gap-1">{(loc.availableFormats||[]).slice(0,2).map((f:string)=><Badge key={f} color="gray">{f}</Badge>)}{(loc.availableFormats||[]).length>2&&<Badge color="gray">+{loc.availableFormats.length-2}</Badge>}</div></Td>
              <Td><div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={()=>{setEdit(loc);setForm(true)}}><Pencil size={13}/></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={()=>setDel(loc)}><Trash2 size={13}/></button>
              </div></Td>
            </Tr>
          ))}
        </tbody>
      </Tbl>
      <Modal open={form} onClose={()=>setForm(false)} title={edit?`Edit — ${edit.city}`:'New Location'}>
        <LocationForm editing={edit} onClose={()=>setForm(false)}/>
      </Modal>
      <Confirm open={!!del} title="Delete Location" message={`Delete "${del?.city}"? This removes all its billboards too.`}
        onConfirm={()=>{locationStore.remove(del.id);toast.success('Deleted');setDel(null)}} onCancel={()=>setDel(null)}/>
    </div>
  )
}
