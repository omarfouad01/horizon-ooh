import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES, RED, NAVY, ease } from "@/lib/routes";
import { authApi } from "@/api";

function AuthInput({ label, id, type = "text", placeholder, value, onChange, required = true }: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold tracking-[0.25em] uppercase mb-2"
        style={{ color: "rgba(11,15,26,0.45)" }}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} required={required} value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full bg-white text-[15px] font-medium outline-none transition-all duration-200"
        style={{ height: 52, padding: "0 18px", border: `1.5px solid ${focused ? NAVY : "rgba(11,15,26,0.14)"}`,
          borderRadius: 6, color: NAVY, boxShadow: focused ? `0 0 0 3px rgba(11,15,26,0.06)` : "none" }} />
    </div>
  );
}

function PasswordInput({ label, id, placeholder, value, onChange }: {
  label: string; id: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold tracking-[0.25em] uppercase mb-2"
        style={{ color: "rgba(11,15,26,0.45)" }}>{label}</label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} placeholder={placeholder} required value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full bg-white text-[15px] font-medium outline-none transition-all duration-200"
          style={{ height: 52, padding: "0 52px 0 18px", borderRadius: 6, color: NAVY,
            border: `1.5px solid ${focused ? NAVY : "rgba(11,15,26,0.14)"}`,
            boxShadow: focused ? `0 0 0 3px rgba(11,15,26,0.06)` : "none" }} />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(11,15,26,0.35)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
            background: "none", border: "none", cursor: "pointer" }}>
          {show ? "HIDE" : "SHOW"}
        </button>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative overflow-hidden hidden lg:flex flex-col justify-between"
      style={{ background: NAVY, width: "48%", flexShrink: 0, minHeight: "100svh", padding: "52px 64px" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 70% 40%, rgba(217,4,41,0.07) 0%, transparent 70%)" }} />
      <img src="https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=900&q=80&fit=crop"
        alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.1, mixBlendMode: "luminosity" }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute top-0 bottom-0 border-l border-white/[0.03]"
          style={{ left: `${(i + 1) * 16.66}%` }} />
      ))}

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }} className="relative z-10">
        <Link to={ROUTES.HOME} className="flex items-center gap-3" style={{ textDecoration: "none" }}>
          <div className="w-9 h-9 flex items-center justify-center" style={{ background: RED }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" opacity="0.9" />
              <path d="M7 8.5h4v1H7z" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-[13px] tracking-[0.22em] uppercase leading-none">HORIZON</p>
            <p className="text-white/30 font-semibold text-[9px] tracking-[0.35em] uppercase mt-0.5">OUT-OF-HOME</p>
          </div>
        </Link>
      </motion.div>

      <div className="relative z-10">
        {["Join Egypt's", "premier OOH", "network.", "Start today."].map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.p initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.2 + i * 0.1 }}
              className="font-black leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: "clamp(36px, 4vw, 58px)",
                color: i === 2 || i === 3 ? "rgba(255,255,255,0.2)" : "white" }}>
              {line}
            </motion.p>
          </div>
        ))}
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.85 }}
          className="mt-10 flex items-center gap-4" style={{ transformOrigin: "left" }}>
          <span className="block w-8 h-[1.5px]" style={{ background: RED }} />
          <span className="text-white/25 text-[11px] font-bold tracking-[0.3em] uppercase">9,500+ Premium Locations</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 1.1 }}
          className="mt-10 flex flex-col gap-4">
          {["Access all 9,500+ advertising locations", "Manage campaigns in real time", "Download reports and analytics"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: RED }} />
              <span className="text-white/35 text-[13px] leading-[1.5]">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 1.1 }}
        className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.07]">
        {[{ v: "100+", l: "Brands" }, { v: "+180%", l: "Avg. Recall" }, { v: "4.1×", l: "Avg. ROI" }].map((s) => (
          <div key={s.l}>
            <p className="font-black tracking-[-0.04em]" style={{ fontSize: 24, color: RED }}>{s.v}</p>
            <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-bold mt-1">{s.l}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password || !confirm) { setError('Please fill in all required fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please agree to the terms and privacy policy.'); return; }
    setLoading(true);
    try {
      const payload = { name, email, password, password_confirmation: confirm, phone, company };
      try {
        await authApi.register(payload);
      } catch (e1: any) {
        if (e1?.response?.status === 405 || e1?.response?.status === 404) {
          await authApi.registerFallback(payload);
        } else throw e1;
      }
      // Save full user info (including phone + company) for navbar / profile page
      localStorage.setItem('horizon_site_user', JSON.stringify({ name, email, phone: phone || '', company: company || '' }));
      setSuccess(true);
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        setError(Object.values(apiErrors).flat().join(' '));
      } else {
        setError(err?.response?.data?.message ?? err?.message ?? 'Registration failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[100svh]" style={{ fontFamily: "Inter, sans-serif" }}>
      <BrandPanel />

      <div className="flex-1 flex flex-col bg-white" style={{ minHeight: "100svh" }}>
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-8 pt-8 pb-6 border-b border-[#0B0F1A]/[0.07]">
          <Link to={ROUTES.HOME} className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: RED }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" />
              </svg>
            </div>
            <span className="font-black text-[13px] tracking-[0.22em] uppercase" style={{ color: NAVY }}>HORIZON OOH</span>
          </Link>
          <Link to={ROUTES.HOME} className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "rgba(11,15,26,0.4)", textDecoration: "none" }}>← Back</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease }} className="w-full" style={{ maxWidth: 480 }}>

            {/* Back — desktop */}
            <div className="hidden lg:flex items-center justify-between mb-10">
              <Link to={ROUTES.HOME}
                className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors hover:text-[#D90429]"
                style={{ color: "rgba(11,15,26,0.35)", textDecoration: "none" }}>
                <span style={{ fontSize: 14 }}>←</span> Back to site
              </Link>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: "rgba(11,15,26,0.2)" }}>Client Portal</span>
            </div>

            {success ? (
              /* ── Success state ── */
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease }} className="text-center py-8">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-6" style={{ background: RED }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12.5l5.5 5.5L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="font-black tracking-[-0.03em] mb-3" style={{ fontSize: 34, color: NAVY }}>
                  Account created.
                </h2>
                <p className="text-[16px] leading-[1.7] mb-8" style={{ color: "rgba(11,15,26,0.45)" }}>
                  Welcome to HORIZON OOH. Your account is ready — our team will be in touch within 24 hours to activate your campaign access.
                </p>
                <Link to={ROUTES.LOGIN}
                  className="inline-flex items-center h-[54px] px-10 text-[12px] font-bold tracking-[0.22em] uppercase text-white"
                  style={{ background: RED, borderRadius: 6, textDecoration: "none" }}>
                  Sign In →
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Heading */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                    <span className="text-[10px] font-bold tracking-[0.35em] uppercase"
                      style={{ color: "rgba(11,15,26,0.35)" }}>New Account</span>
                  </div>
                  <h1 className="font-black tracking-[-0.04em] leading-[0.92]"
                    style={{ fontSize: "clamp(34px, 4vw, 50px)", color: NAVY }}>
                    Create your<br />
                    <span style={{ color: "rgba(11,15,26,0.2)" }}>account.</span>
                  </h1>
                  <p className="mt-4 text-[15px] leading-[1.65]" style={{ color: "rgba(11,15,26,0.45)" }}>
                    Start your campaign with Horizon OOH — Egypt's #1 outdoor network.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <AuthInput label="Full Name" id="name" placeholder="Ahmed Hassan"
                      value={name} onChange={setName} />
                    <AuthInput label="Phone Number" id="phone" type="tel" placeholder="+20 100 000 0000"
                      value={phone} onChange={setPhone} required={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AuthInput label="Email Address" id="email" type="email"
                      placeholder="you@brand.com" value={email} onChange={setEmail} />
                    <AuthInput label="Company" id="company" placeholder="Brand Egypt"
                      value={company} onChange={setCompany} required={false} />
                  </div>
                  <PasswordInput label="Password" id="password" placeholder="Min. 8 characters"
                    value={password} onChange={setPassword} />
                  <div>
                    <PasswordInput label="Confirm Password" id="confirm" placeholder="Repeat password"
                      value={confirm} onChange={setConfirm} />
                    {confirm && password !== confirm && (
                      <p className="mt-1.5 text-[11px] font-semibold" style={{ color: RED }}>
                        Passwords do not match
                      </p>
                    )}
                    {confirm && password === confirm && confirm.length >= 8 && (
                      <p className="mt-1.5 text-[11px] font-semibold" style={{ color: "#22c55e" }}>
                        ✓ Passwords match
                      </p>
                    )}
                  </div>

                  {/* Password strength */}
                  {password.length > 0 && (
                    <div>
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex-1 h-[3px] rounded-full transition-all duration-300"
                            style={{ background: i < Math.min(Math.floor(password.length / 3), 4)
                              ? i < 2 ? "#f59e0b" : RED : "rgba(11,15,26,0.1)" }} />
                        ))}
                      </div>
                      <p className="text-[11px] mt-1.5 font-semibold" style={{ color: "rgba(11,15,26,0.35)" }}>
                        {password.length < 6 ? "Weak" : password.length < 10 ? "Fair" : password.length < 14 ? "Good" : "Strong"} password
                      </p>
                    </div>
                  )}

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div className="relative flex-shrink-0 w-5 h-5 border border-[#0B0F1A]/20 rounded-[4px] flex items-center justify-center mt-0.5"
                      style={{ background: agreed ? NAVY : "white" }}
                      onClick={() => setAgreed(!agreed)}>
                      {agreed && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[12px] leading-[1.6]" style={{ color: "rgba(11,15,26,0.45)" }}>
                      I agree to the{" "}
                      <span className="font-semibold underline" style={{ color: NAVY }}>Terms of Service</span>{" "}
                      and{" "}
                      <span className="font-semibold underline" style={{ color: NAVY }}>Privacy Policy</span>
                    </span>
                  </label>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4"
                      style={{ background: "rgba(217,4,41,0.05)", border: "1px solid rgba(217,4,41,0.2)", borderRadius: 6 }}>
                      <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full" style={{ background: RED }} />
                      <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className="group relative w-full overflow-hidden text-[12px] font-bold tracking-[0.22em] uppercase text-white flex items-center justify-center gap-3"
                    style={{ height: 54, background: RED, borderRadius: 6, border: "none",
                      cursor: loading ? "wait" : "pointer", opacity: loading ? 0.75 : 1, marginTop: 4 }}>
                    <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                      style={{ background: NAVY }} />
                    <span className="relative z-10 flex items-center gap-3">
                      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {loading ? "Creating account…" : "Create Account"}
                    </span>
                  </button>
                </form>

                <div className="flex items-center gap-4 my-7">
                  <span className="flex-1 h-px" style={{ background: "rgba(11,15,26,0.08)" }} />
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: "rgba(11,15,26,0.25)" }}>or</span>
                  <span className="flex-1 h-px" style={{ background: "rgba(11,15,26,0.08)" }} />
                </div>

                <p className="text-center text-[14px]" style={{ color: "rgba(11,15,26,0.45)" }}>
                  Already have an account?{" "}
                  <Link to={ROUTES.LOGIN}
                    className="font-bold transition-colors hover:text-[#D90429]"
                    style={{ color: NAVY, textDecoration: "none" }}>
                    Sign in →
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>

        <div className="px-8 py-5 border-t border-[#0B0F1A]/[0.06] flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em]" style={{ color: "rgba(11,15,26,0.2)" }}>© 2026 HORIZON OOH</p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Help"].map((l) => (
              <span key={l} className="text-[11px] tracking-[0.12em] cursor-pointer hover:text-[#D90429] transition-colors"
                style={{ color: "rgba(11,15,26,0.25)" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
