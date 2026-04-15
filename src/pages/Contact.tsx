import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem, PageHero, Eyebrow } from "@/components/UI";
import { RED, NAVY, ease } from "@/lib/routes";

// PHP API endpoint — reads from Vite env, falls back to relative path.
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

const CONTACT_INFO = [
  { label: "Cairo HQ", value: "Smart Village, Km 28 Cairo–Alexandria Desert Rd, Giza", icon: "◉" },
  { label: "Phone", value: "+20 2 1234 5678", icon: "◉" },
  { label: "Email", value: "info@horizonooh.com", icon: "◉" },
  { label: "Hours", value: "Sun – Thu, 9:00 – 18:00 EET", icon: "◉" },
];

export default function Contact() {
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
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json() as { status: string; message?: string; errors?: Record<string, string> };
      if (!res.ok || json.status !== "ok") {
        const msg = json.message ?? "Something went wrong. Please try again.";
        setApiError(msg);
      } else {
        setSubmitted(true);
      }
    } catch (_err) {
      setApiError("Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Contact Us."
        titleAccent="Let's talk visibility."
        subtitle="Ready to launch your outdoor advertising campaign? Our team will respond within 24 hours."
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
                  Campaign Enquiry Form
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
                    Message received.
                  </h2>
                  <p className="text-[17px] leading-[1.75]" style={{ color: "rgba(11,15,26,0.45)", maxWidth: 420 }}>
                    Thank you for reaching out. One of our media strategists will be in touch within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-0">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px]" style={{ background: "rgba(11,15,26,0.08)" }}>
                    {[
                      { name: "name", label: "Full Name", type: "text", required: true },
                      { name: "company", label: "Company", type: "text", required: false },
                    ].map((field) => (
                      <Reveal key={field.name}>
                        <div className="bg-white relative" style={{ paddingTop: 8 }}>
                          <label
                            htmlFor={field.name}
                            className="block text-[10px] font-bold tracking-[0.3em] uppercase px-6 pt-5 pb-1"
                            style={{ color: "rgba(11,15,26,0.35)" }}
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
                            className="w-full bg-transparent px-6 pb-5 text-[15px] font-medium outline-none border-0 focus:border-b-2 focus:border-[#D90429] transition-colors duration-200"
                            style={{ color: NAVY }}
                            placeholder=""
                          />
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] mt-[1px]" style={{ background: "rgba(11,15,26,0.08)" }}>
                    {[
                      { name: "email", label: "Email Address", type: "email", required: true },
                      { name: "phone", label: "Phone Number", type: "tel", required: false },
                    ].map((field) => (
                      <Reveal key={field.name}>
                        <div className="bg-white">
                          <label
                            htmlFor={field.name}
                            className="block text-[10px] font-bold tracking-[0.3em] uppercase px-6 pt-5 pb-1"
                            style={{ color: "rgba(11,15,26,0.35)" }}
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
                            className="w-full bg-transparent px-6 pb-5 text-[15px] font-medium outline-none border-0 focus:border-b-2 focus:border-[#D90429] transition-colors duration-200"
                            style={{ color: NAVY }}
                          />
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* Message */}
                  <div className="mt-[1px]" style={{ background: "rgba(11,15,26,0.08)" }}>
                    <Reveal>
                      <div className="bg-white">
                        <label
                          htmlFor="message"
                          className="block text-[10px] font-bold tracking-[0.3em] uppercase px-6 pt-5 pb-1"
                          style={{ color: "rgba(11,15,26,0.35)" }}
                        >
                          Message<span style={{ color: RED }}>*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={handleChange}
                          className="w-full bg-transparent px-6 pb-6 text-[15px] font-medium outline-none border-0 resize-none focus:border-b-2 focus:border-[#D90429] transition-colors duration-200"
                          style={{ color: NAVY }}
                          placeholder="Tell us about your campaign objectives, target audience, and budget range…"
                        />
                      </div>
                    </Reveal>
                  </div>

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
                          {loading ? "Sending…" : "Send Message"}
                        </span>
                        {loading && (
                          <span className="relative z-10 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                      </button>
                      <p className="text-[11px]" style={{ color: "rgba(11,15,26,0.3)" }}>
                        We respond within 24 hours.
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
                      Speak directly with our media team.
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
                        Quick Actions
                      </p>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: "View all locations", href: "/locations" },
                          { label: "Explore our services", href: "/services" },
                          { label: "Read our insights", href: "/blog" },
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
              { icon: "⊙", label: "Media Strategy", desc: "Free campaign planning consultation" },
              { icon: "◈", label: "Site Selection", desc: "Data-driven location recommendations" },
              { icon: "◇", label: "Campaign Execution", desc: "End-to-end managed service" },
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
