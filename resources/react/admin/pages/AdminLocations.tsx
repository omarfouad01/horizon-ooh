import { useState } from 'react'
import { useStore, locationStore, districtStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, ArrayEditor, ImagePicker } from '../ui'
import { Plus, Pencil, Trash2, MapPin, Map } from 'lucide-react'
import toast from 'react-hot-toast'

const NAVY = '#0B0F1A', RED = '#D90429'

// ── Governorate Form ────────────────────────────────────────────────────────
function GovForm({ editing, onClose }: any) {
  const init = editing || { city:'', headline:'', description:'', detail:'', longDescription:'', image:'', imageAlt:'', availableFormats:[], cityAr:'', descriptionAr:'', headlineAr:'' }
  const [f, setF]     = useState({ ...init })
  const [fmts, setFmts] = useState<string[]>(init.availableFormats || [])
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...f, availableFormats: fmts, products: editing?.products || [], slug: f.city.toLowerCase().replace(/\s+/g, '-') }
    if (editing) locationStore.update(editing.id, data)
    else         locationStore.add(data)
    toast.success(editing ? 'Governorate updated' : 'Governorate created')
    onClose()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Governorate Name *" value={f.city}   onChange={(e: any) => set('city', e.target.value)}   required />
        <Field label="Detail (subtitle)"  value={f.detail} onChange={(e: any) => set('detail', e.target.value)} />
      </div>
      <Field label="Headline *"          value={f.headline}     onChange={(e: any) => set('headline', e.target.value)}     required />
      <TA    label="Short Description *" value={f.description}  onChange={(e: any) => set('description', e.target.value)}  rows={2} required />
      <TA    label="Long Description"    value={f.longDescription} onChange={(e: any) => set('longDescription', e.target.value)} rows={3} />
      {/* ── Arabic ── */}
      <div className="pt-1 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Arabic (اللغة العربية)</span><div className="flex-1 h-px bg-gray-100"/></div>
      <Field label="Arabic City Name (اسم المدينة)" value={f.cityAr||''} onChange={(e: any) => set('cityAr', e.target.value)} dir="rtl" placeholder="مثال: القاهرة"/>
      <Field label="Arabic Headline (العنوان)" value={f.headlineAr||''} onChange={(e: any) => set('headlineAr', e.target.value)} dir="rtl"/>
      <TA    label="Arabic Description (الوصف)" value={f.descriptionAr||''} onChange={(e: any) => set('descriptionAr', e.target.value)} rows={2} dir="rtl"/>
      <ImagePicker label="Cover Image" value={f.image} altValue={f.imageAlt} onChange={(url, alt) => { set('image', url); set('imageAlt', alt) }} />
      <ArrayEditor label="Available Ad Formats" value={fmts} onChange={setFmts} placeholder="e.g. Unipole Billboard" />
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing ? 'Save Changes' : 'Add Governorate'}</Btn>
      </div>
    </form>
  )
}

