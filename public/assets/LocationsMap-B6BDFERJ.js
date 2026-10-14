import{r as l,j as g}from"./react-core-CinYyM6B.js";import{L as m}from"./leaflet-BQFJiSzX.js";import{ensureLeafletCss as N}from"./BillboardMap-BodQDkUt.js";import"./router-bZzok1W7.js";const d="#0B0F1A",y="#D90429",F="#FFFFFF";function w(o){const u=o==="active"?y:o==="hover"?"#1a2035":d,i=o==="active"?F:y,r=o==="active"?34:28,x=o==="active"?17:14;return m.divIcon({html:`<svg xmlns="http://www.w3.org/2000/svg" width="${r}" height="${Math.round(r*1.28)}" viewBox="0 0 32 40"
        style="filter:drop-shadow(0 3px 8px rgba(11,15,26,.35));transition:all .2s">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${u}"/>
      <circle cx="16" cy="16" r="6" fill="${i}"/>
    </svg>`,className:"",iconSize:[r,Math.round(r*1.28)],iconAnchor:[x,Math.round(r*1.28)],popupAnchor:[0,-Math.round(r*1.28)-4]})}function j({billboards:o,hoveredId:u,selectedId:i,onHover:r,onSelect:x,className:z,style:$}){const h=l.useRef(null),c=l.useRef(null),f=l.useRef(new Map);return l.useEffect(()=>{if(N(),!h.current||c.current)return;const e=m.map(h.current,{center:[30.0444,31.2357],zoom:7,zoomControl:!1,attributionControl:!1});return m.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(e),m.control.zoom({position:"bottomright"}).addTo(e),c.current=e,()=>{e.remove(),c.current=null,f.current.clear()}},[]),l.useEffect(()=>{const e=c.current;if(!e)return;const a=new Set(o.map(t=>t.id));if(f.current.forEach((t,s)=>{a.has(s)||(t.remove(),f.current.delete(s))}),o.forEach(t=>{if(f.current.has(t.id))return;const s=typeof t.lat=="number"?t.lat:parseFloat(t.lat),n=typeof t.lng=="number"?t.lng:parseFloat(t.lng);if(isNaN(s)||isNaN(n)||s===0||n===0)return;const p=m.marker([s,n],{icon:w("default"),title:`${t.name} — ${t.city}`,alt:t.name}).addTo(e);p.on("mouseover",()=>r(t.id)),p.on("mouseout",()=>r(null)),p.on("click",()=>x(i===t.id?null:t.id)),p.bindTooltip(`
        <div style="font-family:'Inter',sans-serif;padding:2px">
          <p style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${y};margin:0 0 3px">${t.type}</p>
          <p style="font-size:13px;font-weight:800;color:${d};margin:0 0 2px;line-height:1.2">${t.name}</p>
          <p style="font-size:10px;color:rgba(11,15,26,.4);margin:0 0 8px">${t.district}, ${t.city}</p>
          <div style="display:flex;gap:12px">
            <div><p style="font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 1px">Traffic</p>
              <p style="font-size:11px;font-weight:700;color:${d};margin:0">${(t.traffic||"").split(" ").slice(0,2).join(" ")||"—"}</p></div>
            <div><p style="font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 1px">Size</p>
              <p style="font-size:11px;font-weight:700;color:${d};margin:0">${t.size}</p></div>
          </div>
        </div>`,{permanent:!1,direction:"top",className:"loc-map-tooltip",offset:[0,-4]}),f.current.set(t.id,p)}),o.length>0){const t=o.filter(n=>{const p=typeof n.lat=="number"?n.lat:parseFloat(n.lat),v=typeof n.lng=="number"?n.lng:parseFloat(n.lng);return!isNaN(p)&&!isNaN(v)&&(p!==0||v!==0)});if(t.length===0)return;const s=m.latLngBounds(t.map(n=>[n.lat,n.lng]));e.fitBounds(s,{padding:[48,48],maxZoom:14,animate:!0})}},[o]),l.useEffect(()=>{f.current.forEach((e,a)=>{const t=a===i?"active":a===u?"hover":"default";e.setIcon(w(t)),e.setZIndexOffset(t!=="default"?1e3:0)})},[u,i]),l.useEffect(()=>{if(!i||!c.current)return;const e=o.find(a=>a.id===i);if(e){const a=typeof e.lat=="number"?e.lat:parseFloat(e.lat),t=typeof e.lng=="number"?e.lng:parseFloat(e.lng);!isNaN(a)&&!isNaN(t)&&c.current.panTo([a,t],{animate:!0,duration:.5})}},[i,o]),g.jsxs(g.Fragment,{children:[g.jsx("div",{ref:h,className:z,style:$}),g.jsx("style",{children:`
        .loc-map-tooltip {
          background: white !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: 0 6px 32px rgba(11,15,26,.18) !important;
          padding: 12px 14px !important;
        }
        .loc-map-tooltip::before { display: none !important; }
        .leaflet-tooltip-top.loc-map-tooltip::before { display: none !important; }
      `})]})}export{j as default};
