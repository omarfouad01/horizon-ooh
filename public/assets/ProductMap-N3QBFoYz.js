import{r as s,j as i}from"./react-core-CinYyM6B.js";import{u as T,n as d,o as C}from"./index-CGRooo4t.js";import{L as e}from"./leaflet-BQFJiSzX.js";import{ensureLeafletCss as F}from"./BillboardMap-C1SkVJRc.js";import"./router-bZzok1W7.js";import"./i18n-n82oFGzX.js";import"./site-data-DxKVQzcS.js";import"./app-core-exbkQ68p.js";import"./data-layer-DbRIsQj-.js";import"./icons-Bl7QE20W.js";import"./framer-motion-CIlRwrVA.js";const l="#0B0F1A",p="#D90429",A="#FFFFFF";function P(){return e.divIcon({html:`
      <div style="position:relative;width:40px;height:52px;filter:drop-shadow(0 4px 12px rgba(11,15,26,.45))">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 13.255 18.333 30.6 19.24 31.478a1.1 1.1 0 0 0 1.52 0
            C21.667 50.6 40 33.255 40 20 40 8.954 31.046 0 20 0z" fill="${p}"/>
          <circle cx="20" cy="20" r="8" fill="${A}"/>
          <circle cx="20" cy="20" r="4" fill="${p}"/>
        </svg>
        <!-- Pulse ring -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-130%);
          width:40px;height:40px;border-radius:50%;
          border:2px solid ${p};opacity:.35;
          animation:pinPulse 2s ease-out infinite">
        </div>
      </div>`,className:"",iconSize:[40,52],iconAnchor:[20,52],popupAnchor:[0,-58]})}function B({lat:c,lng:m,name:r="",type:x="",district:g="",city:h="",traffic:b="",size:y="",className:z,style:w}){const{isAr:o}=T(),v=t=>o?C(t):t,n=s.useRef(null),a=s.useRef(null);return s.useEffect(()=>{if(F(),!n.current||a.current)return;const t=e.map(n.current,{center:[c,m],zoom:16,zoomControl:!1,attributionControl:!1,scrollWheelZoom:!1});e.control.attribution({prefix:!1}).addTo(t),e.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:o?'&copy; <a href="https://www.openstreetmap.org/copyright">مساهمو أوبن ستريت ماب</a>':'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(t),e.control.zoom({position:"bottomright",zoomInTitle:o?"تكبير":"Zoom in",zoomOutTitle:o?"تصغير":"Zoom out"}).addTo(t),o&&t.on("popupopen",({popup:$})=>{const f=$.getElement()?.querySelector(".leaflet-popup-close-button");f?.setAttribute("aria-label","إغلاق التفاصيل"),f?.setAttribute("title","إغلاق التفاصيل")});const u=e.marker([c,m],{icon:P(),zIndexOffset:1e3,title:o?d(r):r,alt:o?d(r):r}).addTo(t);return u.bindPopup(e.popup({maxWidth:260,minWidth:220,className:"horizon-product-popup",closeButton:!0,offset:[0,-8],autoClose:!1,closeOnClick:!1}).setContent(v(`
        <div style="font-family:'Inter',sans-serif;padding:2px">
          <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${p};margin:0 0 5px">${x}</p>
          <p style="font-size:15px;font-weight:800;color:${l};margin:0 0 3px;line-height:1.15">${r}</p>
          <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 12px">${g}, ${h}</p>
          <div style="display:flex;gap:16px;border-top:1px solid rgba(11,15,26,.07);padding-top:10px">
            <div>
              <p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Daily Traffic</p>
              <p style="font-size:12px;font-weight:700;color:${l};margin:0">${(b||"").split(" ").slice(0,2).join(" ")||"—"}</p>
            </div>
            <div>
              <p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
              <p style="font-size:12px;font-weight:700;color:${l};margin:0">${y}</p>
            </div>
          </div>
        </div>`))),u.openPopup(),t.on("click",()=>t.scrollWheelZoom.enable()),t.on("mouseout",()=>t.scrollWheelZoom.disable()),a.current=t,()=>{t.remove(),a.current=null}},[o]),i.jsxs(i.Fragment,{children:[i.jsx("div",{ref:n,className:z,style:w}),i.jsx("style",{children:`
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
        .horizon-product-popup .leaflet-popup-close-button:hover { color: ${p} !important; }
      `})]})}export{B as default};
