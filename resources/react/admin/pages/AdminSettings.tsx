import { useState, useRef, useEffect } from 'react'
import { useStore, settingsStore, trustStatStore, brandStore, processStore, resultStore, projectsContentStore, resetToDefaults, type ClientBrand } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA } from '../ui'
import { Save, Plus, Trash2, RotateCcw, Upload, X, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Image-to-dataURL helper ───────────────────────────────────────────────────
function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload  = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

// ── Inline image upload field ─────────────────────────────────────────────────
function ImageUpload({
  label, value, onChange, hint, height = 56
}: { label:string; value:string; onChange:(url:string)=>void; hint?:string; height?:number }) {
  const inputRef = useRef<HTMLInputElement>(null)
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await readAsDataURL(file)
    onChange(url)
  }
  return (
    <div>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden"
               style={{ height, minWidth: height * 2.5, padding: 8 }}>
            <img src={value} alt={label} style={{ height: height - 16, width:'auto', objectFit:'contain', maxWidth:180 }}/>
            <button onClick={()=>onChange('')} className="absolute top-1 right-1 bg-white border border-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm"><X size={10}/></button>
          </div>
        ) : (
          <div
            onClick={()=>inputRef.current?.click()}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            style={{ height, minWidth: height * 2.5, padding: 8 }}
          >
            <Upload size={14} className="text-gray-400"/>
            <span className="text-[10px] text-gray-400">Upload image</span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Btn onClick={()=>inputRef.current?.click()} className="text-[11px] px-3 py-1.5 flex items-center gap-1.5"><Upload size={12}/>{value ? 'Replace' : 'Upload'}</Btn>
          {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick}/>
    </div>
  )
}

