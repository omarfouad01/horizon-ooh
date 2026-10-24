import {LocalizedText, LocalizedElement} from "@/components/Localized";
/**
 * DesignSimulator.tsx — "See Your Brand on Any Billboard"
 * - Login gate: if not signed in, show sign-in prompt
 * - Format selection: grid of cards (photo on top, type + size below)
 * - Upload design → preview appears immediately (no "Preview Simulation" button)
 * - Auto-saves upload to dashboard silently (no "Save to My Account" button)
 */
import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/i18n/LangContext';
import { Link } from 'react-router-dom';
import { useStore, designUploadStore } from '@/store/dataStore';
import type { SimulatorCanvasHandle } from '@/components/SimulatorCanvas';
import SEO from '@/components/SEO';
const SimulatorCanvas = lazy(() => import('@/components/SimulatorCanvas'));
import type { SimulatorTemplate } from '@/store/dataStore';
import { Upload, Download, ChevronRight, Layers, AlertCircle, LogIn, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { langPath, makeRoutes } from '@/lib/routes';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSiteUser() {
  try {
    const r = localStorage.getItem('horizon_site_user') || localStorage.getItem('horizon_user');
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}

const PANEL_COLORS = ['#D90429', '#7C3AED', '#D97706'];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all
        ${done ? 'bg-[#D90429] border-[#D90429] text-white' : active ? 'bg-white border-white text-[#0B0F1A]' : 'border-white/30 text-white/40'}`}>
        <LocalizedText>{done ? <CheckCircle2 size={14} /> : n}</LocalizedText>
      </div>
      <span className={`text-sm font-semibold hidden sm:block ${active ? 'text-white' : done ? 'text-white/70' : 'text-white/30'}`}><LocalizedText>{label}</LocalizedText></span>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({ index, panelCount, value, onChange }: {
  index: number; panelCount: number; value: string; onChange: (url: string) => void;
}) {
  const { t } = useLang();
  const color = PANEL_COLORS[index % PANEL_COLORS.length];
  const label = `Panel ${index + 1}`;
  return (
    <div>
      <LocalizedText>{panelCount > 1 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider"><LocalizedText>{label}</LocalizedText></p>
        </div>
      )}</LocalizedText>
      <label className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm overflow-hidden
        ${value ? 'border-green-400 bg-green-50/60' : 'border-gray-200 hover:bg-gray-50'}`}>
        <LocalizedText>{value ? (
          <div className="relative w-full h-full">
            <LocalizedElement as="img" src={value} alt="" className="w-full h-full object-contain p-1" />
          </div>
        ) : (
          <>
            <Upload size={22} className="text-gray-300 mb-1.5" />
            <span className="text-gray-400 text-xs font-medium"><LocalizedText>{t('sim.clickToUpload')}</LocalizedText></span>
          </>
        )}</LocalizedText>
        <LocalizedElement as="input" type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ev => onChange(ev.target?.result as string);
          reader.readAsDataURL(file);
          e.target.value = '';
        }} />
      </label>
      <LocalizedText>{value && (
        <button onClick={() => onChange('')} className="text-xs text-gray-400 hover:text-red-500 mt-1 ml-1 transition-colors">
          <LocalizedText>{t('sim.changeDesign')}</LocalizedText>
        </button>
      )}</LocalizedText>
    </div>
  );
}

