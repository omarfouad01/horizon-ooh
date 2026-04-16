import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const NAVY = "#0B0F1A";
const RED  = "#D90429";

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  icon: React.ReactNode;
}

export default function MultiSelect({ label, options, selected, onChange, icon }: Props) {
  const [open, setOpen]           = useState(false);
  const [dropPos, setDropPos]     = useState({ top: 0, left: 0, width: 0 });
  const [query, setQuery]         = useState("");
  const triggerRef                = useRef<HTMLButtonElement>(null);
  const dropRef                   = useRef<HTMLDivElement>(null);

  // ── Reposition dropdown to match trigger button ───────────────────────
  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropPos({
      top:   r.bottom + window.scrollY,
      left:  r.left   + window.scrollX,
      width: r.width,
    });
  }, []);

  // Reposition whenever opened or window scrolls/resizes
  useEffect(() => {
    if (!open) return;
    setQuery("");
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropRef.current    && !dropRef.current.contains(target)
      ) {
        setOpen(false);
      }
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

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  const triggerLabel = selected.length === 0
    ? `All ${label}s`
    : selected.length === 1
      ? selected[0]
      : selected.length <= 2
        ? selected.join(", ")
        : `${selected.length} ${label}s`;

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="relative flex-1 min-w-0">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-12 flex items-center gap-2 pl-3 pr-7 text-[12px] font-semibold text-left outline-none transition-all duration-200"
        style={{
          background: "white",
          border: `1.5px solid ${open || selected.length > 0 ? RED : "rgba(11,15,26,0.12)"}`,
          borderRadius: 0,
          color: selected.length > 0 ? NAVY : "rgba(11,15,26,0.38)",
          cursor: "pointer",
        }}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="flex-1 truncate">{triggerLabel}</span>
        {/* Selected count badge */}
        {selected.length > 0 && (
          <span
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-white rounded-full"
            style={{ background: RED, fontSize: 9, fontWeight: 900 }}
          >
            {selected.length}
          </span>
        )}
        {/* Chevron */}
        <span
          className="absolute right-3 top-1/2 pointer-events-none transition-transform duration-200"
          style={{ transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
        >
          <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
            <path d="M1 1l3.5 3.5L8 1" stroke={NAVY} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* Dropdown — rendered in a portal to escape any overflow:hidden ancestors */}
      {open && createPortal(
        <div
          ref={dropRef}
          className="overflow-y-auto"
          style={{
            position: "absolute",
            top:   dropPos.top,
            left:  dropPos.left,
            width: dropPos.width,
            zIndex: 99999,
            background: "white",
            border: `1.5px solid ${RED}`,
            borderTop: "none",
            boxShadow: "0 12px 40px rgba(11,15,26,0.18)",
            maxHeight: 220,
          }}
        >
          {/* Clear option */}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 font-bold tracking-[0.18em] uppercase transition-colors hover:bg-red-50"
              style={{ color: RED, background: "rgba(217,4,41,0.04)", cursor: "pointer", border: "none", fontSize: 10 }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1l6 6M7 1L1 7" stroke={RED} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Clear selection
            </button>
          )}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid rgba(11,15,26,0.06)" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full h-9 px-3 text-[12px] outline-none"
              style={{ border: "1px solid rgba(11,15,26,0.12)", color: NAVY }}
            />
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-4 text-[12px]" style={{ color: "rgba(11,15,26,0.4)" }}>
              No results found.
            </div>
          ) : filteredOptions.map(opt => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 transition-all duration-150"
                style={{
                  background: checked ? "rgba(217,4,41,0.05)" : "white",
                  color: checked ? NAVY : "rgba(11,15,26,0.65)",
                  cursor: "pointer",
                  border: "none",
                  borderBottom: "1px solid rgba(11,15,26,0.05)",
                  fontWeight: checked ? 700 : 500,
                  fontSize: 12,
                }}
              >
                <span
                  className="flex-shrink-0 w-4 h-4 flex items-center justify-center transition-all duration-150"
                  style={{
                    border: `1.5px solid ${checked ? RED : "rgba(11,15,26,0.2)"}`,
                    background: checked ? RED : "white",
                  }}
                >
                  {checked && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
