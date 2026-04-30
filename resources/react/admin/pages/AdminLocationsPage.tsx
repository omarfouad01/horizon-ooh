import { useState } from 'react'
import { useStore, locationsContentStore } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA } from '../ui'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLocationsPage() {
  const store = useStore()
  const [d, setD] = useState({ ...store.locationsContent })

  function set(k: string, v: any) { setD(p => ({ ...p, [k]: v })) }

  async function save() {
    try {
      await locationsContentStore.update(d)
      toast.success('Locations page content saved!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Save failed')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Locations Page Content"
        subtitle="Control text displayed on the /locations page"
        action={<Btn onClick={save} className="flex items-center gap-2"><Save size={14} />Save Changes</Btn>}
      />

      <div className="space-y-8 mt-6">

        {/* ── Hero Section ──────────────────────────────────────────── */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
            Hero Section
          </h2>
          {/* Eyebrow — key: eyebrow / eyebrowAr */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Eyebrow Label (EN)"
              value={d.eyebrow ?? d.heroEyebrow ?? ''}
              onChange={e => set('eyebrow', e.target.value)}
              placeholder="Our Network"
            />
            <Field
              label="Eyebrow Label (AR)"
              value={d.eyebrowAr ?? d.heroEyebrowAr ?? ''}
              onChange={e => set('eyebrowAr', e.target.value)}
              dir="rtl"
              placeholder="شبكتنا"
            />
          </div>
          {/* Title — key: title / titleAr */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Page Title (EN)"
              value={d.title ?? d.heroTitle ?? ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Advertising Locations"
            />
            <Field
              label="Page Title (AR)"
              value={d.titleAr ?? d.heroTitleAr ?? ''}
              onChange={e => set('titleAr', e.target.value)}
              dir="rtl"
              placeholder="مواقع الإعلانات"
            />
          </div>
          {/* Title Accent (second line, faded) — key: titleAccent / titleAccentAr */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Title Accent — 2nd line, faded (EN)"
              value={d.titleAccent ?? ''}
              onChange={e => set('titleAccent', e.target.value)}
              placeholder="across Egypt."
            />
            <Field
              label="Title Accent (AR)"
              value={d.titleAccentAr ?? ''}
              onChange={e => set('titleAccentAr', e.target.value)}
              dir="rtl"
              placeholder="في جميع أنحاء مصر."
            />
          </div>
          {/* Subtitle — key: subtitle / subtitleAr */}
          <div className="grid grid-cols-2 gap-3">
            <TA
              label="Subtitle / Description (EN)"
              value={d.subtitle ?? d.heroSubtitle ?? ''}
              onChange={e => set('subtitle', e.target.value)}
              rows={2}
              placeholder="Discover premium outdoor advertising locations across Egypt."
            />
            <TA
              label="Subtitle / Description (AR)"
              value={d.subtitleAr ?? d.heroSubtitleAr ?? ''}
              onChange={e => set('subtitleAr', e.target.value)}
              rows={2}
              dir="rtl"
            />
          </div>
        </section>

        {/* ── CTA Bar ───────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
            CTA Bar (bottom of filter panel)
          </h2>
          {/* Help text — key: ctaHelpText / ctaHelpTextAr */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Help text (EN)"
              value={d.ctaHelpText ?? d.ctaHelpTextAr ?? ''}
              onChange={e => set('ctaHelpText', e.target.value)}
              placeholder="Need help choosing a location?"
            />
            <Field
              label="Help text (AR)"
              value={d.ctaHelpTextAr ?? ''}
              onChange={e => set('ctaHelpTextAr', e.target.value)}
              dir="rtl"
              placeholder="تحتاج مساعدة في اختيار الموقع؟"
            />
          </div>
          {/* CTA Button — key: ctaButton / ctaButtonAr */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="CTA Button Label (EN)"
              value={d.ctaButton ?? d.ctaTalkText ?? ''}
              onChange={e => set('ctaButton', e.target.value)}
              placeholder="Talk to an expert"
            />
            <Field
              label="CTA Button Label (AR)"
              value={d.ctaButtonAr ?? d.ctaTalkTextAr ?? ''}
              onChange={e => set('ctaButtonAr', e.target.value)}
              dir="rtl"
              placeholder="تحدث مع خبير"
            />
          </div>
          {/* WhatsApp — shared key */}
          <Field
            label="WhatsApp Number (for CTA button)"
            value={d.ctaWhatsApp ?? d.whatsappNumber ?? ''}
            onChange={e => set('ctaWhatsApp', e.target.value)}
            placeholder="+20XXXXXXXXXX"
          />
        </section>

        {/* ── No Results State ──────────────────────────────────────── */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
            No Results State
          </h2>
          {/* Title — key: noResultsTitle / noResultsTitleAr */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="No Results Title (EN)"
              value={d.noResultsTitle ?? d.noResultsText ?? ''}
              onChange={e => set('noResultsTitle', e.target.value)}
              placeholder="No locations found"
            />
            <Field
              label="No Results Title (AR)"
              value={d.noResultsTitleAr ?? ''}
              onChange={e => set('noResultsTitleAr', e.target.value)}
              dir="rtl"
              placeholder="لا توجد مواقع"
            />
          </div>
          {/* Hint — key: noResultsHint / noResultsHintAr */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="No Results Hint (EN)"
              value={d.noResultsHint ?? ''}
              onChange={e => set('noResultsHint', e.target.value)}
              placeholder="Try adjusting your filters."
            />
            <Field
              label="No Results Hint (AR)"
              value={d.noResultsHintAr ?? ''}
              onChange={e => set('noResultsHintAr', e.target.value)}
              dir="rtl"
              placeholder="حاول تعديل الفلاتر."
            />
          </div>
        </section>

      </div>

      <div className="mt-6 flex justify-end">
        <Btn onClick={save} className="flex items-center gap-2"><Save size={14} />Save Changes</Btn>
      </div>
    </div>
  )
}
