import L from 'leaflet';

/** Shared satellite view for public maps and the dashboard location picker. */
export function addMapBasemaps(
  map: L.Map,
  { isAr, collapsed = true }: { isAr?: boolean; collapsed?: boolean } = {},
) {
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxNativeZoom: 19, maxZoom: 21, detectRetina: false,
  });
  const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: isAr
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">مساهمو أوبن ستريت ماب</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19, detectRetina: false,
  });
  const roadLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Roads &copy; Esri, HERE, Garmin, OpenStreetMap contributors',
    minZoom: 16, maxNativeZoom: 19, maxZoom: 21, opacity: 0.55,
    pane: 'overlayPane', detectRetina: false,
  });
  const placeLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Place labels &copy; Esri and contributors',
    maxNativeZoom: 19, maxZoom: 21, pane: 'overlayPane', detectRetina: false,
  });

  // Labels belong to the satellite basemap and leave with it when switching.
  const hybrid = L.layerGroup([satellite, roadLabels, placeLabels]).addTo(map);
  const hybridName = isAr === undefined ? 'Satellite + labels / أقمار صناعية وأسماء' : isAr ? 'أقمار صناعية وأسماء' : 'Satellite + labels';
  const streetsName = isAr === undefined ? 'Streets / الشوارع' : isAr ? 'الشوارع' : 'Streets';
  const control = L.control.layers({ [hybridName]: hybrid, [streetsName]: streets }, undefined, {
    position: 'topright', collapsed,
  }).addTo(map);
  const toggle = control.getContainer()?.querySelector<HTMLAnchorElement>('.leaflet-control-layers-toggle');
  toggle?.setAttribute('title', isAr ? 'طبقات الخريطة' : 'Map layers');
  toggle?.setAttribute('aria-label', isAr ? 'طبقات الخريطة' : 'Map layers');
  if (toggle && collapsed) {
    // The shared Leaflet CSS is injected from a lazy chunk: use an inline icon
    // instead of a relative layers.png URL that breaks on nested page URLs.
    toggle.style.backgroundImage = 'none';
    toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" style="width:100%;height:100%;padding:7px;box-sizing:border-box;pointer-events:none" fill="none" stroke="#0B0F1A" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="m12 3-9 5 9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></svg>';
  }
  return { hybrid, streets, roadLabels, placeLabels, control };
}
