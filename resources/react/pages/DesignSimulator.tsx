/**
 * DesignSimulator.tsx — Public page
 * Lets users upload their artwork and see it warped onto a billboard mockup.
 * No login required — open to everyone.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Upload, Download, Monitor, ChevronRight, RotateCcw, Check } from 'lucide-react';
import { useStore } from '@/store/dataStore';
import { designUploadStore } from '@/store/dataStore';
import type { SimulatorTemplate } from '@/store/dataStore';
import SimulatorCanvas, { type SimulatorCanvasRef, type Corner } from '@/components/SimulatorCanvas';

const NAVY = '#0B0F1A';
const RED  = '#D90429';

type Step = 'format' | 'upload' | 'preview';

// ── Flat preview fallback (no template) ───────────────────────────────────────
function FlatPreview({ designUrl }: { designUrl: string }) {
  return (
    <div style={{
      background: '#1a1a2e', borderRadius: 12, padding: 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Flat Preview
      </p>
      <img src={designUrl} alt="Your design"
        style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 8, objectFit: 'contain' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
        No street mockup configured for this format yet — showing flat preview.
      </p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DesignSimulator() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product') || '';

  const store = useStore();
  const { loaded, simulatorTemplates = [], adFormats } = store;

  const [step, setStep] = useState<Step>('format');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [sizeFilter,   setSizeFilter]   = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SimulatorTemplate | null>(null);
  const [designUrl,  setDesignUrl]  = useState('');
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  const canvasRef = useRef<SimulatorCanvasRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If coming from a product page, pre-filter by that product's template
  useEffect(() => {
    if (productId && simulatorTemplates.length > 0) {
      const match = simulatorTemplates.find(t => (t as any).productId === productId);
      if (match) {
        setSelectedTemplate(match);
        setTypeFilter(match.typeName);
        setSizeFilter(match.sizeLabel);
      }
    }
  }, [productId, simulatorTemplates]);

  // Unique types from templates
  const uniqueTypes = Array.from(new Set(simulatorTemplates.map(t => t.typeName))).sort();
  const sizesForType = Array.from(new Set(
    simulatorTemplates.filter(t => !typeFilter || t.typeName === typeFilter).map(t => t.sizeLabel)
  )).sort();

  const filteredTemplates = simulatorTemplates.filter(t => {
    if (typeFilter && t.typeName !== typeFilter) return false;
    if (sizeFilter && t.sizeLabel !== sizeFilter) return false;
    return true;
  });

  const handleSelectTemplate = (tpl: SimulatorTemplate) => {
    setSelectedTemplate(tpl);
    setStep('upload');
  };

  const handleDesignFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setDesignUrl(url);
    setSaved(false);
    setStep('preview');
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleDesignFile(file);
  }, [handleDesignFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleDesignFile(file);
  }, [handleDesignFile]);

  // Save upload record to dashboard
  const saveUpload = useCallback(() => {
    if (!selectedTemplate || !designUrl || saved) return;
    const email = localStorage.getItem('horizon_user_email') || '';
    const name  = localStorage.getItem('horizon_user_name')  || 'Guest';
    const phone = localStorage.getItem('horizon_user_phone') || '';
    designUploadStore.add({
      userId:      email || 'guest',
      userName:    name,
      userEmail:   email,
      userPhone:   phone,
      designUrl,
      templateId:  selectedTemplate.id,
      typeName:    selectedTemplate.typeName,
      sizeLabel:   selectedTemplate.sizeLabel,
      productId,
      productName: (selectedTemplate as any).productName || '',
    });
    setSaved(true);
  }, [selectedTemplate, designUrl, saved, productId]);

  // Auto-save when we reach preview
  useEffect(() => {
    if (step === 'preview' && designUrl && selectedTemplate && !saved) {
      saveUpload();
    }
  }, [step, designUrl, selectedTemplate, saved, saveUpload]);

  // Helper: trigger a reliable download from a dataURL or blob URL
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(a);
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    }, 200);
  };

  const handleDownload = async () => {
    setDownloading(true);
    const filename = `horizon-simulation-${selectedTemplate?.typeName ?? 'billboard'}-${selectedTemplate?.sizeLabel ?? ''}.jpg`
      .replace(/\s+/g, '-').toLowerCase();
    try {
      // Try to get composite image from the canvas
      const dataUrl = canvasRef.current ? await canvasRef.current.capture() : null;

      if (dataUrl && dataUrl.startsWith('data:')) {
        // Convert dataURL → Blob → object URL (more reliable for download)
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        triggerDownload(blobUrl, filename);
        return;
      }

      // Fallback: download the raw design file the user uploaded
      if (designUrl) {
        triggerDownload(designUrl, 'your-design.png');
      }
    } catch (err) {
      console.error('Download error:', err);
      // Last resort: open in new tab so user can save manually
      if (designUrl) window.open(designUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setStep('format');
    setSelectedTemplate(null);
    setDesignUrl('');
    setSaved(false);
    setTypeFilter('');
    setSizeFilter('');
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f8f9fb', minHeight: '100vh' }}>
      {/* Hero bar */}
      <div style={{ background: NAVY, padding: '48px 0 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: RED, marginBottom: 12 }}>
            Ad Design Simulator
          </p>
          <h1 style={{ fontWeight: 900, color: '#fff', fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 }}>
            See Your Brand on Any Billboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 480 }}>
            Upload your artwork and preview it on Egypt's outdoor advertising network.
          </p>
          {/* Breadcrumb steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
            {(['format','upload','preview'] as Step[]).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step === s ? RED : (i < ['format','upload','preview'].indexOf(step) ? 'rgba(217,4,41,0.3)' : 'rgba(255,255,255,0.1)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>
                  {i < ['format','upload','preview'].indexOf(step) ? <Check size={12} /> : i+1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step === s ? '#fff' : 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{s}</span>
                {i < 2 && <ChevronRight size={14} color="rgba(255,255,255,0.2)" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── STEP 1: Choose Format ──────────────────────────────────────────── */}
        {step === 'format' && (
          <div>
            {/* No templates configured */}
            {loaded && simulatorTemplates.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <Monitor size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 700, fontSize: 20, color: NAVY, marginBottom: 8 }}>Simulator Coming Soon</p>
                <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 360, margin: '0 auto 24px' }}>
                  Our team is setting up billboard mockups. Check back soon or contact us to book a location.
                </p>
                <Link to="/contact" style={{
                  display: 'inline-block', background: RED, color: '#fff',
                  fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, textDecoration: 'none',
                }}>Contact Our Team</Link>
              </div>
            )}

            {simulatorTemplates.length > 0 && (
              <>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                  <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setSizeFilter(''); }}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, fontWeight: 600, background: '#fff', color: NAVY, minWidth: 160 }}>
                    <option value="">All Types</option>
                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, fontWeight: 600, background: '#fff', color: NAVY, minWidth: 160 }}>
                    <option value="">All Sizes</option>
                    {sizesForType.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                  </select>
                  {(typeFilter || sizeFilter) && (
                    <button onClick={() => { setTypeFilter(''); setSizeFilter(''); }}
                      style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, fontWeight: 600, background: '#fff', color: '#6b7280', cursor: 'pointer' }}>
                      Clear
                    </button>
                  )}
                </div>

                {/* Template cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                  {filteredTemplates.map(tpl => (
                    <button key={tpl.id} onClick={() => handleSelectTemplate(tpl)}
                      style={{
                        background: '#fff', border: '2px solid #e5e7eb', borderRadius: 14,
                        padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = RED; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(217,4,41,0.12)`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      <div style={{ height: 160, overflow: 'hidden', background: '#f3f4f6' }}>
                        {tpl.mockupUrl ? (
                          <img src={tpl.mockupUrl} alt={tpl.typeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Monitor size={32} color="#d1d5db" />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <p style={{ fontWeight: 800, fontSize: 15, color: NAVY, marginBottom: 4 }}>{tpl.typeName}</p>
                        <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{tpl.sizeLabel}</p>
                        {tpl.notes && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{tpl.notes}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: Upload Design ──────────────────────────────────────────── */}
        {step === 'upload' && selectedTemplate && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1.5px solid #e5e7eb', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, background: `rgba(217,4,41,0.08)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={22} color={RED} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: NAVY }}>{selectedTemplate.typeName}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{selectedTemplate.sizeLabel}</p>
                </div>
                <button onClick={() => setStep('format')} style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  ← Change Format
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleFileDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #d1d5db', borderRadius: 12, padding: '48px 24px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                  background: '#fafafa',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = RED; (e.currentTarget as HTMLElement).style.background = 'rgba(217,4,41,0.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
              >
                <Upload size={32} color={RED} />
                <p style={{ fontWeight: 700, fontSize: 15, color: NAVY }}>Drop your design here</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>or click to browse — PNG, JPG, PDF supported</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} />

              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
                For best results, upload your design at the exact billboard ratio ({selectedTemplate.sizeLabel}).
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Preview ───────────────────────────────────────────────── */}
        {step === 'preview' && selectedTemplate && designUrl && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
            {/* Canvas */}
            <div>
              {selectedTemplate.mockupUrl && selectedTemplate.corners ? (
                <>
                  <SimulatorCanvas
                    ref={canvasRef}
                    mockupUrl={selectedTemplate.mockupUrl}
                    designUrl={designUrl}
                    corners={selectedTemplate.corners}
                    style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.12)' }}
                  />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
                    Your design warped onto the billboard surface
                  </p>
                </>
              ) : (
                <FlatPreview designUrl={designUrl} />
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1.5px solid #e5e7eb' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: RED, marginBottom: 12 }}>
                  Your Simulation
                </p>
                <p style={{ fontWeight: 800, fontSize: 16, color: NAVY, marginBottom: 4 }}>{selectedTemplate.typeName}</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>{selectedTemplate.sizeLabel}</p>
                {saved && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 16 }}>
                    <Check size={13} color="#22c55e" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Saved to dashboard</span>
                  </div>
                )}
                <button onClick={handleDownload} disabled={downloading}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                    background: NAVY, color: '#fff', fontWeight: 700, fontSize: 13,
                    cursor: downloading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    marginBottom: 10, opacity: downloading ? 0.7 : 1,
                  }}>
                  <Download size={15} />
                  {downloading ? 'Preparing…' : 'Download Mockup'}
                </button>
                {/* Change Design */}
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid #e5e7eb',
                  background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', marginBottom: 8,
                }}>
                  <Upload size={14} />
                  Change Design
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleDesignFile(f); }} />
                </label>
                <button onClick={reset}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid #e5e7eb',
                    background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  <RotateCcw size={14} />
                  Try Another Format
                </button>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1.5px solid #e5e7eb' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Like what you see?</p>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>
                  Contact our team to book this billboard location and launch your campaign.
                </p>
                <Link to="/contact" style={{
                  display: 'block', textAlign: 'center', padding: '10px 0', borderRadius: 10,
                  background: RED, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                }}>
                  Get a Quote
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
