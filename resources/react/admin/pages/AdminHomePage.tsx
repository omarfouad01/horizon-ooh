import { useState } from 'react'
import { useStore, homeStore } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA, ImagePicker } from '../ui'
import { Save, Home, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Small helpers ─────────────────────────────────────────────────────────────
const NAVY = '#0B0F1A', RED = '#D90429'

function SectionCard({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5"
           style={{ background: color || '#f9fafb' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: RED }}/>
        <p className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

/** Editable list of strings */
function StringListEditor({ label, value, onChange }: { label:string; value:string[]; onChange:(v:string[])=>void }) {
  function update(i: number, v: string) { const a = [...value]; a[i] = v; onChange(a) }
  function add()    { onChange([...value, '']) }
  function remove(i: number) { onChange(value.filter((_,j)=>j!==i)) }

  return (
    <div>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">{label}</label>
      <div className="space-y-2">
        {value.map((v,i)=>(
          <div key={i} className="flex gap-2 items-center">
            <input value={v} onChange={e=>update(i,e.target.value)}
              className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400"/>
            <button type="button" onClick={()=>remove(i)}
              className="text-[11px] text-gray-400 hover:text-red-500 px-2 font-bold transition-colors">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="mt-2 text-[11px] font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
        + Add line
      </button>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Hero', 'Statement', 'Feature', 'Signature', 'Final CTA'] as const
type Tab = typeof TABS[number]

export default function AdminHomePage() {
  const { homeContent } = useStore()
  const [h, setH] = useState({ ...homeContent })
  const [tab, setTab] = useState<Tab>('Hero')

  function set(k: string, v: any) { setH(p => ({ ...p, [k]: v })) }

  function save() {
    homeStore.update(h)
    toast.success('Home page content saved')
  }

  function reset() {
    if (!confirm('Reset this section to defaults?')) return
    // reload from store defaults by remounting
    setH({ ...homeContent })
    toast.success('Reset to current saved values')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Home Page"
        subtitle="Edit all static content sections of the homepage"
        action={
          <div className="flex gap-2">
            <Btn onClick={reset} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200">
              <RefreshCw size={13}/> Reset
            </Btn>
            <Btn onClick={save} className="flex items-center gap-1.5">
              <Save size={13}/> Save All Changes
            </Btn>
          </div>
        }
      />

      {/* Preview link */}
      <div className="mb-5 flex items-center gap-2 text-[12px] text-gray-400">
        <Home size={13}/>
        <a href="/#/" target="_blank" className="text-blue-500 hover:text-blue-700 font-semibold">Preview live homepage ↗</a>
        <span className="text-gray-300 mx-1">·</span>
        <span>Changes are saved to the store — click <strong>Save All Changes</strong> then refresh the preview.</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-[12px] font-bold transition-all"
            style={tab===t ? {background:'white',color:NAVY,boxShadow:'0 1px 3px rgba(11,15,26,0.1)'} : {color:'rgba(11,15,26,0.4)'}}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-5">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        {tab === 'Hero' && (<>
          <SectionCard title="Hero — Eyebrow & Headline">
            <Field label="Eyebrow text (small tag above headline)"
              value={h.heroEyebrow} onChange={(e:any)=>set('heroEyebrow',e.target.value)}/>
            <StringListEditor label="H1 Title Lines (each on a new line)"
              value={h.heroTitleLines || []} onChange={v=>set('heroTitleLines',v)}/>
            <div className="p-3 rounded-lg bg-gray-50 text-[11px] text-gray-400">
              💡 The last line uses a faded style by default (e.g. "Agency.").
            </div>
            {/* ── Arabic ── */}
            <div className="pt-2 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{color:'#D90429'}}>🌐 Arabic — اللغة العربية</span><div className="flex-1 h-px bg-red-100"/></div>
            <Field label="Arabic Eyebrow (الشعار الصغير)" value={(h as any).heroEyebrowAr||''} onChange={(e:any)=>set('heroEyebrowAr',e.target.value)} dir="rtl" placeholder="مثال: الوكالة الرقم 1 في مصر"/>
            <StringListEditor label="Arabic H1 Title Lines (أسطر العنوان الرئيسي بالعربية)"
              value={(h as any).heroTitleLinesAr || []} onChange={v=>set('heroTitleLinesAr',v)}/>
            <div className="p-3 rounded-lg bg-red-50 text-[11px] text-gray-500">
              💡 اترك هذه الحقول فارغة لعرض النص الإنجليزي افتراضياً.
            </div>
          </SectionCard>
          <SectionCard title="Hero — Subtext & Channels">
            <Field label="Channels strip (e.g. Billboards · DOOH · Malls)"
              value={h.heroChannels} onChange={(e:any)=>set('heroChannels',e.target.value)}/>
            <Field label="Hero statement / tagline"
              value={h.heroStatement} onChange={(e:any)=>set('heroStatement',e.target.value)}/>
            <Field label="Search form title (e.g. 'Find a Billboard')"
              value={h.searchTitle} onChange={(e:any)=>set('searchTitle',e.target.value)}/>
            {/* ── Arabic ── */}
            <div className="pt-2 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{color:'#D90429'}}>🌐 Arabic — اللغة العربية</span><div className="flex-1 h-px bg-red-100"/></div>
            <Field label="Arabic Tagline (الشعار الرئيسي)" value={(h as any).heroStatementAr||''} onChange={(e:any)=>set('heroStatementAr',e.target.value)} dir="rtl" placeholder="مثال: نخطط وننفذ حملاتك الإعلانية في كل مصر."/>
            <Field label="Arabic Search Title (عنوان خانة البحث)" value={(h as any).searchTitleAr||''} onChange={(e:any)=>set('searchTitleAr',e.target.value)} dir="rtl" placeholder="مثال: ابحث عن موقع لوحتك الإعلانية"/>
            <Field label="Arabic Channels Strip (شريط الخدمات)" value={(h as any).heroChannelsAr||''} onChange={(e:any)=>set('heroChannelsAr',e.target.value)} dir="rtl" placeholder="مثال: لوحات إعلانية · شاشات رقمية · مولات · مطارات"/>
          </SectionCard>
        </>)}

        {/* ── STATEMENT ────────────────────────────────────────────── */}
        {tab === 'Statement' && (<>
          <SectionCard title="Statement Section (full-screen dark quote)">
            <Field label="Eyebrow (e.g. 'A thought')"
              value={h.statementEyebrow} onChange={(e:any)=>set('statementEyebrow',e.target.value)}/>
            <StringListEditor label="Quote lines (each becomes a separate animated line)"
              value={h.statementLines || []} onChange={v=>set('statementLines',v)}/>
            <div className="p-3 rounded-lg bg-gray-50 text-[11px] text-gray-400">
              💡 The <strong>second line</strong> is displayed in red; all others are white.
            </div>
            <Field label="Brand signature below quote (e.g. 'HORIZON OOH')"
              value={h.statementBrand} onChange={(e:any)=>set('statementBrand',e.target.value)}/>
            {/* ── Arabic ── */}
            <div className="pt-2 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{color:'#D90429'}}>🌐 Arabic — اللغة العربية</span><div className="flex-1 h-px bg-red-100"/></div>
            <Field label="Arabic Eyebrow (الشعار الصغير)" value={(h as any).statementEyebrowAr||''} onChange={(e:any)=>set('statementEyebrowAr',e.target.value)} dir="rtl"/>
            <StringListEditor label="Arabic Quote Lines (أسطر الاقتباس بالعربية)"
              value={(h as any).statementLinesAr || []} onChange={v=>set('statementLinesAr',v)}/>
          </SectionCard>
        </>)}

        {/* ── FEATURE ──────────────────────────────────────────────── */}
        {tab === 'Feature' && (<>
          <SectionCard title="Feature Section — Billboard Spotlight">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Eyebrow" value={h.featureEyebrow} onChange={(e:any)=>set('featureEyebrow',e.target.value)}/>
              <Field label="Button text" value={h.featureButtonText} onChange={(e:any)=>set('featureButtonText',e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title line 1 (white)" value={h.featureTitleLine1} onChange={(e:any)=>set('featureTitleLine1',e.target.value)}/>
              <Field label="Title line 2 (white)" value={h.featureTitleLine2} onChange={(e:any)=>set('featureTitleLine2',e.target.value)}/>
            </div>
            <StringListEditor label="Feature bullets (3 bullet points)"
              value={h.featureBullets || []} onChange={v=>set('featureBullets',v)}/>
            {/* ── Arabic ── */}
            <div className="pt-2 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{color:'#D90429'}}>🌐 Arabic — اللغة العربية</span><div className="flex-1 h-px bg-red-100"/></div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Arabic Title Line 1 (السطر الأول)" value={(h as any).featureTitleLine1Ar||''} onChange={(e:any)=>set('featureTitleLine1Ar',e.target.value)} dir="rtl"/>
              <Field label="Arabic Title Line 2 (السطر الثاني)" value={(h as any).featureTitleLine2Ar||''} onChange={(e:any)=>set('featureTitleLine2Ar',e.target.value)} dir="rtl"/>
            </div>
            <StringListEditor label="Arabic Bullets (النقاط بالعربية)"
              value={(h as any).featureBulletsAr || []} onChange={v=>set('featureBulletsAr',v)}/>
          </SectionCard>
          <SectionCard title="Feature Section — Background Image & Stats">
            <ImagePicker label="Background Image" value={h.featureImage} altValue={h.featureImageAlt || ''} onChange={(url, alt) => { set('featureImage', url); set('featureImageAlt', alt) }}/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stats overlay label" value={h.featureStatsLabel} onChange={(e:any)=>set('featureStatsLabel',e.target.value)} placeholder="Daily Impressions"/>
              <Field label="Stats overlay value" value={h.featureStatsValue} onChange={(e:any)=>set('featureStatsValue',e.target.value)} placeholder="4.2M+"/>
            </div>
          </SectionCard>
        </>)}

        {/* ── SIGNATURE ────────────────────────────────────────────── */}
        {tab === 'Signature' && (<>
          <SectionCard title="Signature Section (dark full-screen brand statement)">
            <Field label="Eyebrow (e.g. 'Brand Philosophy')"
              value={h.signatureEyebrow} onChange={(e:any)=>set('signatureEyebrow',e.target.value)}/>
            <StringListEditor label="Signature lines (each on a new line)"
              value={h.signatureLines || []} onChange={v=>set('signatureLines',v)}/>
            <div className="p-3 rounded-lg bg-gray-50 text-[11px] text-gray-400">
              💡 The <strong>second line</strong> is displayed in red; all others are white.
            </div>
            {/* ── Arabic ── */}
            <div className="pt-2 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{color:'#D90429'}}>🌐 Arabic — اللغة العربية</span><div className="flex-1 h-px bg-red-100"/></div>
            <Field label="Arabic Eyebrow (الشعار الصغير)" value={(h as any).signatureEyebrowAr||''} onChange={(e:any)=>set('signatureEyebrowAr',e.target.value)} dir="rtl"/>
            <StringListEditor label="Arabic Signature Lines (أسطر الشعار بالعربية)"
              value={(h as any).signatureLinesAr || []} onChange={v=>set('signatureLinesAr',v)}/>
          </SectionCard>
        </>)}

        {/* ── FINAL CTA ────────────────────────────────────────────── */}
        {tab === 'Final CTA' && (<>
          <SectionCard title="Final CTA Section">
            <Field label="Eyebrow (e.g. 'Let's Work Together')"
              value={h.finalCtaEyebrow} onChange={(e:any)=>set('finalCtaEyebrow',e.target.value)}/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Headline line 1" value={h.finalCtaTitleLine1} onChange={(e:any)=>set('finalCtaTitleLine1',e.target.value)}/>
              <Field label="Headline line 2 (faded)" value={h.finalCtaTitleLine2} onChange={(e:any)=>set('finalCtaTitleLine2',e.target.value)}/>
            </div>
            <TA label="Subtext paragraph" value={h.finalCtaSubtext}
              onChange={(e:any)=>set('finalCtaSubtext',e.target.value)} rows={2}/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary button text" value={h.finalCtaPrimaryText} onChange={(e:any)=>set('finalCtaPrimaryText',e.target.value)}/>
              <Field label="Secondary button text" value={h.finalCtaSecondaryText} onChange={(e:any)=>set('finalCtaSecondaryText',e.target.value)}/>
            </div>
            <StringListEditor label="Trust badges (3 micro-labels at the bottom)"
              value={h.finalCtaBadges || []} onChange={v=>set('finalCtaBadges',v)}/>
            {/* ── Arabic ── */}
            <div className="pt-2 flex items-center gap-3"><span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{color:'#D90429'}}>🌐 Arabic — اللغة العربية</span><div className="flex-1 h-px bg-red-100"/></div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Arabic Headline Line 1 (السطر الأول)" value={(h as any).finalCtaTitleLine1Ar||''} onChange={(e:any)=>set('finalCtaTitleLine1Ar',e.target.value)} dir="rtl"/>
              <Field label="Arabic Headline Line 2 (السطر الثاني)" value={(h as any).finalCtaTitleLine2Ar||''} onChange={(e:any)=>set('finalCtaTitleLine2Ar',e.target.value)} dir="rtl"/>
            </div>
            <TA label="Arabic Subtext (النص الفرعي بالعربية)" value={(h as any).finalCtaSubtextAr||''}
              onChange={(e:any)=>set('finalCtaSubtextAr',e.target.value)} rows={2} dir="rtl"/>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Arabic Primary Button (زر رئيسي)" value={(h as any).finalCtaPrimaryTextAr||''} onChange={(e:any)=>set('finalCtaPrimaryTextAr',e.target.value)} dir="rtl"/>
              <Field label="Arabic Secondary Button (زر ثانوي)" value={(h as any).finalCtaSecondaryTextAr||''} onChange={(e:any)=>set('finalCtaSecondaryTextAr',e.target.value)} dir="rtl"/>
            </div>
          </SectionCard>
        </>)}

      </div>

      {/* Sticky save */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
        <Btn onClick={save} className="flex items-center gap-2 px-6">
          <Save size={14}/> Save All Changes
        </Btn>
      </div>
    </div>
  )
}
