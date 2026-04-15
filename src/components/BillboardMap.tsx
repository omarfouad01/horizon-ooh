/**
 * BillboardMap — Leaflet-powered interactive map with search filters
 * City | District | Format (type) dropdowns + text search
 * Custom HORIZON OOH brand pins with popup cards
 */
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import { ALL_BILLBOARDS, MapBillboard } from "@/data";
import { productHref } from "@/lib/routes";

// ── Brand tokens ─────────────────────────────────────────────────────────
const NAVY  = "#0B0F1A";
const RED   = "#D90429";
const WHITE = "#FFFFFF";

// ── Fix Leaflet's missing default icon issue with Vite ───────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom SVG pin icon ───────────────────────────────────────────────────
function makePin(active = false) {
  const fill  = active ? RED : NAVY;
  const ring  = active ? WHITE : "#D90429";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z"
        fill="${fill}" />
      <circle cx="16" cy="16" r="6" fill="${ring}" />
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -44],
  });
}

// ── Derive filter options ─────────────────────────────────────────────────
const ALL_CITIES    = Array.from(new Set(ALL_BILLBOARDS.map(b => b.city))).sort();
const ALL_DISTRICTS = Array.from(new Set(ALL_BILLBOARDS.map(b => b.district))).sort();
const ALL_FORMATS   = Array.from(new Set(ALL_BILLBOARDS.map(b => b.type))).sort();

