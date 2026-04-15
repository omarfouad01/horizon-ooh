import { useState, useRef, useEffect } from "react";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      {/* Trigger button */}
      <button
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

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 overflow-y-auto"
          style={{
            zIndex: 9999,
            background: "white",
            border: `1.5px solid ${RED}`,
            borderTop: "none",
            boxShadow: "0 8px 32px rgba(11,15,26,0.14)",
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
          {options.map(opt => {
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
                {/* Custom checkbox */}
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
        </div>
      )}
    </div>
  );
}
