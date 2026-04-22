import { useState } from 'react'
import { useStore, projectStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, Sel, ArrayEditor, ImagePicker, ImageGalleryPicker, type GalleryImage } from '../ui'
import { Plus, Pencil, Trash2, Star, X, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

function ProjectForm({ editing, onClose }: any) {
  const { clientBrands } = useStore()
  const init = editing || { title:'', client:'', clientLogo:'', clientLogoAlt:'', clientIndustry:'', clientDescription:'', clientPageDescription:'', campaignBrief:'', location:'', city:'', category:'Billboard', year:new Date().getFullYear().toString(), duration:'', tagline:'', overview:'', objective:'', execution:'', coverImage:'', coverImageAlt:'', heroImage:'', heroImageAlt:'', galleryImages:[] as GalleryImage[], results:[], tags:[], keywords:[], featured:false, titleAr:'', overviewAr:'', objectiveAr:'', executionAr:'', taglineAr:'' }
  const [f,setF]           = useState({...init})
  const [results,setRes]   = useState<any[]>(init.results||[])
  const [tags,setTags]     = useState<string[]>(init.tags||[])
  // Gallery stores {url, alt} objects
  const rawGallery = (init.galleryImages || []) as any[]
  const [galleryImages,setGalleryImages] = useState<GalleryImage[]>(
    rawGallery.map((g: any) => typeof g === 'string' ? { url: g, alt: '' } : g)
  )
  const set = (k:string,v:any) => setF((p:any)=>({...p,[k]:v}))
  const save = (e:React.FormEvent) => {
    e.preventDefault()
    const data = { ...f, results, tags, galleryImages, slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'), heroImage: f.heroImage || f.coverImage }
    if (editing) projectStore.update(editing.id, data)
    else         projectStore.add(data)
    toast.success(editing?'Updated':'Created'); onClose()
  }
  const addResult=()=>setRes(r=>[...r,{metric:'',value:'',description:''}])
  const updateResult=(i:number,k:string,v:string)=>setRes(r=>r.map((x:any,j:number)=>j===i?{...x,[k]:v}:x))
  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title *"  value={f.title}  onChange={(e:any)=>set('title',e.target.value)}  required/>
        {/* ── Brand dropdown sourced from Settings → Brands ── */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Client Brand *</label>
          <div className="relative">
            <select
              required
              value={f.client}
              onChange={(e: any) => {
                const selected = clientBrands.find(b => b.name === e.target.value)
                set('client', e.target.value)
                if (selected) {
                  set('clientLogo', selected.logoUrl || (selected as any).logo || '')
                  set('clientIndustry', selected.industry || f.clientIndustry)
                  // Auto-import description from brand if not already filled
                  if (selected.description) set('clientDescription', selected.description)
                }
              }}
              className="w-full h-9 pl-3 pr-8 rounded-xl border border-gray-200 text-[13px] text-gray-800 bg-white outline-none focus:border-[#D90429] appearance-none"
            >
              <option value="">— Select a brand —</option>
              {clientBrands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          {/* Logo preview */}
          {f.clientLogo && (
            <div className="mt-2 flex items-center gap-2">
              <img src={f.clientLogo} alt={f.client} style={{ height: 28, width: 'auto', objectFit: 'contain', maxWidth: 100 }} className="opacity-80"/>
              <span className="text-[10px] text-gray-400">Logo auto-imported from Brands</span>
            </div>
          )}
          {!f.clientLogo && f.client && (
            <p className="mt-1.5 text-[10px] text-amber-500">No logo set for this brand — add one in Settings → Brands.</p>
          )}
          {clientBrands.length === 0 && (
            <p className="mt-1.5 text-[10px] text-gray-400">No brands yet — add them in <strong>Settings → Brands</strong> first.</p>
          )}
        </div>
      </div>
      <Field label="Client Industry" value={f.clientIndustry} onChange={(e:any)=>set('clientIndustry',e.target.value)} placeholder="Real Estate, FMCG, Retail..."/>
      <TA label="Client Description" value={f.clientDescription} onChange={(e:any)=>set('clientDescription',e.target.value)} />
      <TA label="Client Page Description" value={f.clientPageDescription} onChange={(e:any)=>set('clientPageDescription',e.target.value)} />
      <TA label="Campaign Brief" value={f.campaignBrief} onChange={(e:any)=>set('campaignBrief',e.target.value)} />
      <div className="grid grid-cols-3 gap-3">
        <Sel label="Category" value={f.category} onChange={(e:any)=>set('category',e.target.value)}>
          {['Billboard','DOOH','Mall','Airport'].map(c=><option key={c}>{c}</option>)}
        </Sel>
        <Field label="Location" value={f.location} onChange={(e:any)=>set('location',e.target.value)}/>
        <Field label="Duration"  value={f.duration}  onChange={(e:any)=>set('duration',e.target.value)}  placeholder="6 weeks"/>
      </div>
      <Field label="Tagline" value={f.tagline} onChange={(e:any)=>set('tagline',e.target.value)}/>
      <TA label="Overview *"   value={f.overview}   onChange={(e:any)=>set('overview',e.target.value)}   required/>
      <TA label="Objective *"  value={f.objective}  onChange={(e:any)=>set('objective',e.target.value)}  required/>
      <TA label="Execution *"  value={f.execution}  onChange={(e:any)=>set('execution',e.target.value)}  required/>
      {/* ── Arabic Content ── */}
      <div className="pt-2 pb-1 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Arabic Content (اللغة العربية)</span><div className="flex-1 h-px bg-gray-100"/></div>
      <Field label="Arabic Title (العنوان)" value={f.titleAr||''} onChange={(e:any)=>set('titleAr',e.target.value)} dir="rtl" placeholder="مثال: حملة الإعلانات الخارجية"/>
      <Field label="Arabic Tagline (الشعار)" value={f.taglineAr||''} onChange={(e:any)=>set('taglineAr',e.target.value)} dir="rtl"/>
      <TA label="Arabic Overview (نظرة عامة)" value={f.overviewAr||''} onChange={(e:any)=>set('overviewAr',e.target.value)} rows={3} dir="rtl"/>
      <TA label="Arabic Objective (الهدف)" value={f.objectiveAr||''} onChange={(e:any)=>set('objectiveAr',e.target.value)} rows={2} dir="rtl"/>
      <TA label="Arabic Execution (التنفيذ)" value={f.executionAr||''} onChange={(e:any)=>set('executionAr',e.target.value)} rows={2} dir="rtl"/>
      <div className="grid grid-cols-2 gap-3 items-start">
        <ImagePicker label="Cover Image" value={f.coverImage} altValue={f.coverImageAlt} onChange={(url, alt) => { set('coverImage', url); set('coverImageAlt', alt) }}/>
        <ImagePicker label="Hero Image (optional)" value={f.heroImage} altValue={f.heroImageAlt} onChange={(url, alt) => { set('heroImage', url); set('heroImageAlt', alt) }}/>
      </div>
      <ImageGalleryPicker label="Gallery Images" value={galleryImages} onChange={setGalleryImages}/>
      <ArrayEditor label="Tags" value={tags} onChange={setTags} placeholder="e.g. Billboard, Cairo"/>
      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Campaign Results</label>
          <Btn type="button" variant="ghost" size="sm" onClick={addResult}><Plus size={12}/>Add</Btn>
        </div>
        <div className="space-y-2">
          {results.map((r:any,i:number)=>(
            <div key={i} className="grid grid-cols-3 gap-2 items-center bg-gray-50 rounded-xl p-3">
              <input placeholder="Metric"      value={r.metric}      onChange={e=>updateResult(i,'metric',e.target.value)}      className="h-8 px-2.5 rounded-xl border border-gray-200 text-xs outline-none"/>
              <input placeholder="Value"       value={r.value}       onChange={e=>updateResult(i,'value',e.target.value)}       className="h-8 px-2.5 rounded-xl border border-gray-200 text-xs outline-none"/>
              <div className="flex gap-1">
                <input placeholder="Description" value={r.description} onChange={e=>updateResult(i,'description',e.target.value)} className="flex-1 h-8 px-2.5 rounded-xl border border-gray-200 text-xs outline-none"/>
                <button type="button" onClick={()=>setRes(r=>r.filter((_:any,j:number)=>j!==i))} className="text-gray-400 hover:text-red-500"><X size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Year" value={f.year} onChange={(e:any)=>set('year',e.target.value)}/>
        <Sel label="Featured" value={f.featured?'1':'0'} onChange={(e:any)=>set('featured',e.target.value==='1')}>
          <option value="0">Not Featured</option><option value="1">Featured</option>
        </Sel>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing?'Save':'Create Project'}</Btn>
      </div>
    </form>
  )
}

export default function AdminProjects() {
  const { projects, clientBrands } = useStore()
  const [form,setForm]=useState(false); const [edit,setEdit]=useState<any>(null); const [del,setDel]=useState<any>(null)
  // Helper: find logo for a project's client from the brands store
  const logoFor = (clientName: string) => clientBrands.find(b => b.name === clientName)?.logoUrl || ''
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Projects" subtitle={`${projects.length} case studies`}
        action={<Btn onClick={()=>{setEdit(null);setForm(true)}}><Plus size={13}/>Add Project</Btn>}/>
      <Tbl><thead><tr><Th>Title</Th><Th>Client</Th><Th>Category</Th><Th>Year</Th><Th>Featured</Th><Th className="w-24">Actions</Th></tr></thead>
        <tbody>
          {projects.map(p=>(
            <Tr key={p.id}>
              <Td><div className="font-semibold">{p.title}</div><div className="text-xs text-gray-400">{p.location}</div></Td>
              <Td>
                <div className="flex items-center gap-2">
                  {logoFor(p.client) ? (
                    <img src={logoFor(p.client)} alt={p.client} style={{ height: 24, width: 'auto', objectFit: 'contain', maxWidth: 56, flexShrink: 0 }}/>
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-gray-400">{p.client?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-[13px] text-gray-700">{p.client}</span>
                </div>
              </Td>
              <Td><Badge color="blue">{p.category}</Badge></Td>
              <Td className="text-xs text-gray-500">{p.year}</Td>
              <Td>{p.featured&&<Star size={13} className="text-yellow-400 fill-yellow-400"/>}</Td>
              <Td><div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={()=>{setEdit(p);setForm(true)}}><Pencil size={13}/></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={()=>setDel(p)}><Trash2 size={13}/></button>
              </div></Td>
            </Tr>
          ))}
        </tbody>
      </Tbl>
      <Modal open={form} onClose={()=>setForm(false)} title={edit?`Edit — ${edit.title}`:'New Project'} size="xl">
        <ProjectForm editing={edit} onClose={()=>setForm(false)}/>
      </Modal>
      <Confirm open={!!del} title="Delete Project" message={`Delete "${del?.title}"?`}
        onConfirm={()=>{projectStore.remove(del.id);toast.success('Deleted');setDel(null)}} onCancel={()=>setDel(null)}/>
    </div>
  )
}
