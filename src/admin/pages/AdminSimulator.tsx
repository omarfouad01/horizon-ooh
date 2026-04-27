// v2 - direct file upload, type/size dropdowns
import { useState, useRef } from 'react'
import { useStore, billboardSizeStore, simulatorTemplateStore, designUploadStore, type BillboardSize, type SimulatorTemplate, type DesignUpload } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA, Modal, ImagePicker } from '../ui'
import { Plus, Trash2, Pencil, Save, Image, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Billboard Sizes ───────────────────────────────────────────────────────────
function SizesTab() {
  const store = useStore()
  const sizes: BillboardSize[] = store.billboardSizes ?? []
  const [form, setForm] = useState<Partial<BillboardSize>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function openAdd() { setForm({}); setEditing(null); setOpen(true) }
  function openEdit(s: BillboardSize) { setForm({ ...s }); setEditing(s.id); setOpen(true) }

  async function save() {
    if (!form.label?.trim()) { toast.error('Label is required'); return }
    try {
      if (editing) {
        await billboardSizeStore.update(editing, form)
        toast.success('Size updated')
      } else {
        await billboardSizeStore.add(form as Omit<BillboardSize, 'id'>)
        toast.success('Size added')
      }
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Save failed')
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this size?')) return
    try {
      await billboardSizeStore.remove(id)
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{sizes.length} sizes defined</p>
        <Btn onClick={openAdd} className="flex items-center gap-1.5 text-sm"><Plus size={14} />Add Size</Btn>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Label</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Width (m)</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Height (m)</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Notes</th>
            <th className="px-4 py-3" />
          </tr></thead>
          <tbody>
            {sizes.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-semibold">{s.label}</td>
                <td className="px-4 py-3 text-gray-500">{s.widthM ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{s.heightM ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{s.notes ?? ''}</td>
                <td className="px-4 py-3 flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-gray-100"><Pencil size={13} /></button>
                  <button onClick={() => del(s.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {!sizes.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-300">No sizes yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? 'Edit Size' : 'Add Billboard Size'} onClose={() => setOpen(false)}
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={save}><Save size={14} className="mr-1" />Save</Btn></>}>
        <div className="space-y-4">
          <Field label="Label (e.g. 8 × 16 m)" value={form.label ?? ''} onChange={(e: any) => setForm(p => ({ ...p, label: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Width (m)" type="number" value={String(form.widthM ?? '')} onChange={(e: any) => setForm(p => ({ ...p, widthM: Number(e.target.value) }))} />
            <Field label="Height (m)" type="number" value={String(form.heightM ?? '')} onChange={(e: any) => setForm(p => ({ ...p, heightM: Number(e.target.value) }))} />
          </div>
          <TA label="Notes" value={form.notes ?? ''} onChange={(e: any) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
      </Modal>
    </div>
  )
}

// ── Simulator Templates ───────────────────────────────────────────────────────
interface TemplateFormState extends Partial<SimulatorTemplate> {
  mockupFile?: File | null   // new: direct file upload
  mockupPreview?: string     // preview data URL
}

function TemplatesTab() {
  const store = useStore()
  const templates: SimulatorTemplate[] = store.simulatorTemplates ?? []
  const sizes: BillboardSize[]          = store.billboardSizes    ?? []
  const adFormats: any[]                = (store as any).adFormats ?? []

  const [form, setForm] = useState<TemplateFormState>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen]       = useState(false)
  const fileRef               = useRef<HTMLInputElement>(null)

  function openAdd()  { setForm({ panels: [] }); setEditing(null); setOpen(true) }
  function openEdit(t: SimulatorTemplate) { setForm({ ...t, mockupFile: null, mockupPreview: undefined }); setEditing(t.id); setOpen(true) }

  function handleMockupFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, mockupFile: file, mockupPreview: ev.target?.result as string }))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function save() {
    if (!form.typeName?.trim()) { toast.error('Type name is required'); return }
    try {
      const payload: any = {
        typeName:  form.typeName,
        sizeLabel: form.sizeLabel ?? '',
        notes:     form.notes ?? '',
        panels:    form.panels ?? [],
      }
      // If a new file was chosen, attach it; otherwise keep existing URL
      if (form.mockupFile) {
        payload.mockupFile = form.mockupFile   // will be sent as FormData by the API layer
      } else if (form.mockupUrl !== undefined) {
        payload.mockupUrl = form.mockupUrl
      }

      if (editing) {
        await simulatorTemplateStore.update(editing, payload)
        toast.success('Template updated')
      } else {
        await simulatorTemplateStore.add(payload as Omit<SimulatorTemplate, 'id'>)
        toast.success('Template added')
      }
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Save failed')
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this template?')) return
    try {
      await simulatorTemplateStore.remove(id)
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  // Preview URL: prefer newly uploaded file preview, then existing URL
  const mockupPreviewUrl = form.mockupPreview ?? form.mockupUrl ?? ''

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{templates.length} templates defined</p>
        <Btn onClick={openAdd} className="flex items-center gap-1.5 text-sm"><Plus size={14} />Add Template</Btn>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Size</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Mockup</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Panels</th>
            <th className="px-4 py-3" />
          </tr></thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-semibold">{t.typeName}</td>
                <td className="px-4 py-3 text-gray-500">{t.sizeLabel || '—'}</td>
                <td className="px-4 py-3">
                  {t.mockupUrl ? <img src={t.mockupUrl} alt="" className="w-16 h-10 object-cover rounded" /> : <span className="text-gray-300 text-xs">None</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{(t.panels?.length ?? 0)} panel(s)</td>
                <td className="px-4 py-3 flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-gray-100"><Pencil size={13} /></button>
                  <button onClick={() => del(t.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {!templates.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-300">No templates yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? 'Edit Template' : 'Add Simulator Template'} onClose={() => setOpen(false)}
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={save}><Save size={14} className="mr-1" />Save</Btn></>}>
        <div className="space-y-4">

          {/* Type — dropdown from Ad Formats */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Billboard Type <span className="text-red-400">*</span>
            </label>
            {adFormats.length > 0 ? (
              <select
                value={form.typeName ?? ''}
                onChange={e => setForm(p => ({ ...p, typeName: e.target.value }))}
                className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white w-full focus:border-gray-400"
              >
                <option value="">— Select billboard type —</option>
                {adFormats.map((f: any) => (
                  <option key={f.id} value={f.name}>{f.name}</option>
                ))}
              </select>
            ) : (
              <Field
                value={form.typeName ?? ''}
                onChange={(e: any) => setForm(p => ({ ...p, typeName: e.target.value }))}
                placeholder="e.g. Uni-Pole, Double Decker (add types in Ad Formats)"
                required
              />
            )}
            {adFormats.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-1">
                No ad formats configured — add them in the Ad Formats section of the dashboard, or type manually above.
              </p>
            )}
          </div>

          {/* Size — dropdown from Billboard Sizes */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Size
            </label>
            {sizes.length > 0 ? (
              <select
                value={form.sizeLabel ?? ''}
                onChange={e => setForm(p => ({ ...p, sizeLabel: e.target.value }))}
                className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none bg-white w-full focus:border-gray-400"
              >
                <option value="">— Select size —</option>
                {sizes.map(s => (
                  <option key={s.id} value={s.label}>{s.label}</option>
                ))}
              </select>
            ) : (
              <Field
                value={form.sizeLabel ?? ''}
                onChange={(e: any) => setForm(p => ({ ...p, sizeLabel: e.target.value }))}
                placeholder="e.g. 8×16 (add sizes in Billboard Sizes tab)"
              />
            )}
            {sizes.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-1">
                No sizes configured — add them in the Billboard Sizes tab above.
              </p>
            )}
          </div>

          {/* Mockup Photo — direct file upload */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Mockup Street Photo
            </label>
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all
                ${mockupPreviewUrl ? 'border-green-300 p-2' : 'border-gray-200 hover:border-red-300 hover:bg-red-50/20 p-6'}`}
              onClick={() => fileRef.current?.click()}
            >
              {mockupPreviewUrl ? (
                <>
                  <img src={mockupPreviewUrl} alt="Mockup preview" className="max-h-40 w-auto rounded-lg object-contain" />
                  <p className="text-[10px] text-gray-400 mt-2">Click to replace photo</p>
                </>
              ) : (
                <>
                  <Image size={28} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">Click to upload street photo</p>
                  <p className="text-[11px] text-gray-400 mt-1">JPG, PNG · Max 10MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMockupFile} />
            </div>
            {mockupPreviewUrl && !form.mockupFile && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, mockupUrl: '', mockupPreview: undefined, mockupFile: null })) }}
                className="text-[11px] text-red-400 hover:text-red-600 mt-1"
              >
                Remove photo
              </button>
            )}
          </div>

          <TA label="Notes" value={form.notes ?? ''} onChange={(e: any) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
          <p className="text-xs text-gray-400 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
            💡 After saving, open this template to set the 4 corner points that define the design placement area on the mockup photo.
          </p>
        </div>
      </Modal>
    </div>
  )
}

// ── Design Uploads ────────────────────────────────────────────────────────────
function UploadsTab() {
  const store = useStore()
  const uploads: DesignUpload[] = store.designUploads ?? []
  const [search, setSearch] = useState('')

  const filtered = uploads.filter(u => {
    const q = search.toLowerCase()
    return !q || (u.userName ?? '').toLowerCase().includes(q) || (u.userEmail ?? '').toLowerCase().includes(q) || (u.typeName ?? '').toLowerCase().includes(q)
  })

  async function del(id: string) {
    if (!confirm('Delete this upload?')) return
    try { await designUploadStore.remove(id); toast.success('Deleted') } catch { toast.error('Delete failed') }
  }

  async function setStatus(id: string, status: string) {
    try { await designUploadStore.update(id, { status }); toast.success('Status updated') } catch { toast.error('Update failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{uploads.length} design upload(s)</p>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or type..."
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg w-64 outline-none focus:border-blue-400" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Type / Size</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Design</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
            <th className="px-4 py-3" />
          </tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-semibold">{u.userName ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{u.userEmail ?? ''}</p>
                  {u.userPhone && <p className="text-xs text-gray-400">{u.userPhone}</p>}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{u.typeName ?? '—'}</p>
                  <p className="text-xs text-gray-400">{u.sizeLabel ?? ''}</p>
                </td>
                <td className="px-4 py-3">
                  {u.designUrl ? <a href={u.designUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline text-xs">View</a> : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <select value={u.status ?? 'pending'} onChange={e => setStatus(u.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 outline-none">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 flex items-center gap-2 justify-end">
                  <button onClick={() => del(u.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-300">No uploads yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = 'sizes' | 'templates' | 'uploads'

export default function AdminSimulator() {
  const [tab, setTab] = useState<Tab>('sizes')

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'sizes',     label: 'Billboard Sizes',      icon: Layers },
    { id: 'templates', label: 'Simulator Templates',  icon: Image },
    { id: 'uploads',   label: 'Design Uploads',        icon: Save },
  ]

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Ad Design Simulator"
        subtitle="Manage billboard sizes, simulator templates, and uploaded designs"
      />

      {/* Tabs */}
      <div className="flex gap-1 mt-6 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'sizes'     && <SizesTab />}
      {tab === 'templates' && <TemplatesTab />}
      {tab === 'uploads'   && <UploadsTab />}
    </div>
  )
}
