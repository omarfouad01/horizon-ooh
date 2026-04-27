import{r as s,j as r}from"./react-core-D-bXyxDN.js";import{L as i}from"./leaflet-DcPNEzH4.js";import{a as y}from"./router-B51QJzbE.js";const p="#0B0F1A",l="#D90429",x="#FFFFFF";delete i.Icon.Default.prototype._getIconUrl;i.Icon.Default.mergeOptions({iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});function v(o=!1){const c=o?l:p,n=o?x:l;return i.divIcon({html:`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${c}"/>
      <circle cx="16" cy="16" r="6" fill="${n}"/>
    </svg>`,className:"",iconSize:[28,36],iconAnchor:[14,36],popupAnchor:[0,-40]})}function j({filtered:o,allCount:c,selected:n,onSelect:d,className:h,style:w}){y();const m=s.useRef(null),f=s.useRef(null),g=s.useRef([]);return s.useEffect(()=>{if(!m.current||f.current)return;const e=i.map(m.current,{center:[30.0444,31.2357],zoom:7,zoomControl:!1,attributionControl:!1});return i.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(e),i.control.zoom({position:"bottomright"}).addTo(e),f.current=e,()=>{e.remove(),f.current=null}},[]),s.useEffect(()=>{const e=f.current;e&&(g.current.forEach(t=>t.remove()),g.current=[],o.forEach(t=>{const u=(n==null?void 0:n.id)===t.id,a=i.marker([t.lat,t.lng],{icon:v(u),zIndexOffset:u?1e3:0}).addTo(e);a.on("click",()=>d((n==null?void 0:n.id)===t.id?null:t)),a.bindPopup(i.popup({maxWidth:270,minWidth:230,className:"horizon-popup",closeButton:!1,offset:[0,-6]}).setContent(`
          <div style="font-family:'Inter',sans-serif">
            <p style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${l};margin:0 0 4px">${t.type}</p>
            <p style="font-size:14px;font-weight:800;color:${p};margin:0 0 4px;line-height:1.2">${t.name}</p>
            <p style="font-size:11px;color:rgba(11,15,26,.4);margin:0 0 10px">${t.district}, ${t.city}</p>
            <div style="display:flex;gap:14px;margin-bottom:12px">
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Traffic</p>
                <p style="font-size:12px;font-weight:700;color:${p};margin:0">${(t.traffic??"").split(" ").slice(0,2).join(" ")||"—"}</p></div>
              <div><p style="font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 2px">Size</p>
                <p style="font-size:12px;font-weight:700;color:${p};margin:0">${t.size}</p></div>
            </div>
            <a href="/locations/${t.citySlug}/billboards/${t.slug}"
              style="display:block;text-align:center;background:${l};color:#fff;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:9px 0;text-decoration:none">
              View Details →
            </a>
          </div>`)),a.on("click",()=>a.openPopup()),g.current.push(a)}),o.length>0&&o.length<c?e.fitBounds(i.latLngBounds(o.map(t=>[t.lat,t.lng])),{padding:[50,50],maxZoom:13}):o.length===c&&e.setView([30.0444,31.2357],7))},[o,n]),r.jsxs(r.Fragment,{children:[r.jsx("div",{ref:m,className:h,style:w}),r.jsxs("div",{className:"absolute bottom-5 left-5 z-[1000] flex items-center gap-2 pointer-events-none",style:{background:x,padding:"7px 13px",boxShadow:"0 2px 16px rgba(11,15,26,0.14)"},children:[r.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 32 40",children:[r.jsx("path",{d:`M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
            C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z`,fill:p}),r.jsx("circle",{cx:"16",cy:"16",r:"6",fill:l})]}),r.jsx("span",{className:"text-[9px] font-bold tracking-[0.22em] uppercase",style:{color:p},children:"Billboard Location"})]}),r.jsx("style",{children:`
        .horizon-popup .leaflet-popup-content-wrapper {
          border-radius: 0 !important; padding: 0 !important;
          overflow: hidden; box-shadow: 0 8px 36px rgba(11,15,26,.2) !important; border: none !important;
        }
        .horizon-popup .leaflet-popup-content { margin: 14px !important; }
        .horizon-popup .leaflet-popup-tip-container { display: none; }
      `})]})}export{j as default};
