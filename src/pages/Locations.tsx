import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LOCATIONS, ALL_BILLBOARDS } from "@/data";
import { Reveal, RevealGroup, RevealItem, PageHero, CTABanner } from "@/components/UI";
import { locationHref, productHref, RED, NAVY } from "@/lib/routes";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Locations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cities     = searchParams.getAll("city");
  const districts  = searchParams.getAll("district");
  const formats    = searchParams.getAll("format");
  const hasSearch  = cities.length > 0 || districts.length > 0 || formats.length > 0;

  // Scroll to results when arriving from hero search
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hasSearch && resultsRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [hasSearch]);

  // Filter billboard products
  const matchedBillboards = ALL_BILLBOARDS.filter(b => {
    if (cities.length     > 0 && !cities.includes(b.city))        return false;
    if (districts.length  > 0 && !districts.includes(b.district)) return false;
    if (formats.length    > 0 && !formats.includes(b.type))       return false;
    return true;
  });

  // Clear all filters
  const clearSearch = () => setSearchParams({});

  return (
    <>
      <PageHero
        eyebrow="Our Network"
        title="Advertising Locations"
        titleAccent="Across Egypt."
        subtitle="9,500+ premium outdoor advertising locations across Egypt's most valuable markets — from Cairo's Ring Road to Alexandria's Corniche."
      />

      {/* ── SEARCH RESULTS — shown when arriving from hero search ──────── */}
      <AnimatePresence>
        {hasSearch && (
          <motion.section
            ref={resultsRef as React.RefObject<HTMLElement>}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, ease }}
            style={{ background: "#F5F5F6", paddingTop: 72, paddingBottom: 80 }}
          >
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">

              {/* Results header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                  {/* Active filters */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase"
                      style={{ color: "rgba(11,15,26,0.35)" }}>Filtered by:</span>
                    {cities.map(c => (
                      <span key={c} className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1"
                        style={{ background: NAVY, color: "white" }}>
                        City: {c}
                      </span>
                    ))}
                    {districts.map(d => (
                      <span key={d} className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1"
                        style={{ background: NAVY, color: "white" }}>
                        District: {d}
                      </span>
                    ))}
                    {formats.map(f => (
                      <span key={f} className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1"
                        style={{ background: NAVY, color: "white" }}>
                        Format: {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-black tracking-[-0.04em]"
                      style={{ fontSize: "clamp(28px, 3vw, 40px)", color: matchedBillboards.length > 0 ? RED : NAVY }}>
                      {matchedBillboards.length}
                    </span>
                    <span className="text-[13px] font-semibold tracking-[0.1em] uppercase"
                      style={{ color: "rgba(11,15,26,0.4)" }}>
                      Billboard{matchedBillboards.length !== 1 ? "s" : ""} Found
                    </span>
                  </div>
                </div>

                <button
                  onClick={clearSearch}
                  className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors hover:opacity-70 self-start sm:self-auto"
                  style={{ background: "none", border: "1.5px solid rgba(11,15,26,0.15)", padding: "10px 20px", cursor: "pointer", color: "rgba(11,15,26,0.5)" }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Clear Search
                </button>
              </div>

              {/* Results grid */}
              {matchedBillboards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedBillboards.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease, delay: i * 0.06 }}
                    >
                      <Link
                        to={productHref(b.citySlug, b.slug)}
                        className="group block overflow-hidden bg-white border transition-all duration-400 hover:border-[#D90429]/30"
                        style={{ borderColor: "rgba(11,15,26,0.08)", textDecoration: "none" }}
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden" style={{ height: 210 }}>
                          <img
                            src={b.image}
                            alt={`${b.name} — billboard advertising ${b.city}`}
                            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                            style={{ opacity: 0.88 }}
                          />
                          <div className="absolute inset-0"
                            style={{ background: "linear-gradient(to top, rgba(11,15,26,0.72) 0%, transparent 55%)" }} />
                          {/* City + District chip */}
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 text-white"
                              style={{ background: RED }}>
                              {b.city}
                            </span>
                            <span className="text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 text-white/70"
                              style={{ background: "rgba(11,15,26,0.65)", backdropFilter: "blur(4px)" }}>
                              {b.district}
                            </span>
                          </div>
                          {/* Name overlay */}
                          <p className="absolute bottom-4 left-4 right-4 font-extrabold text-white leading-tight"
                            style={{ fontSize: 16 }}>
                            {b.name}
                          </p>
                        </div>

                        {/* Card body */}
                        <div className="flex items-center justify-between"
                          style={{ padding: "16px 20px" }}>
                          <div>
                            <p className="text-[11px] font-bold tracking-[0.12em]"
                              style={{ color: "rgba(11,15,26,0.45)" }}>
                              {b.type} · {b.size}
                            </p>
                            <p className="text-[12px] font-semibold mt-0.5"
                              style={{ color: RED }}>
                              {b.traffic}
                            </p>
                          </div>
                          <span className="text-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                            style={{ color: RED }}>
                            →
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 flex items-center justify-center mb-6"
                    style={{ background: "rgba(11,15,26,0.05)", borderRadius: "50%" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="9" cy="9" r="7" stroke="rgba(11,15,26,0.2)" strokeWidth="1.5"/>
                      <path d="M14 14l4 4" stroke="rgba(11,15,26,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M6 9h6M9 6v6" stroke="rgba(11,15,26,0.2)" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="font-bold text-[18px] mb-2" style={{ color: NAVY }}>
                    No billboards match your search
                  </p>
                  <p className="text-[14px] mb-8" style={{ color: "rgba(11,15,26,0.4)" }}>
                    Try removing a filter or browse all locations below
                  </p>
                  <button onClick={clearSearch}
                    className="text-[11px] font-bold tracking-[0.2em] uppercase px-6 py-3 text-white"
                    style={{ background: RED, border: "none", cursor: "pointer" }}>
                    Show All Locations
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── ALL LOCATIONS GRID ──────────────────────────────────────────── */}
      <section className="bg-white" style={{ paddingTop: hasSearch ? 60 : 80, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">

          {hasSearch && (
            <Reveal>
              <div className="flex items-center gap-3 mb-10">
                <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase"
                  style={{ color: "rgba(11,15,26,0.3)" }}>
                  All Cities
                </p>
              </div>
            </Reveal>
          )}

          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px]"
            style={{ background: "rgba(11,15,26,0.07)" }}>
            {LOCATIONS.map((loc, i) => (
              <RevealItem key={loc.id}>
                <Link
                  to={locationHref(loc.slug)}
                  className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 block relative overflow-hidden"
                  style={{ textDecoration: "none" }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: 260 }}>
                    <img
                      src={loc.image}
                      alt={`Outdoor advertising in ${loc.city}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ opacity: 0.85 }}
                    />
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(11,15,26,0.7) 0%, transparent 60%)" }} />
                    <span className="absolute bottom-5 left-6 font-black text-white tracking-[-0.03em]"
                      style={{ fontSize: 28 }}>
                      {loc.city}
                    </span>
                    <span className="absolute top-5 left-6 font-black text-[11px] tracking-[0.2em] uppercase"
                      style={{ color: RED }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {/* Highlight if city matches search */}
                    {cities.length > 0 && cities.includes(loc.city) && (
                      <div className="absolute top-4 right-4 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 text-white"
                        style={{ background: RED }}>
                        Your Search
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "28px 28px 32px" }}>
                    <p className="text-[13px] leading-[1.65] mb-5 transition-colors duration-500 group-hover:text-white/40"
                      style={{ color: "rgba(11,15,26,0.45)" }}>
                      {loc.detail}
                    </p>
                    {/* Formats pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {loc.availableFormats.slice(0, 3).map((fmt) => (
                        <span key={fmt}
                          className="text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 border transition-colors duration-500 group-hover:border-white/20 group-hover:text-white/30"
                          style={{ borderColor: "rgba(11,15,26,0.12)", color: "rgba(11,15,26,0.4)" }}>
                          {fmt}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>
                        Explore Locations
                      </span>
                      <span className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                        style={{ color: RED }}>
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: NAVY, paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "5",     label: "Major Cities" },
              { value: "9,500+", label: "Locations" },
              { value: "6",     label: "Ad Formats" },
              { value: "22M+",  label: "Daily Audience" },
            ].map((stat) => (
              <RevealItem key={stat.label}>
                <div className="flex flex-col" style={{ paddingTop: 8 }}>
                  <div className="w-5 h-[1.5px] mb-5" style={{ background: RED }} />
                  <span className="font-black leading-none tracking-[-0.05em] mb-3"
                    style={{ fontSize: 48, color: RED }}>
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.22em] uppercase"
                    style={{ color: "rgba(255,255,255,0.3)" }}>
                    {stat.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABanner
        title="Can't find your target market?"
        subtitle="We'll identify the perfect locations for your campaign objectives."
        buttonLabel="Talk to a Strategist"
        dark={false}
      />
    </>
  );
}
