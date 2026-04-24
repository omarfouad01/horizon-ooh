import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LangProvider } from "@/i18n/LangContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import { Toaster as HotToaster } from "react-hot-toast";

// ── Admin Panel (non-lazy — always small) ────────────────────────────────────
import { AdminAuthProvider } from "@/admin/AdminAuth";
import AdminLayout from "@/admin/AdminLayout";
import AdminLogin  from "@/admin/AdminLogin";

// ── Spinner shown while lazy chunks load ─────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}

// ── Lazy-loaded public pages ─────────────────────────────────────────────────
const Home            = lazy(() => import("@/pages/Home"));
const About           = lazy(() => import("@/pages/About"));
const Services        = lazy(() => import("@/pages/Services"));
const ServiceDetail   = lazy(() => import("@/pages/ServiceDetail"));
const Projects        = lazy(() => import("@/pages/Projects"));
const ProjectDetail   = lazy(() => import("@/pages/ProjectDetail"));
const Locations       = lazy(() => import("@/pages/Locations"));
const LocationDetail  = lazy(() => import("@/pages/LocationDetail"));
const Product         = lazy(() => import("@/pages/Product"));
const Blog            = lazy(() => import("@/pages/Blog"));
const BlogArticle     = lazy(() => import("@/pages/BlogArticle"));
const Contact         = lazy(() => import("@/pages/Contact"));
const Login           = lazy(() => import("@/pages/Login"));
const Signup          = lazy(() => import("@/pages/Signup"));
const DesignSimulator = lazy(() => import("@/pages/DesignSimulator"));
const NotFound        = lazy(() => import("./pages/not-found/Index"));

// ── Lazy-loaded admin pages ──────────────────────────────────────────────────
const AdminDashboard      = lazy(() => import("@/admin/pages/AdminDashboard"));
const AdminLocations      = lazy(() => import("@/admin/pages/AdminLocations"));
const AdminBillboards     = lazy(() => import("@/admin/pages/AdminBillboards"));
const AdminServices       = lazy(() => import("@/admin/pages/AdminServices"));
const AdminProjects       = lazy(() => import("@/admin/pages/AdminProjects"));
const AdminBlog           = lazy(() => import("@/admin/pages/AdminBlog"));
const AdminContacts       = lazy(() => import("@/admin/pages/AdminContacts"));
const AdminSettings       = lazy(() => import("@/admin/pages/AdminSettings"));
const AdminAbout          = lazy(() => import("@/admin/pages/AdminAbout"));
const AdminSuppliers      = lazy(() => import("@/admin/pages/AdminSuppliers"));
const AdminCustomers      = lazy(() => import("@/admin/pages/AdminCustomers"));
const AdminUsers          = lazy(() => import("@/admin/pages/AdminUsers"));
const AdminHomePage       = lazy(() => import("@/admin/pages/AdminHomePage"));
const AdminSimulator      = lazy(() => import("@/admin/pages/AdminSimulator"));
const AdminLocationsPage  = lazy(() => import("@/admin/pages/AdminLocationsPage"));
const AdminContactPage    = lazy(() => import("@/admin/pages/AdminContactPage"));
const AdminDashboardUsers = lazy(() => import("@/admin/pages/AdminDashboardUsers"));

// ── QueryClient with sensible caching defaults ───────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min: cached data considered fresh
      gcTime:    10 * 60 * 1000,  // 10 min: unused data kept in memory
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

const App = () => (
  <LangProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster position="top-right" toastOptions={{ style: { fontSize: 13, fontWeight: 600 } }} />
      <AdminAuthProvider>
        <HashRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public Website ───────────────────────────────────────── */}
              <Route path="/"                                  element={<Layout><Home /></Layout>} />
              <Route path="/about"                             element={<Layout><About /></Layout>} />
              <Route path="/services"                          element={<Layout><Services /></Layout>} />
              <Route path="/services/:slug"                    element={<Layout><ServiceDetail /></Layout>} />
              <Route path="/projects"                          element={<Layout><Projects /></Layout>} />
              <Route path="/projects/:slug"                    element={<Layout><ProjectDetail /></Layout>} />
              <Route path="/locations"                         element={<Layout><Locations /></Layout>} />
              <Route path="/locations/:slug"                   element={<Layout><LocationDetail /></Layout>} />
              <Route path="/locations/:city/billboards/:slug"  element={<Layout><Product /></Layout>} />
              <Route path="/blog"                              element={<Layout><Blog /></Layout>} />
              <Route path="/blog/:slug"                        element={<Layout><BlogArticle /></Layout>} />
              <Route path="/contact"                           element={<Layout><Contact /></Layout>} />
              <Route path="/login"                             element={<Login />} />
              <Route path="/signup"                            element={<Signup />} />
              <Route path="/design-simulator"                  element={<Layout><DesignSimulator /></Layout>} />

              {/* ── Admin Panel ──────────────────────────────────────────── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin"       element={<AdminLayout />}>
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

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </LangProvider>
);

export default App;
