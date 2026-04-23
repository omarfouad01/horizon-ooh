/**
 * AdminSimulator.tsx — Admin page
 * Three tabs:
 *   1. Billboard Sizes  — manage available sizes dropdown
 *   2. Simulator Templates — manage type+size combinations with mockup photo and corner points
 *   3. Design Uploads   — view user submissions (with name, email, phone)
 */
import { useState, useRef } from 'react';
import { Trash2, Plus, Edit2, Download, Phone, Mail, User, Monitor, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/dataStore';
import { billboardSizeStore, simulatorTemplateStore, designUploadStore } from '@/store/dataStore';
import type { BillboardSize, SimulatorTemplate, DesignUpload } from '@/store/dataStore';
import { Btn, Field, TA, Sel } from '@/admin/ui';
import { ImagePicker } from '@/admin/ui';
import SimulatorCanvas, { type SimulatorCanvasRef, type Corner } from '@/components/SimulatorCanvas';

const NAVY = '#0B0F1A', RED = '#D90429';

// ── Status badge ───────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: 'rgba(245,158,11,0.1)',  text: '#d97706' },
  reviewed: { bg: 'rgba(59,130,246,0.1)',  text: '#2563eb' },
  approved: { bg: 'rgba(34,197,94,0.1)',   text: '#16a34a' },
  rejected: { bg: 'rgba(239,68,68,0.1)',   text: '#dc2626' },
};
function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ ...c, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch { return iso; }
}

