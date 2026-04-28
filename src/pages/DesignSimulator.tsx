/**
 * DesignSimulator.tsx — Public page: "See Your Brand on Any Billboard"
 * Matches the site theme (dark hero, step indicators, navbar visible via Layout wrapper in App.tsx).
 * Login required to upload and save designs.
 */
import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useStore, designUploadStore } from '@/store/dataStore';
import SimulatorCanvas, { type SimulatorCanvasHandle } from '@/components/SimulatorCanvas';
import type { SimulatorTemplate } from '@/store/dataStore';
import { Upload, Download, ChevronRight, Layers, AlertCircle, LogIn, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSiteUser() {
  try {
    const r = localStorage.getItem('horizon_site_user') || localStorage.getItem('horizon_user');
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}

const PANEL_COLORS = ['#D90429', '#7C3AED', '#D97706'];
const PANEL_LABELS = ['Panel 1', 'Panel 2', 'Panel 3'];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all
        ${done ? 'bg-[#D90429] border-[#D90429] text-white' : active ? 'bg-white border-white text-[#0B0F1A]' : 'border-white/30 text-white/40'}`}>
        {done ? <CheckCircle2 size={14} /> : n}
      </div>
      <span className={`text-sm font-semibold hidden sm:block ${active ? 'text-white' : done ? 'text-white/70' : 'text-white/30'}`}>{label}</span>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({ index, panelCount, value, onChange }: {
  index: number; panelCount: number; value: string; onChange: (url: string) => void;
}) {
  const color = PANEL_COLORS[index % PANEL_COLORS.length];
  const label = PANEL_LABELS[index] ?? `Panel ${index + 1}`;
  return (
    <div>
      {panelCount > 1 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</p>
        </div>
      )}
      <label className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm overflow-hidden
        ${value ? 'border-green-400 bg-green-50/60' : 'border-gray-200 hover:bg-gray-50'}`}>
        {value ? (
          <div className="relative w-full h-full">
            <img src={value} alt="" className="w-full h-full object-contain p-1" />
          </div>
        ) : (
          <>
            <Upload size={22} className="text-gray-300 mb-1.5" />
            <span className="text-gray-400 text-xs font-medium">Click to upload (JPG / PNG)</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ev => onChange(ev.target?.result as string);
          reader.readAsDataURL(file);
          e.target.value = '';
        }} />
      </label>
      {value && (
        <button onClick={() => onChange('')} className="text-xs text-gray-400 hover:text-red-500 mt-1 ml-1 transition-colors">
          ↺ Change design
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DesignSimulator() {
  const store = useStore();
  const canvasRef = useRef<SimulatorCanvasHandle>(null);

  const templates: SimulatorTemplate[] = (store.simulatorTemplates ?? []).filter(
    t => t.mockupUrl && (t.panels?.length ?? 0) > 0
  );
  const allTemplates: SimulatorTemplate[] = store.simulatorTemplates ?? [];

  const [step, setStep]                   = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<SimulatorTemplate | null>(null);
  const [designFiles, setDesignFiles]     = useState<string[]>([]);
  const [downloading, setDownloading]     = useState(false);
  const [saving, setSaving]               = useState(false);

  const user = getSiteUser();
  const panelCount = selectedTemplate?.panels?.length ?? 1;
  const allUploaded = selectedTemplate
    ? Array.from({ length: panelCount }).every((_, i) => !!designFiles[i])
    : false;

  function handleTemplateSelect(t: SimulatorTemplate) {
    setSelectedTemplate(t);
    setDesignFiles([]);
    setStep(2);
  }

  function setDesign(idx: number, url: string) {
    setDesignFiles(prev => {
      const arr = [...prev];
      arr[idx] = url;
      return arr;
    });
  }

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await canvasRef.current.capture();
      if (!dataUrl) { toast.error('Could not generate image'); return; }
      const arr  = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/png';
      const bstr = atob(arr[1]);
      const u8   = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
      const blob = new Blob([u8], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `horizon-mockup-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      toast.success('Mockup downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedTemplate || !user) return;
    setSaving(true);
    try {
      await designUploadStore.add({
        userId:     user?.id    ?? '',
        userName:   user?.name  ?? 'Guest',
        userEmail:  user?.email ?? '',
        userPhone:  user?.phone ?? '',
        designUrl:  designFiles[0] ?? '',
        templateId: selectedTemplate.id,
        typeName:   selectedTemplate.typeName,
        sizeLabel:  selectedTemplate.sizeLabel ?? '',
      });
      toast.success('Design saved to dashboard!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save design');
    } finally { setSaving(false); }
  }, [selectedTemplate, designFiles, user]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Dark Hero Section ── */}
      <div className="bg-[#0B0F1A] text-white pt-12 pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow */}
          <p className="text-[#D90429] text-[11px] font-black tracking-[0.22em] uppercase mb-3">
            Ad Design Simulator
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight">
            See Your Brand on{' '}
            <span className="text-[#D90429]">Any Billboard</span>
          </h1>
          <p className="text-white/55 text-sm md:text-base max-w-lg mb-8">
            Upload your artwork and preview it on Egypt's outdoor advertising network.
          </p>

          {/* Step indicators */}
          <div className="flex items-center gap-3 flex-wrap">
            <StepDot n={1} label="Format"  active={step === 1} done={step > 1} />
            <ChevronRight size={14} className="text-white/20" />
            <StepDot n={2} label="Upload"  active={step === 2} done={step > 2} />
            <ChevronRight size={14} className="text-white/20" />
            <StepDot n={3} label="Preview" active={step === 3} done={false} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Not Logged In Gate ── */}
        {!user && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md mx-auto">
            <LogIn size={36} className="text-[#D90429] mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-500 text-sm mb-6">
              Please log in or create an account to use the design simulator and save your mockups.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/login"  className="px-5 py-2.5 bg-[#D90429] text-white font-bold rounded-xl text-sm hover:bg-[#b8031f] transition-colors">
                Login
              </Link>
              <Link to="/signup" className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:border-gray-400 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* ── Logged In: No Templates Yet ── */}
        {user && allTemplates.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto">
            <AlertCircle size={36} className="text-amber-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Simulator Coming Soon</h2>
            <p className="text-gray-500 text-sm mb-6">
              Our team is setting up billboard mockups. Check back soon or contact us to book a location.
            </p>
            <Link to="/contact" className="inline-block px-6 py-2.5 bg-[#D90429] text-white font-bold rounded-xl text-sm hover:bg-[#b8031f] transition-colors">
              Contact Our Team
            </Link>
          </div>
        )}

        {/* ── Logged In: Simulator ── */}
        {user && allTemplates.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left column: controls ── */}
            <div className="lg:col-span-1 space-y-5">

              {/* Step 1 — Choose Format */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D90429] text-white text-[10px] flex items-center justify-center font-black">1</span>
                  Choose Format
                </h3>
                {templates.length === 0 ? (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>Templates are being set up. Check back soon.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templates.map(t => {
                      const pc = t.panels?.length ?? 0;
                      const isSelected = selectedTemplate?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleTemplateSelect(t)}
                          className={`w-full text-left px-3 py-3 rounded-xl border-2 text-sm transition-all
                            ${isSelected
                              ? 'border-[#D90429] bg-red-50/60'
                              : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/60'}`}
                        >
                          <span className={`font-bold ${isSelected ? 'text-[#D90429]' : 'text-gray-900'}`}>
                            {t.typeName}
                          </span>
                          {t.sizeLabel && (
                            <span className="ml-1.5 text-xs text-gray-400 font-medium">— {t.sizeLabel}</span>
                          )}
                          {pc > 1 && (
                            <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded-full">
                              {pc} panels
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2 — Upload */}
              {selectedTemplate && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D90429] text-white text-[10px] flex items-center justify-center font-black">2</span>
                    Upload Your Design{panelCount > 1 ? 's' : ''}
                  </h3>
                  {panelCount > 1 && (
                    <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2 mb-3 font-semibold border border-purple-100">
                      {panelCount === 2 ? 'Double Decker' : 'Multi-Panel'} format — {panelCount} designs needed
                    </p>
                  )}
                  <div className="space-y-4">
                    {Array.from({ length: panelCount }).map((_, i) => (
                      <UploadZone
                        key={i}
                        index={i}
                        panelCount={panelCount}
                        value={designFiles[i] ?? ''}
                        onChange={url => setDesign(i, url)}
                      />
                    ))}
                  </div>
                  {allUploaded && (
                    <button
                      onClick={() => setStep(3)}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-[#D90429] text-white font-bold py-3 rounded-xl hover:bg-[#b8031f] transition-colors text-sm"
                    >
                      Preview Simulation <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              )}

              {/* Actions */}
              {allUploaded && selectedTemplate && (
                <div className="space-y-2">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 bg-[#0B0F1A] text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50 text-sm"
                  >
                    <Download size={15} />
                    {downloading ? 'Generating...' : 'Download Mockup'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors disabled:opacity-50 text-sm"
                  >
                    {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : 'Save to My Account'}
                  </button>
                </div>
              )}
            </div>

            {/* ── Right column: preview ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 420 }}>

                {/* Header bar */}
                <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</p>
                  {selectedTemplate && (
                    <p className="text-xs text-gray-500">
                      {selectedTemplate.typeName}{selectedTemplate.sizeLabel ? ` · ${selectedTemplate.sizeLabel}` : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center p-4" style={{ minHeight: 380 }}>
                  {!selectedTemplate ? (
                    <div className="text-center">
                      <Layers size={52} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-semibold text-sm">Select a format on the left</p>
                      <p className="text-gray-300 text-xs mt-1">to see the preview here</p>
                    </div>
                  ) : !designFiles.some(Boolean) ? (
                    <div className="text-center">
                      <Upload size={52} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-semibold text-sm">Upload your design{panelCount > 1 ? 's' : ''}</p>
                      <p className="text-gray-300 text-xs mt-1">to see the simulation here</p>
                    </div>
                  ) : selectedTemplate.mockupUrl && (selectedTemplate.panels?.length ?? 0) > 0 ? (
                    <SimulatorCanvas
                      ref={canvasRef}
                      mockupUrl={selectedTemplate.mockupUrl}
                      designUrls={designFiles}
                      panels={selectedTemplate.panels!}
                      containerWidth={700}
                      containerHeight={460}
                    />
                  ) : (
                    /* Flat fallback (no corners set) */
                    <div className="text-center">
                      {selectedTemplate.mockupUrl && (
                        <img
                          src={selectedTemplate.mockupUrl}
                          alt="Mockup"
                          className="max-h-64 mx-auto rounded-xl mb-4 object-contain"
                        />
                      )}
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100 inline-block">
                        Template corners not yet configured — contact admin
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
