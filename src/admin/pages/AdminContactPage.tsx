import { useState } from 'react'
import { useStore, contactContentStore } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA } from '../ui'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminContactPage() {
  const store = useStore()
  const [d, setD] = useState({ ...store.contactContent })

  function set(k: string, v: any) { setD(p => ({ ...p, [k]: v })) }

  async function save() {
    try {
      await contactContentStore.update(d)
      toast.success('Contact page content saved!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Save failed')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Contact Page Content"
        subtitle="Control text displayed on the /contact page"
        action={<Btn onClick={save} className="flex items-center gap-2"><Save size={14} />Save Changes</Btn>}
      />

      <div className="space-y-8 mt-6">
        {/* Hero */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Hero Section</h2>
          <Field label="Eyebrow Text (EN)" value={d.heroEyebrow ?? ''} onChange={e => set('heroEyebrow', e.target.value)} placeholder="Get in Touch" />
          <Field label="Eyebrow Text (AR)" value={d.heroEyebrowAr ?? ''} onChange={e => set('heroEyebrowAr', e.target.value)} dir="rtl" />
          <Field label="Headline (EN)" value={d.heroTitle ?? ''} onChange={e => set('heroTitle', e.target.value)} placeholder="Let's Talk" />
          <Field label="Headline (AR)" value={d.heroTitleAr ?? ''} onChange={e => set('heroTitleAr', e.target.value)} dir="rtl" />
          <TA label="Subtitle (EN)" value={d.heroSubtitle ?? ''} onChange={e => set('heroSubtitle', e.target.value)} rows={2} />
          <TA label="Subtitle (AR)" value={d.heroSubtitleAr ?? ''} onChange={e => set('heroSubtitleAr', e.target.value)} rows={2} dir="rtl" />
        </section>

        {/* Office Info */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Office Info</h2>
          <Field label="Office Address (EN)" value={d.address ?? ''} onChange={e => set('address', e.target.value)} placeholder="Cairo, Egypt" />
          <Field label="Office Address (AR)" value={d.addressAr ?? ''} onChange={e => set('addressAr', e.target.value)} dir="rtl" />
          <Field label="Phone Number" value={d.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="+20 XX XXXX XXXX" />
          <Field label="Email" value={d.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="info@horizonooh.com" />
          <Field label="WhatsApp Number" value={d.whatsapp ?? ''} onChange={e => set('whatsapp', e.target.value)} placeholder="+20XXXXXXXXXX" />
        </section>

        {/* Form Labels */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Form Submit Button</h2>
          <Field label="Submit Button Text (EN)" value={d.submitBtn ?? ''} onChange={e => set('submitBtn', e.target.value)} placeholder="Send Message" />
          <Field label="Submit Button Text (AR)" value={d.submitBtnAr ?? ''} onChange={e => set('submitBtnAr', e.target.value)} dir="rtl" />
          <Field label="Success Message (EN)" value={d.successMsg ?? ''} onChange={e => set('successMsg', e.target.value)} placeholder="Your message has been sent!" />
          <Field label="Success Message (AR)" value={d.successMsgAr ?? ''} onChange={e => set('successMsgAr', e.target.value)} dir="rtl" />
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Btn onClick={save} className="flex items-center gap-2"><Save size={14} />Save Changes</Btn>
      </div>
    </div>
  )
}
