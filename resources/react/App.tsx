// Horizon OOH v2.1.0 - build 20260427
import { Toaster } from "@/components/ui/toaster";
import { LangProvider } from "@/i18n/LangContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Locations from "@/pages/Locations";
import LocationDetail from "@/pages/LocationDetail";
import Product from "@/pages/Product";
import Blog from "@/pages/Blog";
import BlogArticle from "@/pages/BlogArticle";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import DesignSimulator from "@/pages/DesignSimulator";
import NotFound from "./pages/not-found/Index";
import { Toaster as HotToaster } from "react-hot-toast";

// ── Admin Panel — LAZY LOADED so it never ships to website visitors ──────────
// The entire 424 KB admin bundle is only downloaded when the user navigates to /admin
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

// Minimal fallback shown while admin chunk downloads
const AdminLoading = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0B0F1A' }}>
    <div style={{ width:36, height:36, border:'3px solid #D90429', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <LangProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster position="top-right" toastOptions={{ style: { fontSize: 13, fontWeight: 600 } }} />
      <HashRouter>
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
          <Route path="/profile"                           element={<Layout><Profile /></Layout>} />
          <Route path="/design-simulator"                  element={<Layout><DesignSimulator /></Layout>} />

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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </LangProvider>
);

export default App;
