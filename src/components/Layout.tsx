import { useState, useEffect } from "react";
import { NAV_LINKS } from "@/data";

// ─── Scroll utility ────────────────────────────────────────────────────────
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// ─── Navigation ────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b border-black/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-[120px] h-[72px] flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-3 group"
          aria-label="Horizon OOH Home"
        >
          <div className="w-8 h-8 bg-[#D90429] flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-widest">H</span>
          </div>
          <span
            className={`text-sm font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
              scrolled ? "text-[#0B0F1A]" : "text-[#0B0F1A]"
            }`}
          >
            HORIZON OOH
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`text-[13px] font-medium tracking-[0.12em] uppercase transition-colors duration-200 hover:text-[#D90429] ${
                scrolled ? "text-[#0B0F1A]/60" : "text-[#0B0F1A]/60"
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("contact")}
            className="ml-4 h-10 px-6 bg-[#D90429] text-white text-[13px] font-semibold tracking-[0.1em] uppercase hover:bg-[#b8021f] transition-colors duration-200"
          >
            Get a Quote
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-[#0B0F1A] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#0B0F1A] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#0B0F1A] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-black/10 px-6 py-6 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => { scrollTo(link.id); setMenuOpen(false); }}
              className="text-left text-sm font-medium tracking-widest uppercase text-[#0B0F1A]/60 hover:text-[#D90429]"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { scrollTo("contact"); setMenuOpen(false); }}
            className="mt-2 h-10 px-6 bg-[#D90429] text-white text-sm font-semibold tracking-widest uppercase"
          >
            Get a Quote
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-[#0B0F1A] border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-[120px] py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#D90429] flex items-center justify-center">
                <span className="text-white font-bold text-xs tracking-widest">H</span>
              </div>
              <span className="text-white font-bold text-sm tracking-[0.2em] uppercase">HORIZON OOH</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Egypt's premier outdoor advertising network. Putting brands where they get seen.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <p className="text-white/20 text-[11px] tracking-[0.2em] uppercase mb-4">Services</p>
              <div className="flex flex-col gap-2">
                {["Billboard", "DOOH", "Mall Ads", "Airport", "Street Furniture"].map((s) => (
                  <span key={s} className="text-white/50 text-sm hover:text-white cursor-pointer transition-colors">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/20 text-[11px] tracking-[0.2em] uppercase mb-4">Cities</p>
              <div className="flex flex-col gap-2">
                {["Cairo", "New Cairo", "Sheikh Zayed", "Alexandria", "North Coast"].map((c) => (
                  <span key={c} className="text-white/50 text-sm hover:text-white cursor-pointer transition-colors">{c}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/20 text-[11px] tracking-[0.2em] uppercase mb-4">Contact</p>
              <div className="flex flex-col gap-2">
                <span className="text-white/50 text-sm">info@horizonooh.com</span>
                <span className="text-white/50 text-sm">+20 2 1234 5678</span>
                <span className="text-white/50 text-sm">Cairo, Egypt</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs tracking-widest">© 2026 HORIZON OOH. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span className="text-white/20 text-xs tracking-widest">MADE IN EGYPT</span>
            <span className="ml-2 text-[#D90429] text-xs">●</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout Wrapper ────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
