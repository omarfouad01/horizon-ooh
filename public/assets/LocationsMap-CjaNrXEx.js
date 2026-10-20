import{r as c,j as d}from"./react-core-CinYyM6B.js";import{u as T,n as $,o as M}from"./index-CtGq6b4Y.js";import{L as u}from"./leaflet-BQFJiSzX.js";import{ensureLeafletCss as R}from"./BillboardMap-dxqx3f4f.js";import"./router-bZzok1W7.js";import"./i18n-CIkWp0Gh.js";import"./site-data-DxKVQzcS.js";import"./app-core-exbkQ68p.js";import"./data-layer-DbRIsQj-.js";import"./icons-Bl7QE20W.js";import"./framer-motion-CIlRwrVA.js";const x="#0B0F1A",v="#D90429",j="#FFFFFF";function w(e){const g=e==="active"?v:e==="hover"?"#1a2035":x,i=e==="active"?j:v,r=e==="active"?34:28,h=e==="active"?17:14;return u.divIcon({html:`<svg xmlns="http://www.w3.org/2000/svg" width="${r}" height="${Math.round(r*1.28)}" viewBox="0 0 32 40"
        style="filter:drop-shadow(0 3px 8px rgba(11,15,26,.35));transition:all .2s">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.222 23.156 15.259 24.114a1 1 0 0 0 1.482 0
        C17.778 39.156 32 26.293 32 16 32 7.163 24.837 0 16 0z" fill="${g}"/>
      <circle cx="16" cy="16" r="6" fill="${i}"/>
    </svg>`,className:"",iconSize:[r,Math.round(r*1.28)],iconAnchor:[h,Math.round(r*1.28)],popupAnchor:[0,-Math.round(r*1.28)-4]})}function V({billboards:e,hoveredId:g,selectedId:i,onHover:r,onSelect:h,className:N,style:F}){const{isAr:l}=T(),E=o=>l?M(o):o,y=c.useRef(null),m=c.useRef(null),f=c.useRef(new Map);return c.useEffect(()=>{if(R(),!y.current||m.current)return;const o=u.map(y.current,{center:[30.0444,31.2357],zoom:7,zoomControl:!1,attributionControl:!1});return u.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(o),u.control.zoom({position:"bottomright",zoomInTitle:l?"تكبير":"Zoom in",zoomOutTitle:l?"تصغير":"Zoom out"}).addTo(o),m.current=o,()=>{o.remove(),m.current=null,f.current.clear()}},[l]),c.useEffect(()=>{const o=m.current;if(!o)return;const a=new Set(e.map(t=>t.id));if(f.current.forEach((t,s)=>{a.has(s)||(t.remove(),f.current.delete(s))}),e.forEach(t=>{if(f.current.has(t.id))return;const s=typeof t.lat=="number"?t.lat:parseFloat(t.lat),n=typeof t.lng=="number"?t.lng:parseFloat(t.lng);if(isNaN(s)||isNaN(n)||s===0||n===0)return;const p=u.marker([s,n],{icon:w("default"),title:l?$(`${t.name} — ${t.city}`):`${t.name} — ${t.city}`,alt:l?$(t.name):t.name}).addTo(o);p.on("mouseover",()=>r(t.id)),p.on("mouseout",()=>r(null)),p.on("click",()=>h(i===t.id?null:t.id)),p.bindTooltip(E(`
        <div style="font-family:'Inter',sans-serif;padding:2px">
          <p style="font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${v};margin:0 0 3px">${t.type}</p>
          <p style="font-size:13px;font-weight:800;color:${x};margin:0 0 2px;line-height:1.2">${t.name}</p>
          <p style="font-size:10px;color:rgba(11,15,26,.4);margin:0 0 8px">${t.district}, ${t.city}</p>
          <div style="display:flex;gap:12px">
            <div><p style="font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 1px">Traffic</p>
              <p style="font-size:11px;font-weight:700;color:${x};margin:0">${(t.traffic||"").split(" ").slice(0,2).join(" ")||"—"}</p></div>
            <div><p style="font-size:7px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(11,15,26,.3);margin:0 0 1px">Size</p>
              <p style="font-size:11px;font-weight:700;color:${x};margin:0">${t.size}</p></div>
          </div>
        </div>`),{permanent:!1,direction:"top",className:"loc-map-tooltip",offset:[0,-4]}),f.current.set(t.id,p)}),e.length>0){const t=e.filter(n=>{const p=typeof n.lat=="number"?n.lat:parseFloat(n.lat),z=typeof n.lng=="number"?n.lng:parseFloat(n.lng);return!isNaN(p)&&!isNaN(z)&&(p!==0||z!==0)});if(t.length===0)return;const s=u.latLngBounds(t.map(n=>[n.lat,n.lng]));o.fitBounds(s,{padding:[48,48],maxZoom:14,animate:!0})}},[e,l]),c.useEffect(()=>{f.current.forEach((o,a)=>{const t=a===i?"active":a===g?"hover":"default";o.setIcon(w(t)),o.setZIndexOffset(t!=="default"?1e3:0)})},[g,i]),c.useEffect(()=>{if(!i||!m.current)return;const o=e.find(a=>a.id===i);if(o){const a=typeof o.lat=="number"?o.lat:parseFloat(o.lat),t=typeof o.lng=="number"?o.lng:parseFloat(o.lng);!isNaN(a)&&!isNaN(t)&&m.current.panTo([a,t],{animate:!0,duration:.5})}},[i,e]),d.jsxs(d.Fragment,{children:[d.jsx("div",{ref:y,className:N,style:F}),d.jsx("style",{children:`
        .loc-map-tooltip {
          background: white !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: 0 6px 32px rgba(11,15,26,.18) !important;
          padding: 12px 14px !important;
        }
        .loc-map-tooltip::before { display: none !important; }
        .leaflet-tooltip-top.loc-map-tooltip::before { display: none !important; }
      `})]})}export{V as default};
