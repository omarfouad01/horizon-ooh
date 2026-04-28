import{r as n,j as r}from"./react-core-D-bXyxDN.js";import{L as t}from"./leaflet-DcPNEzH4.js";const a="#0B0F1A",e="#D90429",v="#FFFFFF";function b(){return t.divIcon({html:`
      <div style="position:relative;width:40px;height:52px;filter:drop-shadow(0 4px 12px rgba(11,15,26,.45))">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 13.255 18.333 30.6 19.24 31.478a1.1 1.1 0 0 0 1.52 0
            C21.667 50.6 40 33.255 40 20 40 8.954 31.046 0 20 0z" fill="${e}"/>
          <circle cx="20" cy="20" r="8" fill="${v}"/>
          <circle cx="20" cy="20" r="4" fill="${e}"/>
        </svg>
        <!-- Pulse ring -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-130%);
          width:40px;height:40px;border-radius:50%;
          border:2px solid ${e};opacity:.35;
          animation:pinPulse 2s ease-out infinite">
        </div>
      </div>`,className:"",iconSize:[40,52],iconAnchor:[20,52],popupAnchor:[0,-58]})}function $({lat:s,lng:l,name:d,type:f,district:m,city:u,traffic:x,size:h,className:g,style:y}){const p=n.useRef(null),i=n.useRef(null);return n.useEffect(()=>{if(!p.current||i.current)return;const o=t.map(p.current,{center:[s,l],zoom:16,zoomControl:!1,attributionControl:!1,scrollWheelZoom:!1});t.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(o),t.control.zoom({position:"bottomright"}).addTo(o);const c=t.marker([s,l],{icon:b(),zIndexOffset:1e3}).addTo(o);return c.bindPopup(t.popup({maxWidth:260,minWidth:220,className:"horizon-product-popup",closeButton:!0,offset:[0,-8],autoClose:!1,closeOnClick:!1}).setContent(`
        <div style="font-family:'Inter',sans-serif;padding:2px">
          <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${e};margin:0 0 5px">${f}</p>
          <p style="font-size:15px;font-weight:800;color:${a};margin:0 0 3px;line-height:1.15">${d}</p>
          <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 12px">${m}, ${u}</p>
          <div style="display:flex;gap:16px;border-top:1px solid rgba(11,15,26,.07);padding-top:10px">
            <div>
              <p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Daily Traffic</p>
              <p style="font-size:12px;font-weight:700;color:${a};margin:0">${x.split(" ").slice(0,2).join(" ")}</p>
            </div>
            <div>
              <p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
              <p style="font-size:12px;font-weight:700;color:${a};margin:0">${h}</p>
            </div>
          </div>
        </div>`)),c.openPopup(),o.on("click",()=>o.scrollWheelZoom.enable()),o.on("mouseout",()=>o.scrollWheelZoom.disable()),i.current=o,()=>{o.remove(),i.current=null}},[]),r.jsxs(r.Fragment,{children:[r.jsx("div",{ref:p,className:g,style:y}),r.jsx("style",{children:`
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
        .horizon-product-popup .leaflet-popup-close-button:hover { color: ${e} !important; }
      `})]})}export{$ as default};
