// Horizon OOH v2.1.0 - build 20260427
import { LangProvider, useLang } from "@/i18n/LangContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState, useRef } from "react";
import SiteInformation from "@/pages/SiteInformation";
import Layout from "@/components/Layout";
import { FaviconSync } from "@/components/FaviconSync";
import { trackEvent } from "@/lib/analytics";
import { useStore } from "@/store/dataStore";
import { loadPublicSnapshot, parsePublicSnapshot, rememberPublicSnapshot, cachedPublicSnapshot } from "@/store/publicNavigation";

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackEvent('page_view', { page_path: `${location.pathname}${location.search}` });
  }, [location.pathname, location.search]);
  return null;
}

function DataStatus() {
  const { error, loading, reload } = useStore();
  const { isAr } = useLang();
  if (!error || loading) return null;
  return (
    <div role="status" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-md z-[10000] bg-[#0B0F1A] text-white p-4 shadow-2xl flex items-center gap-4">
      <p className="text-sm flex-1">{isAr ? 'تعذر تحديث بعض المحتوى. يمكنك المحاولة مرة أخرى.' : 'Some live content could not be refreshed. You can try again.'}</p>
      <button type="button" onClick={() => reload()} className="text-xs font-bold uppercase tracking-wider text-[#D90429]">
        {isAr ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>
  );
}

// Lazy-load toast/tooltip providers — they are never needed for LCP
// and add ~15 KB to the eager bundle when loaded synchronously.
const Toaster     = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner      = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const HotToaster  = lazy(() => import("react-hot-toast").then(m => ({ default: m.Toaster })));
const TooltipProvider = lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));

// ── Public pages ─────────────────────────────────────────────────────────────
// Public routes are eager imports so the same component tree can be rendered
// at build time by entry-server.tsx. Admin/auth-only code remains lazy.
import { Home, About, Services, ServiceDetail, Projects, ProjectDetail, Locations, LocationDetail, Product, Blog, BlogArticle, Contact } from "@/publicPages";
const Login          = lazy(() => import("@/pages/Login"));
const Signup         = lazy(() => import("@/pages/Signup"));
const Profile        = lazy(() => import("@/pages/Profile"));
const DesignSimulator= lazy(() => import("@/pages/DesignSimulator"));
const NotFound       = lazy(() => import("./pages/not-found/Index"));

// ── Admin Panel — LAZY LOADED so it never ships to website visitors ──────────
const AdminAuthProvider  = lazy(() => import("@/admin/AdminAuth").then(m => ({ default: m.AdminAuthProvider })));
const AdminLayout        = lazy(() => import("@/admin/AdminLayout"));
const AdminLogin         = lazy(() => import("@/admin/AdminLogin"));
const AdminDashboard     = lazy(() => import("@/admin/pages/AdminDashboard"));
const AdminLocations     = lazy(() => import("@/admin/pages/AdminLocations"));
const AdminBillboards    = lazy(() => import("@/admin/pages/AdminBillboards"));
const AdminServices      = lazy(() => import("@/admin/pages/AdminServices"));
const AdminProjects      = lazy(() => import("@/admin/pages/AdminProjects"));
const AdminBlog          = lazy(() => import("@/admin/pages/AdminBlog"));
const AdminContacts      = lazy(() => import("@/admin/pages/AdminContacts"));
const AdminSettings      = lazy(() => import("@/admin/pages/AdminSettings"));
const AdminAbout         = lazy(() => import("@/admin/pages/AdminAbout"));
const AdminSuppliers     = lazy(() => import("@/admin/pages/AdminSuppliers"));
const AdminCustomers     = lazy(() => import("@/admin/pages/AdminCustomers"));
const AdminUsers         = lazy(() => import("@/admin/pages/AdminUsers"));
const AdminHomePage      = lazy(() => import("@/admin/pages/AdminHomePage"));
const AdminSimulator     = lazy(() => import("@/admin/pages/AdminSimulator"));
const AdminLocationsPage = lazy(() => import("@/admin/pages/AdminLocationsPage"));
const AdminContactPage   = lazy(() => import("@/admin/pages/AdminContactPage"));
const AdminDashboardUsers = lazy(() => import("@/admin/pages/AdminDashboardUsers"));

// Shared page loading fallback
const PageLoading = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh', background:'#fff', color:'#0B0F1A' }}>
    <div style={{ width:32, height:32, border:'3px solid #D90429', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
  </div>
);

// Minimal fallback shown while admin chunk downloads
const AdminLoading = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0B0F1A' }}>
    <div style={{ width:36, height:36, border:'3px solid #D90429', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
  </div>
);

const queryClient = new QueryClient();

function ClientEnhancements() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster position="top-right" toastOptions={{ style: { fontSize: 13, fontWeight: 600 } }} />
      </TooltipProvider>
    </Suspense>
  );
}

