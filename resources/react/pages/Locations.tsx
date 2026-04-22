/**
 * Locations — Premium marketplace-style page
 * Layout: Sticky filter bar → Results header → Split-screen (cards left / map right)
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, getState } from "@/store/dataStore";
import { productHref, RED, NAVY } from "@/lib/routes";
import LocationsMap from "@/components/LocationsMap";
import { useLang } from "@/i18n/LangContext";

const getBillboards = () => getState().locations.flatMap((l: any) => (l.products||[]).map((p: any) => ({ ...p, citySlug: l.slug })));

// ─── constants ─────────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;
// Cities, districts, and formats come from the store (admin-managed), not billboard fields
const getCities  = () => getState().locations.map((l: any) => l.city).sort();
const getFormats = () => getState().adFormats.map((f: any) => f.label).filter(Boolean).sort();

const BADGES: Record<string, string[]> = {
  "Unipole Billboard": ["High Visibility", "Premium Location"],
  "Rooftop Billboard": ["Strategic Placement", "Urban Core"],
  "Bridge Panel":      ["High Traffic", "Strategic Placement"],
  "DOOH Screen":       ["Digital", "Premium Location"],
  "Mega Billboard":    ["High Visibility", "Landmark"],
  "Mall Advertising":  ["High Footfall", "Indoor"],
  "Street Furniture":  ["Eye-Level", "High Frequency"],
  "Corniche Panel":    ["Iconic Location", "Premium Location"],
};
const getBadges = (type: string) => BADGES[type] ?? ["Premium Location"];



// ─── Tiny helpers ───────────────────────────────────────────────────────────
function ChevronDown({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 10 6" fill="none">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function XIcon({ size = 8 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none">
      <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Filter dropdown — multi-select with checkboxes ────────────────────────
interface FilterDropdownProps {
  label: string;
  options: string[];
  values: string[];
  onChange: (vals: string[]) => void;
  icon: React.ReactNode;
}
function FilterDropdown({ label, options, values, onChange, icon }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);
  const hasValues  = values.length > 0;

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        dropRef.current    && !dropRef.current.contains(t)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);

  // Trigger label
  const triggerLabel = !hasValues
    ? label
    : values.length === 1
      ? values[0]
      : `${label} (${values.length})`;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-11 px-5 text-[13px] font-bold transition-all duration-200 whitespace-nowrap"
        style={{
          background: hasValues ? RED : "white",
          color: hasValues ? "white" : NAVY,
          border: `2px solid ${hasValues ? RED : "rgba(11,15,26,0.22)"}`,
          borderRadius: 8,
          cursor: "pointer",
          boxShadow: hasValues ? "0 2px 12px rgba(217,4,41,0.2)" : "0 1px 4px rgba(11,15,26,0.06)",
        }}
      >
        <span style={{ opacity: hasValues ? 1 : 0.5, flexShrink: 0 }}>{icon}</span>
        <span className="truncate" style={{ maxWidth: 140 }}>{triggerLabel}</span>
        {hasValues ? (
          <span
            onClick={e => { e.stopPropagation(); onChange([]); }}
            className="flex items-center justify-center w-4 h-4 rounded-full ml-1 flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ background: "rgba(255,255,255,0.3)", cursor: "pointer" }}
          >
            <XIcon size={7} />
          </span>
        ) : (
          <span
            className="transition-transform duration-200 flex-shrink-0"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <ChevronDown />
          </span>
        )}
      </button>

      {/* Dropdown panel — rendered inline, z-index handles layering */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease }}
            className="absolute top-full left-0 mt-2 z-[9999] overflow-hidden"
            style={{
              minWidth: 240,
              background: "white",
              border: "1.5px solid rgba(11,15,26,0.1)",
              borderRadius: 10,
              boxShadow: "0 12px 40px rgba(11,15,26,0.14)",
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(11,15,26,0.07)" }}>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase"
                style={{ color: "rgba(11,15,26,0.4)" }}>
                {label}
              </span>
              {hasValues && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-[10px] font-bold tracking-[0.12em] uppercase transition-colors hover:text-[#D90429]"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(11,15,26,0.35)" }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Options list */}
            <div style={{ maxHeight: 240, overflowY: "auto" }}>
              {options.map(opt => {
                const checked = values.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 transition-all duration-150"
                    style={{
                      background: checked ? "rgba(217,4,41,0.04)" : "white",
                      border: "none",
                      borderBottom: "1px solid rgba(11,15,26,0.04)",
                      cursor: "pointer",
                    }}
                  >
                    {/* Checkbox */}
                    <span
                      className="flex-shrink-0 flex items-center justify-center transition-all duration-150"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: `2px solid ${checked ? RED : "rgba(11,15,26,0.2)"}`,
                        background: checked ? RED : "white",
                      }}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5l2.5 2.5 5-5" stroke="white" strokeWidth="1.6"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{
                        color: checked ? NAVY : "rgba(11,15,26,0.65)",
                        fontWeight: checked ? 700 : 450,
                      }}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer — apply/done */}
            {hasValues && (
              <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(11,15,26,0.07)" }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full h-9 flex items-center justify-center text-[11px] font-bold tracking-[0.18em] uppercase text-white transition-opacity hover:opacity-90"
                  style={{ background: RED, border: "none", borderRadius: 6, cursor: "pointer" }}
                >
                  Apply · {values.length} selected
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Billboard card ──────────────────────────────────────────────────────────
interface CardProps {
  b: any;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}
function BillboardCard({ b, isHovered, isSelected, onHover, onSelect, cardRef }: CardProps) {
  const navigate = useNavigate();
  const { isAr, t } = useLang();
  const badges = getBadges(b.type);
  const highlighted = isHovered || isSelected;

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.4, ease }}
      onMouseEnter={() => onHover(b.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(isSelected ? null : b.id)}
      className="group cursor-pointer"
      style={{
        background: "white",
        borderRadius: 12,
        overflow: "hidden",
        border: `1.5px solid ${highlighted ? RED : "rgba(11,15,26,0.08)"}`,
        boxShadow: highlighted
          ? "0 8px 32px rgba(217,4,41,0.12), 0 2px 8px rgba(11,15,26,0.06)"
          : "0 2px 12px rgba(11,15,26,0.06)",
        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
        transform: highlighted ? "translateY(-2px)" : "none",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={b.image}
          alt={`${b.name} — billboard advertising ${b.city}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ opacity: 0.88 }}
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(11,15,26,0.75) 0%, rgba(11,15,26,0.1) 60%)" }} />

        {/* City chip */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 text-white"
            style={{ background: RED, borderRadius: 3 }}>
            {isAr && b.cityAr ? b.cityAr : b.city}
          </span>
          <span className="text-[9px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 text-white/80"
            style={{ background: "rgba(11,15,26,0.6)", backdropFilter: "blur(6px)", borderRadius: 3 }}>
            {isAr && b.districtAr ? b.districtAr : b.district}
          </span>
        </div>

        {/* Format chip top right */}
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 text-white/70"
            style={{ background: "rgba(11,15,26,0.55)", backdropFilter: "blur(6px)", borderRadius: 3 }}>
            {b.type}
          </span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-extrabold text-white leading-tight" style={{ fontSize: 15 }}>{isAr && b.nameAr ? b.nameAr : (b.nameEn || b.name)}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px" }}>
        {/* English name + full address */}
        <div className="mb-4 pb-4" style={{ borderBottom: "1px solid rgba(11,15,26,0.06)" }}>
          <p className="text-[13px] font-bold text-[#0B0F1A] leading-snug mb-1">{isAr && b.nameAr ? b.nameAr : (b.nameEn || b.name)}</p>
          <div className="flex items-start gap-1.5">
            <svg className="shrink-0 mt-[1px]" width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: '#D90429' }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
            </svg>
            <p className="text-[11px] leading-snug" style={{ color: "rgba(11,15,26,0.45)" }}>{b.location}</p>
          </div>
        </div>
        {/* Code / Size / Format stats row */}
        <div className="grid grid-cols-3 gap-0 mb-4" style={{ border: "1px solid rgba(11,15,26,0.07)" }}>
          {[
            { label: t('spec.code'),      value: b.code || "—" },
            { label: t('spec.size'),      value: b.size },
            { label: t('spec.adFormat'),  value: b.type },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-2.5 px-2"
              style={{ borderLeft: i > 0 ? '2px solid #D90429' : 'none' }}>
              <p className="text-[9px] font-semibold tracking-[0.18em] uppercase mb-0.5"
                style={{ color: "rgba(11,15,26,0.3)" }}>{stat.label}</p>
              <p className="text-[11px] font-bold text-center leading-tight" style={{ color: NAVY }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Badge tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {badges.map(badge => (
            <span key={badge}
              className="text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1"
              style={{
                background: "rgba(217,4,41,0.06)",
                color: RED,
                borderRadius: 4,
                border: "1px solid rgba(217,4,41,0.15)",
              }}>
              {badge}
            </span>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); navigate(productHref(b.citySlug, b.slug)); }}
            className="flex-1 h-9 flex items-center justify-center text-[10px] font-bold tracking-[0.18em] uppercase text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            style={{ background: NAVY, border: "none", borderRadius: 5, cursor: "pointer" }}
          >
            {isAr ? 'عرض التفاصيل' : 'View Details'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); navigate("/contact"); }}
            className="flex-1 h-9 flex items-center justify-center text-[10px] font-bold tracking-[0.18em] uppercase transition-all duration-200 hover:bg-[rgba(217,4,41,0.06)] active:scale-[0.97]"
            style={{ border: `1.5px solid ${RED}`, color: RED, borderRadius: 5, cursor: "pointer", background: "transparent" }}
          >
            {isAr ? 'اطلب عرض سعر' : 'Get Quote'}
          </button>
          <a
            href={`https://wa.me/201234567890?text=Hi%20HORIZON%20OOH%2C%20I%27m%20interested%20in%20${encodeURIComponent(b.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-[0.97] flex-shrink-0"
            style={{ background: "#25D366", borderRadius: 5, textDecoration: "none" }}
            title="WhatsApp enquiry"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Locations() {
  const { locations, districts: storeDistrictsForEnrich } = useStore()
  const { isAr, t } = useLang()
  // Enrich each billboard with Arabic city/district names from the store
  const allBillboards = locations.flatMap((l: any) =>
    (l.products||[]).map((p: any) => {
      const districtObj = storeDistrictsForEnrich.find((d: any) => d.name === p.district)
      return {
        ...p,
        citySlug: l.slug,
        cityAr: l.cityAr || '',
        districtAr: districtObj?.nameAr || '',
      }
    })
  )
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── Filter state — multi-select arrays ──────────────────────────────
  const [cities,    setCities]    = useState<string[]>(searchParams.getAll("city"));
  const [districts, setDistricts] = useState<string[]>(searchParams.getAll("district"));
  const [formats,   setFormats]   = useState<string[]>(searchParams.getAll("format"));

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileMapOpen,     setMobileMapOpen]     = useState(false);

  // Sync URL ↔ local state when navigating from outside (e.g. homepage search)
  useEffect(() => {
    setCities(   searchParams.getAll("city"));
    setDistricts(searchParams.getAll("district"));
    setFormats(  searchParams.getAll("format"));
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  // Push filter arrays to URL immediately on change
  const pushToUrl = useCallback((c: string[], d: string[], f: string[]) => {
    const p = new URLSearchParams();
    c.forEach(v => p.append("city",     v));
    d.forEach(v => p.append("district", v));
    f.forEach(v => p.append("format",   v));
    setSearchParams(p);
  }, [setSearchParams]);

  // District options come from store.districts, narrowed by selected cities
  const { locations: storeLocations, districts: storeDistricts, adFormats } = useStore()
  const ALL_CITIES  = storeLocations.map((l: any) => l.city).sort()
  const ALL_FORMATS = adFormats.map((f: any) => f.label).filter(Boolean).sort()
  const districtOptions = (() => {
    if (cities.length === 0) return storeDistricts.map((d: any) => d.name).sort()
    const locIds = storeLocations
      .filter((l: any) => cities.includes(l.city))
      .map((l: any) => l.id)
    return storeDistricts
      .filter((d: any) => locIds.includes(d.locationId))
      .map((d: any) => d.name)
      .sort()
  })()

  // ── Filtered results ─────────────────────────────────────────────────
  const sorted = allBillboards.filter(b => {
    if (cities.length    > 0 && !cities.includes(b.city))        return false;
    if (districts.length > 0 && !districts.includes(b.district)) return false;
    if (formats.length   > 0 && !formats.includes(b.type))       return false;
    return true;
  });

  const hasFilters = cities.length > 0 || districts.length > 0 || formats.length > 0;
  const clearAll = () => { setCities([]); setDistricts([]); setFormats([]); setSearchParams({}); };

  // ── Pin ↔ card interaction ───────────────────────────────────────────
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listRef  = useRef<HTMLDivElement>(null);

  const handlePinSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id && listRef.current) {
      const el = cardRefs.current.get(id);
      if (el) {
        const container = listRef.current;
        const top = el.offsetTop - container.offsetTop - 80;
        container.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, []);

  // Filter change helpers — update state + URL together
  const handleCitiesChange = (vals: string[]) => {
    // When cities change, remove districts that no longer belong
    const newDists = districts.filter(d =>
      allBillboards.some(b => vals.length === 0 || vals.includes(b.city) ? b.district === d : false)
    );
    setCities(vals); setDistricts(newDists);
    pushToUrl(vals, newDists, formats);
  };
  const handleDistrictsChange = (vals: string[]) => {
    setDistricts(vals); pushToUrl(cities, vals, formats);
  };
  const handleFormatsChange = (vals: string[]) => {
    setFormats(vals); pushToUrl(cities, districts, vals);
  };

  const cityLabel = cities.length === 0 ? "" : cities.length === 1 ? cities[0] : `${cities.length} cities`;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F7F7F8" }}>

      {/* ══════════════════════════════════════════════════════════════
          1. PAGE HEADER (not sticky — scrolls away)
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white" style={{ borderBottom: "1px solid rgba(11,15,26,0.07)", paddingTop: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]" style={{ paddingBottom: 40 }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => navigate("/")}
              className="text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors hover:text-[#D90429]"
              style={{ color: "rgba(11,15,26,0.35)", background: "none", border: "none", cursor: "pointer" }}>
              Home
            </button>
            <span style={{ color: "rgba(11,15,26,0.2)", fontSize: 12 }}>›</span>
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: NAVY }}>
              Locations
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase"
                  style={{ color: "rgba(11,15,26,0.3)" }}>{t('locations.ourNetwork')}</span>
              </div>
              <h1 className="font-black leading-[0.88] tracking-[-0.04em]"
                style={{ fontSize: "clamp(36px, 4vw, 58px)", color: NAVY }}>
                {t('locations.title')}<br />
                <span style={{ color: "rgba(11,15,26,0.18)" }}>{t('locations.titleAccent')}</span>
              </h1>
            </div>
            <p className="text-[15px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.45)", maxWidth: 340 }}>
              {t('locations.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. STICKY FILTER BAR
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-40 bg-white"
        style={{
          borderBottom: "1px solid rgba(11,15,26,0.07)",
          boxShadow: "0 2px 16px rgba(11,15,26,0.06)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          {/* Desktop filter row */}
          <div className="hidden lg:flex items-center gap-3 py-4">
            {/* Filters label */}
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase mr-1 flex-shrink-0"
              style={{ color: "rgba(11,15,26,0.45)" }}>Filter:</span>

            <FilterDropdown
              label="City" options={ALL_CITIES} values={cities} onChange={handleCitiesChange}
              icon={
                <svg width="11" height="13" viewBox="0 0 13 15" fill="none">
                  <path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 3.85 5.5 9.5 5.5 9.5S12 9.35 12 5.5C12 2.462 9.538 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                    fill="currentColor"/>
                </svg>
              }
            />
            <FilterDropdown
              label="District" options={districtOptions} values={districts} onChange={handleDistrictsChange}
              icon={
                <svg width="13" height="11" viewBox="0 0 15 13" fill="none">
                  <rect x="0.5" y="5.5" width="6" height="7" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="8.5" y="2.5" width="6" height="10" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M0 5.5L7.5 0 15 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              }
            />
            <FilterDropdown
              label="Format" options={ALL_FORMATS} values={formats} onChange={handleFormatsChange}
              icon={
                <svg width="13" height="11" viewBox="0 0 15 13" fill="none">
                  <rect x="0.5" y="0.5" width="14" height="12" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M3 4h9M3 6.5h6M3 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              }
            />

            {/* Clear filters */}
            <AnimatePresence>
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  onClick={clearAll}
                  className="flex items-center gap-1.5 h-10 px-3 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors hover:text-[#D90429]"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(11,15,26,0.35)" }}
                >
                  <XIcon size={8} /> Clear all
                </motion.button>
              )}
            </AnimatePresence>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Result count pill */}
            <div className="flex items-center gap-2 px-4 py-2"
              style={{ background: "rgba(11,15,26,0.06)", borderRadius: 8 }}>
              <span className="text-[13px] font-black" style={{ color: NAVY }}>{sorted.length}</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ color: "rgba(11,15,26,0.45)" }}>locations</span>
            </div>
          </div>

          {/* Mobile filter row */}
          <div className="flex lg:hidden items-center gap-2 py-3">
            <button
              onClick={() => setMobileFiltersOpen(v => !v)}
              className="flex items-center gap-2 h-10 px-4 flex-1 text-[12px] font-semibold"
              style={{
                background: hasFilters ? RED : "white",
                color: hasFilters ? "white" : "rgba(11,15,26,0.6)",
                border: `1.5px solid ${hasFilters ? RED : "rgba(11,15,26,0.12)"}`,
                borderRadius: 8, cursor: "pointer",
              }}
            >
              <svg width="13" height="11" viewBox="0 0 14 12" fill="none">
                <path d="M1 2h12M3 6h8M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filters {hasFilters && `(${cities.length + districts.length + formats.length})`}
              <ChevronDown />
            </button>
            <button
              onClick={() => setMobileMapOpen(v => !v)}
              className="flex items-center gap-2 h-10 px-4 text-[12px] font-semibold flex-shrink-0"
              style={{
                background: mobileMapOpen ? RED : "white",
                color: mobileMapOpen ? "white" : "rgba(11,15,26,0.6)",
                border: `1.5px solid ${mobileMapOpen ? RED : "rgba(11,15,26,0.12)"}`,
                borderRadius: 8, cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 1L1 3v10l4-2 4 2 4-2V1l-4 2-4-2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 1v10M9 3v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {mobileMapOpen ? "List" : "Map"}
            </button>
            <div className="px-3 py-2 flex-shrink-0"
              style={{ background: "rgba(11,15,26,0.05)", borderRadius: 6 }}>
              <span className="text-[11px] font-bold" style={{ color: NAVY }}>{sorted.length}</span>
            </div>
          </div>

          {/* Mobile filter panel */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pb-4 flex flex-col gap-3">
                  <FilterDropdown label="City" options={ALL_CITIES} values={cities} onChange={handleCitiesChange}
                    icon={<svg width="11" height="13" viewBox="0 0 13 15" fill="none"><path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 3.85 5.5 9.5 5.5 9.5S12 9.35 12 5.5C12 2.462 9.538 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/></svg>}
                  />
                  <FilterDropdown label="District" options={districtOptions} values={districts} onChange={handleDistrictsChange}
                    icon={<svg width="13" height="11" viewBox="0 0 15 13" fill="none"><rect x="0.5" y="5.5" width="6" height="7" stroke="currentColor" strokeWidth="1.4"/><rect x="8.5" y="2.5" width="6" height="10" stroke="currentColor" strokeWidth="1.4"/><path d="M0 5.5L7.5 0 15 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                  />
                  <FilterDropdown label="Format" options={ALL_FORMATS} values={formats} onChange={handleFormatsChange}
                    icon={<svg width="13" height="11" viewBox="0 0 15 13" fill="none"><rect x="0.5" y="0.5" width="14" height="12" stroke="currentColor" strokeWidth="1.4"/><path d="M3 4h9M3 6.5h6M3 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                  />
              {hasFilters && (
                <button onClick={() => { clearAll(); }}
                  className="text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-1.5"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(11,15,26,0.4)" }}>
                  <XIcon size={8}/> Clear all filters
                </button>
              )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. SPLIT-SCREEN CONTENT AREA
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:flex-row relative">

        {/* ── LEFT — Scrollable card list (70%) ───────────────────── */}
        <div
          ref={listRef}
          className={`${mobileMapOpen ? "hidden lg:flex" : "flex"} flex-col lg:overflow-y-auto`}
          style={{ flex: "0 0 66%", padding: "0 0 120px" }}
        >
          {/* Results header */}
          <div className="sticky top-0 z-20 bg-white/95"
            style={{
              backdropFilter: "blur(8px)",
              padding: "14px 32px",
              borderBottom: "1px solid rgba(11,15,26,0.06)",
              boxShadow: "0 2px 8px rgba(11,15,26,0.04)",
            }}>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold" style={{ color: "rgba(11,15,26,0.55)" }}>
                <span className="font-black" style={{ color: NAVY }}>{sorted.length} </span>
                {cityLabel ? <>premium billboard location{sorted.length !== 1 ? "s" : ""} in <span style={{ color: RED }}>{cityLabel}</span></> : "premium billboard locations"}
              </p>
              {hasFilters && (
                <button onClick={clearAll}
                  className="text-[10px] font-bold tracking-[0.15em] uppercase transition-colors hover:text-[#D90429]"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(11,15,26,0.3)" }}>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {hasFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                style={{ padding: "12px 32px 0", overflow: "hidden" }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    ...cities.map(v    => ({ label: "City",     value: v, clear: () => handleCitiesChange(cities.filter(x => x !== v)) })),
                    ...districts.map(v => ({ label: "District", value: v, clear: () => handleDistrictsChange(districts.filter(x => x !== v)) })),
                    ...formats.map(v   => ({ label: "Format",   value: v, clear: () => handleFormatsChange(formats.filter(x => x !== v)) })),
                  ].map((chip) => (
                      <motion.span
                        key={chip.label}
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5"
                        style={{ background: NAVY, color: "white", borderRadius: 4 }}
                      >
                        {chip.label}: {chip.value}
                        <button
                          onClick={chip.clear}
                          className="flex items-center justify-center w-3.5 h-3.5 rounded-full transition-opacity hover:opacity-70"
                          style={{ background: "rgba(255,255,255,0.2)", cursor: "pointer", border: "none" }}
                        >
                          <XIcon size={6} />
                        </button>
                      </motion.span>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards */}
          <div style={{ padding: "20px 32px 0" }}>
            <AnimatePresence mode="popLayout">
              {sorted.length > 0 ? (
                <motion.div
                  key="results"
                  className="grid grid-cols-1 xl:grid-cols-2 gap-5"
                >
                  {sorted.map(b => (
                    <BillboardCard
                      key={b.id}
                      b={b}
                      isHovered={hoveredId === b.id}
                      isSelected={selectedId === b.id}
                      onHover={setHoveredId}
                      onSelect={handlePinSelect}
                      cardRef={el => {
                        if (el) cardRefs.current.set(b.id, el);
                        else cardRefs.current.delete(b.id);
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                /* ── EMPTY STATE ────────────────────────────────────── */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-6"
                    style={{ background: "rgba(217,4,41,0.06)", borderRadius: "50%", border: "1.5px solid rgba(217,4,41,0.12)" }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                      <path d="M13 1C6.373 1 1 6.373 1 13s5.373 12 12 12 12-5.373 12-12S19.627 1 13 1z" stroke={RED} strokeWidth="1.5"/>
                      <path d="M9 13h4M13 9v4" stroke={RED} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="font-black text-[22px] tracking-[-0.03em] mb-3" style={{ color: NAVY }}>
                    No locations match your search
                  </h3>
                  <p className="text-[14px] leading-[1.7] mb-8" style={{ color: "rgba(11,15,26,0.45)", maxWidth: 340 }}>
                    Let us recommend the best locations for your campaign — our strategists know every market.
                  </p>
                  <div className="flex items-center gap-3">
                    <button onClick={clearAll}
                      className="h-11 px-6 text-[11px] font-bold tracking-[0.2em] uppercase text-white transition-opacity hover:opacity-90"
                      style={{ background: RED, border: "none", borderRadius: 6, cursor: "pointer" }}>
                      Show All Locations
                    </button>
                    <button onClick={() => navigate("/contact")}
                      className="h-11 px-6 text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:border-[#D90429] hover:text-[#D90429]"
                      style={{ background: "transparent", border: `1.5px solid rgba(11,15,26,0.15)`, borderRadius: 6, cursor: "pointer", color: "rgba(11,15,26,0.5)" }}>
                      Contact Us
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT — Sticky map panel (30%) ──────────────────────── */}
        <div
          className={`${mobileMapOpen ? "flex" : "hidden"} lg:flex flex-col`}
          style={{ flex: "0 0 34%", position: "sticky", top: 57, height: "calc(100vh - 57px)", background: "#e8eaed" }}
        >
          <div className="relative w-full h-full">
            <LocationsMap
              billboards={sorted}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={handlePinSelect}
              className="absolute inset-0 w-full h-full"
              style={{ zIndex: 1 }}
            />

            {/* Map legend */}
            <div className="absolute bottom-20 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-2"
                style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", borderRadius: 6, boxShadow: "0 2px 12px rgba(11,15,26,0.1)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 32 40">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill={NAVY}/>
                  <circle cx="16" cy="16" r="6" fill={RED}/>
                </svg>
                <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: NAVY }}>Billboard</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2"
                style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", borderRadius: 6, boxShadow: "0 2px 12px rgba(11,15,26,0.1)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 32 40">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill={RED}/>
                  <circle cx="16" cy="16" r="6" fill="white}"/>
                </svg>
                <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: NAVY }}>Selected</span>
              </div>
            </div>

            {/* Pin count chip */}
            <div className="absolute top-3 right-3 z-[1000]">
              <div className="flex items-center gap-1.5 px-3 py-1.5"
                style={{ background: "rgba(11,15,26,0.85)", backdropFilter: "blur(6px)", borderRadius: 20 }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill={RED}>
                  <circle cx="4" cy="4" r="4"/>
                </svg>
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white">{sorted.length} pins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          4. FLOATING CTA BAR (sticky bottom)
      ══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease }}
        className="fixed bottom-6 left-1/2 z-50"
        style={{ transform: "translateX(-50%)" }}
      >
        <div className="flex items-center gap-3 px-5 py-3"
          style={{
            background: "white",
            borderRadius: 50,
            boxShadow: "0 8px 40px rgba(11,15,26,0.18), 0 2px 8px rgba(11,15,26,0.08)",
            border: "1px solid rgba(11,15,26,0.08)",
            whiteSpace: "nowrap",
          }}>
          <div className="hidden sm:flex items-center gap-2 pr-3"
            style={{ borderRight: "1px solid rgba(11,15,26,0.1)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: RED, animation: "pulse 2s infinite" }} />
            <span className="text-[12px] font-semibold" style={{ color: "rgba(11,15,26,0.55)" }}>
              Need help choosing the best billboard?
            </span>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="flex items-center gap-2 h-9 px-4 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
            style={{ background: NAVY, border: "none", borderRadius: 30, cursor: "pointer" }}
          >
            Talk to an Expert
          </button>
          <a
            href="https://wa.me/201234567890?text=Hi%20HORIZON%20OOH%2C%20I%20need%20help%20choosing%20billboard%20locations"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 h-9 px-4 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
            style={{ background: "#25D366", borderRadius: 30, textDecoration: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  );
}