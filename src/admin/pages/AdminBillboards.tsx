import { useState, useRef, useEffect, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore, locationStore, nextBillboardCode, type Supplier, type Product, type AdFormatType, adFormatStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field } from '../ui'
import { Plus, Pencil, Trash2, X, Upload, MapPin, Settings2, ExternalLink, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseSqm(size: string): number {
  const nums = size.replace(/[^\d.]+/g, ' ').trim().split(/\s+/).map(Number).filter(n => n > 0)
  if (nums.length >= 2) return Math.round(nums[0] * nums[1] * 10) / 10
  return 0
}
function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload=()=>res(r.result as string); r.onerror=rej; r.readAsDataURL(file) })
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-3 pb-1">
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-100"/>
    </div>
  )
}

// ── Labeled wrapper ───────────────────────────────────────────────────────────
function Lbl({ label, required, children, hint }: { label:string; required?:boolean; children:React.ReactNode; hint?:string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 -mt-1">{hint}</p>}
    </div>
  )
}
const sel = "h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white w-full focus:border-gray-400"
const inp = "h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 w-full"
const ta  = "px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 resize-none w-full"

// ── Map Picker ────────────────────────────────────────────────────────────────
// ── Interactive Leaflet Map Picker ────────────────────────────────────────────
function LeafletPickerMap({ lat, lng, onMove }: { lat: number; lng: number; onMove:(la:number,lo:number)=>void }) {
  const divRef  = useRef<HTMLDivElement>(null)
  const mapRef  = useRef<L.Map | null>(null)
  const pinRef  = useRef<L.Marker | null>(null)

  const makeIcon = () => L.divIcon({
    className:'',
    html:`<div style="width:28px;height:28px;background:#D90429;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
    iconSize:[28,28], iconAnchor:[14,28],
  })

  useEffect(()=>{
    if (!divRef.current || mapRef.current) return
    const initLat = lat || 30.0444, initLng = lng || 31.2357
    const map = L.map(divRef.current, { center:[initLat,initLng], zoom:13, zoomControl:true })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
      attribution:'&copy; OpenStreetMap &copy; CARTO', maxZoom:19
    }).addTo(map)
    const marker = L.marker([initLat,initLng],{ icon:makeIcon(), draggable:true }).addTo(map)
    marker.on('dragend',()=>{
      const p = marker.getLatLng()
      onMove(Math.round(p.lat*1e6)/1e6, Math.round(p.lng*1e6)/1e6)
    })
    map.on('click',(e)=>{
      const {lat:la,lng:lo} = e.latlng
      marker.setLatLng([la,lo])
      onMove(Math.round(la*1e6)/1e6, Math.round(lo*1e6)/1e6)
    })
    mapRef.current = map; pinRef.current = marker
    return ()=>{ map.remove(); mapRef.current=null; pinRef.current=null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  // Sync external lat/lng changes into the map
  useEffect(()=>{
    if (!mapRef.current || !pinRef.current) return
    if (!lat || !lng) return
    pinRef.current.setLatLng([lat,lng])
    mapRef.current.setView([lat,lng], mapRef.current.getZoom(), {animate:true})
  },[lat,lng])

  return <div ref={divRef} style={{width:'100%',height:'100%',minHeight:340}}/>
}

function MapPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange:(lat:number,lng:number)=>void }) {
  const [open, setOpen] = useState(false)
  const [tempLat, setTempLat] = useState(lat || 30.0444)
  const [tempLng, setTempLng] = useState(lng || 31.2357)

  // Keep temp coords in sync when parent values change (first open)
  useEffect(()=>{
    if (lat) setTempLat(lat)
    if (lng) setTempLng(lng)
  },[lat,lng])

  const handleMapMove = useCallback((la:number,lo:number)=>{
    setTempLat(la); setTempLng(lo)
  },[])

  function confirm() {
    if (!isNaN(tempLat) && !isNaN(tempLng)) {
      onChange(tempLat, tempLng); setOpen(false); toast.success('Location saved ✓')
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <input className={inp} type="number" step="any" value={lat||''} onChange={e=>onChange(parseFloat(e.target.value)||0,lng)} placeholder="Latitude e.g. 30.0722"/>
          <input className={inp} type="number" step="any" value={lng||''} onChange={e=>onChange(lat,parseFloat(e.target.value)||0)} placeholder="Longitude e.g. 31.3987"/>
        </div>
        <Btn type="button" onClick={()=>setOpen(true)} className="flex items-center gap-1.5 text-[12px] whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200">
          <MapPin size={13}/> Pick on Map
        </Btn>
        {lat && lng && (
          <a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap">
            <ExternalLink size={11}/> View
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.72)'}}>
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col" style={{maxHeight:'92vh'}}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={15} style={{color:'#D90429'}}/>Pick Location on Map
          </h3>
          <button onClick={()=>setOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={15}/></button>
        </div>

        {/* Hint */}
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex-shrink-0">
          <p className="text-[12px] text-blue-700">
            <strong>Click anywhere on the map</strong> or <strong>drag the red pin</strong> to set the exact location. Use the coordinate inputs below to fine-tune.
          </p>
        </div>

        {/* Map — takes all available space */}
        <div className="flex-1 relative overflow-hidden" style={{minHeight:340}}>
          {open && <LeafletPickerMap lat={tempLat} lng={tempLng} onMove={handleMapMove}/>}
        </div>

        {/* Coordinate inputs + actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/80">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[130px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Latitude</label>
              <input className={inp} type="number" step="any" value={tempLat}
                onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))setTempLat(v)}}/>
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Longitude</label>
              <input className={inp} type="number" step="any" value={tempLng}
                onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))setTempLng(v)}}/>
            </div>
            <Btn type="button" onClick={()=>setOpen(false)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex-shrink-0">Cancel</Btn>
            <Btn type="button" onClick={confirm} className="flex items-center gap-1.5 flex-shrink-0">
              <MapPin size={13}/> Save Location
            </Btn>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Selected: <span className="font-mono font-semibold text-gray-600">{tempLat.toFixed(6)}, {tempLng.toFixed(6)}</span>
            &nbsp;·&nbsp;
            <a href={`https://maps.google.com/?q=${tempLat},${tempLng}`} target="_blank" rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-semibold">Verify in Google Maps ↗</a>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Image uploader ────────────────────────────────────────────────────────────
function ImageUploader({ images, onChange }: { images:{url:string;alt:string}[]; onChange:(imgs:{url:string;alt:string}[])=>void }) {
  const ref = useRef<HTMLInputElement>(null)
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const results = await Promise.all(files.map(async f => ({ url: await readAsDataURL(f), alt: f.name.replace(/\.[^.]+$/, '') })))
    onChange([...images, ...results])
    e.target.value = ''
  }
  function updateAlt(i: number, alt: string) { onChange(images.map((img, j) => j===i ? {...img, alt} : img)) }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <div className="w-24 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button type="button" onClick={()=>onChange(images.filter((_,j)=>j!==i))} className="text-white"><Trash2 size={14}/></button>
              </div>
            </div>
            <input
              className="mt-1 w-24 h-6 px-1.5 text-[9px] rounded border border-gray-200 outline-none focus:border-gray-400 text-gray-600"
              value={img.alt} onChange={e=>updateAlt(i,e.target.value)} placeholder="alt text (SEO)"/>
          </div>
        ))}
        <button type="button" onClick={()=>ref.current?.click()}
          className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400">
          <Upload size={16}/><span className="text-[10px]">Add photo</span>
        </button>
      </div>
      <p className="text-[10px] text-gray-400">Filename is used as alt text by default. You can edit each alt text directly below the image.</p>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={pick}/>
    </div>
  )
}

