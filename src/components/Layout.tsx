import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/data";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// ─── Navbar ────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-[#0B0F1A]/8"
            : "bg-transparent"
        }`}
      >
        <div
          className="max-w-[1440px] mx-auto h-[76px] flex items-center justify-between"
          style={{ padding: "0 120px" }}
        >
          {/* Logo */}
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-4 group"
            aria-label="HORIZON OOH"
          >
            {/* Refined logomark */}
            <div className="relative w-9 h-9 overflow-hidden">
              <div className="absolute inset-0 bg-[#D90429]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" opacity="0.9" />
                  <path d="M7 8.5h4v1H7z" fill="white" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-[1px]">
              <span
                className={`text-[13px] font-black tracking-[0.22em] uppercase leading-none transition-colors duration-300 ${
                  scrolled ? "text-[#0B0F1A]" : "text-[#0B0F1A]"
                }`}
              >
                HORIZON
              </span>
              <span
                className={`text-[9px] font-semibold tracking-[0.35em] uppercase leading-none transition-colors duration-300 ${
                  scrolled ? "text-[#0B0F1A]/35" : "text-[#0B0F1A]/35"
                }`}
              >
                OUT-OF-HOME
              </span>
            </div>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`relative text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 group ${
                  scrolled ? "text-[#0B0F1A]/45 hover:text-[#0B0F1A]" : "text-[#0B0F1A]/45 hover:text-[#0B0F1A]"
                }`}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#D90429] group-hover:w-full transition-all duration-300" />
              </button>
            ))}
            <button
              onClick={() => scrollTo("contact")}
              className="ml-2 h-[40px] px-7 bg-[#D90429] text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8021f] transition-all duration-200 relative overflow-hidden group"
            >
              <span className="relative z-10">Get a Quote</span>
              <span className="absolute inset-0 bg-[#0B0F1A] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 hidden group-hover:inline text-white">Get a Quote</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-[1.5px] bg-[#0B0F1A] transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] bg-[#0B0F1A] transition-all duration-300 ${
                menuOpen ? "w-0 opacity-0" : "w-4"
              }`}
            />
            <span
              className={`block w-6 h-[1.5px] bg-[#0B0F1A] transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
              }`}
            />
          </button>
        </div>

        {/* Read progress bar */}
        <div className="absolute bottom-0 left-0 h-[1px] bg-[#D90429] transition-all duration-100 ease-linear" style={{ width: `${scrollProgress}%` }} />
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[76px] left-0 right-0 z-40 bg-white border-b border-[#0B0F1A]/10 px-8 py-8 flex flex-col gap-5"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => { scrollTo(link.id); setMenuOpen(false); }}
                className="text-left text-[13px] font-semibold tracking-[0.2em] uppercase text-[#0B0F1A]/50 hover:text-[#D90429] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { scrollTo("contact"); setMenuOpen(false); }}
              className="mt-2 h-[44px] px-8 bg-[#D90429] text-white text-[11px] font-bold tracking-[0.2em] uppercase w-fit"
            >
              Get a Quote
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <footer ref={ref} className="bg-[#0B0F1A] relative overflow-hidden">
      {/* Decorative large text background */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none h-[180px]">
        <p
          className="text-white/[0.025] font-black uppercase whitespace-nowrap leading-none"
          style={{ fontSize: "clamp(80px, 12vw, 180px)", letterSpacing: "-0.04em", transform: "translateY(30%)" }}
        >
          HORIZON OOH
        </p>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-[120px] pt-20 pb-12">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-16 border-b border-white/[0.07]">
          {/* Brand block */}
          <div className="max-w-[280px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#D90429] flex items-center justify-center flex-shrink-0">
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
              <span className="w-6 h-[1px] bg-[#D90429]" />
              <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase ml-2">Est. 2008, Cairo</span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-16">
            {[
              {
                heading: "Services",
                links: ["Billboard", "DOOH", "Mall Advertising", "Airport", "Street Furniture", "Activations"],
              },
              {
                heading: "Markets",
                links: ["Cairo", "New Cairo", "Sheikh Zayed", "Alexandria", "North Coast", "6th of October"],
              },
              {
                heading: "Company",
                links: ["About Us", "Case Studies", "News", "Careers", "Partners"],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold mb-5">{heading}</p>
                <div className="flex flex-col gap-3">
                  {links.map((l) => (
                    <span
                      key={l}
                      className="text-white/40 text-[13px] hover:text-white cursor-pointer transition-colors duration-200 leading-none"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <p className="text-white/20 text-[11px] tracking-[0.2em]">© 2026 HORIZON OOH</p>
            <span className="text-white/10 hidden md:block">·</span>
            <p className="text-white/15 text-[11px] tracking-[0.15em] hidden md:block">All rights reserved</p>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Sitemap"].map((item) => (
              <span key={item} className="text-white/20 text-[11px] tracking-[0.15em] hover:text-white/50 cursor-pointer transition-colors">{item}</span>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <span className="w-1.5 h-1.5 bg-[#D90429] block animate-pulse" />
              <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase ml-1">Made in Egypt</span>
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
      <main>{children}</main>
      <Footer />
    </div>
  );
}
