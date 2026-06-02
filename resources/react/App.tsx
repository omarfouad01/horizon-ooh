// Horizon OOH v2.1.0 - build 20260427
import { LangProvider } from "@/i18n/LangContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import { FaviconSync } from "@/components/FaviconSync";

// Lazy-load toast/tooltip providers — they are never needed for LCP
// and add ~15 KB to the eager bundle when loaded synchronously.
const Toaster     = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner      = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const HotToaster  = lazy(() => import("react-hot-toast").then(m => ({ default: m.Toaster })));
const TooltipProvider = lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));

// ── Public pages — eager-load only the homepage, lazy the rest ───────────────
import Home from "@/pages/Home";
const About          = lazy(() => import("@/pages/About"));
const Services       = lazy(() => import("@/pages/Services"));
const ServiceDetail  = lazy(() => import("@/pages/ServiceDetail"));
const Projects       = lazy(() => import("@/pages/Projects"));
const ProjectDetail  = lazy(() => import("@/pages/ProjectDetail"));
const Locations      = lazy(() => import("@/pages/Locations"));
const LocationDetail = lazy(() => import("@/pages/LocationDetail"));
const Product        = lazy(() => import("@/pages/Product"));
const Blog           = lazy(() => import("@/pages/Blog"));
const BlogArticle    = lazy(() => import("@/pages/BlogArticle"));
const Contact        = lazy(() => import("@/pages/Contact"));
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
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh' }}>
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

// ── All public page routes — reused for both /  and /ar/ prefixes ────────────
function PublicRoutes() {
  return (
    <Routes>
      <Route index                                        element={<Layout><Home /></Layout>} />
      <Route path="about"            element={<Suspense fallback={<PageLoading />}><Layout><About /></Layout></Suspense>} />
      <Route path="services"         element={<Suspense fallback={<PageLoading />}><Layout><Services /></Layout></Suspense>} />
      <Route path="services/:slug"   element={<Suspense fallback={<PageLoading />}><Layout><ServiceDetail /></Layout></Suspense>} />
      <Route path="projects"         element={<Suspense fallback={<PageLoading />}><Layout><Projects /></Layout></Suspense>} />
      <Route path="projects/:slug"   element={<Suspense fallback={<PageLoading />}><Layout><ProjectDetail /></Layout></Suspense>} />
      <Route path="locations"        element={<Suspense fallback={<PageLoading />}><Layout><Locations /></Layout></Suspense>} />
      <Route path="locations/:slug"  element={<Suspense fallback={<PageLoading />}><Layout><LocationDetail /></Layout></Suspense>} />
      <Route path="locations/:city/billboards/:slug" element={<Suspense fallback={<PageLoading />}><Layout><Product /></Layout></Suspense>} />
      <Route path="blog"             element={<Suspense fallback={<PageLoading />}><Layout><Blog /></Layout></Suspense>} />
      <Route path="blog/:slug"       element={<Suspense fallback={<PageLoading />}><Layout><BlogArticle /></Layout></Suspense>} />
      <Route path="contact"          element={<Suspense fallback={<PageLoading />}><Layout><Contact /></Layout></Suspense>} />
      <Route path="login"            element={<Suspense fallback={<PageLoading />}><Login /></Suspense>} />
      <Route path="signup"           element={<Suspense fallback={<PageLoading />}><Signup /></Suspense>} />
      <Route path="profile"          element={<Suspense fallback={<PageLoading />}><Layout><Profile /></Layout></Suspense>} />
      <Route path="design-simulator" element={<Suspense fallback={<PageLoading />}><Layout><DesignSimulator /></Layout></Suspense>} />
      <Route path="*"                element={<Suspense fallback={<PageLoading />}><NotFound /></Suspense>} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Lazy providers — rendered after LCP, never needed for initial paint */}
    <Suspense fallback={null}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster position="top-right" toastOptions={{ style: { fontSize: 13, fontWeight: 600 } }} />
      </TooltipProvider>
    </Suspense>
    <BrowserRouter>
        {/* FaviconSync: keeps browser tab favicon in sync with admin dashboard setting */}
        <FaviconSync />
        {/* LangProvider lives INSIDE BrowserRouter so it can use useNavigate/useLocation */}
        <LangProvider>
          <Routes>
            {/* ── English routes: / ── */}
            <Route path="/*" element={<PublicRoutes />} />

            {/* ── Arabic routes: /ar/* ── same pages, lang derived from URL ── */}
            <Route path="/ar" element={<Layout><Home /></Layout>} />
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
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;
