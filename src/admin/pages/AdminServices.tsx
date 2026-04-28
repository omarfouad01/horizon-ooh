import { useState } from 'react'
import { useStore, serviceStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, ArrayEditor, ImagePicker } from '../ui'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

function ServiceForm({ editing, onClose }: any) {
  const init = editing || { title:'', shortTitle:'', tagline:'', description:'', longDescription:'', whatIs:'', whereUsed:'', image:'', imageAlt:'', icon:'', benefits:[], process:[], titleAr:'', descriptionAr:'', longDescriptionAr:'' }
  const [f, setF]         = useState({...init})
  const [benefits, setBen] = useState<string[]>(init.benefits||[])
  const [proc, setProc]    = useState<string[]>(init.process||[])
  const set = (k:string,v:any) => setF((p:any)=>({...p,[k]:v}))
  const [saving, setSaving] = useState(false)
  const save = async (e:React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Backend 'name' field is required — map from 'title' (UI label)
    const data = { ...f, name: f.title || f.name, benefits, process: proc, slug: f.shortTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-') }
    try {
      if (editing) await serviceStore.update(editing.id, data)
      else         await serviceStore.add(data)
      toast.success(editing ? 'Service updated' : 'Service created')
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }
  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title *"       value={f.title}      onChange={(e:any)=>set('title',e.target.value)}      required/>
        <Field label="Short Title *" value={f.shortTitle} onChange={(e:any)=>set('shortTitle',e.target.value)} required/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tagline *" value={f.tagline} onChange={(e:any)=>set('tagline',e.target.value)} required/>
        <Field label="Icon (2 chars)" value={f.icon} onChange={(e:any)=>set('icon',e.target.value)} placeholder="BB"/>
      </div>
      <TA label="Short Description *" value={f.description}    onChange={(e:any)=>set('description',e.target.value)}    rows={2} required/>
      <TA label="Long Description *"  value={f.longDescription} onChange={(e:any)=>set('longDescription',e.target.value)} rows={3} required/>
      <TA label="What Is It *"        value={f.whatIs}         onChange={(e:any)=>set('whatIs',e.target.value)}          rows={3} required/>
      <TA label="Where Used *"        value={f.whereUsed}      onChange={(e:any)=>set('whereUsed',e.target.value)}       rows={2} required/>
      {/* ── Arabic Content ── */}
      <div className="pt-2 pb-1 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Arabic Content (اللغة العربية)</span><div className="flex-1 h-px bg-gray-100"/></div>
      <Field label="Arabic Title (العنوان)" value={f.titleAr||''} onChange={(e:any)=>set('titleAr',e.target.value)} dir="rtl" placeholder="مثال: لوحات إعلانية"/>
      <TA label="Arabic Short Description (الوصف المختصر)" value={f.descriptionAr||''} onChange={(e:any)=>set('descriptionAr',e.target.value)} rows={2} dir="rtl"/>
      <TA label="Arabic Long Description (الوصف التفصيلي)" value={f.longDescriptionAr||''} onChange={(e:any)=>set('longDescriptionAr',e.target.value)} rows={3} dir="rtl"/>
      <ImagePicker label="Service Image" value={f.image} altValue={f.imageAlt} onChange={(url, alt) => { set('image', url); set('imageAlt', alt) }}/>
      <ArrayEditor label="Benefits"      value={benefits} onChange={setBen}  placeholder="Add a benefit…"/>
      <ArrayEditor label="Process Steps" value={proc}     onChange={setProc} placeholder="Add a step…"/>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Save' : 'Create Service')}</Btn>
      </div>
    </form>
  )
}

export default function AdminServices() {
  const { services } = useStore()
  const [form,setForm]=useState(false); const [edit,setEdit]=useState<any>(null); const [del,setDel]=useState<any>(null)
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Services" subtitle={`${services.length} services`}
        action={<Btn onClick={()=>{setEdit(null);setForm(true)}}><Plus size={13}/>Add Service</Btn>}/>
      <Tbl><thead><tr><Th>Title</Th><Th>Tagline</Th><Th>Description</Th><Th className="w-24">Actions</Th></tr></thead>
        <tbody>
          {services.length===0&&<tr><Td colSpan={4} className="text-center py-10 text-xs text-gray-400">No services yet</Td></tr>}
          {services.map(s=>(
            <Tr key={s.id}>
              <Td><div className="font-semibold">{s.title}</div><div className="text-xs text-gray-400">{s.shortTitle}</div></Td>
              <Td className="text-xs italic text-gray-500 max-w-xs truncate">{s.tagline}</Td>
              <Td className="text-xs text-gray-500 max-w-xs truncate">{s.description}</Td>
              <Td><div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={()=>{setEdit(s);setForm(true)}}><Pencil size={13}/></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={()=>setDel(s)}><Trash2 size={13}/></button>
              </div></Td>
            </Tr>
          ))}
        </tbody>
      </Tbl>
      <Modal open={form} onClose={()=>setForm(false)} title={edit?`Edit — ${edit.title}`:'New Service'} size="xl">
        <ServiceForm editing={edit} onClose={()=>setForm(false)}/>
      </Modal>
      <Confirm open={!!del} title="Delete Service" message={`Delete "${del?.title}"?`}
        onConfirm={()=>{serviceStore.remove(del.id);toast.success('Deleted');setDel(null)}} onCancel={()=>setDel(null)}/>
    </div>
  )
}