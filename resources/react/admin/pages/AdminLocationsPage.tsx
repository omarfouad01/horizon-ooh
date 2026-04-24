import { useState } from 'react'
import { useStore, locationsContentStore } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA } from '../ui'
import { Save, RefreshCw, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const RED = '#D90429'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5" style={{ background: '#f9fafb' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: RED }} />
        <p className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function DividerAr() {
  return (
    <div className="pt-1 flex items-center gap-3">
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Arabic (اللغة العربية)</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

const TABS = ['Hero', 'CTA Bar', 'Location Detail', 'No Results'] as const
type Tab = typeof TABS[number]

export default function AdminLocationsPage() {
  const { locationsContent } = useStore() as any
  const [f, setF] = useState<any>({ ...locationsContent })
  const [tab, setTab] = useState<Tab>('Hero')

  function set(k: string, v: any) { setF((p: any) => ({ ...p, [k]: v })) }

  function save() {
    locationsContentStore.update(f)
    toast.success('Locations page content saved')
  }

  function reset() {
    if (!confirm('Reset to current saved values?')) return
    setF({ ...locationsContent })
    toast.success('Reset to saved values')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Locations Page"
        subtitle="Control all text and content on the /locations page and individual location detail pages"
        action={
          <div className="flex gap-2">
            <Btn onClick={reset} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200">
              <RefreshCw size={14} /> Reset
            </Btn>
            <Btn onClick={save} className="flex items-center gap-1.5">
              <Save size={14} /> Save Changes
            </Btn>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all"
            style={tab === t
              ? { background: 'white', color: '#0B0F1A', boxShadow: '0 1px 3px rgba(11,15,26,0.1)' }
              : { color: 'rgba(11,15,26,0.4)' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-5">

        {/* ── HERO ── */}
        {tab === 'Hero' && (
          <>
            <SectionCard title="Hero — Eyebrow & Headline">
              <Field label="Eyebrow (small label above title)"
                value={f.eyebrow ?? ''} onChange={(e: any) => set('eyebrow', e.target.value)}
                placeholder="Our Network" />
              <Field label="Title (main headline)"
                value={f.title ?? ''} onChange={(e: any) => set('title', e.target.value)}
                placeholder="Advertising Locations" />
              <Field label="Title Accent (greyed second line)"
                value={f.titleAccent ?? ''} onChange={(e: any) => set('titleAccent', e.target.value)}
                placeholder="Across Egypt." />
              <TA label="Subtitle (description under title)"
                value={f.subtitle ?? ''} onChange={(e: any) => set('subtitle', e.target.value)}
                rows={2} placeholder="9,500+ premium outdoor advertising locations..." />
              <DividerAr />
              <Field label="Arabic Eyebrow (الشريط العلوي)"
                value={f.eyebrowAr ?? ''} onChange={(e: any) => set('eyebrowAr', e.target.value)}
                dir="rtl" placeholder="شبكتنا" />
              <Field label="Arabic Title (العنوان الرئيسي)"
                value={f.titleAr ?? ''} onChange={(e: any) => set('titleAr', e.target.value)}
                dir="rtl" placeholder="مواقع إعلانية" />
              <Field label="Arabic Title Accent (السطر الثاني)"
                value={f.titleAccentAr ?? ''} onChange={(e: any) => set('titleAccentAr', e.target.value)}
                dir="rtl" placeholder="في جميع أنحاء مصر." />
              <TA label="Arabic Subtitle (الوصف)"
                value={f.subtitleAr ?? ''} onChange={(e: any) => set('subtitleAr', e.target.value)}
                rows={2} dir="rtl" placeholder="أكثر من 9,500 موقع إعلاني متميز..." />
            </SectionCard>
          </>
        )}

        {/* ── CTA BAR ── */}
        {tab === 'CTA Bar' && (
          <>
            <SectionCard title="Floating CTA Bar (bottom of page)">
              <TA label="Help text (left side of bar)"
                value={f.ctaHelpText ?? ''} onChange={(e: any) => set('ctaHelpText', e.target.value)}
                rows={1} placeholder="Need help choosing the best billboard?" />
              <Field label="Button text"
                value={f.ctaButton ?? ''} onChange={(e: any) => set('ctaButton', e.target.value)}
                placeholder="Talk to an Expert" />
              <Field label="WhatsApp Number (include country code, e.g. +201234567890)"
                value={f.whatsappNumber ?? ''} onChange={(e: any) => set('whatsappNumber', e.target.value)}
                placeholder="+201234567890" />
              <TA label="WhatsApp Pre-filled Message"
                value={f.whatsappMessage ?? ''} onChange={(e: any) => set('whatsappMessage', e.target.value)}
                rows={1} placeholder="Hi HORIZON OOH, I need help choosing billboard locations" />
              <DividerAr />
              <TA label="Arabic Help Text (نص المساعدة)"
                value={f.ctaHelpTextAr ?? ''} onChange={(e: any) => set('ctaHelpTextAr', e.target.value)}
                rows={1} dir="rtl" placeholder="تحتاج مساعدة في اختيار أفضل لوحة إعلانية؟" />
              <Field label="Arabic Button Text (نص الزر)"
                value={f.ctaButtonAr ?? ''} onChange={(e: any) => set('ctaButtonAr', e.target.value)}
                dir="rtl" placeholder="تحدث مع خبير" />
            </SectionCard>
          </>
        )}

        {/* ── LOCATION DETAIL ── */}
        {tab === 'Location Detail' && (
          <>
            <SectionCard title="Individual Location Page (/locations/:city)">
              <p className="text-[12px] text-gray-400 -mt-1">These texts appear on each individual city/governorate page.</p>
              <Field label="Eyebrow label (small text above city name)"
                value={f.detailEyebrow ?? ''} onChange={(e: any) => set('detailEyebrow', e.target.value)}
                placeholder="Advertising Location" />
              <Field label="CTA Button text"
                value={f.detailCtaButton ?? ''} onChange={(e: any) => set('detailCtaButton', e.target.value)}
                placeholder="Get a Quote" />
              <DividerAr />
              <Field label="Arabic Eyebrow (الشريط العلوي)"
                value={f.detailEyebrowAr ?? ''} onChange={(e: any) => set('detailEyebrowAr', e.target.value)}
                dir="rtl" placeholder="موقع إعلاني" />
              <Field label="Arabic CTA Button (نص الزر)"
                value={f.detailCtaButtonAr ?? ''} onChange={(e: any) => set('detailCtaButtonAr', e.target.value)}
                dir="rtl" placeholder="اطلب عرض سعر" />
            </SectionCard>
          </>
        )}

        {/* ── NO RESULTS ── */}
        {tab === 'No Results' && (
          <>
            <SectionCard title="No Results / Empty State">
              <p className="text-[12px] text-gray-400 -mt-1">Shown when no billboards match the selected filters.</p>
              <Field label="Title"
                value={f.noResultsTitle ?? ''} onChange={(e: any) => set('noResultsTitle', e.target.value)}
                placeholder="No locations match your search" />
              <TA label="Hint text (under title)"
                value={f.noResultsHint ?? ''} onChange={(e: any) => set('noResultsHint', e.target.value)}
                rows={2} placeholder="Let us recommend the best locations..." />
              <DividerAr />
              <Field label="Arabic Title (العنوان)"
                value={f.noResultsTitleAr ?? ''} onChange={(e: any) => set('noResultsTitleAr', e.target.value)}
                dir="rtl" placeholder="لا توجد مواقع تطابق بحثك" />
              <TA label="Arabic Hint Text (النص التوضيحي)"
                value={f.noResultsHintAr ?? ''} onChange={(e: any) => set('noResultsHintAr', e.target.value)}
                rows={2} dir="rtl" placeholder="دعنا نوصي بأفضل المواقع لحملتك..." />
            </SectionCard>
          </>
        )}

        {/* Save button at bottom */}
        <div className="flex justify-end pt-2">
          <Btn onClick={save} className="flex items-center gap-2 px-6">
            <Save size={14} /> Save All Changes
          </Btn>
        </div>
      </div>
    </div>
  )
}