// ── District Form ────────────────────────────────────────────────────────────
function DistrictForm({ editing, presetLocationId, onClose }: any) {
  const { locations } = useStore()
  const [name, setName]   = useState(editing?.name || '')
  const [locId, setLocId] = useState(editing?.locationId || presetLocationId || '')

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !locId) { toast.error('Name and Governorate are required'); return }
    if (editing) districtStore.update(editing.id, { name, locationId: locId })
    else         districtStore.add({ name, locationId: locId })
    toast.success(editing ? 'District updated' : 'District added')
    onClose()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Governorate *</label>
        <select value={locId} onChange={e => setLocId(e.target.value)} required
          className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white">
          <option value="">Select governorate…</option>
          {locations.map((l: any) => <option key={l.id} value={l.id}>{l.city}</option>)}
        </select>
      </div>
      <Field label="District Name *" value={name} onChange={(e: any) => setName(e.target.value)} required placeholder="e.g. Nasr City" />
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing ? 'Save' : 'Add District'}</Btn>
      </div>
    </form>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminLocations() {
  const { locations, districts } = useStore()
  const [tab, setTab]           = useState<'governorates' | 'districts'>('governorates')
  const [govFilter, setGovFilter] = useState('')   // filter districts by governorate

  // Governorate state
  const [govForm, setGovForm] = useState(false)
  const [govEdit, setGovEdit] = useState<any>(null)
  const [govDel,  setGovDel]  = useState<any>(null)

  // District state
  const [distForm, setDistForm]   = useState(false)
  const [distEdit, setDistEdit]   = useState<any>(null)
  const [distDel,  setDistDel]    = useState<any>(null)
  const [distPreset, setDistPreset] = useState('')  // pre-fill governorate when adding from row

  const filteredDistricts = govFilter
    ? districts.filter(d => d.locationId === govFilter)
    : districts

  const getGovName = (id: string) => locations.find((l: any) => l.id === id)?.city || '—'

  const openAddDistrict = (locationId = '') => {
    setDistEdit(null)
    setDistPreset(locationId)
    setDistForm(true)
  }

  const allBillboards = locations.flatMap((l: any) => l.products || [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Locations"
        subtitle="Manage all Egyptian governorates and their districts"
        action={
          tab === 'governorates'
            ? <Btn onClick={() => { setGovEdit(null); setGovForm(true) }}><Plus size={13} />Add Governorate</Btn>
            : <Btn onClick={() => openAddDistrict()}><Plus size={13} />Add District</Btn>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
        {([['governorates', 'Governorates', locations.length], ['districts', 'Districts', districts.length]] as const).map(([id, label, count]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={tab === id ? { background: 'white', color: NAVY, boxShadow: '0 1px 3px rgba(11,15,26,0.1)' } : { color: 'rgba(11,15,26,0.4)' }}>
            {label}
            <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-black" style={tab === id ? { background: RED, color: 'white' } : { background: 'rgba(11,15,26,0.08)', color: 'rgba(11,15,26,0.5)' }}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── Governorates Tab ─────────────────────────────────────────────── */}
      {tab === 'governorates' && (
        <Tbl>
          <thead>
            <tr>
              <Th>Governorate</Th>
              <Th>Headline</Th>
              <Th>Districts</Th>
              <Th>Billboards</Th>
              <Th>Ad Formats</Th>
              <Th className="w-32">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 && (
              <tr><Td colSpan={6} className="text-center py-10 text-xs text-gray-400">No governorates yet</Td></tr>
            )}
            {locations.map((loc: any) => {
              const locDistricts = districts.filter(d => d.locationId === loc.id)
              const locBillboards = (loc.products || []).length
              return (
                <Tr key={loc.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-gray-300 flex-shrink-0" />
                      <span className="font-semibold text-gray-900">{loc.city}</span>
                    </div>
                  </Td>
                  <Td className="text-xs text-gray-500 max-w-xs truncate">{loc.headline}</Td>
                  <Td>
                    <button
                      onClick={() => { setTab('districts'); setGovFilter(loc.id) }}
                      className="flex items-center gap-1.5 font-semibold text-sm hover:underline"
                      style={{ color: RED }}>
                      {locDistricts.length}
                      <span className="text-xs font-normal text-gray-400">districts</span>
                    </button>
                  </Td>
                  <Td><span className="font-semibold text-sm">{locBillboards}</span></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {(loc.availableFormats || []).slice(0, 2).map((f: string) => <Badge key={f} color="gray">{f}</Badge>)}
                      {(loc.availableFormats || []).length > 2 && <Badge color="gray">+{loc.availableFormats.length - 2}</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button title="Manage districts"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                        onClick={() => { setTab('districts'); setGovFilter(loc.id) }}>
                        <Map size={13} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        onClick={() => { setGovEdit(loc); setGovForm(true) }}>
                        <Pencil size={13} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => setGovDel(loc)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </tbody>
        </Tbl>
      )}

      {/* ── Districts Tab ─────────────────────────────────────────────────── */}
      {tab === 'districts' && (
        <div>
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4">
            <select value={govFilter} onChange={e => setGovFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white min-w-[200px]">
              <option value="">All Governorates ({districts.length})</option>
              {locations.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.city} ({districts.filter(d => d.locationId === l.id).length})
                </option>
              ))}
            </select>
            {govFilter && (
              <button onClick={() => setGovFilter('')} className="text-xs text-gray-400 hover:text-gray-700 font-semibold">
                Clear filter
              </button>
            )}
            {govFilter && (
              <Btn size="sm" onClick={() => openAddDistrict(govFilter)}>
                <Plus size={12} />Add District to {getGovName(govFilter)}
              </Btn>
            )}
          </div>

          <Tbl>
            <thead>
              <tr>
                <Th>District Name</Th>
                <Th>Governorate</Th>
                <Th>Billboards in this district</Th>
                <Th className="w-24">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.length === 0 && (
                <tr><Td colSpan={4} className="text-center py-10 text-xs text-gray-400">
                  {govFilter ? `No districts in ${getGovName(govFilter)} yet` : 'No districts yet'}
                </Td></tr>
              )}
              {filteredDistricts.map(d => {
                const billboardCount = allBillboards.filter((b: any) => b.district === d.name).length
                return (
                  <Tr key={d.id}>
                    <Td><span className="font-semibold text-gray-900">{d.name}</span></Td>
                    <Td>
                      <Badge color="navy">{getGovName(d.locationId)}</Badge>
                    </Td>
                    <Td>
                      <span className="text-sm font-semibold text-gray-700">{billboardCount}</span>
                      {billboardCount > 0 && <span className="text-xs text-gray-400 ml-1">billboard{billboardCount !== 1 ? 's' : ''}</span>}
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          onClick={() => { setDistEdit(d); setDistForm(true) }}>
                          <Pencil size={13} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => setDistDel(d)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                )
              })}
            </tbody>
          </Tbl>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <Modal open={govForm} onClose={() => setGovForm(false)} title={govEdit ? `Edit — ${govEdit.city}` : 'New Governorate'} size="lg">
        <GovForm editing={govEdit} onClose={() => setGovForm(false)} />
      </Modal>

      <Modal open={distForm} onClose={() => setDistForm(false)} title={distEdit ? `Edit District — ${distEdit.name}` : 'Add New District'} size="md">
        <DistrictForm editing={distEdit} presetLocationId={distPreset} onClose={() => setDistForm(false)} />
      </Modal>

      <Confirm open={!!govDel} title="Delete Governorate"
        message={`Delete "${govDel?.city}"? This will also remove all billboards in this location.`}
        onConfirm={() => { locationStore.remove(govDel.id); toast.success('Deleted'); setGovDel(null) }}
        onCancel={() => setGovDel(null)} />

      <Confirm open={!!distDel} title="Delete District"
        message={`Delete "${distDel?.name}" from ${getGovName(distDel?.locationId || '')}? Existing billboards with this district won't be changed.`}
        onConfirm={() => { districtStore.remove(distDel.id); toast.success('District deleted'); setDistDel(null) }}
        onCancel={() => setDistDel(null)} />
    </div>
  )
}