// ── Brand logo modal ──────────────────────────────────────────────────────────
function BrandModal({ open, brand, onClose, onSave, saving }: { open:boolean; brand:ClientBrand|null; onClose:()=>void; onSave:(b:Omit<ClientBrand,'id'>)=>Promise<void>; saving?:boolean }) {
  // Always call hooks — never conditionally
  const [name,        setName]        = useState('')
  const [logoUrl,     setLogoUrl]     = useState('')
  const [description, setDescription] = useState('')
  const [nameAr,        setNameAr]        = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')

  // Sync fields whenever the modal opens or the brand changes
  useEffect(() => {
    if (open) {
      setName(brand?.name          || '')
      setLogoUrl(brand?.logoUrl    || '')
      setDescription(brand?.description || '')
      setNameAr((brand as any)?.nameAr || '')
      setDescriptionAr((brand as any)?.descriptionAr || '')
    }
  }, [open, brand])

  if (!open) return null

  const handleSave = async () => {
    if (!name.trim()) return
    await onSave({ name: name.trim(), logoUrl, description: description.trim(), nameAr: nameAr.trim(), descriptionAr: descriptionAr.trim() } as any)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(11,15,26,0.55)', zIndex: 9999 }}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md shadow-2xl"
        style={{ display:'flex', flexDirection:'column', maxHeight:'90vh', position:'relative' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{flexShrink:0}}>
          <h3 className="text-[15px] font-bold text-gray-900">{brand ? 'Edit Brand' : 'Add Brand'}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4" style={{overflowY:'auto', flex:1}}>
          <Field label="Brand Name" value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="e.g. Coca-Cola"/>
          <ImageUpload
            label="Brand Logo (optional)"
            value={logoUrl}
            onChange={setLogoUrl}
            hint="PNG / SVG with transparent background recommended"
            height={52}
          />
          <TA
            label="Client Description (shown on project pages)"
            value={description}
            onChange={(e:any)=>setDescription(e.target.value)}
            rows={4}
            placeholder="Write a short description of this client — it will appear in the 'About the client' section of their project pages."
          />
          {/* ── Arabic ── */}
          <div className="pt-1 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Arabic (اللغة العربية)</span><div className="flex-1 h-px bg-gray-100"/></div>
          <Field label="Arabic Brand Name (اسم العلامة التجارية)" value={nameAr} onChange={(e:any)=>setNameAr(e.target.value)} dir="rtl" placeholder="مثال: كوكا كولا"/>
          <TA label="Arabic Description (وصف العميل)" value={descriptionAr} onChange={(e:any)=>setDescriptionAr(e.target.value)} rows={3} dir="rtl"/>
        </div>

        {/* Footer — plain buttons, no Btn wrapper, no pointer-events interference */}
        <div
          className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100"
          style={{flexShrink:0, background:'#fff', borderRadius:'0 0 12px 12px', position:'relative', zIndex:10}}
        >
          <button
            type="button"
            onClick={onClose}
            style={{padding:'8px 18px', borderRadius:10, border:'1.5px solid rgba(11,15,26,0.15)', background:'#f3f4f6', color:'#374151', fontWeight:600, fontSize:13, cursor:'pointer'}}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              padding:'8px 18px', borderRadius:10, border:'none',
              background: saving || !name.trim() ? '#f87171' : '#D90429',
              color:'#fff', fontWeight:700, fontSize:13,
              cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !name.trim() ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : (brand ? 'Save Changes' : 'Add Brand')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const TABS = ['general','social','logo','brands','stats','process','results','projects','reset'] as const
type Tab = typeof TABS[number]

export default function AdminSettings() {
  const s = useStore()
  const [tab,      setTab]      = useState<Tab>('general')
  const [settings, setSettings] = useState({ ...s.settings })
  const [stats,    setStats]    = useState([...s.trustStats])
  const [proc,     setProc]     = useState([...s.process])
  const [results,  setResults]  = useState([...s.results])
  const [projContent, setProjContent] = useState({ ...s.projectsContent })

  // Sync when store changes (e.g. after logoUrl upload)
  const saveGeneral = () => { settingsStore.update(settings); toast.success('Settings saved') }
  const saveLogo    = () => { settingsStore.update({ headerLogoUrl: settings.headerLogoUrl, footerLogoUrl: settings.footerLogoUrl, faviconUrl: settings.faviconUrl }); toast.success('Logos & favicon saved') }
  const saveStats   = () => { stats.forEach(st => trustStatStore.update(st.id, st)); toast.success('Stats saved') }
  const saveProc    = () => { proc.forEach(p => processStore.update(p.id, p)); toast.success('Process saved') }
  const saveResults = () => { resultStore.set(results); toast.success('Results saved') }
  const reset = () => { if(confirm('Reset ALL content to factory defaults? This cannot be undone.')) { resetToDefaults(); toast.success('Reset complete'); window.location.reload() } }

  // Brands modal
  const [brandModal, setBrandModal] = useState<{ open:boolean; brand:ClientBrand|null }>({ open:false, brand:null })
  const [brandSaving, setBrandSaving] = useState(false)
  async function saveBrand(data: Omit<ClientBrand,'id'>) {
    setBrandSaving(true)
    try {
      if (brandModal.brand) {
        await brandStore.update(brandModal.brand.id, data)
      } else {
        await brandStore.add(data)
      }
      toast.success(brandModal.brand ? 'Brand updated' : 'Brand added')
    } catch {
      toast.error('Failed to save brand — check your connection')
    } finally {
      setBrandSaving(false)
    }
  }
  async function removeBrand(id: any) {
    try {
      await brandStore.remove(id)
      toast.success('Brand removed')
    } catch {
      toast.error('Failed to remove brand')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="Site-wide configuration"/>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className="px-4 py-2 rounded-lg text-[12px] font-bold capitalize transition-all"
            style={tab===t ? {background:'white',color:'#0B0F1A',boxShadow:'0 1px 3px rgba(11,15,26,0.1)'} : {color:'rgba(11,15,26,0.4)'}}>
            {t === 'logo' ? 'Logo & Favicon' : t === 'reset' ? '⚠ Reset' : t === 'projects' ? 'Projects Page' : t}
          </button>
        ))}
      </div>

      {/* ── GENERAL ─────────────────────────────────────────────── */}
      {tab==='general' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name" value={settings.companyName} onChange={(e:any)=>setSettings(p=>({...p,companyName:e.target.value}))}/>
              <Field label="Tagline (EN)" value={settings.tagline} onChange={(e:any)=>setSettings(p=>({...p,tagline:e.target.value}))}/>
              <Field label="Tagline (AR) — النص تحت الشعار" value={(settings as any).taglineAr||''} onChange={(e:any)=>setSettings(p=>({...p,taglineAr:e.target.value}))} dir="rtl" placeholder="الشريك الأول في الإعلانات الخارجية في مصر"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email"   value={settings.email}   onChange={(e:any)=>setSettings(p=>({...p,email:e.target.value}))}/>
              <Field label="Phone"   value={settings.phone}   onChange={(e:any)=>setSettings(p=>({...p,phone:e.target.value}))} placeholder="+20 2 XXXX XXXX"/>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Address"     value={settings.address}    onChange={(e:any)=>setSettings(p=>({...p,address:e.target.value}))}/>
              <Field label="HQ Label (Contact page)" value={(settings as any).hqLabel||'Cairo HQ'} onChange={(e:any)=>setSettings(p=>({...p,hqLabel:e.target.value}))} placeholder="Cairo HQ"/>
              <Field label="WhatsApp Number" value={settings.whatsapp} onChange={(e:any)=>setSettings(p=>({...p,whatsapp:e.target.value}))} placeholder="+20 10 XXXX XXXX"/>
            </div>
            <TA label="Meta Description (SEO)" value={settings.metaDescription} onChange={(e:any)=>setSettings(p=>({...p,metaDescription:e.target.value}))} rows={2}/>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
              ℹ️  <strong>Phone</strong> and <strong>WhatsApp</strong> appear in the website footer, contact page, and floating WhatsApp button.
            </div>
          </div>
          <Btn onClick={saveGeneral} className="flex items-center gap-2"><Save size={14}/>Save General Settings</Btn>
        </div>
      )}

      {/* ── SOCIAL LINKS ────────────────────────────────────────── */}
      {tab==='social' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-sm">
            <p className="text-[12px] text-gray-500 mb-2">Enter full URLs (e.g. <code>https://instagram.com/horizonooh</code>). Leave blank to hide the icon in the footer.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Facebook"  value={(settings as any).socialLinks?.facebook  || ''} onChange={(e:any)=>setSettings(p=>({...p,socialLinks:{...(p as any).socialLinks,facebook:e.target.value}}))}   placeholder="https://facebook.com/…"/>
              <Field label="Instagram" value={(settings as any).socialLinks?.instagram || ''} onChange={(e:any)=>setSettings(p=>({...p,socialLinks:{...(p as any).socialLinks,instagram:e.target.value}}))}  placeholder="https://instagram.com/…"/>
              <Field label="LinkedIn"  value={(settings as any).socialLinks?.linkedin  || ''} onChange={(e:any)=>setSettings(p=>({...p,socialLinks:{...(p as any).socialLinks,linkedin:e.target.value}}))}   placeholder="https://linkedin.com/company/…"/>
              <Field label="X (Twitter)" value={(settings as any).socialLinks?.twitter || ''} onChange={(e:any)=>setSettings(p=>({...p,socialLinks:{...(p as any).socialLinks,twitter:e.target.value}}))}    placeholder="https://x.com/…"/>
              <Field label="TikTok"    value={(settings as any).socialLinks?.tiktok    || ''} onChange={(e:any)=>setSettings(p=>({...p,socialLinks:{...(p as any).socialLinks,tiktok:e.target.value}}))}     placeholder="https://tiktok.com/@…"/>
              <Field label="YouTube"   value={(settings as any).socialLinks?.youtube   || ''} onChange={(e:any)=>setSettings(p=>({...p,socialLinks:{...(p as any).socialLinks,youtube:e.target.value}}))}    placeholder="https://youtube.com/@…"/>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <Field label="Home Page — Max Coverage Cards" value={String((settings as any).homeCoverageLimit ?? 9)} onChange={(e:any)=>setSettings(p=>({...p,homeCoverageLimit:Number(e.target.value)||9}))} placeholder="9" type="number"/>
              <div className="pt-5 text-[12px] text-gray-400">Controls how many governorate cards appear in the homepage coverage section (default: 9).</div>
            </div>
          </div>
          <Btn onClick={saveGeneral} className="flex items-center gap-2"><Save size={14}/>Save Social &amp; Display Settings</Btn>
        </div>
      )}

      {/* ── LOGO & FAVICON ──────────────────────────────────────── */}
      {tab==='logo' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6 shadow-sm">

            {/* Header logo */}
            <div>
              <p className="text-[12px] font-bold text-gray-700 mb-1">Header Logo</p>
              <p className="text-[11px] text-gray-400 mb-3">Shown in the top navigation bar. Recommended: PNG/SVG with transparent background, height ≥ 80px.</p>
              <ImageUpload
                label=""
                value={settings.headerLogoUrl}
                onChange={url => setSettings(p=>({...p,headerLogoUrl:url}))}
                hint="If blank, the default icon + text mark is shown."
                height={72}
              />
            </div>

            <div className="border-t border-gray-100 pt-5">
              {/* Footer logo */}
              <p className="text-[12px] font-bold text-gray-700 mb-1">Footer Logo</p>
              <p className="text-[11px] text-gray-400 mb-3">Shown in the website footer. Can be a white/light version of your logo. Recommended: PNG/SVG with transparent background.</p>
              <ImageUpload
                label=""
                value={settings.footerLogoUrl}
                onChange={url => setSettings(p=>({...p,footerLogoUrl:url}))}
                hint="If blank, falls back to the Header Logo. If both are blank, the default text mark is shown."
                height={72}
              />
            </div>

            <div className="border-t border-gray-100 pt-5">
              {/* Favicon */}
              <p className="text-[12px] font-bold text-gray-700 mb-1">Browser Favicon</p>
              <p className="text-[11px] text-gray-400 mb-3">Updates the browser tab icon in real time.</p>
              <ImageUpload
                label=""
                value={settings.faviconUrl}
                onChange={url => setSettings(p=>({...p,faviconUrl:url}))}
                hint="Recommended: 32×32 or 64×64 PNG / ICO."
                height={48}
              />
            </div>
          </div>
          <Btn onClick={saveLogo} className="flex items-center gap-2"><Save size={14}/>Save Logos & Favicon</Btn>
        </div>
      )}

      {/* ── CLIENT BRANDS ───────────────────────────────────────── */}
      {tab==='brands' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] font-semibold text-gray-700">Client Brands — logos shown on About page</p>
              <Btn onClick={()=>setBrandModal({open:true,brand:null})} className="text-[12px] px-3 py-1.5 flex items-center gap-1.5"><Plus size={13}/>Add Brand</Btn>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {s.clientBrands.map(brand => (
                <div key={brand.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/60 group">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} style={{ height:32, width:'auto', objectFit:'contain', maxWidth:64, flexShrink:0 }}/>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-gray-400">{brand.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="flex-1 text-[12px] font-semibold text-gray-700 truncate tracking-wide uppercase">{brand.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={()=>setBrandModal({open:true,brand})} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700"><Pencil size={12}/></button>
                    <button onClick={()=>removeBrand(brand.id)}             className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
            {s.clientBrands.length === 0 && (
              <p className="text-center text-[13px] text-gray-400 py-8">No brands yet. Click "Add Brand" to start.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TRUST STATS ─────────────────────────────────────────── */}
      {tab==='stats' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-[12px] text-gray-400 mb-4">These stats appear on the Home page hero and other sections.</p>
            <div className="space-y-3 mb-4">
              {stats.map((st,i)=>(
                <div key={st.id} className="flex gap-3 items-center">
                  <Field placeholder="Value e.g. 9,500+" value={st.value} onChange={(e:any)=>setStats(s=>s.map((x,j)=>j===i?{...x,value:e.target.value}:x))} className="flex-1"/>
                  <Field placeholder="Label e.g. Locations" value={st.label} onChange={(e:any)=>setStats(s=>s.map((x,j)=>j===i?{...x,label:e.target.value}:x))} className="flex-1"/>
                  <button onClick={()=>{ trustStatStore.remove(st.id); setStats(s=>s.filter((_,j)=>j!==i)) }} className="text-red-400 hover:text-red-600 p-1.5 flex-shrink-0"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
            <Btn onClick={()=>{const n={id:Date.now().toString(),value:'',label:''};trustStatStore.add(n);setStats(s=>[...s,n])}} className="text-[12px] px-3 py-1.5 flex items-center gap-1"><Plus size={12}/>Add Stat</Btn>
          </div>
          <Btn onClick={saveStats} className="flex items-center gap-2"><Save size={14}/>Save Stats</Btn>
        </div>
      )}

      {/* ── PROCESS ─────────────────────────────────────────────── */}
      {tab==='process' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="space-y-3 mb-4">
              {proc.map((p,i)=>(
                <div key={p.id} className="grid grid-cols-4 gap-3 items-center">
                  <Field placeholder="01"    value={p.step}        onChange={(e:any)=>setProc(s=>s.map((x,j)=>j===i?{...x,step:e.target.value}:x))}/>
                  <Field placeholder="Label" value={p.label}       onChange={(e:any)=>setProc(s=>s.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/>
                  <div className="col-span-2 flex gap-2">
                    <Field placeholder="Description" value={p.description} onChange={(e:any)=>setProc(s=>s.map((x,j)=>j===i?{...x,description:e.target.value}:x))} className="flex-1"/>
                    <button onClick={()=>{ processStore.remove(p.id); setProc(s=>s.filter((_,j)=>j!==i)) }} className="text-red-400 hover:text-red-600 p-1.5"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            <Btn onClick={()=>{ const n:any={id:Date.now().toString(),step:`0${proc.length+1}`,label:'',description:''}; processStore.add(n); setProc((s:any[])=>[...s,n]) }} className="text-[12px] px-3 py-1.5 flex items-center gap-1"><Plus size={12}/>Add Step</Btn>
          </div>
          <Btn onClick={saveProc} className="flex items-center gap-2"><Save size={14}/>Save Process</Btn>
        </div>
      )}

      {/* ── RESULTS ─────────────────────────────────────────────── */}
      {tab==='results' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="space-y-3">
              {results.map((r,i)=>(
                <div key={i} className="grid grid-cols-3 gap-3">
                  <Field placeholder="Value e.g. 2.7×" value={r.value}    onChange={(e:any)=>setResults(s=>s.map((x,j)=>j===i?{...x,value:e.target.value}:x))}/>
                  <Field placeholder="Label"            value={r.label}    onChange={(e:any)=>setResults(s=>s.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/>
                  <Field placeholder="Sub-label"        value={r.sublabel} onChange={(e:any)=>setResults(s=>s.map((x,j)=>j===i?{...x,sublabel:e.target.value}:x))}/>
                </div>
              ))}
            </div>
          </div>
          <Btn onClick={saveResults} className="flex items-center gap-2"><Save size={14}/>Save Results</Btn>
        </div>
      )}

      {/* ── PROJECTS PAGE ───────────────────────────────────────── */}
      {tab==='projects' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
            <p className="text-[12px] text-gray-400">Control the text and statistics that appear on the public <strong>/projects</strong> page.</p>

            {/* Hero section */}
            <div className="border-b border-gray-100 pb-5">
              <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">Hero Section</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Eyebrow label" value={projContent.heroEyebrow||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,heroEyebrow:e.target.value}))} placeholder="Projects"/>
                <Field label="Title" value={projContent.heroTitle||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,heroTitle:e.target.value}))} placeholder="Clients first."/>
              </div>
              <Field label="Title accent (greyed-out second line)" value={projContent.heroTitleAccent||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,heroTitleAccent:e.target.value}))} placeholder="Then every campaign we delivered." className="mt-3"/>
              <TA label="Intro paragraph" value={projContent.heroParagraph||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,heroParagraph:e.target.value}))} rows={3} className="mt-3"/>
            </div>

            {/* Why It Works stats */}
            <div className="border-b border-gray-100 pb-5">
              <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">"Why It Works" Stats</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Field label="Stat 1 Value" value={projContent.stat1Value||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat1Value:e.target.value}))} placeholder="+178%"/>
                  <Field label="Stat 1 Label" value={projContent.stat1Label||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat1Label:e.target.value}))} placeholder="Avg. brand recall lift"/>
                  <Field label="Stat 1 Sub"   value={projContent.stat1Sub  ||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat1Sub:e.target.value}))}   placeholder="Across all 2025 campaigns"/>
                </div>
                <div className="space-y-2">
                  <Field label="Stat 2 Value" value={projContent.stat2Value||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat2Value:e.target.value}))} placeholder="4.1×"/>
                  <Field label="Stat 2 Label" value={projContent.stat2Label||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat2Label:e.target.value}))} placeholder="Average campaign ROI"/>
                  <Field label="Stat 2 Sub"   value={projContent.stat2Sub  ||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat2Sub:e.target.value}))}   placeholder="vs. media investment"/>
                </div>
                <div className="space-y-2">
                  <Field label="Stat 3 Value" value={projContent.stat3Value||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat3Value:e.target.value}))} placeholder="100+"/>
                  <Field label="Stat 3 Label" value={projContent.stat3Label||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat3Label:e.target.value}))} placeholder="Campaigns delivered"/>
                  <Field label="Stat 3 Sub"   value={projContent.stat3Sub  ||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,stat3Sub:e.target.value}))}   placeholder="In 2024–2025"/>
                </div>
              </div>
            </div>

            {/* CTA Banner */}
            <div>
              <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">Bottom CTA Banner</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA Title"    value={projContent.ctaTitle  ||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,ctaTitle:e.target.value}))}   placeholder="Ready to be our next success story?"/>
                <Field label="CTA Button"   value={projContent.ctaButton ||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,ctaButton:e.target.value}))}  placeholder="Start Your Campaign"/>
              </div>
              <TA label="CTA Subtitle" value={projContent.ctaSubtitle||''} onChange={(e:any)=>setProjContent((p:any)=>({...p,ctaSubtitle:e.target.value}))} rows={2} className="mt-3"/>
            </div>
          </div>
          <Btn onClick={()=>{ projectsContentStore.update(projContent); toast.success('Projects page content saved') }} className="flex items-center gap-2"><Save size={14}/>Save Projects Page Content</Btn>
        </div>
      )}

      {/* ── RESET ───────────────────────────────────────────────── */}
      {tab==='reset' && (
        <div className="bg-white rounded-xl border border-red-100 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={24} className="text-red-500"/>
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 mb-2">Reset All Content</h3>
          <p className="text-[13px] text-gray-500 mb-6 max-w-xs mx-auto">This will wipe all your changes — locations, billboards, services, projects, blog, settings, brands — and restore factory defaults. This <strong>cannot be undone</strong>.</p>
          <Btn onClick={reset} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 mx-auto">
            <RotateCcw size={14}/> Reset to Factory Defaults
          </Btn>
        </div>
      )}

      {/* Brand modal */}
      <BrandModal
        open={brandModal.open}
        brand={brandModal.brand}
        onClose={()=>setBrandModal({open:false,brand:null})}
        onSave={saveBrand}
        saving={brandSaving}
      />
    </div>
  )
}