// ── Select component ──────────────────────────────────────────────────────
function FilterSelect({
  label, value, options, onChange, icon,
}: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void; icon: React.ReactNode;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {icon}
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-14 pl-10 pr-8 appearance-none text-[13px] font-semibold outline-none cursor-pointer transition-all duration-200"
        style={{
          background: WHITE,
          border: "1.5px solid rgba(11,15,26,0.10)",
          color: value ? NAVY : "rgba(11,15,26,0.35)",
          borderRadius: 0,
        }}
        onFocus={e => (e.target.style.borderColor = RED)}
        onBlur={e  => (e.target.style.borderColor = "rgba(11,15,26,0.10)")}
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {/* Chevron */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function BillboardMap() {
  const navigate  = useNavigate();
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [city,     setCity]     = useState("");
  const [district, setDistrict] = useState("");
  const [format,   setFormat]   = useState("");
  const [query,    setQuery]    = useState("");
  const [selected, setSelected] = useState<MapBillboard | null>(null);
  const [resultCount, setResultCount] = useState(ALL_BILLBOARDS.length);

  // ── Filtered data ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_BILLBOARDS.filter(b => {
      if (city     && b.city     !== city)     return false;
      if (district && b.district !== district) return false;
      if (format   && b.type     !== format)   return false;
      if (q && ![b.name, b.city, b.district, b.location, b.type]
        .some(s => s.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [city, district, format, query]);

  useEffect(() => setResultCount(filtered.length), [filtered]);

  // ── District options scoped to selected city ─────────────────────────
  const districtOptions = useMemo(() =>
    Array.from(new Set(
      ALL_BILLBOARDS
        .filter(b => !city || b.city === city)
        .map(b => b.district)
    )).sort(),
  [city]);

  // ── Init Leaflet once ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const map = L.map(mapRef.current, {
      center: [30.0444, 31.2357], // Cairo
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);
    // Custom zoom position
    L.control.zoom({ position: "bottomright" }).addTo(map);
    leafletRef.current = map;
    return () => { map.remove(); leafletRef.current = null; };
  }, []);

  // ── Sync markers when filter changes ────────────────────────────────
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add filtered markers
    filtered.forEach(b => {
      const marker = L.marker([b.lat, b.lng], {
        icon: makePin(selected?.id === b.id),
      })
        .addTo(map)
        .on("click", () => setSelected(prev => prev?.id === b.id ? null : b));

      // Custom popup
      const popup = L.popup({
        maxWidth: 280,
        minWidth: 240,
        className: "horizon-popup",
        closeButton: false,
        offset: [0, -8],
      }).setContent(`
        <div style="font-family:'Inter',sans-serif;padding:4px 0">
          <p style="font-size:9px;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:${RED};margin:0 0 4px">${b.type}</p>
          <p style="font-size:15px;font-weight:800;color:${NAVY};margin:0 0 6px;line-height:1.2">${b.name}</p>
          <p style="font-size:12px;color:rgba(11,15,26,.45);margin:0 0 10px">${b.location}</p>
          <div style="display:flex;gap:16px;margin-bottom:12px">
            <div>
              <p style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Traffic</p>
              <p style="font-size:13px;font-weight:700;color:${NAVY};margin:0">${b.traffic.split(" ").slice(0,2).join(" ")}</p>
            </div>
            <div>
              <p style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
              <p style="font-size:13px;font-weight:700;color:${NAVY};margin:0">${b.size}</p>
            </div>
          </div>
          <a href="/locations/${b.citySlug}/billboards/${b.slug}"
            style="display:block;text-align:center;background:${RED};color:${WHITE};font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:10px 0;text-decoration:none;border:none;cursor:pointer">
            View Details →
          </a>
        </div>
      `);

      marker.bindPopup(popup);
      marker.on("click", () => marker.openPopup());
      markersRef.current.push(marker);
    });

    // Fit bounds if results exist
    if (filtered.length > 0 && filtered.length < ALL_BILLBOARDS.length) {
      const bounds = L.latLngBounds(filtered.map(b => [b.lat, b.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    } else if (filtered.length === ALL_BILLBOARDS.length) {
      map.setView([30.0444, 31.2357], 7);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // ── Reset all filters ────────────────────────────────────────────────
  const reset = () => { setCity(""); setDistrict(""); setFormat(""); setQuery(""); setSelected(null); };

  const hasFilters = !!(city || district || format || query);

  return (
    <section
      id="find-billboard"
      className="bg-white"
      style={{ paddingTop: 0, paddingBottom: 0 }}
    >
      {/* ── Search bar strip ─────────────────────────────────────────── */}
      <div style={{ background: NAVY, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          {/* Section label */}
          <div className="flex items-center justify-between pt-10 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-white/25">
                  Find a Billboard
                </span>
              </div>
              <h2 className="font-black leading-[0.9] tracking-[-0.04em] text-white"
                style={{ fontSize: "clamp(24px, 2.8vw, 38px)" }}>
                Search our network.
              </h2>
            </div>
            <div className="hidden sm:block text-right">
              <p className="font-black leading-none tracking-[-0.03em] text-white/60"
                style={{ fontSize: "clamp(20px, 2.5vw, 32px)" }}>
                {resultCount}
              </p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25 mt-1">
                {resultCount === 1 ? "location" : "locations"} found
              </p>
            </div>
          </div>

          {/* Search inputs row */}
          <div className="flex flex-col sm:flex-row gap-[1px] pb-0" style={{ background: "rgba(255,255,255,0.07)" }}>
            {/* Text search */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="rgba(11,15,26,0.3)" strokeWidth="1.5" />
                  <path d="M10 10l3.5 3.5" stroke="rgba(11,15,26,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, district, road…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full h-14 pl-11 pr-4 text-[13px] font-medium outline-none transition-all duration-200"
                style={{ background: WHITE, border: "none", borderRadius: 0, color: NAVY }}
              />
            </div>

            {/* City */}
            <FilterSelect
              label="All Cities"
              value={city}
              options={ALL_CITIES}
              onChange={v => { setCity(v); setDistrict(""); }}
              icon={
                <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                  <path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 3.85 5.5 9.5 5.5 9.5S12 9.35 12 5.5C12 2.462 9.538 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                    fill="rgba(11,15,26,0.28)" />
                </svg>
              }
            />

            {/* District */}
            <FilterSelect
              label="All Districts"
              value={district}
              options={districtOptions}
              onChange={setDistrict}
              icon={
                <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
                  <rect x="0.5" y="5.5" width="6" height="7" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4" />
                  <rect x="8.5" y="2.5" width="6" height="10" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4" />
                  <path d="M0 5.5L7.5 0 15 5.5" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              }
            />

            {/* Format */}
            <FilterSelect
              label="All Formats"
              value={format}
              options={ALL_FORMATS}
              onChange={setFormat}
              icon={
                <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
                  <rect x="0.5" y="0.5" width="14" height="12" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4" />
                  <path d="M3 4h9M3 6.5h6M3 9h4" stroke="rgba(11,15,26,0.28)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              }
            />

            {/* Reset button — shown when filters active */}
            <AnimatePresence>
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 52 }}
                  exit={{ opacity: 0, width: 0 }}
                  onClick={reset}
                  className="h-14 flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/5"
                  style={{ background: "rgba(217,4,41,0.12)", border: "none", cursor: "pointer" }}
                  title="Clear filters"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke={RED} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Result count mobile */}
          <div className="sm:hidden flex items-center gap-2 py-3">
            <span className="font-bold text-white/50 text-[13px]">{resultCount}</span>
            <span className="text-[11px] text-white/25">{resultCount === 1 ? "location" : "locations"} found</span>
          </div>
        </div>
      </div>

      {/* ── Map ──────────────────────────────────────────────────────── */}
      <div className="relative" style={{ height: "clamp(420px, 55vh, 680px)" }}>
        {/* Map container */}
        <div ref={mapRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

        {/* Selected billboard card — overlaid on map */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-4 right-4 z-[1000]"
              style={{ width: 280 }}
            >
              {/* Card */}
              <div className="bg-white overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(11,15,26,0.18)" }}>
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: 140 }}>
                  <img src={selected.image} alt={selected.name}
                    className="w-full h-full object-cover" style={{ opacity: 0.9 }} />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(11,15,26,0.7) 0%, transparent 60%)" }} />
                  <span className="absolute bottom-3 left-3 text-[9px] font-bold tracking-[0.2em] uppercase text-white/60">
                    {selected.city} · {selected.district}
                  </span>
                  {/* Close */}
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center"
                    style={{ background: "rgba(11,15,26,0.6)", border: "none", cursor: "pointer" }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div style={{ padding: "16px 20px 20px" }}>
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: RED }}>
                    {selected.type}
                  </p>
                  <p className="font-extrabold text-[15px] leading-tight mb-2" style={{ color: NAVY }}>
                    {selected.name}
                  </p>
                  <p className="text-[12px] mb-4" style={{ color: "rgba(11,15,26,0.4)" }}>
                    {selected.location}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Traffic", value: selected.traffic.split(" ").slice(0,2).join(" ") },
                      { label: "Size",    value: selected.size },
                      { label: "Visibility", value: selected.visibility.split(" ").slice(0,2).join(" ") },
                      { label: "Format",  value: selected.type.split(" ")[0] },
                    ].map(s => (
                      <div key={s.label}>
                        <p className="text-[8px] font-bold tracking-[0.2em] uppercase mb-0.5"
                          style={{ color: "rgba(11,15,26,0.3)" }}>{s.label}</p>
                        <p className="font-bold text-[12px]" style={{ color: NAVY }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(productHref(selected.citySlug, selected.slug))}
                    className="w-full h-10 text-[11px] font-bold tracking-[0.18em] uppercase text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                    style={{ background: RED, border: "none", cursor: "pointer" }}>
                    View Full Details →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state overlay */}
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-[500] pointer-events-none"
              style={{ background: "rgba(11,15,26,0.55)", backdropFilter: "blur(2px)" }}
            >
              <p className="font-bold text-white text-[17px] mb-2">No locations found</p>
              <p className="text-white/40 text-[13px]">Try adjusting your filters</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend chip — bottom left */}
        <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 pointer-events-none"
          style={{ background: WHITE, padding: "8px 14px", boxShadow: "0 2px 12px rgba(11,15,26,0.12)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 32 40">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill={NAVY} />
            <circle cx="16" cy="16" r="6" fill={RED} />
          </svg>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: NAVY }}>
            Billboard Location
          </span>
        </div>
      </div>

      {/* Popup styles injected globally */}
      <style>{`
        .horizon-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(11,15,26,0.20) !important;
          border: none !important;
        }
        .horizon-popup .leaflet-popup-content {
          margin: 16px !important;
        }
        .horizon-popup .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </section>
  );
}
