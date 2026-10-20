import{r as c,j as n}from"./react-core-CinYyM6B.js";import{u as $}from"./router-bZzok1W7.js";import{L as r,l as F}from"./leaflet-BQFJiSzX.js";function N(){if(typeof document>"u"||document.querySelector("style[data-leaflet-css]"))return;const e=document.createElement("style");e.setAttribute("data-leaflet-css","1"),e.textContent=F+`
.leaflet-control-zoom a { width:44px; height:44px; line-height:44px; }`,document.head.appendChild(e)}const l="#0B0F1A",f="#D90429",y="#FFFFFF";delete r.Icon.Default.prototype._getIconUrl;function j(e=!1){const m=e?f:l,s=e?y:f;return r.divIcon({html:`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" style="position:absolute;left:8px;top:4px" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${m}"/>
      <circle cx="16" cy="16" r="6" fill="${s}"/>
    </svg>`,className:"",iconSize:[44,44],iconAnchor:[22,40],popupAnchor:[0,-40]})}function R({filtered:e,allCount:m,selected:s,onSelect:w,className:v,style:z}){$();const u=c.useRef(null),d=c.useRef(null),g=c.useRef([]);return c.useEffect(()=>{if(N(),!u.current||d.current)return;const o=r.map(u.current,{center:[30.0444,31.2357],zoom:7,zoomControl:!1,attributionControl:!1});return r.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19,detectRetina:!1}).addTo(o),r.control.zoom({position:"bottomright"}).addTo(o),d.current=o,()=>{o.remove(),d.current=null}},[]),c.useEffect(()=>{const o=d.current;if(!o)return;g.current.forEach(t=>t.remove()),g.current=[],e.forEach(t=>{const a=typeof t.lat=="number"?t.lat:parseFloat(t.lat),i=typeof t.lng=="number"?t.lng:parseFloat(t.lng);if(isNaN(a)||isNaN(i))return;const h=s?.id===t.id,p=r.marker([a,i],{icon:j(h),zIndexOffset:h?1e3:0,title:`${t.name} — ${t.city}`,alt:t.name}).addTo(o);p.on("click",()=>w(s?.id===t.id?null:t)),p.bindPopup(r.popup({maxWidth:270,minWidth:230,className:"horizon-popup",closeButton:!1,offset:[0,-6]}).setContent(`
          <div style="font-family:'Inter',sans-serif">
            <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${f};margin:0 0 4px">${t.type}</p>
            <p style="font-size:14px;font-weight:800;color:${l};margin:0 0 4px;line-height:1.2">${t.name}</p>
            <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 10px">${t.district}, ${t.city}</p>
            <div style="display:flex;gap:14px;margin-bottom:12px">
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Traffic</p>
                <p style="font-size:12px;font-weight:700;color:${l};margin:0">${(t.traffic??"").split(" ").slice(0,2).join(" ")||"—"}</p></div>
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
                <p style="font-size:12px;font-weight:700;color:${l};margin:0">${t.size}</p></div>
            </div>
            <a href="/locations/${t.citySlug}/billboards/${t.slug}"
              style="display:block;text-align:center;background:${f};color:#fff;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:9px 0;text-decoration:none">
              View Details →
            </a>
          </div>`)),p.on("click",()=>p.openPopup()),g.current.push(p)});const x=e.filter(t=>{const a=typeof t.lat=="number"?t.lat:parseFloat(t.lat),i=typeof t.lng=="number"?t.lng:parseFloat(t.lng);return!isNaN(a)&&!isNaN(i)});x.length>0&&x.length<m?o.fitBounds(r.latLngBounds(x.map(t=>{const a=typeof t.lat=="number"?t.lat:parseFloat(String(t.lat)),i=typeof t.lng=="number"?t.lng:parseFloat(String(t.lng));return[a,i]})),{padding:[50,50],maxZoom:13}):e.length===m&&o.setView([30.0444,31.2357],7)},[e,s]),n.jsxs(n.Fragment,{children:[n.jsx("div",{ref:u,className:v,style:z}),n.jsxs("div",{className:"absolute bottom-5 left-5 z-[1000] flex items-center gap-2 pointer-events-none",style:{background:y,padding:"7px 13px",boxShadow:"0 2px 16px rgba(11,15,26,0.14)"},children:[n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 32 40",children:[n.jsx("path",{d:`M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
            C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z`,fill:l}),n.jsx("circle",{cx:"16",cy:"16",r:"6",fill:f})]}),n.jsx("span",{className:"text-[9px] font-bold tracking-[0.22em] uppercase",style:{color:l},children:"Billboard Location"})]}),n.jsx("style",{children:`
        .horizon-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important; padding: 0 !important;
          overflow: hidden; box-shadow: 0 8px 36px rgba(11,15,26,.2) !important; border: none !important;
        }
        .horizon-popup .leaflet-popup-content { margin: 14px !important; }
        .horizon-popup .leaflet-popup-tip-container { display: none; }
      `})]})}export{R as default,N as ensureLeafletCss};
