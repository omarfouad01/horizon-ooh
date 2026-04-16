import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/not-found/Index";
import { Toaster as HotToaster } from "react-hot-toast";

// ── Admin Panel ──────────────────────────────────────────────────────────────
import { AdminAuthProvider } from "@/admin/AdminAuth";
import AdminLayout   from "@/admin/AdminLayout";
import AdminLogin    from "@/admin/AdminLogin";
import AdminDashboard  from "@/admin/pages/AdminDashboard";
import AdminLocations  from "@/admin/pages/AdminLocations";
import AdminBillboards from "@/admin/pages/AdminBillboards";
import AdminServices   from "@/admin/pages/AdminServices";
import AdminProjects   from "@/admin/pages/AdminProjects";
import AdminBlog       from "@/admin/pages/AdminBlog";
import AdminContacts   from "@/admin/pages/AdminContacts";
import AdminSettings   from "@/admin/pages/AdminSettings";
import AdminAbout      from "@/admin/pages/AdminAbout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster position="top-right" toastOptions={{ style: { fontSize: 13, fontWeight: 600 } }} />
      <AdminAuthProvider>
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

            {/* ── Admin Panel ──────────────────────────────────────────── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin"       element={<AdminLayout />}>
              <Route index              element={<AdminDashboard />} />
              <Route path="locations"   element={<AdminLocations />} />
              <Route path="billboards"  element={<AdminBillboards />} />
              <Route path="services"    element={<AdminServices />} />
              <Route path="projects"    element={<AdminProjects />} />
              <Route path="blog"        element={<AdminBlog />} />
              <Route path="contacts"    element={<AdminContacts />} />
              <Route path="settings"    element={<AdminSettings />} />
              <Route path="about"       element={<AdminAbout />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
