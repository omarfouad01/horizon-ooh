/**
 * ProductMap — single-billboard pin map for the Product detail page.
 * Uses Leaflet, centred and zoomed on one coordinate.
 */
import { useEffect, useRef } from "react";
import L from "leaflet";

const NAVY  = "#0B0F1A";
const RED   = "#D90429";
const WHITE = "#FFFFFF";

function makeSinglePin() {
  return L.divIcon({
    html: `
      <div style="position:relative;width:40px;height:52px;filter:drop-shadow(0 4px 12px rgba(11,15,26,.45))">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 13.255 18.333 30.6 19.24 31.478a1.1 1.1 0 0 0 1.52 0
            C21.667 50.6 40 33.255 40 20 40 8.954 31.046 0 20 0z" fill="${RED}"/>
          <circle cx="20" cy="20" r="8" fill="${WHITE}"/>
          <circle cx="20" cy="20" r="4" fill="${RED}"/>
        </svg>
        <!-- Pulse ring -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-130%);
          width:40px;height:40px;border-radius:50%;
          border:2px solid ${RED};opacity:.35;
          animation:pinPulse 2s ease-out infinite">
        </div>
      </div>`,
    className: "",
    iconSize:    [40, 52],
    iconAnchor:  [20, 52],
    popupAnchor: [0, -58],
  });
}

interface Props {
  lat:      number;
  lng:      number;
  name:     string;
  type:     string;
  district: string;
  city:     string;
  traffic:  string;
  size:     string;
  className?: string;
  style?:   React.CSSProperties;
}

export default function ProductMap({ lat, lng, name, type, district, city, traffic, size, className, style }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const map = L.map(divRef.current, {
      center:           [lat, lng],
      zoom:             16,
      zoomControl:      false,
      attributionControl: false,
      scrollWheelZoom:  false,   // disabled by default — activate on click/focus
    });

    // Cartography — light minimal style consistent with homepage map
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Controls
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Single pin
    const marker = L.marker([lat, lng], { icon: makeSinglePin(), zIndexOffset: 1000 }).addTo(map);

    // Auto-open popup
    marker.bindPopup(
      L.popup({
        maxWidth: 260, minWidth: 220,
        className: "horizon-product-popup",
        closeButton: true,
        offset: [0, -8],
        autoClose: false,
        closeOnClick: false,
      }).setContent(`
        <div style="font-family:'Inter',sans-serif;padding:2px">
          <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${RED};margin:0 0 5px">${type}</p>
          <p style="font-size:15px;font-weight:800;color:${NAVY};margin:0 0 3px;line-height:1.15">${name}</p>
          <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 12px">${district}, ${city}</p>
          <div style="display:flex;gap:16px;border-top:1px solid rgba(11,15,26,.07);padding-top:10px">
            <div>
              <p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Daily Traffic</p>
              <p style="font-size:12px;font-weight:700;color:${NAVY};margin:0">${traffic.split(" ").slice(0,2).join(" ")}</p>
            </div>
            <div>
              <p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
              <p style="font-size:12px;font-weight:700;color:${NAVY};margin:0">${size}</p>
            </div>
          </div>
        </div>`)
    );
    marker.openPopup();

    // Enable scroll zoom only when map is focused
    map.on("click",    () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={divRef} className={className} style={style} />

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pinPulse {
          0%   { transform: translate(-50%, -130%) scale(1);   opacity: .35; }
          70%  { transform: translate(-50%, -130%) scale(2.2); opacity: 0;   }
          100% { transform: translate(-50%, -130%) scale(1);   opacity: 0;   }
        }
        .horizon-product-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important;
          padding: 14px !important;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(11,15,26,.2) !important;
          border: none !important;
        }
        .horizon-product-popup .leaflet-popup-content { margin: 0 !important; }
        .horizon-product-popup .leaflet-popup-tip-container { display: none; }
        .horizon-product-popup .leaflet-popup-close-button {
          top: 8px !important; right: 8px !important;
          color: rgba(11,15,26,.3) !important; font-size: 16px !important;
        }
        .horizon-product-popup .leaflet-popup-close-button:hover { color: ${RED} !important; }
      `}</style>
    </>
  );
}
