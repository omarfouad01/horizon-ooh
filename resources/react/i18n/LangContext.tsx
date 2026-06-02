/**
 * LangContext.tsx
 * Global language context — 'en' | 'ar'
 * - Persists to localStorage
 * - Sets html[dir] and html[lang] automatically
 * - Loads Cairo + Tajawal Arabic Google Fonts on first AR switch
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UI } from './translations';
export type { Lang } from './translations';
import type { Lang } from './translations';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  isAr: boolean;
  t: (key: string) => string;
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  isAr: false,
  t: (k) => k,
});



// ─── Font loader (run once) ───────────────────────────────────────────────────
let fontsLoaded = false;
function loadArabicFonts() {
  if (fontsLoaded || typeof document === 'undefined') return;
  fontsLoaded = true;
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap';
  document.head.appendChild(link);
}

// ─── URL ↔ Language helpers ──────────────────────────────────────────────────

/** Return true when the pathname starts with /ar (BrowserRouter real paths) */
export function pathIsArabic(pathname: string): boolean {
  return pathname === '/ar' || pathname.startsWith('/ar/');
}

/** Strip /ar prefix → bare English path */
export function stripAr(pathname: string): string {
  if (pathname === '/ar') return '/';
  if (pathname.startsWith('/ar/')) return pathname.slice(3);
  return pathname;
}

/** Add /ar prefix to a bare English path */
export function addAr(pathname: string): string {
  if (pathname === '/') return '/ar';
  return `/ar${pathname}`;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function LangProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive language from URL — this is the single source of truth
  const urlLang: Lang = pathIsArabic(location.pathname) ? 'ar' : 'en';

  const [lang, setLangState] = useState<Lang>(() => {
    if (pathIsArabic(location.pathname)) return 'ar';
    const saved = localStorage.getItem('horizon_lang') as Lang | null;
    return saved === 'ar' ? 'ar' : 'en';
  });

  // Sync state when URL changes (back/forward navigation)
  useEffect(() => {
    if (urlLang !== lang) {
      setLangState(urlLang);
      localStorage.setItem('horizon_lang', urlLang);
    }
  }, [urlLang]); // eslint-disable-line react-hooks/exhaustive-deps

  // setLang navigates to the same page under the target language prefix
  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('horizon_lang', l);
    setLangState(l);
    if (l === 'ar') loadArabicFonts();
    const bare = stripAr(location.pathname);
    const next = l === 'ar' ? addAr(bare) : bare;
    navigate(next, { replace: true });
  }, [location.pathname, navigate]);

  // Keep html[dir] + html[lang] in sync
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir',  lang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang === 'ar' ? 'ar'  : 'en');
    if (lang === 'ar') loadArabicFonts();
  }, [lang]);

  const t = (key: string): string => UI[key]?.[lang] ?? UI[key]?.['en'] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, isAr: lang === 'ar', t }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLang() {
  return useContext(LangContext);
}