// ─── Format Card ──────────────────────────────────────────────────────────────
function FormatCard({ t, selected, onClick }: {
  t: SimulatorTemplate; selected: boolean; onClick: () => void;
}) {
  const pc = t.panels?.length ?? 0;
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col rounded-2xl border-2 overflow-hidden text-left transition-all shadow-sm hover:shadow-md
        ${selected ? 'border-[#D90429] shadow-red-100' : 'border-gray-100 hover:border-gray-300'}`}
    >
      {/* Photo */}
      <div className="w-full aspect-video bg-gray-100 overflow-hidden relative">
        <LocalizedText>{t.mockupUrl ? (
          <LocalizedElement as="img"
            src={t.mockupUrl}
            alt={t.typeName}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={32} className="text-gray-300" />
          </div>
        )}</LocalizedText>
        <LocalizedText>{pc > 1 && (
          <span className="absolute top-2 right-2 text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
            <LocalizedText>{pc}</LocalizedText><LocalizedText> panels
          </LocalizedText></span>
        )}</LocalizedText>
        <LocalizedText>{selected && (
          <div className="absolute inset-0 bg-[#D90429]/10 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-[#D90429] drop-shadow" />
          </div>
        )}</LocalizedText>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className={`font-black text-sm leading-tight ${selected ? 'text-[#D90429]' : 'text-gray-900'}`}>
          <LocalizedText>{t.typeName}</LocalizedText>
        </p>
        <LocalizedText>{t.sizeLabel && (
          <p className="text-xs text-gray-400 font-medium mt-0.5"><LocalizedText>{t.sizeLabel}</LocalizedText></p>
        )}</LocalizedText>
        <LocalizedText>{pc > 1 && (
          <p className="text-[10px] text-purple-600 font-semibold mt-1">
            <LocalizedText>{`${pc} designs needed`}</LocalizedText>
          </p>
        )}</LocalizedText>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DesignSimulator() {
  const store = useStore();
  const { lang, t, isAr } = useLang();
  // Read simulator text from homeContent (controlled by admin dashboard)
  const hc = (store.homeContent ?? {}) as Record<string, string>;
  const simEyebrow     = hc.sim_eyebrow     || t('sim.eyebrow')     || 'Ad Design Simulator';
  const simTitle       = hc.sim_title       || t('sim.title')       || 'See Your Brand';
  const simTitleAccent = hc.sim_titleAccent || t('sim.titleAccent') || 'on Any Billboard';
  const simSubtitle    = hc.sim_subtitle    || t('sim.subtitle')    || 'Upload your design and instantly preview it on real billboards across Saudi Arabia.';
  const simCtaEyebrow  = hc.sim_ctaEyebrow  || t('sim.ctaEyebrow')  || 'Ready to Go Live?';
  const simCtaTitle1   = hc.sim_ctaTitle1   || t('sim.ctaTitle1')   || 'Turn your design';
  const simCtaTitle2   = hc.sim_ctaTitle2   || t('sim.ctaTitle2')   || 'into a real campaign.';
  const simCtaSubtext   = hc.sim_ctaSubtext   || t('sim.ctaSubtext')   || 'Our team is ready to help you pick the perfect locations and launch your campaign.';
  const simCtaBtn1Label = hc.sim_ctaBtn1Label || t('sim.ctaContact')   || 'Contact Us';
  const simCtaBtn1Link  = hc.sim_ctaBtn1Link  || '/contact';
  const simCtaBtn2Label = hc.sim_ctaBtn2Label || t('sim.ctaLocations') || 'View Locations';
  const simCtaBtn2Link  = hc.sim_ctaBtn2Link  || '/locations';
  const canvasRef = useRef<SimulatorCanvasHandle>(null);

  const templates: SimulatorTemplate[] = (store.simulatorTemplates ?? []).filter(
    t => t.mockupUrl && (t.panels?.length ?? 0) > 0
  );
  const allTemplates: SimulatorTemplate[] = store.simulatorTemplates ?? [];

  const [step, setStep]                         = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<SimulatorTemplate | null>(null);
  const [designFiles, setDesignFiles]           = useState<string[]>([]);
  const [downloading, setDownloading]           = useState(false);
  const [autoSaved, setAutoSaved]               = useState(false);

  // Keep server HTML and the first client render identical; auth stays client-only.
  const [user, setUser] = useState<ReturnType<typeof getSiteUser>>(null);
  useEffect(() => { setUser(getSiteUser()); }, []);
  const panelCount = selectedTemplate?.panels?.length ?? 1;
  const allUploaded = selectedTemplate
    ? Array.from({ length: panelCount }).every((_, i) => !!designFiles[i])
    : false;

  // Derived step
  useEffect(() => {
    if (!selectedTemplate)           setStep(1);
    else if (!designFiles.some(Boolean)) setStep(2);
    else                             setStep(3);
  }, [selectedTemplate, designFiles]);

  function handleTemplateSelect(t: SimulatorTemplate) {
    setSelectedTemplate(t);
    setDesignFiles([]);
    setAutoSaved(false);
    setStep(2);
  }

  function setDesign(idx: number, url: string) {
    setDesignFiles(prev => {
      const arr = [...prev];
      arr[idx] = url;
      return arr;
    });
    setAutoSaved(false);
  }

  // Auto-save silently once all designs uploaded
  useEffect(() => {
    if (!allUploaded || !selectedTemplate || !user || autoSaved) return;
    setAutoSaved(true);
    designUploadStore.add({
      userId:     user?.id    ?? '',
      userName:   user?.name  ?? 'Guest',
      userEmail:  user?.email ?? '',
      userPhone:  user?.phone ?? '',
      designUrl:  designFiles[0] ?? '',
      templateId: selectedTemplate.id,
      typeName:   selectedTemplate.typeName,
      sizeLabel:  selectedTemplate.sizeLabel ?? '',
    }).catch(() => { /* silent fail */ });
  }, [allUploaded, selectedTemplate, user, autoSaved, designFiles]);

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await canvasRef.current.capture();
      if (!dataUrl) { toast.error(t('sim.downloadFailed')); return; }
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
      toast.success(t('sim.mockupDownloaded'));
    } catch { toast.error(t('sim.downloadFailed')); }
    finally { setDownloading(false); }
  }, [t]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Billboard Design Simulator | HORIZON OOH" description="Preview your design on real billboard formats with the HORIZON OOH simulator." titleAr="محاكي تصميم اللوحات الإعلانية | هورايزون" descriptionAr="عاين تصميمك على قوالب اللوحات الإعلانية الحقيقية باستخدام محاكي هورايزون." canonical="/design-simulator" robots="noindex, follow" />

      {/* ── Dark Hero ── */}
      <div className="bg-[#0B0F1A] text-white pt-12 pb-10 px-4">
        <div className="max-w-6xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
          <p className="text-[#D90429] text-[11px] font-black tracking-[0.22em] uppercase mb-3">
            <LocalizedText>{simEyebrow}</LocalizedText>
          </p>
          <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight">
            <LocalizedText>{simTitle}<LocalizedText></LocalizedText>{' '}</LocalizedText>
            <span className="text-[#D90429]"><LocalizedText>{simTitleAccent}</LocalizedText></span>
          </h1>
          <p className="text-white/55 text-sm md:text-base max-w-lg mb-8">
            <LocalizedText>{simSubtitle}</LocalizedText>
          </p>

          {/* Step indicators — only show when logged in */}
          <LocalizedText>{user && (
            <div className={`flex items-center gap-3 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
              <StepDot n={1} label={t('sim.step1')} active={step === 1} done={step > 1} />
              <ChevronRight size={14} className="text-white/20" />
              <StepDot n={2} label={t('sim.step2')} active={step === 2} done={step > 2} />
              <ChevronRight size={14} className="text-white/20" />
              <StepDot n={3} label={t('sim.step3')} active={step === 3} done={false} />
            </div>
          )}</LocalizedText>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── LOGIN GATE ── */}
        <LocalizedText>{!user && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full">
              <div className="w-16 h-16 rounded-full bg-[#D90429]/10 flex items-center justify-center mx-auto mb-5">
                <LogIn size={30} className="text-[#D90429]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3"><LocalizedText>{t('sim.signInRequired')}</LocalizedText></h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                <LocalizedText>{t('sim.signInDesc')}</LocalizedText>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <LocalizedElement as={Link}
                  to={langPath(lang, "/login")}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D90429] text-white font-bold rounded-xl text-sm hover:bg-[#b8031f] transition-colors"
                >
                  <LogIn size={16} />
                  <LocalizedText>{t('sim.loginBtn')}</LocalizedText>
                </LocalizedElement>
                <LocalizedElement as={Link}
                  to={langPath(lang, "/signup")}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:border-gray-400 transition-colors"
                >
                  <LocalizedText>{t('sim.createAccount')}</LocalizedText>
                </LocalizedElement>
              </div>
            </div>
          </div>
        )}</LocalizedText>

        {/* ── NO TEMPLATES YET ── */}
        <LocalizedText>{user && allTemplates.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto">
            <AlertCircle size={36} className="text-amber-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2"><LocalizedText>{t('sim.templatesComingSoon')}</LocalizedText></h2>
            <p className="text-gray-500 text-sm mb-6">
              <LocalizedText>{t('sim.comingSoonDesc')}</LocalizedText>
            </p>
            <LocalizedElement as={Link} to={langPath(lang, "/contact")} className="inline-block px-6 py-2.5 bg-[#D90429] text-white font-bold rounded-xl text-sm hover:bg-[#b8031f] transition-colors">
              <LocalizedText>{t('sim.contactTeam')}</LocalizedText>
            </LocalizedElement>
          </div>
        )}</LocalizedText>

        {/* ── SIMULATOR ── */}
        <LocalizedText>{user && allTemplates.length > 0 && (
          <div className="space-y-10">

            {/* ── STEP 1: Format grid ── */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-6 h-6 rounded-full bg-[#D90429] text-white text-[11px] flex items-center justify-center font-black"><LocalizedText>1</LocalizedText></span>
                <h2 className="text-base font-black text-gray-900 uppercase tracking-widest"><LocalizedText>{t('sim.chooseFormat')}</LocalizedText></h2>
              </div>

              <LocalizedText>{templates.length === 0 ? (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 max-w-md">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span><LocalizedText>{t('sim.templatesSetup')}</LocalizedText></span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <LocalizedText>{templates.map(tpl => (
                    <FormatCard
                      key={tpl.id}
                      t={tpl}
                      selected={selectedTemplate?.id === tpl.id}
                      onClick={() => handleTemplateSelect(tpl)}
                    />
                  ))}</LocalizedText>
                </div>
              )}</LocalizedText>
            </section>

            {/* ── STEP 2 + 3: Upload + Preview side-by-side ── */}
            <LocalizedText>{selectedTemplate && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: upload */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-6 h-6 rounded-full bg-[#D90429] text-white text-[11px] flex items-center justify-center font-black"><LocalizedText>2</LocalizedText></span>
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        <LocalizedText>{panelCount > 1 ? t('sim.uploadDesigns') : t('sim.uploadDesign')}</LocalizedText>
                      </h3>
                    </div>

                    <LocalizedText>{panelCount > 1 && (
                      <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2 mb-3 font-semibold border border-purple-100">
                        <LocalizedText>{selectedTemplate.typeName}</LocalizedText><LocalizedText> — </LocalizedText><LocalizedText>{panelCount}</LocalizedText> <LocalizedText>{t('sim.designsNeeded')}</LocalizedText>
                      </p>
                    )}</LocalizedText>

                    <div className="space-y-4">
                      <LocalizedText>{Array.from({ length: panelCount }).map((_, i) => (
                        <UploadZone
                          key={i}
                          index={i}
                          panelCount={panelCount}
                          value={designFiles[i] ?? ''}
                          onChange={url => setDesign(i, url)}
                        />
                      ))}</LocalizedText>
                    </div>

                    {/* Download button — shown once at least one design is uploaded */}
                    <LocalizedText>{designFiles.some(Boolean) && (
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="mt-5 w-full flex items-center justify-center gap-2 bg-[#0B0F1A] text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50 text-sm"
                      >
                        <Download size={15} />
                        <LocalizedText>{downloading ? t('sim.generating') : t('sim.downloadMockup')}</LocalizedText>
                      </button>
                    )}</LocalizedText>
                  </div>
                </div>

                {/* Right: live preview */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 420 }}>
                    <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#D90429] text-white text-[11px] flex items-center justify-center font-black"><LocalizedText>3</LocalizedText></span>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest"><LocalizedText>{t('sim.livePreview')}</LocalizedText></p>
                      </div>
                      <p className="text-xs text-gray-500">
                        <LocalizedText>{selectedTemplate.typeName}<LocalizedText></LocalizedText>{selectedTemplate.sizeLabel ? ` · ${selectedTemplate.sizeLabel}` : ''}</LocalizedText>
                      </p>
                    </div>

                    <div className="flex items-center justify-center p-4" style={{ minHeight: 380 }}>
                      <LocalizedText>{!designFiles.some(Boolean) ? (
                        <div className="text-center">
                          <Upload size={52} className="text-gray-200 mx-auto mb-4" />
                          <p className="text-gray-400 font-semibold text-sm"><LocalizedText>{isAr && panelCount > 1 ? 'ارفع تصاميمك' : t('sim.uploadFirst')}<LocalizedText></LocalizedText>{!isAr && panelCount > 1 ? 's' : ''}</LocalizedText></p>
                          <p className="text-gray-300 text-xs mt-1"><LocalizedText>{t('sim.previewAuto')}</LocalizedText></p>
                        </div>
                      ) : selectedTemplate.mockupUrl && (selectedTemplate.panels?.length ?? 0) > 0 ? (
                        <Suspense fallback={<div role="status"><LocalizedText>{t('sim.generating')}</LocalizedText></div>}>
                        <SimulatorCanvas
                          ref={canvasRef}
                          mockupUrl={selectedTemplate.mockupUrl}
                          designUrls={designFiles}
                          panels={selectedTemplate.panels!}
                          style={{ borderRadius: 12, overflow: 'hidden' }}
                        />
                        </Suspense>
                      ) : (
                        <div className="text-center">
                          <LocalizedText>{selectedTemplate.mockupUrl && (
                            <LocalizedElement as="img"
                              src={selectedTemplate.mockupUrl}
                              alt="Mockup"
                              className="max-h-64 mx-auto rounded-xl mb-4 object-contain"
                            />
                          )}</LocalizedText>
                          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100 inline-block">
                            <LocalizedText>{t('sim.cornersNotSet')}</LocalizedText>
                          </p>
                        </div>
                      )}</LocalizedText>
                    </div>
                  </div>
                </div>

              </div>
            )}</LocalizedText>

          </div>
        )}</LocalizedText>
      </div>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-white" style={{ paddingTop: 120, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px] text-center">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <span className="block w-5 h-[1.5px] bg-[#D90429]" />
            <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#0B0F1A]/30">
              <LocalizedText>{simCtaEyebrow}</LocalizedText>
            </span>
            <span className="block w-5 h-[1.5px] bg-[#D90429]" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="font-black leading-[0.9] tracking-[-0.04em] mx-auto mb-8"
            style={{ fontSize: 'clamp(40px,4.5vw,68px)', color: '#0B0F1A', maxWidth: 720 }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08 }}
          >
            <LocalizedText>{simCtaTitle1}</LocalizedText><br />
            <span style={{ color: 'rgba(11,15,26,0.2)' }}><LocalizedText>{simCtaTitle2}</LocalizedText></span>
          </motion.h2>

          {/* Sub text */}
          <motion.p
            className="text-[18px] leading-[1.65] mx-auto mb-14 text-[#0B0F1A]/40"
            style={{ maxWidth: 400 }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.16 }}
          >
            <LocalizedText>{simCtaSubtext}</LocalizedText>
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex items-center justify-center gap-5 mb-16 flex-wrap"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.24 }}
          >
            <LocalizedElement as={Link}
              to={simCtaBtn1Link}
              className="inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white relative group"
              style={{ background: '#D90429' }}
            >
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-[#0B0F1A]" />
              <span className="relative z-10"><LocalizedText>{simCtaBtn1Label}</LocalizedText></span>
            </LocalizedElement>
            <LocalizedElement as={Link}
              to={simCtaBtn2Link}
              className="group relative inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
              style={{ border: '1.5px solid #0B0F1A', color: '#0B0F1A' }}
            >
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-[#0B0F1A]" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-400"><LocalizedText>{simCtaBtn2Label}</LocalizedText></span>
            </LocalizedElement>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex items-center justify-center gap-10 pt-10 border-t border-[#0B0F1A]/[0.06] flex-wrap"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.32 }}
          >
            <LocalizedText>{[
              `9,500+ ${t('home.statsLocations') || 'Locations'}`,
              `100+ ${t('home.statsBrands') || 'Brands'}`,
              t('sim.ctaCoverage') || 'Saudi Arabia-wide Coverage'
            ].map(label => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="block w-1 h-1 bg-[#D90429]" />
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0B0F1A]/30"><LocalizedText>{label}</LocalizedText></span>
              </div>
            ))}</LocalizedText>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