// ── All public page routes — reused for both /  and /ar/ prefixes ────────────
function PublicDataLoader() {
  const { reload } = useStore();
  const location = useLocation();
  const firstLoad = useRef(true);
  useEffect(() => {
    const deferred = firstLoad.current && !!document.getElementById('horizon-ssg-state');
    firstLoad.current = false;
    const path = location.pathname;
    let active = true;
    // Seed the current document once; revisit navigation can render immediately.
    if (deferred) {
      const data = parsePublicSnapshot(document.getElementById('horizon-ssg-state')?.outerHTML || '');
      if (data) rememberPublicSnapshot(path, data);
    } else {
      const apply = (data: Record<string, any> | null) => {
        if (data && active && window.location.pathname === path && useStore.getState().readyPath !== path) {
          useStore.setState({ ...data, readyPath: path, loaded: true, usingDemo: false });
        }
      };
      apply(cachedPublicSnapshot(path));
      void loadPublicSnapshot(path).then(apply);
    }
    // Refresh independently: a slow API must not hide a valid SSG snapshot.
    const timer = window.setTimeout(() => { void reload(); }, deferred ? 2000 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [location.pathname]);
  useEffect(() => {
    const prefetch = (event: Event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor || anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank') return;
      const url = new URL(anchor.getAttribute('href')!, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== window.location.pathname && !url.search) void loadPublicSnapshot(url.pathname);
    };
    document.addEventListener('pointerover', prefetch);
    document.addEventListener('focusin', prefetch);
    return () => { document.removeEventListener('pointerover', prefetch); document.removeEventListener('focusin', prefetch); };
  }, []);
  return null;
}

export function PublicRoutes() {
  const { loaded, readyPath } = useStore();
  const location = useLocation();
  const routeReady = loaded && (typeof window === 'undefined' || readyPath === location.pathname);
  return (
    <Suspense fallback={<PageLoading />}><PublicDataLoader />{routeReady ? <Routes>
      <Route index                                        element={<Layout><Home /></Layout>} />
      <Route path="about"            element={<Layout><About /></Layout>} />
      <Route path="services"         element={<Layout><Services /></Layout>} />
      <Route path="services/:slug"   element={<Layout><ServiceDetail /></Layout>} />
      <Route path="projects"         element={<Layout><Projects /></Layout>} />
      <Route path="projects/:slug"   element={<Layout><ProjectDetail /></Layout>} />
      <Route path="locations"        element={<Layout><Locations /></Layout>} />
      <Route path="locations/:slug"  element={<Layout><LocationDetail /></Layout>} />
      <Route path="locations/:city/billboards/:slug" element={<Layout><Product /></Layout>} />
      <Route path="blog"             element={<Layout><Blog /></Layout>} />
      <Route path="blog/:slug"       element={<Layout><BlogArticle /></Layout>} />
      <Route path="privacy" element={<Layout><SiteInformation kind="privacy" /></Layout>} />
      <Route path="terms" element={<Layout><SiteInformation kind="terms" /></Layout>} />
      <Route path="contact"          element={<Layout><Contact /></Layout>} />
      <Route path="login"            element={<Suspense fallback={<PageLoading />}><Login /></Suspense>} />
      <Route path="signup"           element={<Suspense fallback={<PageLoading />}><Signup /></Suspense>} />
      <Route path="profile"          element={<Suspense fallback={<PageLoading />}><Layout><Profile /></Layout></Suspense>} />
      <Route path="design-simulator" element={<Suspense fallback={<PageLoading />}><Layout><DesignSimulator /></Layout></Suspense>} />
      <Route path="*"                element={<Suspense fallback={<PageLoading />}><NotFound /></Suspense>} />
    </Routes> : <PageLoading />}</Suspense>
  );
}

export const AppContent = () => (
  <>
    <AnalyticsTracker />
    {/* FaviconSync: keeps browser tab favicon in sync with admin dashboard setting */}
    <FaviconSync />
    {/* LangProvider lives inside the router so it can use navigation/location */}
    <LangProvider>
      <DataStatus />
      <Routes>
        {/* ── English routes: / ── */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* ── Arabic routes: /ar/* ── same pages, lang derived from URL ── */}
        <Route path="/ar" element={<PublicRoutes />} />
        <Route path="/ar/*" element={<PublicRoutes />} />

        {/* ── Admin Panel — lazy loaded, never shipped to website users ── */}
        <Route path="/admin/*" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminAuthProvider>
              <Routes>
                <Route path="login" element={<AdminLogin />} />
                <Route path="*"     element={<AdminLayout />}>
                  <Route index                   element={<AdminDashboard />} />
                  <Route path="locations"        element={<AdminLocations />} />
                  <Route path="billboards"       element={<AdminBillboards />} />
                  <Route path="services"         element={<AdminServices />} />
                  <Route path="projects"         element={<AdminProjects />} />
                  <Route path="blog"             element={<AdminBlog />} />
                  <Route path="contacts"         element={<AdminContacts />} />
                  <Route path="settings"         element={<AdminSettings />} />
                  <Route path="about"            element={<AdminAbout />} />
                  <Route path="suppliers"        element={<AdminSuppliers />} />
                  <Route path="customers"        element={<AdminCustomers />} />
                  <Route path="users"            element={<AdminUsers />} />
                  <Route path="homepage"         element={<AdminHomePage />} />
                  <Route path="simulator"        element={<AdminSimulator />} />
                  <Route path="locations-page"   element={<AdminLocationsPage />} />
                  <Route path="contact-page"     element={<AdminContactPage />} />
                  <Route path="dashboard-users"  element={<AdminDashboardUsers />} />
                </Route>
              </Routes>
            </AdminAuthProvider>
          </Suspense>
        } />
      </Routes>
    </LangProvider>
  </>
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {/* Client-only providers mount after hydration and never affect first paint. */}
    <ClientEnhancements />
    {children}
  </QueryClientProvider>
);

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AppProviders>
);

export default App;
