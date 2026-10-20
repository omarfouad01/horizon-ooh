import{r as f,j as n}from"./react-core-CinYyM6B.js";import{u as j,n as w,o as k,a as C}from"./index-CEqLIoog.js";import{u as T}from"./router-bZzok1W7.js";import{L as a,l as E}from"./leaflet-BQFJiSzX.js";import"./i18n-CIkWp0Gh.js";import"./site-data-DxKVQzcS.js";import"./app-core-exbkQ68p.js";import"./data-layer-DbRIsQj-.js";import"./icons-Bl7QE20W.js";import"./framer-motion-CIlRwrVA.js";function R(){if(typeof document>"u"||document.querySelector("style[data-leaflet-css]"))return;const o=document.createElement("style");o.setAttribute("data-leaflet-css","1"),o.textContent=E+`
.leaflet-control-zoom a { width:44px; height:44px; line-height:44px; }`,document.head.appendChild(o)}const s="#0B0F1A",m="#D90429",z="#FFFFFF";delete a.Icon.Default.prototype._getIconUrl;function L(o=!1){const u=o?m:s,l=o?z:m;return a.divIcon({html:`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" style="position:absolute;left:8px;top:4px" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${u}"/>
      <circle cx="16" cy="16" r="6" fill="${l}"/>
    </svg>`,className:"",iconSize:[44,44],iconAnchor:[22,40],popupAnchor:[0,-40]})}function P({filtered:o,allCount:u,selected:l,onSelect:v,className:$,style:F}){const{isAr:r}=j(),N=e=>r?k(e):e;T();const g=f.useRef(null),d=f.useRef(null),x=f.useRef([]);return f.useEffect(()=>{if(R(),!g.current||d.current)return;const e=a.map(g.current,{center:[30.0444,31.2357],zoom:7,zoomControl:!1,attributionControl:!1});return a.control.attribution({prefix:!1}).addTo(e),a.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:r?'&copy; <a href="https://www.openstreetmap.org/copyright">مساهمو أوبن ستريت ماب</a>':'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',detectRetina:!1}).addTo(e),a.control.zoom({position:"bottomright",zoomInTitle:r?"تكبير":"Zoom in",zoomOutTitle:r?"تصغير":"Zoom out"}).addTo(e),d.current=e,()=>{e.remove(),d.current=null}},[r]),f.useEffect(()=>{const e=d.current;if(!e)return;x.current.forEach(t=>t.remove()),x.current=[],o.forEach(t=>{const i=typeof t.lat=="number"?t.lat:parseFloat(t.lat),p=typeof t.lng=="number"?t.lng:parseFloat(t.lng);if(isNaN(i)||isNaN(p))return;const y=l?.id===t.id,c=a.marker([i,p],{icon:L(y),zIndexOffset:y?1e3:0,title:r?w(`${t.name} — ${t.city}`):`${t.name} — ${t.city}`,alt:r?w(t.name):t.name}).addTo(e);c.on("click",()=>v(l?.id===t.id?null:t)),c.bindPopup(a.popup({maxWidth:270,minWidth:230,className:"horizon-popup",closeButton:!1,offset:[0,-6]}).setContent(N(`
          <div style="font-family:'Inter',sans-serif">
            <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${m};margin:0 0 4px">${t.type}</p>
            <p style="font-size:14px;font-weight:800;color:${s};margin:0 0 4px;line-height:1.2">${t.name}</p>
            <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 10px">${t.district}, ${t.city}</p>
            <div style="display:flex;gap:14px;margin-bottom:12px">
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Traffic</p>
                <p style="font-size:12px;font-weight:700;color:${s};margin:0">${(t.traffic??"").split(" ").slice(0,2).join(" ")||"—"}</p></div>
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
                <p style="font-size:12px;font-weight:700;color:${s};margin:0">${t.size}</p></div>
            </div>
            <a href="${r?"/ar":""}/locations/${t.citySlug}/billboards/${t.slug}"
              style="display:block;text-align:center;background:${m};color:#fff;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:9px 0;text-decoration:none">
              View Details →
            </a>
          </div>`))),c.on("click",()=>c.openPopup()),x.current.push(c)});const h=o.filter(t=>{const i=typeof t.lat=="number"?t.lat:parseFloat(t.lat),p=typeof t.lng=="number"?t.lng:parseFloat(t.lng);return!isNaN(i)&&!isNaN(p)});h.length>0&&h.length<u?e.fitBounds(a.latLngBounds(h.map(t=>{const i=typeof t.lat=="number"?t.lat:parseFloat(String(t.lat)),p=typeof t.lng=="number"?t.lng:parseFloat(String(t.lng));return[i,p]})),{padding:[50,50],maxZoom:13}):o.length===u&&e.setView([30.0444,31.2357],7)},[o,l,r]),n.jsxs(n.Fragment,{children:[n.jsx("div",{ref:g,className:$,style:F}),n.jsxs("div",{className:"absolute bottom-5 left-5 z-[1000] flex items-center gap-2 pointer-events-none",style:{background:z,padding:"7px 13px",boxShadow:"0 2px 16px rgba(11,15,26,0.14)"},children:[n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 32 40",children:[n.jsx("path",{d:`M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
            C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z`,fill:s}),n.jsx("circle",{cx:"16",cy:"16",r:"6",fill:m})]}),n.jsx("span",{className:"text-[9px] font-bold tracking-[0.22em] uppercase",style:{color:s},children:n.jsx(C,{children:"Billboard Location"})})]}),n.jsx("style",{children:`
        .horizon-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important; padding: 0 !important;
          overflow: hidden; box-shadow: 0 8px 36px rgba(11,15,26,.2) !important; border: none !important;
        }
        .horizon-popup .leaflet-popup-content { margin: 14px !important; }
        .horizon-popup .leaflet-popup-tip-container { display: none; }
      `})]})}export{P as default,R as ensureLeafletCss};
