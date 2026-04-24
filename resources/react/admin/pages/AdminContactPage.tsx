import { useState } from 'react'
import { useStore } from '@/store/dataStore'
import { contactContentStore } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA } from '../ui'
import toast from 'react-hot-toast'

const NAVY = '#0B0F1A'

export default function AdminContactPage() {
  const { contactContent, settings } = useStore()

  const cc = contactContent || {}

  const [heroEyebrow,    setHeroEyebrow]    = useState(cc.heroEyebrow    || 'Get in Touch')
  const [heroEyebrowAr,  setHeroEyebrowAr]  = useState(cc.heroEyebrowAr  || 'تواصل معنا')
  const [heroTitle,      setHeroTitle]      = useState(cc.heroTitle      || 'Contact Us.')
  const [heroTitleAr,    setHeroTitleAr]    = useState(cc.heroTitleAr    || 'اتصل بنا.')
  const [heroAccent,     setHeroAccent]     = useState(cc.heroAccent     || "Let's talk visibility.")
  const [heroAccentAr,   setHeroAccentAr]   = useState(cc.heroAccentAr   || 'دعنا نتحدث عن الظهور.')
  const [heroSubtitle,   setHeroSubtitle]   = useState(cc.heroSubtitle   || 'Ready to launch your outdoor advertising campaign? Our team will respond within 24 hours.')
  const [heroSubtitleAr, setHeroSubtitleAr] = useState(cc.heroSubtitleAr || 'هل أنت مستعد لإطلاق حملتك الإعلانية الخارجية؟ سيرد فريقنا خلال 24 ساعة.')
  const [formLabel,      setFormLabel]      = useState(cc.formLabel      || 'Campaign Enquiry Form')
  const [formLabelAr,    setFormLabelAr]    = useState(cc.formLabelAr    || 'نموذج الاستفسار عن الحملة')
  const [successTitle,   setSuccessTitle]   = useState(cc.successTitle   || 'Message received.')
  const [successTitleAr, setSuccessTitleAr] = useState(cc.successTitleAr || 'تم استلام رسالتك.')
  const [successText,    setSuccessText]    = useState(cc.successText    || 'Thank you for reaching out. One of our media strategists will be in touch within 24 hours.')
  const [successTextAr,  setSuccessTextAr]  = useState(cc.successTextAr  || 'شكراً لتواصلك معنا. سيتواصل معك أحد خبرائنا الإعلاميين خلال 24 ساعة.')
  const [infoTitle,      setInfoTitle]      = useState(cc.infoTitle      || 'Speak directly with our media team.')
  const [infoTitleAr,    setInfoTitleAr]    = useState(cc.infoTitleAr    || 'تحدث مباشرة مع فريق الإعلام لدينا.')
  const [responseTime,   setResponseTime]   = useState(cc.responseTime   || 'We respond within 24 hours.')
  const [responseTimeAr, setResponseTimeAr] = useState(cc.responseTimeAr || 'نرد خلال 24 ساعة.')
  const [sendBtn,        setSendBtn]        = useState(cc.sendBtn        || 'Send Message')
  const [sendBtnAr,      setSendBtnAr]      = useState(cc.sendBtnAr      || 'إرسال الرسالة')
  const [hqLabel,        setHqLabel]        = useState(cc.hqLabel        || (settings?.hqLabel ?? 'Cairo HQ'))
  const [hqLabelAr,      setHqLabelAr]      = useState(cc.hqLabelAr      || 'المقر الرئيسي بالقاهرة')

  const [tab, setTab] = useState<'en' | 'ar'>('en')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await contactContentStore.update({
      heroEyebrow, heroEyebrowAr,
      heroTitle, heroTitleAr,
      heroAccent, heroAccentAr,
      heroSubtitle, heroSubtitleAr,
      formLabel, formLabelAr,
      successTitle, successTitleAr,
      successText, successTextAr,
      infoTitle, infoTitleAr,
      responseTime, responseTimeAr,
      sendBtn, sendBtnAr,
      hqLabel, hqLabelAr,
    })
    setSaving(false)
    toast.success('Contact page content saved!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Contact Page" subtitle="Control all text and labels on the public Contact page" />

      {/* Language tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit mb-6">
        <button
          onClick={() => setTab('en')}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${tab === 'en' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => setTab('ar')}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${tab === 'ar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          style={tab === 'ar' ? { color: '#D90429' } : {}}
        >
          🌐 Arabic — عربي
        </button>
      </div>

      <div className="space-y-8">

        {/* ── Hero Section ── */}
        <section className="rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(11,15,26,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100" style={{ background: '#F9FAFB' }}>
            <h3 className="text-[13px] font-bold text-gray-900">Hero Section</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">The large top banner of the Contact page</p>
          </div>
          <div className="p-5 space-y-4">
            {tab === 'en' ? (
              <>
                <Field label="Eyebrow text (small label above title)" value={heroEyebrow} onChange={(e: any) => setHeroEyebrow(e.target.value)} placeholder="Get in Touch" />
                <Field label="Main Title" value={heroTitle} onChange={(e: any) => setHeroTitle(e.target.value)} placeholder="Contact Us." />
                <Field label="Accent line (highlighted in red)" value={heroAccent} onChange={(e: any) => setHeroAccent(e.target.value)} placeholder="Let's talk visibility." />
                <TA label="Subtitle paragraph" value={heroSubtitle} onChange={(e: any) => setHeroSubtitle(e.target.value)} rows={2} placeholder="Ready to launch…" />
              </>
            ) : (
              <div className="p-4 rounded-xl space-y-4" style={{ background: '#FFF8F8', border: '1px solid #FFE0E0' }}>
                <p className="text-[11px] text-gray-400">اترك الحقول فارغة لعرض النص الإنجليزي افتراضياً.</p>
                <Field label="Eyebrow (العنوان الصغير)" value={heroEyebrowAr} onChange={(e: any) => setHeroEyebrowAr(e.target.value)} dir="rtl" placeholder="تواصل معنا" />
                <Field label="Main Title (العنوان الرئيسي)" value={heroTitleAr} onChange={(e: any) => setHeroTitleAr(e.target.value)} dir="rtl" placeholder="اتصل بنا." />
                <Field label="Accent Line (النص الأحمر)" value={heroAccentAr} onChange={(e: any) => setHeroAccentAr(e.target.value)} dir="rtl" placeholder="دعنا نتحدث عن الظهور." />
                <TA label="Subtitle (الوصف)" value={heroSubtitleAr} onChange={(e: any) => setHeroSubtitleAr(e.target.value)} rows={2} dir="rtl" placeholder="هل أنت مستعد…" />
              </div>
            )}
          </div>
        </section>

        {/* ── Form & Info labels ── */}
        <section className="rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(11,15,26,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100" style={{ background: '#F9FAFB' }}>
            <h3 className="text-[13px] font-bold text-gray-900">Form &amp; Info Panel</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Labels for the enquiry form and the contact info sidebar</p>
          </div>
          <div className="p-5 space-y-4">
            {tab === 'en' ? (
              <>
                <Field label="Form title label" value={formLabel} onChange={(e: any) => setFormLabel(e.target.value)} placeholder="Campaign Enquiry Form" />
                <Field label="Send button text" value={sendBtn} onChange={(e: any) => setSendBtn(e.target.value)} placeholder="Send Message" />
                <Field label="Info panel title" value={infoTitle} onChange={(e: any) => setInfoTitle(e.target.value)} placeholder="Speak directly with our media team." />
                <Field label="Response time note" value={responseTime} onChange={(e: any) => setResponseTime(e.target.value)} placeholder="We respond within 24 hours." />
                <Field label="HQ / Location label" value={hqLabel} onChange={(e: any) => setHqLabel(e.target.value)} placeholder="Cairo HQ" />
              </>
            ) : (
              <div className="p-4 rounded-xl space-y-4" style={{ background: '#FFF8F8', border: '1px solid #FFE0E0' }}>
                <p className="text-[11px] text-gray-400">اترك الحقول فارغة لعرض النص الإنجليزي افتراضياً.</p>
                <Field label="عنوان النموذج" value={formLabelAr} onChange={(e: any) => setFormLabelAr(e.target.value)} dir="rtl" placeholder="نموذج الاستفسار عن الحملة" />
                <Field label="نص زر الإرسال" value={sendBtnAr} onChange={(e: any) => setSendBtnAr(e.target.value)} dir="rtl" placeholder="إرسال الرسالة" />
                <Field label="عنوان لوحة المعلومات" value={infoTitleAr} onChange={(e: any) => setInfoTitleAr(e.target.value)} dir="rtl" placeholder="تحدث مباشرة مع فريق الإعلام لدينا." />
                <Field label="ملاحظة وقت الاستجابة" value={responseTimeAr} onChange={(e: any) => setResponseTimeAr(e.target.value)} dir="rtl" placeholder="نرد خلال 24 ساعة." />
                <Field label="اسم المقر (HQ Label)" value={hqLabelAr} onChange={(e: any) => setHqLabelAr(e.target.value)} dir="rtl" placeholder="المقر الرئيسي بالقاهرة" />
              </div>
            )}
          </div>
        </section>

        {/* ── Success message ── */}
        <section className="rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(11,15,26,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100" style={{ background: '#F9FAFB' }}>
            <h3 className="text-[13px] font-bold text-gray-900">Success Message</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Shown after the user submits the contact form</p>
          </div>
          <div className="p-5 space-y-4">
            {tab === 'en' ? (
              <>
                <Field label="Success title" value={successTitle} onChange={(e: any) => setSuccessTitle(e.target.value)} placeholder="Message received." />
                <TA label="Success body text" value={successText} onChange={(e: any) => setSuccessText(e.target.value)} rows={2} placeholder="Thank you for reaching out…" />
              </>
            ) : (
              <div className="p-4 rounded-xl space-y-4" style={{ background: '#FFF8F8', border: '1px solid #FFE0E0' }}>
                <p className="text-[11px] text-gray-400">اترك الحقول فارغة لعرض النص الإنجليزي افتراضياً.</p>
                <Field label="عنوان نجاح الإرسال" value={successTitleAr} onChange={(e: any) => setSuccessTitleAr(e.target.value)} dir="rtl" placeholder="تم استلام رسالتك." />
                <TA label="نص نجاح الإرسال" value={successTextAr} onChange={(e: any) => setSuccessTextAr(e.target.value)} rows={2} dir="rtl" placeholder="شكراً لتواصلك معنا…" />
              </div>
            )}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <Btn onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Contact Page'}
          </Btn>
        </div>
      </div>
    </div>
  )
}
