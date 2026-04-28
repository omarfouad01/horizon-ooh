/**
 * BillboardMap — standalone Leaflet map logic (no UI chrome)
 * Accepts filtered billboard list + callbacks from parent
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import type { MapBillboard } from "@/data";

const NAVY = "#0B0F1A";
const RED  = "#D90429";
const WHITE = "#FFFFFF";

// Fix Leaflet default-icon path issue with Vite bundler
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makePin(active = false) {
  const fill = active ? RED  : NAVY;
  const dot  = active ? WHITE : RED;
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${fill}"/>
      <circle cx="16" cy="16" r="6" fill="${dot}"/>
    </svg>`,
    className: "",
    iconSize:    [28, 36],
    iconAnchor:  [14, 36],
    popupAnchor: [0, -40],
  });
}

interface Props {
  filtered:    MapBillboard[];
  allCount:    number;
  selected:    MapBillboard | null;
  onSelect:    (b: MapBillboard | null) => void;
  className?:  string;
  style?:      React.CSSProperties;
}

export default function LeafletMap({ filtered, allCount, selected, onSelect, className, style }: Props) {
  const navigate    = useNavigate();
  const divRef      = useRef<HTMLDivElement>(null);
  const mapRef      = useRef<L.Map | null>(null);
  const markersRef  = useRef<L.Marker[]>([]);

  // ── Init once ─────────────────────────────────────────────────────────
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
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Sync markers ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filtered.forEach(b => {
      // Guard: skip billboards without valid numeric coordinates
      const lat = typeof b.lat === 'number' ? b.lat : parseFloat(b.lat);
      const lng = typeof b.lng === 'number' ? b.lng : parseFloat(b.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      const isActive = selected?.id === b.id;
      const marker = L.marker([lat, lng], { icon: makePin(isActive), zIndexOffset: isActive ? 1000 : 0 })
        .addTo(map);

      marker.on("click", () => onSelect(selected?.id === b.id ? null : b));

      marker.bindPopup(
        L.popup({
          maxWidth: 270, minWidth: 230,
          className: "horizon-popup",
          closeButton: false,
          offset: [0, -6],
        }).setContent(`
          <div style="font-family:'Inter',sans-serif">
            <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${RED};margin:0 0 4px">${b.type}</p>
            <p style="font-size:14px;font-weight:800;color:${NAVY};margin:0 0 4px;line-height:1.2">${b.name}</p>
            <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 10px">${b.district}, ${b.city}</p>
            <div style="display:flex;gap:14px;margin-bottom:12px">
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Traffic</p>
                <p style="font-size:12px;font-weight:700;color:${NAVY};margin:0">${(b.traffic ?? '').split(' ').slice(0,2).join(' ') || '—'}</p></div>
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
                <p style="font-size:12px;font-weight:700;color:${NAVY};margin:0">${b.size}</p></div>
            </div>
            <a href="/locations/${b.citySlug}/billboards/${b.slug}"
              style="display:block;text-align:center;background:${RED};color:#fff;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:9px 0;text-decoration:none">
              View Details →
            </a>
          </div>`)
      );
      marker.on("click", () => marker.openPopup());
      markersRef.current.push(marker);
    });

    // Fit map to filtered results
    const validFiltered = filtered.filter(b => {
      const lat = typeof b.lat === 'number' ? b.lat : parseFloat(b.lat);
      const lng = typeof b.lng === 'number' ? b.lng : parseFloat(b.lng);
      return !isNaN(lat) && !isNaN(lng);
    });
    if (validFiltered.length > 0 && validFiltered.length < allCount) {
      map.fitBounds(L.latLngBounds(validFiltered.map(b => {
        const lat = typeof b.lat === 'number' ? b.lat : parseFloat(String(b.lat));
        const lng = typeof b.lng === 'number' ? b.lng : parseFloat(String(b.lng));
        return [lat, lng] as [number, number];
      })), { padding: [50, 50], maxZoom: 13 });
    } else if (filtered.length === allCount) {
      map.setView([30.0444, 31.2357], 7);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selected]);

  return (
    <>
      <div ref={divRef} className={className} style={style} />

      {/* Legend chip */}
      <div className="absolute bottom-5 left-5 z-[1000] flex items-center gap-2 pointer-events-none"
        style={{ background: WHITE, padding: "7px 13px", boxShadow: "0 2px 16px rgba(11,15,26,0.14)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 32 40">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
            C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill={NAVY}/>
          <circle cx="16" cy="16" r="6" fill={RED}/>
        </svg>
        <span className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: NAVY }}>
          Billboard Location
        </span>
      </div>

      {/* Popup styles */}
      <style>{`
        .horizon-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important; padding: 0 !important;
          overflow: hidden; box-shadow: 0 8px 36px rgba(11,15,26,.2) !important; border: none !important;
        }
        .horizon-popup .leaflet-popup-content { margin: 14px !important; }
        .horizon-popup .leaflet-popup-tip-container { display: none; }
      `}</style>
    </>
  );
}
