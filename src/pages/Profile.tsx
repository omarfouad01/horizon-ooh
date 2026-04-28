import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES, RED, NAVY, ease } from "@/lib/routes";
import { siteUserStore } from "@/store/dataStore";
import { authApi } from "@/api";
import toast from "react-hot-toast";
import { useLang } from "@/i18n/LangContext";

function AuthInput({ label, id, type = "text", placeholder, value, onChange, required = true, readOnly = false }: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange?: (v: string) => void; required?: boolean; readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold tracking-[0.25em] uppercase mb-2"
        style={{ color: "rgba(11,15,26,0.45)" }}>{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} required={required}
        value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        readOnly={readOnly}
        className="w-full bg-white text-[15px] font-medium outline-none transition-all duration-200"
        style={{
          height: 52, padding: "0 18px",
          border: `1.5px solid ${focused && !readOnly ? NAVY : "rgba(11,15,26,0.14)"}`,
          borderRadius: 6, color: readOnly ? "rgba(11,15,26,0.4)" : NAVY,
          background: readOnly ? "rgba(11,15,26,0.02)" : "white",
          boxShadow: focused && !readOnly ? `0 0 0 3px rgba(11,15,26,0.06)` : "none",
        }}
      />
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { isAr } = useLang();

  const [user, setUser] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('horizon_site_user');
      if (raw) {
        const u = JSON.parse(raw);
        setUser(u);
        setName(u.name || '');
        setPhone(u.phone || '');
      } else {
        // Not logged in, redirect
        navigate(ROUTES.HOME);
      }
    } catch {
      navigate(ROUTES.HOME);
    }
  }, [navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error(isAr ? 'الاسم مطلوب' : 'Name is required'); return; }
    setLoading(true);
    try {
      const payload: any = { name, phone };
      if (newPw && currentPw) {
        payload.current_password = currentPw;
        payload.password = newPw;
        payload.password_confirmation = newPw;
      }
      const res = await authApi.updateProfile(payload);
      const updated = res?.data?.user || res?.data;
      if (updated) {
        const newUser = { name: updated.name || name, email: updated.email || user?.email || '', phone: updated.phone || phone };
        localStorage.setItem('horizon_site_user', JSON.stringify(newUser));
        setUser(newUser);
        if (user?.email) {
          siteUserStore.upsert(user.email, { name: newUser.name, phone: newUser.phone, source: 'profile' });
        }
      } else {
        // Update locally even if API doesn't return data
        const newUser = { name, email: user?.email || '', phone };
        localStorage.setItem('horizon_site_user', JSON.stringify(newUser));
        setUser(newUser);
      }
      setCurrentPw(''); setNewPw('');
      toast.success(isAr ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
    } catch (err: any) {
      const apiErr = err?.response?.data?.errors;
      if (apiErr && typeof apiErr === 'object') {
        toast.error(Object.values(apiErr).flat().join(' '));
      } else {
        // Update locally even on API failure (preview / offline)
        const newUser = { name, email: user?.email || '', phone };
        localStorage.setItem('horizon_site_user', JSON.stringify(newUser));
        setUser(newUser);
        toast.success(isAr ? 'تم تحديث البيانات محلياً' : 'Profile updated locally.');
      }
    }
    setLoading(false);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FC] pt-[76px]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-[580px] mx-auto px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}>

          {/* Heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
              <span className="text-[10px] font-bold tracking-[0.35em] uppercase"
                style={{ color: "rgba(11,15,26,0.35)" }}>
                {isAr ? 'الملف الشخصي' : 'My Profile'}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                style={{ background: RED }}>
                {(user.name || user.email).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="font-black text-[26px] tracking-[-0.03em]" style={{ color: NAVY }}>
                  {user.name || user.email}
                </h1>
                <p className="text-[13px] text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <form onSubmit={handleSave} className="space-y-5">
              <AuthInput label={isAr ? 'الاسم الكامل' : 'Full Name'} id="name" placeholder={isAr ? 'الاسم الكامل' : 'Your full name'}
                value={name} onChange={setName} />
              <AuthInput label={isAr ? 'البريد الإلكتروني' : 'Email'} id="email" placeholder=""
                value={user.email} readOnly />
              <AuthInput label={isAr ? 'رقم الهاتف' : 'Phone Number'} id="phone" type="tel" placeholder="+20 xxx xxx xxxx"
                value={phone} onChange={setPhone} required={false} />

              {/* Password change section */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">
                  {isAr ? 'تغيير كلمة المرور (اختياري)' : 'Change Password (optional)'}
                </p>
                <div className="space-y-4">
                  <AuthInput label={isAr ? 'كلمة المرور الحالية' : 'Current Password'} id="current_pw" type="password"
                    placeholder="••••••••" value={currentPw} onChange={setCurrentPw} required={false} />
                  <AuthInput label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} id="new_pw" type="password"
                    placeholder="••••••••" value={newPw} onChange={setNewPw} required={false} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] text-[11px] font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center transition-opacity"
                style={{ background: loading ? "rgba(11,15,26,0.5)" : NAVY, borderRadius: 6 }}
              >
                {loading
                  ? (isAr ? 'جار الحفظ...' : 'Saving...')
                  : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
              </button>
            </form>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="text-[12px] font-semibold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            ← {isAr ? 'رجوع' : 'Go Back'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
