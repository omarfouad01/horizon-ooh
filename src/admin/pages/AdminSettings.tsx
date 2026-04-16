import { useState, useRef } from 'react'
import { useStore, settingsStore, trustStatStore, brandStore, processStore, resultStore, resetToDefaults, type ClientBrand } from '@/store/dataStore'
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
function BrandModal({ open, brand, onClose, onSave }: { open:boolean; brand:ClientBrand|null; onClose:()=>void; onSave:(b:Omit<ClientBrand,'id'>)=>void }) {
  const [name,    setName]    = useState(brand?.name    || '')
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || '')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.55)'}}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">{brand ? 'Edit Brand' : 'Add Brand'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Brand Name" value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="e.g. Coca-Cola"/>
          <ImageUpload label="Brand Logo (optional)" value={logoUrl} onChange={setLogoUrl} hint="PNG / SVG with transparent background recommended" height={52}/>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Btn onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Btn>
            <Btn onClick={()=>{ if(!name.trim()) return; onSave({name:name.trim(),logoUrl}); onClose() }}>
              {brand ? 'Save Changes' : 'Add Brand'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const TABS = ['general','logo','brands','stats','process','results','reset'] as const
type Tab = typeof TABS[number]

export default function AdminSettings() {
  const s = useStore()
  const [tab,      setTab]      = useState<Tab>('general')
  const [settings, setSettings] = useState({ ...s.settings })
  const [stats,    setStats]    = useState([...s.trustStats])
  const [proc,     setProc]     = useState([...s.process])
  const [results,  setResults]  = useState([...s.results])

  // Sync when store changes (e.g. after logoUrl upload)
  const saveGeneral = () => { settingsStore.update(settings); toast.success('Settings saved') }
  const saveLogo    = () => { settingsStore.update({ headerLogoUrl: settings.headerLogoUrl, footerLogoUrl: settings.footerLogoUrl, faviconUrl: settings.faviconUrl }); toast.success('Logos & favicon saved') }
  const saveStats   = () => { stats.forEach(st => trustStatStore.update(st.id, st)); toast.success('Stats saved') }
  const saveProc    = () => { proc.forEach(p => processStore.update(p.id, p)); toast.success('Process saved') }
  const saveResults = () => { resultStore.set(results); toast.success('Results saved') }
  const reset = () => { if(confirm('Reset ALL content to factory defaults? This cannot be undone.')) { resetToDefaults(); toast.success('Reset complete'); window.location.reload() } }

  // Brands modal
  const [brandModal, setBrandModal] = useState<{ open:boolean; brand:ClientBrand|null }>({ open:false, brand:null })
  function saveBrand(data: Omit<ClientBrand,'id'>) {
    if (brandModal.brand) brandStore.update(brandModal.brand.id, data)
    else                  brandStore.add(data)
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
            {t === 'logo' ? 'Logo & Favicon' : t === 'reset' ? '⚠ Reset' : t}
          </button>
        ))}
      </div>

      {/* ── GENERAL ─────────────────────────────────────────────── */}
      {tab==='general' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name" value={settings.companyName} onChange={(e:any)=>setSettings(p=>({...p,companyName:e.target.value}))}/>
              <Field label="Tagline"      value={settings.tagline}     onChange={(e:any)=>setSettings(p=>({...p,tagline:e.target.value}))}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email"   value={settings.email}   onChange={(e:any)=>setSettings(p=>({...p,email:e.target.value}))}/>
              <Field label="Phone"   value={settings.phone}   onChange={(e:any)=>setSettings(p=>({...p,phone:e.target.value}))} placeholder="+20 2 XXXX XXXX"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Address"  value={settings.address}  onChange={(e:any)=>setSettings(p=>({...p,address:e.target.value}))}/>
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
                    <button onClick={()=>brandStore.remove(brand.id)}       className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
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
            <Btn onClick={()=>{ const n={id:Date.now().toString(),step:`0${proc.length+1}`,label:'',description:''}; processStore.add(n); setProc(s=>[...s,n]) }} className="text-[12px] px-3 py-1.5 flex items-center gap-1"><Plus size={12}/>Add Step</Btn>
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
      />
    </div>
  )
}
