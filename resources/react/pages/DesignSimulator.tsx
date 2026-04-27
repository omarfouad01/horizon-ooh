import { useState, useRef, useCallback } from 'react';
import { useStore, designUploadStore } from '@/store/dataStore';
import SimulatorCanvas, { type SimulatorCanvasHandle } from '@/components/SimulatorCanvas';
import type { SimulatorTemplate } from '@/store/dataStore';
import { Upload, Download, ChevronRight, Layers, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function getStoredUser() {
  try { const r = localStorage.getItem('horizon_user'); return r ? JSON.parse(r) : null; } catch { return null; }
}

export default function DesignSimulator() {
  const store = useStore();
  const canvasRef = useRef<SimulatorCanvasHandle>(null);

  const templates: SimulatorTemplate[] = store.simulatorTemplates ?? [];
  const [selectedTemplate, setSelectedTemplate] = useState<SimulatorTemplate | null>(null);
  const [designFiles, setDesignFiles] = useState<string[]>([]);  // data URLs
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  const panelCount = selectedTemplate?.panels?.length ?? 1;

  function handleTemplateSelect(t: SimulatorTemplate) {
    setSelectedTemplate(t);
    setDesignFiles([]);
  }

  function handleDesignUpload(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setDesignFiles(prev => {
        const arr = [...prev];
        arr[idx] = dataUrl;
        return arr;
      });
    };
    reader.readAsDataURL(file);
  }

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await canvasRef.current.capture();
      if (!dataUrl) { toast.error('Could not generate image'); return; }
      // Decode base64 to blob
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/png';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horizon-mockup-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      toast.success('Mockup downloaded!');
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedTemplate) return;
    const user = getStoredUser();
    setSaving(true);
    try {
      await designUploadStore.add({
        id: String(Date.now()),
        userId:      user?.id ?? '',
        userName:    user?.name ?? 'Guest',
        userEmail:   user?.email ?? '',
        userPhone:   user?.phone ?? '',
        designUrl:   designFiles[0] ?? '',
        templateId:  selectedTemplate.id,
        typeName:    selectedTemplate.typeName,
        sizeLabel:   selectedTemplate.sizeLabel ?? '',
        status:      'pending',
        createdAt:   new Date().toISOString(),
      });
      toast.success('Design saved to dashboard!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save design');
    } finally {
      setSaving(false);
    }
  }, [selectedTemplate, designFiles]);

  const hasDesign = designFiles.some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0B0F1A] text-white py-12 px-4 text-center">
        <p className="text-[#D90429] text-xs font-bold tracking-widest uppercase mb-2">Ad Design Simulator</p>
        <h1 className="text-3xl md:text-5xl font-black mb-3">Preview Your Design</h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          Upload your design and see how it looks on a real billboard in the street.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel — controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Step 1 — Choose format */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Layers size={14} className="text-[#D90429]" />1. Choose Format</h2>
            {templates.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                <AlertCircle size={14} />No templates configured yet
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map(t => (
                  <button key={t.id} onClick={() => handleTemplateSelect(t)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all
                      ${selectedTemplate?.id === t.id ? 'border-[#D90429] bg-red-50 text-[#D90429]' : 'border-gray-100 hover:border-gray-300'}`}>
                    {t.typeName}{t.sizeLabel ? ` — ${t.sizeLabel}` : ''}
                    {(t.panels?.length ?? 0) > 1 && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t.panels!.length} panels</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 — Upload designs */}
          {selectedTemplate && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Upload size={14} className="text-[#D90429]" />2. Upload Your Design{panelCount > 1 ? 's' : ''}</h2>
              <div className="space-y-3">
                {Array.from({ length: panelCount }).map((_, i) => (
                  <div key={i}>
                    {panelCount > 1 && <p className="text-xs text-gray-500 font-semibold mb-1">Panel {i + 1}</p>}
                    <label className={`flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm
                      ${designFiles[i] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-[#D90429] hover:bg-red-50/30'}`}>
                      {designFiles[i] ? (
                        <img src={designFiles[i]} alt="" className="h-full object-contain rounded-xl p-1" />
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-300 mb-1" />
                          <span className="text-gray-400 text-xs">Click to upload (JPG / PNG)</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleDesignUpload(i, e)} />
                    </label>
                    {designFiles[i] && (
                      <button onClick={() => setDesignFiles(prev => { const a=[...prev]; a[i]=''; return a; })}
                        className="text-xs text-gray-400 hover:text-red-500 mt-1">Change design</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {hasDesign && selectedTemplate && (
            <div className="space-y-2">
              <button onClick={handleDownload} disabled={downloading}
                className="w-full flex items-center justify-center gap-2 bg-[#D90429] text-white font-bold py-3 rounded-xl hover:bg-[#b8031f] transition-colors disabled:opacity-60">
                <Download size={16} />
                {downloading ? 'Generating...' : 'Download Mockup'}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save to My Account'}
              </button>
            </div>
          )}
        </div>

        {/* Right panel — preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm min-h-[400px] flex items-center justify-center">
            {!selectedTemplate ? (
              <div className="text-center text-gray-300">
                <Layers size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a format to see the preview</p>
              </div>
            ) : !hasDesign ? (
              <div className="text-center text-gray-300">
                <Upload size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Upload your design to see the simulation</p>
              </div>
            ) : selectedTemplate.mockupUrl && (selectedTemplate.panels?.length ?? 0) > 0 ? (
              <SimulatorCanvas
                ref={canvasRef}
                mockupUrl={selectedTemplate.mockupUrl}
                designUrls={designFiles}
                panels={selectedTemplate.panels!}
                containerWidth={720}
                containerHeight={480}
              />
            ) : (
              /* Flat fallback if no template corners defined */
              <div className="w-full relative">
                {selectedTemplate.mockupUrl && (
                  <img src={selectedTemplate.mockupUrl} alt="Mockup" className="w-full rounded-xl" />
                )}
                {designFiles[0] && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2 text-center">Your design preview</p>
                    <img src={designFiles[0]} alt="Design" className="w-full rounded-xl border border-gray-100" />
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <ChevronRight size={12} />
              {selectedTemplate.typeName}{selectedTemplate.sizeLabel ? ` — ${selectedTemplate.sizeLabel}` : ''}
              {(selectedTemplate.panels?.length ?? 0) > 1 && ` (${selectedTemplate.panels!.length} panels)`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
