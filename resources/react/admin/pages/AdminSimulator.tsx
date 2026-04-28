/**
 * AdminSimulator.tsx — Admin panel for managing Ad Design Simulator
 * Tabs: Billboard Sizes | Simulator Templates | Design Uploads
 *
 * Templates tab features:
 *  - Upload street photo directly (ImagePicker)
 *  - Type dropdown from Ad Formats
 *  - Size dropdown from Billboard Sizes
 *  - Visual corner picker: drag 4 dots on the mockup photo per panel
 *  - Multi-panel support (Add Panel button, up to 3 panels per template)
 *  - Save button always visible in the modal footer
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  useStore,
  billboardSizeStore, simulatorTemplateStore, designUploadStore,
  type BillboardSize, type SimulatorTemplate, type DesignUpload, type SimPanel, type SimCorner,
} from '@/store/dataStore'
import { Btn, PageHeader, Field, TA, Modal, ImagePicker } from '../ui'
import { Plus, Trash2, Pencil, Save, Image, Layers, X, Move } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Colours & Labels ────────────────────────────────────────────────────────
const PANEL_COLORS = ['#D90429', '#7C3AED', '#D97706']
const PANEL_NAMES  = ['Panel 1', 'Panel 2', 'Panel 3']
const DEFAULT_CORNERS: SimPanel = [
  { x: 100, y: 100 },
  { x: 500, y: 100 },
  { x: 500, y: 400 },
  { x: 100, y: 400 },
]

// ─── Corner Picker ───────────────────────────────────────────────────────────
interface CornerPickerProps {
  mockupUrl: string          // data URL or remote URL
  panels:    SimPanel[]      // array of panels, each = 4 corners in natural image coords
  onChange:  (panels: SimPanel[]) => void
  activePanelIdx: number
}

function CornerPicker({ mockupUrl, panels, onChange, activePanelIdx }: CornerPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef       = useRef<HTMLImageElement>(null)
  const dragging     = useRef<{ panelIdx: number; cornerIdx: number } | null>(null)
  const [imgBounds, setImgBounds] = useState({ w: 0, h: 0, offX: 0, offY: 0, natW: 1, natH: 1 })

  // Measure rendered image dimensions (object-fit: contain)
  const measure = useCallback(() => {
    const img  = imgRef.current
    const cont = containerRef.current
    if (!img || !cont) return
    const natW = img.naturalWidth  || 600
    const natH = img.naturalHeight || 400
    const contW = cont.clientWidth
    const contH = cont.clientHeight
    const scale = Math.min(contW / natW, contH / natH)
    const w = natW * scale
    const h = natH * scale
    const offX = (contW - w) / 2
    const offY = (contH - h) / 2
    setImgBounds({ w, h, offX, offY, natW, natH })
  }, [])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    if (img.complete && img.naturalWidth) measure()
    else img.onload = measure
  }, [mockupUrl, measure])

  // Convert display coords → natural image coords
  function toNatural(dx: number, dy: number) {
    return {
      x: Math.round(((dx - imgBounds.offX) / imgBounds.w) * imgBounds.natW),
      y: Math.round(((dy - imgBounds.offY) / imgBounds.h) * imgBounds.natH),
    }
  }

  // Convert natural coords → display coords
  function toDisplay(nx: number, ny: number) {
    return {
      x: (nx / imgBounds.natW) * imgBounds.w + imgBounds.offX,
      y: (ny / imgBounds.natH) * imgBounds.h + imgBounds.offY,
    }
  }

  // Mouse/touch handlers
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const rect = containerRef.current!.getBoundingClientRect()
    const dx = e.clientX - rect.left
    const dy = e.clientY - rect.top
    const nat = toNatural(dx, dy)
    const { panelIdx, cornerIdx } = dragging.current
    const next = panels.map((p, pi) =>
      pi === panelIdx
        ? p.map((c, ci) => ci === cornerIdx ? { x: Math.max(0,Math.min(nat.x, imgBounds.natW)), y: Math.max(0,Math.min(nat.y, imgBounds.natH)) } : c) as SimPanel
        : p
    )
    onChange(next)
  }

  function onMouseUp() { dragging.current = null }

  useEffect(() => {
    const up = () => { dragging.current = null }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  const CONT_H = 420

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 rounded-xl overflow-hidden select-none cursor-crosshair"
      style={{ height: CONT_H }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <img
        ref={imgRef}
        src={mockupUrl}
        alt="Mockup"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* SVG lines for each panel */}
      {imgBounds.w > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ height: CONT_H }}>
          {panels.map((panel, pi) => {
            const color = PANEL_COLORS[pi % PANEL_COLORS.length]
            const pts = panel.map(c => toDisplay(c.x, c.y))
            const d = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y} L ${pts[3].x} ${pts[3].y} Z`
            const isActive = pi === activePanelIdx
            return (
              <path
                key={pi}
                d={d}
                fill={color + '22'}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeDasharray={isActive ? undefined : '5,4'}
                opacity={isActive ? 1 : 0.5}
              />
            )
          })}
        </svg>
      )}

      {/* Draggable corner dots */}
      {imgBounds.w > 0 && panels.map((panel, pi) => {
        const color = PANEL_COLORS[pi % PANEL_COLORS.length]
        const isActive = pi === activePanelIdx
        return panel.map((corner, ci) => {
          const dp = toDisplay(corner.x, corner.y)
          return (
            <div
              key={`${pi}-${ci}`}
              className="absolute z-20 flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125"
              style={{
                width: isActive ? 20 : 14,
                height: isActive ? 20 : 14,
                background: color,
                left: dp.x - (isActive ? 10 : 7),
                top:  dp.y - (isActive ? 10 : 7),
                cursor: 'grab',
                opacity: isActive ? 1 : 0.6,
              }}
              onMouseDown={e => {
                e.preventDefault()
                dragging.current = { panelIdx: pi, cornerIdx: ci }
              }}
            >
              {isActive && <Move size={8} className="text-white" />}
            </div>
          )
        })
      })}

      {/* Panel labels in corners */}
      {imgBounds.w > 0 && panels.map((panel, pi) => {
        const color = PANEL_COLORS[pi % PANEL_COLORS.length]
        const dp = toDisplay(panel[0].x, panel[0].y)
        return (
          <div
            key={pi}
            className="absolute z-10 px-1.5 py-0.5 rounded text-[10px] font-bold text-white pointer-events-none"
            style={{ left: dp.x + 4, top: dp.y - 18, background: color }}
          >
            {PANEL_NAMES[pi] ?? `Panel ${pi + 1}`}
          </div>
        )
      })}
    </div>
  )
}

// ─── Billboard Sizes Tab ─────────────────────────────────────────────────────
function SizesTab() {
  const store = useStore()
  const sizes: BillboardSize[] = store.billboardSizes ?? []
  const [form, setForm]   = useState<Partial<BillboardSize>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen]   = useState(false)

  function openAdd()  { setForm({});           setEditing(null);   setOpen(true) }
  function openEdit(s: BillboardSize) { setForm({ ...s }); setEditing(s.id); setOpen(true) }

  async function save() {
    if (!form.label?.trim()) { toast.error('Label is required'); return }
    try {
      if (editing) { await billboardSizeStore.update(editing, form); toast.success('Size updated') }
      else         { await billboardSizeStore.add(form as Omit<BillboardSize,'id'>); toast.success('Size added') }
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Save failed')
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this size?')) return
    try { await billboardSizeStore.remove(id); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
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
                  <button onClick={() => del(s.id)}   className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
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
            <Field label="Width (m)"  type="number" value={String(form.widthM  ?? '')} onChange={(e: any) => setForm(p => ({ ...p, widthM:  Number(e.target.value) }))} />
            <Field label="Height (m)" type="number" value={String(form.heightM ?? '')} onChange={(e: any) => setForm(p => ({ ...p, heightM: Number(e.target.value) }))} />
          </div>
          <TA label="Notes" value={form.notes ?? ''} onChange={(e: any) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
      </Modal>
    </div>
  )
}

// ─── Templates Tab ───────────────────────────────────────────────────────────
interface TFormState extends Partial<SimulatorTemplate> {
  mockupFile?:    File | null
  mockupPreview?: string       // data URL for preview
}

function TemplatesTab() {
  const store      = useStore()
  const templates: SimulatorTemplate[] = store.simulatorTemplates ?? []
  const sizes:     BillboardSize[]     = store.billboardSizes     ?? []
  const adFormats: any[]               = (store as any).adFormats ?? []

  const [form, setForm]         = useState<TFormState>({})
  const [editing, setEditing]   = useState<string | null>(null)
  const [open, setOpen]         = useState(false)
  const [activePanelIdx, setActivePanelIdx] = useState(0)

  function openAdd() {
    setForm({ panels: [JSON.parse(JSON.stringify(DEFAULT_CORNERS))] })
    setEditing(null)
    setActivePanelIdx(0)
    setOpen(true)
  }

  function openEdit(t: SimulatorTemplate) {
    setForm({ ...t, mockupFile: null, mockupPreview: undefined })
    setEditing(t.id)
    setActivePanelIdx(0)
    setOpen(true)
  }

  function handleMockupPick(url: string, _alt?: string) {
    setForm(p => ({ ...p, mockupPreview: url, mockupUrl: url, mockupFile: null }))
  }

  // Panel management
  function addPanel() {
    if ((form.panels?.length ?? 0) >= 3) { toast('Maximum 3 panels'); return }
    setForm(p => ({ ...p, panels: [...(p.panels ?? []), JSON.parse(JSON.stringify(DEFAULT_CORNERS))] }))
    setActivePanelIdx((form.panels?.length ?? 0))
  }

  function removePanel(idx: number) {
    if ((form.panels?.length ?? 0) <= 1) { toast.error('Minimum 1 panel'); return }
    setForm(p => {
      const nxt = (p.panels ?? []).filter((_, i) => i !== idx)
      return { ...p, panels: nxt }
    })
    setActivePanelIdx(prev => Math.min(prev, (form.panels?.length ?? 2) - 2))
  }

  function handleCornersChange(panels: SimPanel[]) {
    setForm(p => ({ ...p, panels }))
  }

  async function save() {
    if (!form.typeName?.trim()) { toast.error('Billboard type is required'); return }
    try {
      const payload: any = {
        typeName:  form.typeName,
        sizeLabel: form.sizeLabel ?? '',
        notes:     form.notes    ?? '',
        panels:    form.panels   ?? [],
      }
      if (form.mockupFile) {
        payload.mockupFile = form.mockupFile
      } else if (form.mockupUrl !== undefined) {
        payload.mockupUrl = form.mockupUrl
      }
      if (editing) {
        await simulatorTemplateStore.update(editing, payload)
        toast.success('Template updated')
      } else {
        await simulatorTemplateStore.add(payload as Omit<SimulatorTemplate,'id'>)
        toast.success('Template added')
      }
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Save failed')
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this template?')) return
    try { await simulatorTemplateStore.remove(id); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const previewUrl  = form.mockupPreview ?? form.mockupUrl ?? ''
  const panelCount  = form.panels?.length ?? 0

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
                  {t.mockupUrl
                    ? <img src={t.mockupUrl} alt="" className="w-16 h-10 object-cover rounded" />
                    : <span className="text-gray-300 text-xs">None</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-500">{t.panels?.length ?? 0} panel(s)</span>
                  {(t.panels?.length ?? 0) > 1 && (
                    <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">
                      {t.panels!.length} panels
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-gray-100"><Pencil size={13} /></button>
                  <button onClick={() => del(t.id)}   className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {!templates.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-300">No templates yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={open}
        title={editing ? 'Edit Template' : 'Add Simulator Template'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn onClick={save}><Save size={14} className="mr-1" />Save Template</Btn>
          </>
        }
      >
        <div className="space-y-5">

          {/* Type */}
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
                placeholder="e.g. Uni-Pole, Double Decker"
                required
              />
            )}
            {adFormats.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-1">
                No ad formats configured — add them in the Ad Formats section, or type manually above.
              </p>
            )}
          </div>

          {/* Size */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Size</label>
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
                placeholder="e.g. 8 × 16 m (add sizes in Billboard Sizes tab)"
              />
            )}
          </div>

          {/* Mockup Photo Upload */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Mockup Street Photo
            </label>
            <ImagePicker
              value={previewUrl}
              altValue=""
              onChange={(url, _alt) => handleMockupPick(url)}
            />
          </div>

          {/* ── Corner Picker Section ── */}
          {previewUrl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Design Placement Areas ({panelCount} panel{panelCount !== 1 ? 's' : ''})
                </label>
                {panelCount < 3 && (
                  <button
                    type="button"
                    onClick={addPanel}
                    className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <Plus size={12} />Add Panel
                  </button>
                )}
              </div>

              {/* Panel tabs */}
              {panelCount > 1 && (
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {(form.panels ?? []).map((_, pi) => (
                    <div key={pi} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActivePanelIdx(pi)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
                          activePanelIdx === pi
                            ? 'text-white border-transparent'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}
                        style={activePanelIdx === pi ? { background: PANEL_COLORS[pi % PANEL_COLORS.length], borderColor: PANEL_COLORS[pi % PANEL_COLORS.length] } : {}}
                      >
                        {PANEL_NAMES[pi] ?? `Panel ${pi + 1}`}
                      </button>
                      {panelCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removePanel(pi)}
                          className="p-0.5 rounded text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Instructions */}
              <p className="text-[11px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-3 border border-blue-100">
                🖱 Drag the coloured dots to define the billboard area for <strong>{PANEL_NAMES[activePanelIdx] ?? `Panel ${activePanelIdx + 1}`}</strong>.
                Set them to the 4 corners of the billboard face (Top-Left → Top-Right → Bottom-Right → Bottom-Left).
              </p>

              {/* Visual corner picker */}
              <CornerPicker
                mockupUrl={previewUrl}
                panels={form.panels ?? []}
                onChange={handleCornersChange}
                activePanelIdx={activePanelIdx}
              />

              <p className="text-[10px] text-gray-400 mt-1.5">
                Corners are stored in natural image coordinates and scale correctly at all display sizes.
              </p>
            </div>
          )}

          {!previewUrl && (
            <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100">
              📸 Upload a street photo above to enable corner placement for the billboard area.
            </p>
          )}

          <TA label="Notes" value={form.notes ?? ''} onChange={(e: any) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
      </Modal>
    </div>
  )
}

// ─── Design Uploads Tab ───────────────────────────────────────────────────────
function UploadsTab() {
  const store   = useStore()
  const uploads: DesignUpload[] = store.designUploads ?? []
  const [search, setSearch] = useState('')

  const filtered = uploads.filter(u => {
    const q = search.toLowerCase()
    return !q
      || (u.userName  ?? '').toLowerCase().includes(q)
      || (u.userEmail ?? '').toLowerCase().includes(q)
      || (u.typeName  ?? '').toLowerCase().includes(q)
  })

  async function del(id: string) {
    if (!confirm('Delete this upload?')) return
    try { await designUploadStore.remove(id); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  async function setStatus(id: string, status: string) {
    try { await designUploadStore.update(id, { status }); toast.success('Status updated') }
    catch { toast.error('Update failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{uploads.length} design upload(s)</p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or type…"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg w-64 outline-none focus:border-blue-400"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
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
                  <p className="font-semibold">{u.userName  ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{u.userEmail ?? ''}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{u.userPhone ?? '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{u.typeName ?? '—'}</p>
                  <p className="text-xs text-gray-400">{u.sizeLabel ?? ''}</p>
                </td>
                <td className="px-4 py-3">
                  {u.designUrl
                    ? <a href={u.designUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline text-xs">View</a>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.status ?? 'pending'}
                    onChange={e => setStatus(u.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 flex items-center gap-2 justify-end">
                  <button onClick={() => del(u.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-300">No uploads yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = 'sizes' | 'templates' | 'uploads'

export default function AdminSimulator() {
  const [tab, setTab] = useState<Tab>('templates')

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'sizes',     label: 'Billboard Sizes',     icon: Layers },
    { id: 'templates', label: 'Simulator Templates', icon: Image  },
    { id: 'uploads',   label: 'Design Uploads',       icon: Save   },
  ]

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Ad Design Simulator"
        subtitle="Manage billboard sizes, simulator templates with visual corner placement, and uploaded designs"
      />

      {/* Tabs */}
      <div className="flex gap-1 mt-6 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
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
