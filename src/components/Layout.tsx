import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/data";
import { ROUTES, RED, NAVY } from "@/lib/routes";

// ─── Navbar ────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled || !isHome ? "bg-white/95 backdrop-blur-sm border-b border-[#0B0F1A]/[0.07]" : "bg-transparent";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
        <div
          className="max-w-[1440px] mx-auto h-[76px] flex items-center justify-between"
          style={{ padding: "0 120px" }}
        >
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-4 group flex-shrink-0">
            <div className="relative w-9 h-9 overflow-hidden flex-shrink-0" style={{ background: RED }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" opacity="0.9" />
                  <path d="M7 8.5h4v1H7z" fill="white" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-[1px]">
              <span className="text-[13px] font-black tracking-[0.22em] uppercase leading-none text-[#0B0F1A]">
                HORIZON
              </span>
              <span className="text-[9px] font-semibold tracking-[0.35em] uppercase leading-none text-[#0B0F1A]/35">
                OUT-OF-HOME
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `relative text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 group ${
                    isActive ? "text-[#0B0F1A]" : "text-[#0B0F1A]/40 hover:text-[#0B0F1A]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className="absolute -bottom-0.5 left-0 h-[1px] transition-all duration-300"
                      style={{
                        width: isActive ? "100%" : "0%",
                        background: RED,
                      }}
                    />
                  </>
                )}
              </NavLink>
            ))}
            <Link
              to={ROUTES.CONTACT}
              className="ml-2 h-[40px] px-7 text-[11px] font-bold tracking-[0.2em] uppercase text-white flex items-center relative overflow-hidden group"
              style={{ background: RED }}
            >
              <span
                className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                style={{ background: NAVY }}
              />
              <span className="relative z-10">Get a Quote</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-[1.5px] bg-[#0B0F1A] transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block h-[1.5px] bg-[#0B0F1A] transition-all duration-300 ${menuOpen ? "w-0 opacity-0" : "w-4"}`} />
            <span className={`block w-6 h-[1.5px] bg-[#0B0F1A] transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>

        {/* Scroll progress */}
        <div
          className="absolute bottom-0 left-0 h-[1.5px] transition-all duration-100 ease-linear"
          style={{ width: `${scrollPct}%`, background: RED }}
        />
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="fixed top-[76px] left-0 right-0 z-40 bg-white border-b border-[#0B0F1A]/10 px-8 py-8 flex flex-col gap-5"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-left text-[13px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                    isActive ? "text-[#D90429]" : "text-[#0B0F1A]/50 hover:text-[#D90429]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={ROUTES.CONTACT}
              className="mt-2 h-[44px] px-8 text-white text-[11px] font-bold tracking-[0.2em] uppercase w-fit flex items-center"
              style={{ background: RED }}
            >
              Get a Quote
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer style={{ background: NAVY }} className="relative overflow-hidden">
      {/* Decorative watermark */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none h-[180px]">
        <p
          className="text-white/[0.025] font-black uppercase whitespace-nowrap leading-none"
          style={{ fontSize: "clamp(80px, 12vw, 180px)", letterSpacing: "-0.04em", transform: "translateY(30%)" }}
        >
          HORIZON OOH
        </p>
      </div>

      <div className="relative max-w-[1440px] mx-auto pt-20 pb-12" style={{ padding: "80px 120px 48px" }}>
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-16 border-b border-white/[0.07]">
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: RED }}>
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" />
                  <path d="M7 8.5h4v1H7z" fill="white" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-[13px] tracking-[0.22em] uppercase leading-none">HORIZON</p>
                <p className="text-white/30 font-semibold text-[9px] tracking-[0.35em] uppercase mt-0.5">OUT-OF-HOME</p>
              </div>
            </div>
            <p className="text-white/30 text-[14px] leading-[1.75]">
              Egypt's premier outdoor advertising network — putting brands in front of millions daily.
            </p>
            <div className="mt-8 flex items-center gap-1">
              <span className="w-6 h-[1px]" style={{ background: RED }} />
              <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase ml-2">Est. 2008, Cairo</span>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              {
                heading: "Services",
                links: [
                  { label: "Billboard", href: "/services/billboard-advertising" },
                  { label: "DOOH", href: "/services/digital-out-of-home" },
                  { label: "Mall Advertising", href: "/services/mall-advertising" },
                  { label: "Airport", href: "/services/airport-advertising" },
                  { label: "Street Furniture", href: "/services/street-furniture" },
                ],
              },
              {
                heading: "Locations",
                links: [
                  { label: "Cairo", href: "/locations/cairo" },
                  { label: "New Cairo", href: "/locations/new-cairo" },
                  { label: "Sheikh Zayed", href: "/locations/sheikh-zayed" },
                  { label: "Alexandria", href: "/locations/alexandria" },
                  { label: "North Coast", href: "/locations" },
                ],
              },
              {
                heading: "Company",
                links: [
                  { label: "About Us", href: "/about" },
                  { label: "Blog", href: "/blog" },
                  { label: "Contact", href: "/contact" },
                ],
              },
              {
                heading: "Contact",
                links: [
                  { label: "info@horizonooh.com", href: "/contact" },
                  { label: "+20 2 1234 5678", href: "/contact" },
                  { label: "Cairo, Egypt", href: "/contact" },
                ],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold mb-5">{heading}</p>
                <div className="flex flex-col gap-3">
                  {links.map((l) => (
                    <Link
                      key={l.label}
                      to={l.href}
                      className="text-white/40 text-[13px] hover:text-white transition-colors duration-200 leading-none"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-white/20 text-[11px] tracking-[0.2em]">© 2026 HORIZON OOH · All rights reserved</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Sitemap"].map((item) => (
              <span key={item} className="text-white/20 text-[11px] tracking-[0.15em] hover:text-white/50 cursor-pointer transition-colors">{item}</span>
            ))}
            <div className="flex items-center gap-1.5 ml-1">
              <span className="w-1.5 h-1.5 block animate-pulse" style={{ background: RED }} />
              <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase">Made in Egypt</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-[76px]">{children}</main>
      <Footer />
    </div>
  );
}