// Default corners — sensible rectangle in the middle of the image
const DEFAULT_CORNERS: [Corner,Corner,Corner,Corner] = [
  { x: 0.15, y: 0.2 },
  { x: 0.85, y: 0.2 },
  { x: 0.85, y: 0.75 },
  { x: 0.15, y: 0.75 },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminSimulator() {
  const store = useStore();
  const billboardSizes:     BillboardSize[]     = (store as any).billboardSizes     ?? [];
  const simulatorTemplates: SimulatorTemplate[] = (store as any).simulatorTemplates ?? [];
  const designUploads:      DesignUpload[]      = (store as any).designUploads      ?? [];

  const [activeTab, setActiveTab] = useState<'sizes' | 'templates' | 'uploads'>('sizes');

  // ── Tab: Sizes ─────────────────────────────────────────────────────────────
  const SizesTab = () => {
    const [editing, setEditing] = useState<BillboardSize | null>(null);
    const [form, setForm] = useState({ label: '', widthM: '', heightM: '', notes: '' });

    const startAdd = () => { setEditing({ id: '', label: '', notes: '' }); setForm({ label: '', widthM: '', heightM: '', notes: '' }); };
    const startEdit = (s: BillboardSize) => {
      setEditing(s);
      setForm({ label: s.label, widthM: String(s.widthM ?? ''), heightM: String(s.heightM ?? ''), notes: s.notes ?? '' });
    };
    const cancel = () => setEditing(null);
    const save = () => {
      if (!form.label.trim()) { toast.error('Label is required'); return; }
      if (editing!.id) {
        billboardSizeStore.update(editing!.id, { label: form.label, widthM: parseFloat(form.widthM) || undefined, heightM: parseFloat(form.heightM) || undefined, notes: form.notes });
        toast.success('Size updated');
      } else {
        billboardSizeStore.add({ label: form.label, widthM: parseFloat(form.widthM) || undefined, heightM: parseFloat(form.heightM) || undefined, notes: form.notes });
        toast.success('Size added');
      }
      setEditing(null);
    };
    const remove = (id: string) => { billboardSizeStore.remove(id); toast.success('Removed'); };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-lg" style={{ color: NAVY }}>Billboard Sizes</h2>
            <p className="text-sm text-gray-400 mt-0.5">Manage the size dropdown used when creating billboards.</p>
          </div>
          <Btn onClick={startAdd}><Plus size={14} /> Add Size</Btn>
        </div>

        {/* Add/Edit form */}
        {editing !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4" style={{ color: NAVY }}>{editing.id ? 'Edit Size' : 'New Size'}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Size Label *" placeholder="e.g. 8×16 m" value={form.label} onChange={(e:any) => setForm(f => ({ ...f, label: e.target.value }))} />
              <Field label="Notes" placeholder="Optional note" value={form.notes} onChange={(e:any) => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Field label="Width (m)" type="number" placeholder="8" value={form.widthM} onChange={(e:any) => setForm(f => ({ ...f, widthM: e.target.value }))} />
              <Field label="Height (m)" type="number" placeholder="16" value={form.heightM} onChange={(e:any) => setForm(f => ({ ...f, heightM: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <Btn onClick={save}>Save</Btn>
              <Btn variant="ghost" onClick={cancel}>Cancel</Btn>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {billboardSizes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Monitor size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No sizes yet. Add your first size.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Label</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Dimensions</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Notes</th>
                <th className="px-5 py-3" />
              </tr></thead>
              <tbody>
                {billboardSizes.map(sz => (
                  <tr key={sz.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-bold" style={{ color: NAVY }}>{sz.label}</td>
                    <td className="px-5 py-3 text-gray-500">{sz.widthM && sz.heightM ? `${sz.widthM} × ${sz.heightM} m` : '—'}</td>
                    <td className="px-5 py-3 text-gray-400">{sz.notes || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => startEdit(sz)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={14} /></button>
                        <button onClick={() => remove(sz.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // ── Tab: Templates ─────────────────────────────────────────────────────────
  const TemplatesTab = () => {
    const [editing, setEditing] = useState<SimulatorTemplate | null>(null);
    const [previewDesign, setPreviewDesign] = useState('');
    const [corners, setCorners] = useState<[Corner,Corner,Corner,Corner]>(DEFAULT_CORNERS);
    const canvasRef = useRef<SimulatorCanvasRef>(null);

    // Unique ad format types from adFormats in the store
    const adTypes = Array.from(new Set([
      ...store.adFormats.map((f: any) => f.name || f.label),
      ...simulatorTemplates.map(t => t.typeName),
    ])).filter(Boolean).sort();

    const startAdd = () => {
      setEditing({ id: '', typeName: '', sizeLabel: '', mockupUrl: '', corners: [...DEFAULT_CORNERS] as any });
      setCorners(DEFAULT_CORNERS);
      setPreviewDesign('');
    };
    const startEdit = (t: SimulatorTemplate) => {
      setEditing(t);
      setCorners(t.corners ?? DEFAULT_CORNERS);
      setPreviewDesign('');
    };
    const cancel = () => { setEditing(null); setPreviewDesign(''); };
    const save = () => {
      if (!editing) return;
      if (!editing.typeName || !editing.sizeLabel) { toast.error('Type and size are required'); return; }
      if (!editing.mockupUrl) { toast.error('Please upload a mockup photo'); return; }
      const tplData = { ...editing, corners };
      if (tplData.id) {
        simulatorTemplateStore.update(tplData.id, tplData);
        toast.success('Template updated');
      } else {
        simulatorTemplateStore.add({ typeName: tplData.typeName, sizeLabel: tplData.sizeLabel, mockupUrl: tplData.mockupUrl, corners, notes: tplData.notes });
        toast.success('Template added');
      }
      setEditing(null);
    };
    const remove = (id: string) => { simulatorTemplateStore.remove(id); toast.success('Removed'); };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-lg" style={{ color: NAVY }}>Simulator Templates</h2>
            <p className="text-sm text-gray-400 mt-0.5">Configure mockup photos and corner points for each billboard type + size combination.</p>
          </div>
          <Btn onClick={startAdd}><Plus size={14} /> Add Template</Btn>
        </div>

        {/* Editor */}
        {editing !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-sm mb-5" style={{ color: NAVY }}>
              {editing.id ? 'Edit Template' : 'New Template'}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <Sel label="Billboard Type *"
                value={editing.typeName}
                onChange={(e:any) => setEditing(t => t ? { ...t, typeName: e.target.value } : t)}
                options={[{value:'',label:'Select type…'},...adTypes.map((t:string)=>({value:t,label:t}))]}
              />
              <Sel label="Size *"
                value={editing.sizeLabel}
                onChange={(e:any) => setEditing(t => t ? { ...t, sizeLabel: e.target.value } : t)}
                options={[{value:'',label:'Select size…'},...billboardSizes.map((sz:any)=>({value:sz.label,label:sz.label}))]}
              />
              <div className="col-span-2">
                <Field label="Notes" placeholder="Optional description" value={editing.notes ?? ''}
                  onChange={(e:any) => setEditing(t => t ? { ...t, notes: e.target.value } : t)} />
              </div>
            </div>

            {/* Mockup photo */}
            <div className="mb-5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Mockup Photo *</label>
              <ImagePicker value={editing.mockupUrl} onChange={(url: string) => setEditing(t => t ? { ...t, mockupUrl: url } : t)} />
            </div>

            {/* Corner point picker — shown when mockup is set */}
            {editing.mockupUrl && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair size={15} color={RED} />
                  <p className="font-bold text-sm" style={{ color: NAVY }}>Set Corner Points</p>
                  <span className="text-xs text-gray-400">— drag the colored handles to the exact corners of the billboard surface</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3 text-xs text-gray-500 font-semibold">
                  {['🟢 TL (top-left)', '🔵 TR (top-right)', '🟡 BR (bottom-right)', '🔴 BL (bottom-left)'].map(l => (
                    <span key={l}>{l}</span>
                  ))}
                </div>

                {/* Preview design picker for live testing */}
                <div className="mb-3">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Test Design (optional)</label>
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setPreviewDesign(URL.createObjectURL(f));
                  }} className="text-xs text-gray-500" />
                  <p className="text-[11px] text-gray-400 mt-1">Upload a test image to see how designs look with your corner points.</p>
                </div>

                <SimulatorCanvas
                  ref={canvasRef}
                  mockupUrl={editing.mockupUrl}
                  designUrl={previewDesign || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="%23D90429" opacity="0.7"/><text x="50%25" y="50%25" fill="white" font-size="48" font-family="Arial" font-weight="bold" text-anchor="middle" dominant-baseline="middle">YOUR DESIGN</text></svg>'}
                  corners={corners}
                  editMode={true}
                  onCornersChange={newCorners => setCorners(newCorners)}
                  style={{ borderRadius: 10, overflow: 'hidden', border: '2px solid #e5e7eb' }}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Current corners: {corners.map((c,i) => `${['TL','TR','BR','BL'][i]}(${(c.x*100).toFixed(1)}%, ${(c.y*100).toFixed(1)}%)`).join(' · ')}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Btn onClick={save}>Save Template</Btn>
              <Btn variant="ghost" onClick={cancel}>Cancel</Btn>
            </div>
          </div>
        )}

        {/* Templates list */}
        <div className="grid grid-cols-1 gap-4">
          {simulatorTemplates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">
              <Monitor size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No templates yet. Add your first template.</p>
            </div>
          ) : (
            simulatorTemplates.map(tpl => (
              <div key={tpl.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5 items-start">
                <div style={{ width: 100, height: 70, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                  {tpl.mockupUrl ? (
                    <img src={tpl.mockupUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Monitor size={20} color="#d1d5db" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm" style={{ color: NAVY }}>{tpl.typeName} — {tpl.sizeLabel}</p>
                  {tpl.notes && <p className="text-xs text-gray-400 mt-0.5">{tpl.notes}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">
                    Corners: {tpl.corners?.map((c,i) => `${['TL','TR','BR','BL'][i]}(${(c.x*100).toFixed(1)}%,${(c.y*100).toFixed(1)}%)`).join(' · ') ?? 'Not set'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(tpl)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={14} /></button>
                  <button onClick={() => remove(tpl.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ── Tab: Design Uploads ────────────────────────────────────────────────────
  const UploadsTab = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const filtered = statusFilter ? designUploads.filter(u => u.status === statusFilter) : designUploads;
    const sorted   = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-lg" style={{ color: NAVY }}>Design Uploads</h2>
            <p className="text-sm text-gray-400 mt-0.5">{designUploads.length} submission{designUploads.length !== 1 ? 's' : ''} total</p>
          </div>
          <Sel value={statusFilter} onChange={(e:any) => setStatusFilter(e.target.value)}
            options={[
              {value:'',label:'All Statuses'},
              {value:'pending',label:'Pending'},
              {value:'reviewed',label:'Reviewed'},
              {value:'approved',label:'Approved'},
              {value:'rejected',label:'Rejected'},
            ]}/>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">
            <Monitor size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">No uploads yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Design</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Format</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    {/* Design thumbnail */}
                    <td className="px-5 py-3">
                      <div style={{ width: 64, height: 40, borderRadius: 6, overflow: 'hidden', background: '#f3f4f6' }}>
                        <img src={u.designUrl} alt="design"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    </td>
                    {/* User name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `rgba(217,4,41,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={13} color={RED} />
                        </div>
                        <div>
                          <p className="font-semibold text-xs" style={{ color: NAVY }}>{u.userName || '—'}</p>
                          {u.userId && u.userId !== 'guest' && (
                            <p className="text-[10px] text-gray-400">ID: {u.userId}</p>
                          )}
                          {u.userId === 'guest' && (
                            <p className="text-[10px] text-gray-400">Guest</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Contact: email + phone */}
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        {u.userEmail && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={11} color="#9ca3af" />
                            <a href={`mailto:${u.userEmail}`} className="text-xs text-blue-600 hover:underline">{u.userEmail}</a>
                          </div>
                        )}
                        {u.userPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} color="#9ca3af" />
                            <a href={`tel:${u.userPhone}`} className="text-xs text-gray-600 hover:underline">{u.userPhone}</a>
                          </div>
                        )}
                        {!u.userEmail && !u.userPhone && <span className="text-xs text-gray-400">—</span>}
                      </div>
                    </td>
                    {/* Format */}
                    <td className="px-5 py-3">
                      <p className="font-semibold text-xs" style={{ color: NAVY }}>{u.typeName}</p>
                      <p className="text-[11px] text-gray-400">{u.sizeLabel}</p>
                      {u.productName && <p className="text-[11px] text-gray-400">{u.productName}</p>}
                    </td>
                    {/* Date */}
                    <td className="px-5 py-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                    {/* Status */}
                    <td className="px-5 py-3">
                      <Sel value={u.status}
                        onChange={(e:any) => { designUploadStore.update(u.id, { status: e.target.value as any }); toast.success('Status updated'); }}
                        options={[
                          {value:'pending',label:'Pending'},
                          {value:'reviewed',label:'Reviewed'},
                          {value:'approved',label:'Approved'},
                          {value:'rejected',label:'Rejected'},
                        ]}/>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <a href={u.designUrl} download target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                          <Download size={14} />
                        </a>
                        <button onClick={() => { designUploadStore.remove(u.id); toast.success('Removed'); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'sizes',     label: 'Billboard Sizes' },
    { id: 'templates', label: 'Simulator Templates' },
    { id: 'uploads',   label: `Design Uploads (${designUploads.length})` },
  ] as const;

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-black text-2xl tracking-tight" style={{ color: NAVY }}>Ad Design Simulator</h1>
        <p className="text-sm text-gray-400 mt-1">Manage billboard sizes, mockup templates, and user design submissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={activeTab === t.id
              ? { background: '#fff', color: NAVY, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { background: 'transparent', color: '#9ca3af' }
            }>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'sizes'     && <SizesTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'uploads'   && <UploadsTab />}
    </div>
  );
}