// ── Billboard Form ────────────────────────────────────────────────────────────
const AD_FORMATS = ['Billboard','Digital Screens','Mall Advertising','Airport Advertising','Transit Ads']

function BillboardForm({ editing, onClose }: any) {
  const { locations, districts, suppliers, adFormats } = useStore()

  const owningLoc = editing
    ? locations.find((l: any) => (l.products || []).some((p: any) => p.id === editing.id))
    : null

  const [locId, setLocId] = useState<string>(owningLoc?.id || '')

  // Generate a code if creating new
  const [code] = useState<string>(() => editing?.code || nextBillboardCode())

  const empty: any = {
    code, nameEn:'', nameAr:'', name:'',
    location:'', locationName:'', city:'', district:'', lat:0, lng:0,
    adFormat:'Billboard', type:'',
    size:'', sqm:0, sides:1, material:'', brightness:'Back Light',
    resolution:'', spot:'',
    agencyPrice:0, clientPrice:0,
    availability: new Date().toISOString().split('T')[0],
    status:'Available', quantity:1,
    descriptionEn:'', descriptionAr:'',
    traffic:'', visibility:'',
    supplierId:'', supplierNote:'',
    images:[], image:'',
    specs:[], benefits:[], relatedSlugs:[],
  }

  const [f, setF] = useState<any>(() => {
    const ed = editing || {}
    // Map legacy `name` field to `nameEn` so the form pre-fills correctly
    return { ...empty, ...ed, nameEn: (ed as any).nameEn || (ed as any).name || '' }
  })
  const set = (k: string, v: any) => setF((p: any) => {
    const next = { ...p, [k]: v }
    if (k === 'size') next.sqm = parseSqm(v)
    if (k === 'nameEn') next.name = v
    return next
  })

  const locDistricts = locId ? districts.filter((d: any) => d.locationId === locId) : []

  const handleLocChange = (id: string) => {
    setLocId(id)
    const loc = locations.find((l: any) => l.id === id)
    if (loc) { set('city', (loc as any).city); set('district', '') }
  }

  const isDigital = f.adFormat === 'Digital Screens'
  const selectedSupplier = f.supplierId ? suppliers.find((s: Supplier) => s.id === f.supplierId) : null

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const targetLoc = locations.find((l: any) => l.id === locId)
    const bb: any = {
      ...f,
      name:   f.nameEn || f.name || '',
      city:   (targetLoc as any)?.city || f.city,
      slug:   (f.nameEn || f.name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
      sqm:    parseSqm(f.size),
      image:  f.images?.[0]?.url || f.image || '',
      lat:    typeof f.lat === 'number' ? f.lat : (parseFloat(f.lat) || 0),
      lng:    typeof f.lng === 'number' ? f.lng : (parseFloat(f.lng) || 0),
      code:   f.code || code,
    }
    if (editing) {
      if (owningLoc) {
        locationStore.update(owningLoc.id, {
          products: (owningLoc.products || []).map((p: any) => p.id === editing.id ? { ...bb, id: editing.id } : p)
        })
      }
      toast.success('Billboard updated')
    } else {
      const loc = locations.find((l: any) => l.id === locId)
      if (!loc) { toast.error('Please select a governorate'); return }
      locationStore.update(loc.id, {
        products: [...((loc as any).products || []), { ...bb, id: Date.now().toString(36) + Math.random().toString(36).slice(2) }]
      })
      toast.success('Billboard created')
    }
    onClose()
  }

  return (
    <form onSubmit={save} className="space-y-3">

      {/* ── BILLBOARD CODE ── */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 text-white">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/40">Billboard Code</span>
          <span className="text-[22px] font-black tracking-[0.1em] text-white leading-none">{f.code || code}</span>
        </div>
        <span className="ml-auto text-[10px] text-white/30">Auto-generated · unique</span>
      </div>

      {/* ── NAMES ── */}
      <SectionDivider label="Names"/>
      <div className="grid grid-cols-2 gap-3">
        <Lbl label="English Name" required>
          <input className={inp} value={f.nameEn||''} onChange={e=>set('nameEn',e.target.value)} required placeholder="e.g. Ring Road North Face"/>
        </Lbl>
        <Lbl label="Arabic Name">
          <input className={inp} value={f.nameAr||''} onChange={e=>set('nameAr',e.target.value)} placeholder="مثال: واجهة الطريق الدائري الشمالي" dir="rtl"/>
        </Lbl>
      </div>

      {/* ── FORMAT & CLASSIFICATION ── */}
      <SectionDivider label="Format & Classification"/>
      <div className="grid grid-cols-2 gap-3">
        <Lbl label="Ad Format" required>
          <select className={sel} value={f.adFormat||'Billboard'} onChange={e=>set('adFormat',e.target.value)} required>
            {AD_FORMATS.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
          </select>
        </Lbl>
        <Lbl label="Type">
          <select className={sel} value={f.type||''} onChange={e=>set('type',e.target.value)}>
            <option value="">— Select type —</option>
            {adFormats.map((t: AdFormatType) => <option key={t.id} value={t.label}>{t.label}</option>)}
          </select>
        </Lbl>
      </div>

      {/* ── PHYSICAL ── */}
      <SectionDivider label="Physical Specifications"/>
      <div className="grid grid-cols-3 gap-3">
        <Lbl label="Size" required>
          <input className={inp} value={f.size||''} onChange={e=>set('size',e.target.value)} required placeholder="12m × 6m"/>
        </Lbl>
        <Lbl label="Sq. Meters (auto)">
          <input className={inp} value={f.sqm || parseSqm(f.size||'')} readOnly style={{background:'#f9fafb',color:'#9ca3af'}}/>
        </Lbl>
        <Lbl label="Sides">
          <input className={inp} type="number" min={1} max={6} value={f.sides||1} onChange={e=>set('sides',parseInt(e.target.value)||1)}/>
        </Lbl>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Lbl label="Material">
          <input className={inp} value={f.material||''} onChange={e=>set('material',e.target.value)} placeholder="e.g. SMD / Flex / Aluminium"/>
        </Lbl>
        <Lbl label="Brightness">
          <select className={sel} value={f.brightness||'Back Light'} onChange={e=>set('brightness',e.target.value)}>
            <option value="Back Light">Back Light</option>
            <option value="Internal Light">Internal Light</option>
            <option value="Front Light">Front Light</option>
            <option value="Unlit">Unlit</option>
          </select>
        </Lbl>
        <Lbl label="Visibility Distance">
          <input className={inp} value={f.visibility||''} onChange={e=>set('visibility',e.target.value)} placeholder="e.g. 1.2km"/>
        </Lbl>
      </div>
      {isDigital && (
        <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
          <Lbl label="Resolution (Digital only)">
            <input className={inp} value={f.resolution||''} onChange={e=>set('resolution',e.target.value)} placeholder="e.g. 1920×1080 / P6"/>
          </Lbl>
          <Lbl label="Spot Duration (Digital only)">
            <input className={inp} value={f.spot||''} onChange={e=>set('spot',e.target.value)} placeholder="e.g. 10 sec loop"/>
          </Lbl>
        </div>
      )}

      {/* ── COMMERCIAL ── */}
      <SectionDivider label="Commercial"/>
      <div className="grid grid-cols-2 gap-3">
        <Lbl label="Agency Price (EGP)">
          <input className={inp} type="number" min={0} value={f.agencyPrice||''} onChange={e=>set('agencyPrice',parseFloat(e.target.value)||0)} placeholder="0"/>
        </Lbl>
        <Lbl label="Client Price (EGP)">
          <input className={inp} type="number" min={0} value={f.clientPrice||''} onChange={e=>set('clientPrice',parseFloat(e.target.value)||0)} placeholder="0"/>
        </Lbl>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Lbl label="Status">
          <select className={sel} value={f.status||'Available'} onChange={e=>set('status',e.target.value)}>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>
        </Lbl>
        <Lbl label="Availability Date">
          <input className={inp} type="date" value={f.availability||''} onChange={e=>set('availability',e.target.value)}/>
        </Lbl>
        <Lbl label="Quantity">
          <input className={inp} type="number" min={1} value={f.quantity||1} onChange={e=>set('quantity',parseInt(e.target.value)||1)}/>
        </Lbl>
      </div>

      {/* ── TRAFFIC ── */}
      <SectionDivider label="Traffic & Audience"/>
      <Lbl label="Traffic">
        <input className={inp} value={f.traffic||''} onChange={e=>set('traffic',e.target.value)} placeholder="e.g. 420,000+ daily vehicles"/>
      </Lbl>

      {/* ── SUPPLIER ── */}
      <SectionDivider label="Supplier"/>
      <Lbl label="Assign Supplier">
        <select className={sel} value={f.supplierId||''} onChange={e=>set('supplierId',e.target.value)}>
          <option value="">— No supplier assigned —</option>
          {suppliers.map((s: Supplier) => (
            <option key={s.id} value={s.id}>{s.name}{s.category?` · ${s.category}`:''}{s.phone?` — ${s.phone}`:''}</option>
          ))}
        </select>
      </Lbl>
      {selectedSupplier && (
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[12px]">
          <p className="font-semibold text-gray-800">{selectedSupplier.name}</p>
          {selectedSupplier.contact && <p className="text-gray-500">Contact: {selectedSupplier.contact}</p>}
          {selectedSupplier.email && <p className="text-gray-500">Email: <a href={`mailto:${selectedSupplier.email}`} className="text-blue-600">{selectedSupplier.email}</a></p>}
          {selectedSupplier.phone && <p className="text-gray-500">Phone: {selectedSupplier.phone}</p>}
        </div>
      )}
      <Lbl label="Supplier Note">
        <textarea className={ta} rows={2} value={f.supplierNote||''} onChange={e=>set('supplierNote',e.target.value)} placeholder="Installation date, contract ref…"/>
      </Lbl>

      {/* ── DESCRIPTIONS ── */}
      <SectionDivider label="Descriptions"/>
      <Lbl label="English Description">
        <textarea className={ta} rows={3} value={f.descriptionEn||''} onChange={e=>set('descriptionEn',e.target.value)} placeholder="Describe this billboard in English…"/>
      </Lbl>
      <Lbl label="Arabic Description">
        <textarea className={ta} rows={3} value={f.descriptionAr||''} onChange={e=>set('descriptionAr',e.target.value)} placeholder="وصف الإعلان بالعربية…" dir="rtl"/>
      </Lbl>

      {/* ── LOCATION ── */}
      <SectionDivider label="Location & Address"/>
      <div className="grid grid-cols-2 gap-3">
        <Lbl label="Governorate" required>
          <select className={sel} value={locId} onChange={e=>handleLocChange(e.target.value)} required>
            <option value="">Select governorate…</option>
            {locations.map((l: any) => <option key={l.id} value={l.id}>{l.city}</option>)}
          </select>
        </Lbl>
        <Lbl label="District" required>
          <select className={sel} value={f.district||''} onChange={e=>set('district',e.target.value)} required disabled={!locId}>
            <option value="">{locId ? 'Select district…' : 'Select governorate first'}</option>
            {locDistricts.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </Lbl>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Lbl label="Location Landmark / Name">
          <input className={inp} value={f.locationName||''} onChange={e=>set('locationName',e.target.value)} placeholder="e.g. Ring Road km 28 — Nasr City exit"/>
        </Lbl>
        <Lbl label="Full Address">
          <input className={inp} value={f.location||''} onChange={e=>set('location',e.target.value)} placeholder="Full street address"/>
        </Lbl>
      </div>
      <Lbl label="Map Pin — Latitude & Longitude">
        <MapPicker lat={f.lat} lng={f.lng} onChange={(la,lo)=>setF((p:any)=>({...p,lat:la,lng:lo}))}/>
      </Lbl>

      {/* ── IMAGES ── */}
      <SectionDivider label="Images"/>
      <ImageUploader images={f.images||[]} onChange={imgs=>set('images',imgs)}/>

      <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 mt-2">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing ? 'Save Changes' : 'Create Billboard'}</Btn>
      </div>
    </form>
  )
}

// ── Ad Format Types Manager ───────────────────────────────────────────────────
function AdFormatManager({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const { adFormats } = useStore()
  const [newLabel, setNewLabel] = useState('')
  const [editId,   setEditId]   = useState<string|null>(null)
  const [editLabel,setEditLabel]= useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.55)'}}>
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Manage Billboard Types</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={15}/></button>
        </div>
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {adFormats.map((t: AdFormatType) => (
            <div key={t.id} className="flex items-center gap-2">
              {editId===t.id ? (
                <>
                  <input className="flex-1 h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none" value={editLabel} onChange={e=>setEditLabel(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'){adFormatStore.update(t.id,{label:editLabel});setEditId(null)}}} autoFocus/>
                  <button onClick={()=>{adFormatStore.update(t.id,{label:editLabel});setEditId(null)}} className="text-[11px] font-bold text-green-600 px-2">Save</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[13px] text-gray-800">{t.label}</span>
                  <button onClick={()=>{setEditId(t.id);setEditLabel(t.label)}} className="text-gray-400 hover:text-gray-700 p-1"><Pencil size={12}/></button>
                  <button onClick={()=>adFormatStore.remove(t.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={12}/></button>
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-1 border-t border-gray-100">
            <input className="flex-1 h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none" value={newLabel} onChange={e=>setNewLabel(e.target.value)}
              placeholder="New type name…" onKeyDown={e=>{if(e.key==='Enter'&&newLabel.trim()){adFormatStore.add({label:newLabel.trim()});setNewLabel('')}}}/>
            <Btn onClick={()=>{if(newLabel.trim()){adFormatStore.add({label:newLabel.trim()});setNewLabel('')}}} className="text-[11px] px-3 py-1.5 flex items-center gap-1"><Plus size={11}/>Add</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main list ──────────────────────────────────────────────────────────────────
export default function AdminBillboards() {
  const store = useStore()
  const { locations } = store
  const allBillboards = locations.flatMap((l: any) =>
    (l.products || []).map((p: any) => ({ ...p, _locId: l.id, _locCity: l.city }))
  )
  const [form,    setForm]    = useState(false)
  const [edit,    setEdit]    = useState<any>(null)
  const [del,     setDel]     = useState<any>(null)
  const [govFilter, setGovFilter] = useState('')
  const [fmtFilter, setFmtFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [codeSearch, setCodeSearch] = useState('')
  const [typesMgr, setTypesMgr] = useState(false)

  const filtered = allBillboards.filter(b => {
    if (govFilter    && b._locId   !== govFilter)   return false
    if (fmtFilter    && b.adFormat !== fmtFilter)    return false
    if (statusFilter && b.status   !== statusFilter) return false
    if (codeSearch) {
      const q = codeSearch.toLowerCase()
      const matchCode = (b.code||'').toLowerCase().includes(q)
      const matchName = ((b.nameEn||b.name||'')).toLowerCase().includes(q)
      if (!matchCode && !matchName) return false
    }
    return true
  })

  const deleteBb = (bb: any) => {
    const loc = locations.find((l: any) => l.id === bb._locId)
    if (loc) locationStore.update(loc.id, { products: ((loc as any).products || []).filter((p: any) => p.id !== bb.id) })
    toast.success('Deleted')
    setDel(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Billboards"
        subtitle={`${allBillboards.length} billboard locations across ${locations.length} governorates`}
        action={
          <div className="flex gap-2">
            <Btn onClick={()=>setTypesMgr(true)} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200">
              <Settings2 size={13}/> Manage Types
            </Btn>
            <Btn onClick={() => { setEdit(null); setForm(true) }} className="flex items-center gap-1.5">
              <Plus size={13}/> Add Billboard
            </Btn>
          </div>
        }
      />
      {/* Filters + Search */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Code / name search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={codeSearch}
            onChange={e => setCodeSearch(e.target.value)}
            placeholder="Search by code or name…"
            className="h-9 pl-8 pr-3 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-gray-400 w-56"
          />
          {codeSearch && (
            <button onClick={() => setCodeSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X size={12}/>
            </button>
          )}
        </div>
        <select value={govFilter} onChange={e=>setGovFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white min-w-[180px]">
          <option value="">All Governorates ({allBillboards.length})</option>
          {locations.map((l: any) => <option key={l.id} value={l.id}>{l.city} ({(l.products||[]).length})</option>)}
        </select>
        <select value={fmtFilter} onChange={e=>setFmtFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white">
          <option value="">All Formats</option>
          {AD_FORMATS.map(f=><option key={f} value={f}>{f}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Not Available">Not Available</option>
        </select>
        {(govFilter||fmtFilter||statusFilter||codeSearch) && (
          <button onClick={()=>{setGovFilter('');setFmtFilter('');setStatusFilter('');setCodeSearch('')}} className="text-xs text-gray-400 hover:text-gray-700 font-semibold px-2">Clear all</button>
        )}
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} of {allBillboards.length} shown</span>
      </div>

      <Tbl>
        <thead>
          <tr>
            <Th>Code</Th>
            <Th>Name</Th>
            <Th>Governorate · District</Th>
            <Th>Format</Th>
            <Th>Size / m²</Th>
            <Th>Status</Th>
            <Th>Client Price</Th>
            <Th>Supplier</Th>
            <Th className="w-24">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><Td colSpan={9} className="text-center py-10 text-xs text-gray-400">No billboards match the current filter</Td></tr>
          )}
          {filtered.map((b: any) => {
            const sup = b.supplierId ? (store.suppliers||[]).find((s:any)=>s.id===b.supplierId) : null
            return (
              <Tr key={b.id}>
                <Td>
                  <div className="font-mono text-[12px] font-bold text-gray-900 whitespace-nowrap flex items-center gap-1">
                    {b.code || '—'}
                    {b.code && (
                      <button type="button" onClick={()=>{navigator.clipboard?.writeText(b.code);toast.success('Code copied')}}
                        className="text-gray-300 hover:text-gray-600 ml-0.5"><Copy size={10}/></button>
                    )}
                  </div>
                </Td>
                <Td>
                  <div className="font-semibold text-gray-900 text-[13px]">{b.nameEn||b.name||'—'}</div>
                  {b.nameAr && <div className="text-[11px] text-gray-400 mt-0.5" dir="rtl">{b.nameAr}</div>}
                </Td>
                <Td>
                  <div className="text-[13px] text-gray-700">{b._locCity||b.city}</div>
                  {b.district && <div className="text-[11px] text-gray-400 mt-0.5">{b.district}</div>}
                </Td>
                <Td>
                  <Badge color="navy">{b.adFormat||b.type||'—'}</Badge>
                  {b.type && b.adFormat && b.type!==b.adFormat && <div className="text-[10px] text-gray-400 mt-0.5">{b.type}</div>}
                </Td>
                <Td>
                  <div className="font-mono text-xs text-gray-700">{b.size||'—'}</div>
                  {(b.sqm||parseSqm(b.size||''))>0 && <div className="text-[10px] text-gray-400">{b.sqm||parseSqm(b.size||'')} m²</div>}
                </Td>
                <Td><Badge color={b.status==='Available'?'green':'red'}>{b.status||'Available'}</Badge></Td>
                <Td>{b.clientPrice>0?<span className="font-semibold text-[13px]">{b.clientPrice.toLocaleString()} EGP</span>:<span className="text-gray-300 text-xs">—</span>}</Td>
                <Td className="text-xs text-gray-600">{sup?<span className="font-medium">{(sup as any).name}</span>:<span className="text-gray-300">—</span>}</Td>
                <Td>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={()=>{setEdit(b);setForm(true)}}><Pencil size={13}/></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={()=>setDel(b)}><Trash2 size={13}/></button>
                  </div>
                </Td>
              </Tr>
            )
          })}
        </tbody>
      </Tbl>

      <Modal open={form} onClose={()=>setForm(false)} title={edit?`Edit — ${edit.code||''} ${edit.nameEn||edit.name||''}`:'New Billboard'} size="xl">
        <BillboardForm editing={edit} onClose={()=>setForm(false)}/>
      </Modal>
      <Confirm open={!!del} title="Delete Billboard" message={`Delete "${del?.nameEn||del?.name}"?`}
        onConfirm={()=>deleteBb(del)} onCancel={()=>setDel(null)}/>
      <AdFormatManager open={typesMgr} onClose={()=>setTypesMgr(false)}/>
    </div>
  )
}
