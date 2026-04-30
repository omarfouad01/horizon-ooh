import{r as c,j as e}from"./react-core-D-bXyxDN.js";import"./admin-DPfr-G5k.js";import{L as r}from"./leaflet-DcPNEzH4.js";import{a as k}from"./router-DwZDU_mQ.js";import"./utils-B2rm_Apj.js";import"./data-layer-Dd3l1QeK.js";const s="#0B0F1A",f="#D90429",y="#FFFFFF";delete r.Icon.Default.prototype._getIconUrl;r.Icon.Default.mergeOptions({iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});function F(i=!1){const m=i?f:s,o=i?y:f;return r.divIcon({html:`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${m}"/>
      <circle cx="16" cy="16" r="6" fill="${o}"/>
    </svg>`,className:"",iconSize:[28,36],iconAnchor:[14,36],popupAnchor:[0,-40]})}function I({filtered:i,allCount:m,selected:o,onSelect:w,className:v,style:z}){k();const u=c.useRef(null),g=c.useRef(null),d=c.useRef([]);return c.useEffect(()=>{if(!u.current||g.current)return;const n=r.map(u.current,{center:[30.0444,31.2357],zoom:7,zoomControl:!1,attributionControl:!1});return r.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(n),r.control.zoom({position:"bottomright"}).addTo(n),g.current=n,()=>{n.remove(),g.current=null}},[]),c.useEffect(()=>{const n=g.current;if(!n)return;d.current.forEach(t=>t.remove()),d.current=[],i.forEach(t=>{const a=typeof t.lat=="number"?t.lat:parseFloat(t.lat),p=typeof t.lng=="number"?t.lng:parseFloat(t.lng);if(isNaN(a)||isNaN(p))return;const h=(o==null?void 0:o.id)===t.id,l=r.marker([a,p],{icon:F(h),zIndexOffset:h?1e3:0}).addTo(n);l.on("click",()=>w((o==null?void 0:o.id)===t.id?null:t)),l.bindPopup(r.popup({maxWidth:270,minWidth:230,className:"horizon-popup",closeButton:!1,offset:[0,-6]}).setContent(`
          <div style="font-family:'Inter',sans-serif">
            <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${f};margin:0 0 4px">${t.type}</p>
            <p style="font-size:14px;font-weight:800;color:${s};margin:0 0 4px;line-height:1.2">${t.name}</p>
            <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 10px">${t.district}, ${t.city}</p>
            <div style="display:flex;gap:14px;margin-bottom:12px">
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Traffic</p>
                <p style="font-size:12px;font-weight:700;color:${s};margin:0">${(t.traffic??"").split(" ").slice(0,2).join(" ")||"—"}</p></div>
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
                <p style="font-size:12px;font-weight:700;color:${s};margin:0">${t.size}</p></div>
            </div>
            <a href="/locations/${t.citySlug}/billboards/${t.slug}"
              style="display:block;text-align:center;background:${f};color:#fff;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:9px 0;text-decoration:none">
              View Details →
            </a>
          </div>`)),l.on("click",()=>l.openPopup()),d.current.push(l)});const x=i.filter(t=>{const a=typeof t.lat=="number"?t.lat:parseFloat(t.lat),p=typeof t.lng=="number"?t.lng:parseFloat(t.lng);return!isNaN(a)&&!isNaN(p)});x.length>0&&x.length<m?n.fitBounds(r.latLngBounds(x.map(t=>{const a=typeof t.lat=="number"?t.lat:parseFloat(String(t.lat)),p=typeof t.lng=="number"?t.lng:parseFloat(String(t.lng));return[a,p]})),{padding:[50,50],maxZoom:13}):i.length===m&&n.setView([30.0444,31.2357],7)},[i,o]),e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:u,className:v,style:z}),e.jsxs("div",{className:"absolute bottom-5 left-5 z-[1000] flex items-center gap-2 pointer-events-none",style:{background:y,padding:"7px 13px",boxShadow:"0 2px 16px rgba(11,15,26,0.14)"},children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 32 40",children:[e.jsx("path",{d:`M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
            C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z`,fill:s}),e.jsx("circle",{cx:"16",cy:"16",r:"6",fill:f})]}),e.jsx("span",{className:"text-[9px] font-bold tracking-[0.22em] uppercase",style:{color:s},children:"Billboard Location"})]}),e.jsx("style",{children:`
        .horizon-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important; padding: 0 !important;
          overflow: hidden; box-shadow: 0 8px 36px rgba(11,15,26,.2) !important; border: none !important;
        }
        .horizon-popup .leaflet-popup-content { margin: 14px !important; }
        .horizon-popup .leaflet-popup-tip-container { display: none; }
      `})]})}export{I as default};
