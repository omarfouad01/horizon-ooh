/**
 * LocationsMap — interactive split-screen Leaflet map for the Locations marketplace page.
 * Syncs pin hover/click with the card list on the left.
 */
import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import type { MapBillboard } from "@/data";

const NAVY  = "#0B0F1A";
const RED   = "#D90429";
const WHITE = "#FFFFFF";

function makePin(state: "default" | "hover" | "active") {
  const bg  = state === "active" ? RED  : state === "hover" ? "#1a2035" : NAVY;
  const dot = state === "active" ? WHITE : RED;
  const size = state === "active" ? 34 : 28;
  const anchor = state === "active" ? 17 : 14;
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size*1.28)}" viewBox="0 0 32 40"
        style="filter:drop-shadow(0 3px 8px rgba(11,15,26,.35));transition:all .2s">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${bg}"/>
      <circle cx="16" cy="16" r="6" fill="${dot}"/>
    </svg>`,
    className: "",
    iconSize:    [size, Math.round(size * 1.28)],
    iconAnchor:  [anchor, Math.round(size * 1.28)],
    popupAnchor: [0, -Math.round(size * 1.28) - 4],
  });
}

interface Props {
  billboards:    MapBillboard[];
  hoveredId:     string | null;
  selectedId:    string | null;
  onHover:       (id: string | null) => void;
  onSelect:      (id: string | null) => void;
  className?:    string;
  style?:        React.CSSProperties;
}

export default function LocationsMap({
  billboards, hoveredId, selectedId, onHover, onSelect, className, style,
}: Props) {
  const divRef     = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // ── Init map once ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      center: [30.0444, 31.2357],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current.clear(); };
  }, []);

  // ── Sync markers when billboard list changes ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove markers no longer in list
    const ids = new Set(billboards.map(b => b.id));
    markersRef.current.forEach((m, id) => {
      if (!ids.has(id)) { m.remove(); markersRef.current.delete(id); }
    });

    // Add new markers
    billboards.forEach(b => {
      if (markersRef.current.has(b.id)) return;
      const marker = L.marker([b.lat, b.lng], { icon: makePin("default") }).addTo(map);

      marker.on("mouseover", () => onHover(b.id));
      marker.on("mouseout",  () => onHover(null));
      marker.on("click",     () => onSelect(selectedId === b.id ? null : b.id));

      // Tooltip (mini card on hover)
      marker.bindTooltip(`
        <div style="font-family:'Inter',sans-serif;padding:2px">
          <p style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${RED};margin:0 0 3px">${b.type}</p>
          <p style="font-size:13px;font-weight:800;color:${NAVY};margin:0 0 2px;line-height:1.2">${b.name}</p>
          <p style="font-size:10px;color:rgba(11,15,26,.4);margin:0 0 8px">${b.district}, ${b.city}</p>
          <div style="display:flex;gap:12px">
            <div><p style="font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 1px">Traffic</p>
              <p style="font-size:11px;font-weight:700;color:${NAVY};margin:0">${b.traffic.split(" ").slice(0,2).join(" ")}</p></div>
            <div><p style="font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 1px">Size</p>
              <p style="font-size:11px;font-weight:700;color:${NAVY};margin:0">${b.size}</p></div>
          </div>
        </div>`, {
        permanent: false,
        direction: "top",
        className: "loc-map-tooltip",
        offset: [0, -4],
      });

      markersRef.current.set(b.id, marker);
    });

    // Fit bounds
    if (billboards.length > 0) {
      const bounds = L.latLngBounds(billboards.map(b => [b.lat, b.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14, animate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billboards]);

  // ── Update pin states on hover/select changes ──────────────────────────
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const state = id === selectedId ? "active" : id === hoveredId ? "hover" : "default";
      marker.setIcon(makePin(state));
      marker.setZIndexOffset(state !== "default" ? 1000 : 0);
    });
  }, [hoveredId, selectedId]);

  // ── Pan to selected ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const b = billboards.find(x => x.id === selectedId);
    if (b) mapRef.current.panTo([b.lat, b.lng], { animate: true, duration: 0.5 });
  }, [selectedId, billboards]);

  return (
    <>
      <div ref={divRef} className={className} style={style} />
      <style>{`
        .loc-map-tooltip {
          background: white !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: 0 6px 32px rgba(11,15,26,.18) !important;
          padding: 12px 14px !important;
        }
        .loc-map-tooltip::before { display: none !important; }
        .leaflet-tooltip-top.loc-map-tooltip::before { display: none !important; }
      `}</style>
    </>
  );
}
