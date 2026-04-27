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
        {/* Hero Section */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Hero Section</h2>
          <Field label="Eyebrow Text (EN)" value={d.heroEyebrow ?? ''} onChange={e => set('heroEyebrow', e.target.value)} placeholder="Our Locations" />
          <Field label="Eyebrow Text (AR)" value={d.heroEyebrowAr ?? ''} onChange={e => set('heroEyebrowAr', e.target.value)} dir="rtl" />
          <Field label="Hero Title (EN)" value={d.heroTitle ?? ''} onChange={e => set('heroTitle', e.target.value)} placeholder="Discover Egypt's Best Outdoor Ad Locations" />
          <Field label="Hero Title (AR)" value={d.heroTitleAr ?? ''} onChange={e => set('heroTitleAr', e.target.value)} dir="rtl" />
          <TA label="Hero Subtitle (EN)" value={d.heroSubtitle ?? ''} onChange={e => set('heroSubtitle', e.target.value)} rows={2} />
          <TA label="Hero Subtitle (AR)" value={d.heroSubtitleAr ?? ''} onChange={e => set('heroSubtitleAr', e.target.value)} rows={2} dir="rtl" />
        </section>

        {/* CTA Bar */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">CTA Bar</h2>
          <Field label="Help Choosing Button (EN)" value={d.ctaHelp ?? ''} onChange={e => set('ctaHelp', e.target.value)} placeholder="Help Me Choose" />
          <Field label="Help Choosing Button (AR)" value={d.ctaHelpAr ?? ''} onChange={e => set('ctaHelpAr', e.target.value)} dir="rtl" />
          <Field label="Talk to Expert Button (EN)" value={d.ctaExpert ?? ''} onChange={e => set('ctaExpert', e.target.value)} placeholder="Talk to an Expert" />
          <Field label="Talk to Expert Button (AR)" value={d.ctaExpertAr ?? ''} onChange={e => set('ctaExpertAr', e.target.value)} dir="rtl" />
          <Field label="WhatsApp Number" value={d.whatsappNumber ?? ''} onChange={e => set('whatsappNumber', e.target.value)} placeholder="+20XXXXXXXXXX" />
        </section>

        {/* Location Detail Page */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Location Detail Page</h2>
          <Field label="Eyebrow Text (EN)" value={d.detailEyebrow ?? ''} onChange={e => set('detailEyebrow', e.target.value)} placeholder="Advertising Location" />
          <Field label="Eyebrow Text (AR)" value={d.detailEyebrowAr ?? ''} onChange={e => set('detailEyebrowAr', e.target.value)} dir="rtl" />
          <Field label="Get a Quote Button (EN)" value={d.getQuoteBtn ?? ''} onChange={e => set('getQuoteBtn', e.target.value)} placeholder="Get a Quote" />
          <Field label="Get a Quote Button (AR)" value={d.getQuoteBtnAr ?? ''} onChange={e => set('getQuoteBtnAr', e.target.value)} dir="rtl" />
        </section>

        {/* No Results */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">No Results Text</h2>
          <Field label="No Results (EN)" value={d.noResults ?? ''} onChange={e => set('noResults', e.target.value)} placeholder="No locations found" />
          <Field label="No Results (AR)" value={d.noResultsAr ?? ''} onChange={e => set('noResultsAr', e.target.value)} dir="rtl" />
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Btn onClick={save} className="flex items-center gap-2"><Save size={14} />Save Changes</Btn>
      </div>
    </div>
  )
}
