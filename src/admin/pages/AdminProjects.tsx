import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStore, projectStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, Sel, ArrayEditor, ImagePicker, ImageGalleryPicker, type GalleryImage } from '../ui'
import { Plus, Pencil, Trash2, Star, X, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const NAVY = '#0B0F1A'
const RED  = '#D90429'

// ─── Inline client multi-select (uses clientBrands from store) ──────────────
function ClientMultiSelect({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const { clientBrands } = useStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropRef    = useRef<HTMLDivElement>(null)

  const reposition = () => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setDropPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width })
  }

  useEffect(() => {
    if (!open) return
    setQuery('')
    reposition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current && !triggerRef.current.contains(t) && dropRef.current && !dropRef.current.contains(t))
        setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name])

  const filtered = clientBrands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
  const logoOf = (name: string) => clientBrands.find(b => b.name === name)?.logoUrl || clientBrands.find(b => b.name === name)?.logo || ''

  const label = selected.length === 0 ? 'Select client(s)…'
    : selected.length === 1 ? selected[0]
    : `${selected.length} clients selected`

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client(s) *</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="h-9 px-3 rounded-xl border text-sm text-left flex items-center gap-2 outline-none w-full bg-white"
        style={{ borderColor: open || selected.length > 0 ? RED : 'rgba(11,15,26,0.15)', color: selected.length > 0 ? NAVY : 'rgba(11,15,26,0.38)' }}
      >
        {/* Show logo thumbnails for selected */}
        {selected.slice(0,3).map(n => logoOf(n) ? (
          <img key={n} src={logoOf(n)} alt={n} className="h-5 w-5 rounded object-contain border border-gray-100 flex-shrink-0" />
        ) : null)}
        <span className="flex-1 truncate text-sm">{label}</span>
        {selected.length > 0 && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-white rounded-full text-[9px] font-black" style={{ background: RED }}>
            {selected.length}
          </span>
        )}
        <ChevronDown size={13} className="flex-shrink-0 text-gray-400" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Show selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {selected.map(name => (
            <span key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
              {logoOf(name) && <img src={logoOf(name)} alt={name} className="h-4 w-4 rounded object-contain" />}
              {name}
              <button type="button" onClick={() => toggle(name)} className="hover:text-red-900 ml-0.5"><X size={10}/></button>
            </span>
          ))}
        </div>
      )}

      {open && createPortal(
        <div
          ref={dropRef}
          className="overflow-y-auto rounded-xl shadow-2xl"
          style={{ position:'absolute', top: dropPos.top + 4, left: dropPos.left, width: Math.max(dropPos.width, 280), zIndex:99999, background:'white', border:`1.5px solid ${RED}`, maxHeight:240 }}
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search brands…"
              className="w-full h-8 px-3 text-xs outline-none rounded-lg border border-gray-200"
              autoFocus
            />
          </div>
          {filtered.length === 0 && (
            <div className="px-4 py-4 text-xs text-gray-400">No brands found. Add brands in Client Brands section.</div>
          )}
          {filtered.map(brand => {
            const checked = selected.includes(brand.name)
            const logo = brand.logoUrl || brand.logo || ''
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => toggle(brand.name)}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 transition-colors"
                style={{ background: checked ? 'rgba(217,4,41,0.05)' : 'white', cursor:'pointer', border:'none', borderBottom:'1px solid rgba(11,15,26,0.05)' }}
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded" style={{ border:`1.5px solid ${checked ? RED : 'rgba(11,15,26,0.2)'}`, background: checked ? RED : 'white' }}>
                  {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                {logo
                  ? <img src={logo} alt={brand.name} className="h-6 w-10 object-contain flex-shrink-0 rounded" />
                  : <span className="w-10 h-6 flex items-center justify-center rounded text-[10px] font-black text-white flex-shrink-0" style={{ background: NAVY }}>{brand.name.slice(0,2).toUpperCase()}</span>
                }
                <span className="text-xs font-semibold" style={{ color: checked ? NAVY : 'rgba(11,15,26,0.65)' }}>{brand.name}</span>
                {brand.industry && <span className="ml-auto text-[10px] text-gray-400">{brand.industry}</span>}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

// ─── Project form ────────────────────────────────────────────────────────────
function ProjectForm({ editing, onClose }: any) {
  const { clientBrands } = useStore()

  // Derive initial client list: use clients[] array if present, else fall back to single client string
  const initClients: string[] = editing
    ? (editing.clients && editing.clients.length > 0 ? editing.clients : (editing.client ? [editing.client] : []))
    : []

  const init = editing || {
    title:'', client:'', clients:[] as string[], clientLogo:'', clientLogoAlt:'', clientIndustry:'',
    clientDescription:'', clientPageDescription:'', campaignBrief:'',
    location:'', city:'', category:'Billboard', year:new Date().getFullYear().toString(),
    duration:'', tagline:'', overview:'', objective:'', execution:'',
    coverImage:'', coverImageAlt:'', heroImage:'', heroImageAlt:'',
    galleryImages:[] as GalleryImage[], results:[], tags:[], keywords:[], featured:false
  }
  const [f,setF]           = useState({...init})
  const [clients,setClients] = useState<string[]>(initClients)
  const [results,setRes]   = useState<any[]>(init.results||[])
  const [tags,setTags]     = useState<string[]>(init.tags||[])
  const rawGallery = (init.galleryImages || []) as any[]
  const [galleryImages,setGalleryImages] = useState<GalleryImage[]>(
    rawGallery.map((g: any) => typeof g === 'string' ? { url: g, alt: '' } : g)
  )
  const set = (k:string,v:any) => setF((p:any)=>({...p,[k]:v}))

  const save = (e:React.FormEvent) => {
    e.preventDefault()
    if (clients.length === 0) { toast.error('Please select at least one client'); return }

    // Build clientLogos map from clientBrands
    const clientLogos: Record<string,string> = {}
    clients.forEach(name => {
      const brand = clientBrands.find(b => b.name === name)
      if (brand) clientLogos[name] = brand.logoUrl || brand.logo || ''
    })

    const data = {
      ...f,
      clients,
      client: clients[0] || '',          // primary client (backward compat)
      clientLogos,
      clientLogo: clientLogos[clients[0]] || f.clientLogo || '',
      results,
      tags,
      galleryImages,
      slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      heroImage: f.heroImage || f.coverImage,
    }
    if (editing) projectStore.update(editing.id, data)
    else         projectStore.add(data)
    toast.success(editing?'Updated':'Created'); onClose()
  }

  const addResult=()=>setRes(r=>[...r,{metric:'',value:'',description:''}])
  const updateResult=(i:number,k:string,v:string)=>setRes(r=>r.map((x:any,j:number)=>j===i?{...x,[k]:v}:x))

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title *"  value={f.title}  onChange={(e:any)=>set('title',e.target.value)} required/>
        <ClientMultiSelect selected={clients} onChange={setClients} />
      </div>
      <div className="grid grid-cols-2 gap-3 items-start">
        <ImagePicker label="Client Logo (override)" value={f.clientLogo} altValue={f.clientLogoAlt} onChange={(url, alt) => { set('clientLogo', url); set('clientLogoAlt', alt) }}/>
        <Field label="Client Industry" value={f.clientIndustry} onChange={(e:any)=>set('clientIndustry',e.target.value)} placeholder="Real Estate, FMCG, Retail..."/>
      </div>
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

// ─── Admin list ──────────────────────────────────────────────────────────────
export default function AdminProjects() {
  const { projects, clientBrands } = useStore()
  const [form,setForm]=useState(false); const [edit,setEdit]=useState<any>(null); const [del,setDel]=useState<any>(null)

  const logoOf = (name: string) => clientBrands.find(b => b.name === name)?.logoUrl || clientBrands.find(b => b.name === name)?.logo || ''

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Projects" subtitle={`${projects.length} case studies`}
        action={<Btn onClick={()=>{setEdit(null);setForm(true)}}><Plus size={13}/>Add Project</Btn>}/>
      <Tbl>
        <thead><tr>
          <Th>Title</Th>
          <Th>Client(s)</Th>
          <Th>Category</Th>
          <Th>Year</Th>
          <Th>Featured</Th>
          <Th className="w-24">Actions</Th>
        </tr></thead>
        <tbody>
          {projects.map((p:any) => {
            const clientList: string[] = p.clients && p.clients.length > 0 ? p.clients : (p.client ? [p.client] : [])
            return (
              <Tr key={p.id}>
                <Td><div className="font-semibold">{p.title}</div><div className="text-xs text-gray-400">{p.location}</div></Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {clientList.map((name:string) => {
                      const logo = (p.clientLogos && p.clientLogos[name]) || logoOf(name)
                      return (
                        <span key={name} className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-50 border border-gray-100 text-gray-700">
                          {logo
                            ? <img src={logo} alt={name} className="h-4 w-6 object-contain rounded flex-shrink-0" />
                            : <span className="w-4 h-4 flex items-center justify-center rounded text-[8px] font-black text-white flex-shrink-0" style={{ background: NAVY }}>{name.slice(0,2).toUpperCase()}</span>
                          }
                          {name}
                        </span>
                      )
                    })}
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
            )
          })}
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
