import { contactStore, siteUserStore, useStore } from "@/store/dataStore"
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem, PageHero, Eyebrow } from "@/components/UI";
import { RED, NAVY, ease } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";

// PHP API endpoint — reads from Vite env, falls back to relative path.
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export default function Contact() {
  const { settings, contactContent } = useStore();
  const cc = contactContent || {};
  const { isAr, t } = useLang();
  const CONTACT_INFO = [
    { label: isAr ? (cc.hqLabelAr || 'المقر الرئيسي بالقاهرة') : (cc.hqLabel || (settings as any).hqLabel || 'Cairo HQ'), value: settings.address || 'Cairo, Egypt', icon: '◉' },
    { label: isAr ? 'الهاتف' : "Phone",   value: settings.phone   || "+20 2 1234 5678", icon: "◉" },
    { label: isAr ? 'البريد الإلكتروني' : "Email",   value: settings.email   || "info@horizonooh.com", icon: "◉" },
    { label: isAr ? 'ساعات العمل' : "Hours",   value: isAr ? 'الأحد – الخميس، 9:00 – 18:00 EET' : "Sun – Thu, 9:00 – 18:00 EET", icon: "◉" },
  ];
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    // ── Always save to local store immediately ─────────────────────────────
    contactStore.add({
      name:    form.name    || "",
      email:   form.email   || "",
      phone:   (form as any).phone,
      company: (form as any).company,
      subject: (form as any).subject || (form as any).service,
      message: form.message || "",
    });
    // Track as site user
    if (form.email) {
      siteUserStore.upsert(form.email, { name: form.name, phone: (form as any).phone, source: 'contact' });
    }

    // ── Also try sending to PHP API (optional, non-blocking) ───────────────
    try {
      await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (_) { /* ignore — data already saved to store */ }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <PageHero
        eyebrow={isAr ? (cc.heroEyebrowAr || 'تواصل معنا') : (cc.heroEyebrow || 'Get in Touch')}
        title={isAr ? (cc.heroTitleAr || 'اتصل بنا.') : (cc.heroTitle || 'Contact Us.')}
        titleAccent={isAr ? (cc.heroAccentAr || 'دعنا نتحدث عن الظهور.') : (cc.heroAccent || "Let's talk visibility.")}
        subtitle={isAr ? (cc.heroSubtitleAr || 'هل أنت مستعد لإطلاق حملتك الإعلانية الخارجية؟ سيرد فريقنا خلال 24 ساعة.') : (cc.heroSubtitle || 'Ready to launch your outdoor advertising campaign? Our team will respond within 24 hours.')}
        dark={false}
      />

      {/* Contact layout */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 140 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Form — left */}
            <div className="col-span-7">
              <Reveal>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8" style={{ color: "rgba(11,15,26,0.3)" }}>
                  {isAr ? (cc.formLabelAr || 'نموذج الاستفسار عن الحملة') : (cc.formLabel || 'Campaign Enquiry Form')}
                </p>
              </Reveal>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease }}
                  className="flex flex-col items-start gap-6"
                  style={{ padding: "60px 0" }}
                >
                  <div className="w-12 h-12 flex items-center justify-center" style={{ background: RED }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M4 11.5l5 5 9-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="font-black leading-[1.0] tracking-[-0.03em]" style={{ fontSize: 36, color: NAVY }}>
                    {isAr ? (cc.successTitleAr || 'تم استلام رسالتك.') : (cc.successTitle || 'Message received.')}
                  </h2>
                  <p className="text-[17px] leading-[1.75]" style={{ color: "rgba(11,15,26,0.45)", maxWidth: 420 }}>
                    {isAr ? (cc.successTextAr || 'شكراً لتواصلك معنا. سيتواصل معك أحد خبرائنا الإعلاميين خلال 24 ساعة.') : (cc.successText || 'Thank you for reaching out. One of our media strategists will be in touch within 24 hours.')}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { name: "name",    label: isAr ? 'الاسم الكامل' : 'Full Name',   type: "text",  required: true,  placeholder: isAr ? 'مثال: أحمد حسن' : 'e.g. Ahmed Hassan' },
                      { name: "company", label: isAr ? 'الشركة' : 'Company',     type: "text",  required: false, placeholder: isAr ? 'مثال: هورايزون ميديا' : 'e.g. Horizon Media' },
                    ].map((field) => (
                      <Reveal key={field.name}>
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={field.name}
                            className="text-[11px] font-bold tracking-[0.25em] uppercase"
                            style={{ color: "rgba(11,15,26,0.5)" }}
                          >
                            {field.label}{field.required && <span style={{ color: RED }}>*</span>}
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            required={field.required}
                            value={form[field.name as keyof typeof form]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className="w-full h-[52px] px-4 text-[15px] font-medium outline-none transition-all duration-200"
                            style={{
                              color: NAVY,
                              background: "#F8F8F9",
                              border: "1.5px solid rgba(11,15,26,0.15)",
                              borderRadius: 2,
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = RED)}
                            onBlur={e  => (e.currentTarget.style.borderColor = "rgba(11,15,26,0.15)")}
                          />
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { name: "email", label: isAr ? 'البريد الإلكتروني' : 'Email Address', type: "email", required: true,  placeholder: "name@company.com" },
                      { name: "phone", label: isAr ? 'رقم الهاتف' : 'Phone Number',  type: "tel",   required: false, placeholder: "+20 100 000 0000" },
                    ].map((field) => (
                      <Reveal key={field.name}>
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={field.name}
                            className="text-[11px] font-bold tracking-[0.25em] uppercase"
                            style={{ color: "rgba(11,15,26,0.5)" }}
                          >
                            {field.label}{field.required && <span style={{ color: RED }}>*</span>}
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            required={field.required}
                            value={form[field.name as keyof typeof form]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className="w-full h-[52px] px-4 text-[15px] font-medium outline-none transition-all duration-200"
                            style={{
                              color: NAVY,
                              background: "#F8F8F9",
                              border: "1.5px solid rgba(11,15,26,0.15)",
                              borderRadius: 2,
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = RED)}
                            onBlur={e  => (e.currentTarget.style.borderColor = "rgba(11,15,26,0.15)")}
                          />
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* Message */}
                  <Reveal>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="message"
                        className="text-[11px] font-bold tracking-[0.25em] uppercase"
                        style={{ color: "rgba(11,15,26,0.5)" }}
                      >
                        {isAr ? 'الرسالة' : 'Message'}<span style={{ color: RED }}>*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={form.message}
                        onChange={handleChange}
                        placeholder={isAr ? 'أخبرنا عن أهداف حملتك والجمهور المستهدف ونطاق الميزانية...' : 'Tell us about your campaign objectives, target audience, and budget range…'}
                        className="w-full px-4 py-3.5 text-[15px] font-medium outline-none resize-none transition-all duration-200"
                        style={{
                          color: NAVY,
                          background: "#F8F8F9",
                          border: "1.5px solid rgba(11,15,26,0.15)",
                          borderRadius: 2,
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = RED)}
                        onBlur={e  => (e.currentTarget.style.borderColor = "rgba(11,15,26,0.15)")}
                      />
                    </div>
                  </Reveal>

                  {/* API Error */}
                  {apiError && (
                    <Reveal>
                      <div className="mt-6 p-4 border border-[#D90429]/30" style={{ background: "rgba(217,4,41,0.04)" }}>
                        <p className="text-[13px] font-medium" style={{ color: RED }}>{apiError}</p>
                      </div>
                    </Reveal>
                  )}

                  {/* Submit */}
                  <Reveal delay={0.1}>
                    <div className="mt-8 flex items-center gap-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative h-[56px] px-12 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white flex items-center gap-3 active:scale-[0.97] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        style={{ background: loading ? "rgba(217,4,41,0.6)" : RED }}
                      >
                        <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: NAVY }} />
                        <span className="relative z-10">
                          {loading ? (isAr ? 'جارٍ الإرسال...' : 'Sending…') : (isAr ? (cc.sendBtnAr || 'إرسال الرسالة') : (cc.sendBtn || 'Send Message'))}
                        </span>
                        {loading && (
                          <span className="relative z-10 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                      </button>
                      <p className="text-[11px]" style={{ color: "rgba(11,15,26,0.3)" }}>
                        {isAr ? (cc.responseTimeAr || 'نرد خلال 24 ساعة.') : (cc.responseTime || 'We respond within 24 hours.')}
                      </p>
                    </div>
                  </Reveal>
                </form>
              )}
            </div>

            {/* Info — right */}
            <div className="col-span-5">
              <div className="sticky" style={{ top: 100 }}>
                {/* Navy info card */}
                <Reveal delay={0.1}>
                  <div style={{ background: NAVY, padding: "48px 48px" }}>
                    <div className="w-5 h-[1.5px] mb-8" style={{ background: RED }} />
                    <p className="font-black text-white text-[20px] tracking-[-0.02em] leading-[1.2] mb-10">
                      {isAr ? (cc.infoTitleAr || 'تحدث مباشرة مع فريق الإعلام لدينا.') : (cc.infoTitle || 'Speak directly with our media team.')}
                    </p>

                    <div className="flex flex-col gap-8">
                      {CONTACT_INFO.map((info) => (
                        <div key={info.label}>
                          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {info.label}
                          </p>
                          <p className="text-[14px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
                            {info.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Quick links */}
                    <div className="mt-12 pt-10 border-t border-white/[0.07]">
                      <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
                      </p>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: isAr ? 'عرض جميع المواقع' : 'View all locations', href: "/locations" },
                          { label: isAr ? 'استكشف خدماتنا' : 'Explore our services', href: "/services" },
                          { label: isAr ? 'اقرأ رؤيتنا' : 'Read our insights', href: "/blog" },
                        ].map((link) => (
                          <a
                            key={link.label}
                            href={`#${link.href}`}
                            onClick={(e) => { e.preventDefault(); window.location.hash = link.href; }}
                            className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ textDecoration: "none" }}
                          >
                            <span className="w-1 h-1 flex-shrink-0 group-hover:w-3 transition-all duration-300" style={{ background: RED }} />
                            <span className="text-[12px] font-semibold tracking-[0.15em] uppercase transition-colors duration-200 group-hover:text-white" style={{ color: "rgba(255,255,255,0.35)" }}>
                              {link.label}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom strip */}
      <section style={{ background: "#F5F5F6", paddingTop: 60, paddingBottom: 60 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3">
            {[
              { icon: "⊙", label: isAr ? 'استراتيجية الإعلام' : 'Media Strategy', desc: isAr ? 'استشارة مجانية لتخطيط الحملة' : 'Free campaign planning consultation' },
              { icon: "◈", label: isAr ? 'اختيار الموقع' : 'Site Selection', desc: isAr ? 'توصيات مواقع تعتمد على البيانات' : 'Data-driven location recommendations' },
              { icon: "◇", label: isAr ? 'تنفيذ الحملة' : 'Campaign Execution', desc: isAr ? 'خدمة متكاملة من البداية إلى النهاية' : 'End-to-end managed service' },
            ].map((item, i) => (
              <RevealItem key={item.label}>
                <div
                  className="flex flex-col py-8 px-10"
                  style={{ borderRight: i < 2 ? "1px solid rgba(11,15,26,0.08)" : "none" }}
                >
                  <span className="text-2xl mb-4" style={{ color: RED }}>{item.icon}</span>
                  <p className="font-bold text-[16px] mb-2" style={{ color: NAVY }}>{item.label}</p>
                  <p className="text-[13px] leading-[1.65]" style={{ color: "rgba(11,15,26,0.4)" }}>{item.desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
