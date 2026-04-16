// ─── HORIZON OOH — Complete Site Data ─────────────────────────────────────

// ─── Navigation ───────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Locations", href: "/locations" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ─── Projects / Case Studies ───────────────────────────────────────────────
export type ProjectCategory = "Billboard" | "DOOH" | "Mall" | "Airport";

export interface ProjectResult {
  metric: string;
  value: string;
  description: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  clientLogo?: string;
  clientIndustry?: string;
  clientDescription?: string;
  clientPageDescription?: string;
  campaignBrief?: string;
  location: string;
  city: string;
  category: ProjectCategory;
  tags: string[];
  year: string;
  duration: string;
  featured: boolean;
  coverImage: string;
  heroImage: string;
  galleryImages: string[];
  tagline: string;
  overview: string;
  objective: string;
  execution: string;
  results: ProjectResult[];
  keywords: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "vodafone-ring-road",
    slug: "vodafone-ring-road-cairo-billboard",
    title: "Vodafone Ring Road Domination",
    client: "Vodafone Egypt",
    location: "Ring Road, Cairo",
    city: "Cairo",
    category: "Billboard",
    tags: ["Billboard", "Cairo", "Telecom"],
    year: "2025",
    duration: "8 weeks",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1600&q=90&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=900&q=85&fit=crop",
      "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=900&q=85&fit=crop",
    ],
    tagline: "Owning Cairo's most-travelled road — 420,000 impressions daily.",
    overview:
      "Vodafone Egypt tasked HORIZON OOH with achieving maximum brand presence across Cairo's Ring Road ahead of a major national product launch. The campaign required coordinated multi-format outdoor execution across 14 premium locations along the northern and southern Ring Road corridors.",
    objective:
      "Achieve nationwide top-of-mind brand awareness for a new Vodafone tariff among 18–45 urban commuters in Cairo. Target minimum 3 million unique impressions within an 8-week window.",
    execution:
      "HORIZON OOH secured 14 consecutive unipole and mega-format billboard sites along the Ring Road — creating a visual corridor that followed the commuter from the Nasr City interchange to the Maadi exit. Creative was produced at 12×6m and 18×8m formats and illuminated 24/7 with LED backlighting. Each site was installed within a 72-hour window to ensure simultaneous campaign launch.",
    results: [
      { metric: "Daily Impressions", value: "420,000+", description: "Combined vehicle traffic across all 14 sites" },
      { metric: "Brand Recall Lift", value: "+180%", description: "Post-campaign unaided brand recall uplift" },
      { metric: "Campaign Visibility", value: "2.5×", description: "Increase in brand visibility vs. prior quarter" },
      { metric: "Unique Reach", value: "3.8M", description: "Unique individual commuters exposed in 8 weeks" },
    ],
    keywords: ["billboard advertising Cairo", "outdoor advertising Egypt", "Ring Road billboard", "advertising agency Egypt"],
  },
  {
    id: "cib-90th-street",
    slug: "cib-bank-new-cairo-dooh",
    title: "CIB Bank DOOH — 90th Street",
    client: "Commercial International Bank",
    location: "90th Street, New Cairo",
    city: "New Cairo",
    category: "DOOH",
    tags: ["DOOH", "New Cairo", "Finance"],
    year: "2025",
    duration: "6 weeks",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1600&q=90&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=900&q=85&fit=crop",
    ],
    tagline: "Real-time digital storytelling at Egypt's most affluent address.",
    overview:
      "CIB bank partnered with HORIZON OOH to deploy a premium digital out-of-home campaign across the 90th Street DOOH network — targeting New Cairo's high-net-worth residential and commercial audience with dynamic, daypart-scheduled creative.",
    objective:
      "Drive awareness and qualified leads for CIB's new premium banking product among New Cairo's affluent A1 demographic. Leverage DOOH's dynamic capabilities to deliver time-sensitive messaging and build frequency across a 6-week campaign.",
    execution:
      "HORIZON OOH deployed full-motion video creative across 8 high-brightness LED digital screens along the 90th Street corridor and Fifth Settlement commercial strip. Content was daypart-scheduled — premium business messaging during morning rush, lifestyle content in evenings. Creative updated weekly to maintain freshness and deliver phased product messaging.",
    results: [
      { metric: "Screens Deployed", value: "8", description: "Premium LED screens across 90th Street corridor" },
      { metric: "Daily Digital Impressions", value: "280,000+", description: "Across the full DOOH network" },
      { metric: "Engagement Rate", value: "+165%", description: "Lift vs. static billboard benchmark" },
      { metric: "Lead Quality Score", value: "4.2×", description: "Improvement in branch visit-to-lead ratio" },
    ],
    keywords: ["DOOH campaigns Cairo", "digital billboard New Cairo", "outdoor advertising Egypt"],
  },
  {
    id: "toyota-cairo-festival",
    slug: "toyota-cairo-festival-city-mall",
    title: "Toyota Launch — Cairo Festival City",
    client: "Toyota Egypt",
    location: "Cairo Festival City Mall",
    city: "Cairo",
    category: "Mall",
    tags: ["Mall", "Cairo", "Automotive"],
    year: "2025",
    duration: "4 weeks",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1600&q=90&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1772895343662-d597635b8168?w=900&q=85&fit=crop",
    ],
    tagline: "A model launch executed across Egypt's most trafficked mall atrium.",
    overview:
      "Toyota Egypt chose HORIZON OOH to execute an all-formats mall takeover at Cairo Festival City to launch a new vehicle model to Egypt's premium automotive audience — combining large-format atrium banners, digital totems, floor branding, and an experiential activation zone.",
    objective:
      "Create an unmissable brand moment at Egypt's highest-footfall mall destination to drive product awareness and qualified showroom traffic for Toyota Egypt's new model launch.",
    execution:
      "HORIZON OOH executed a comprehensive mall takeover: three 6×12m atrium banners suspended above the main concourse, eight digital totems with full-motion launch video, branded floor graphics at all four entrance points, and a 120sqm activation zone in the central atrium. All elements were installed overnight with zero disruption to mall operations.",
    results: [
      { metric: "Mall Footfall Reached", value: "2.1M", description: "Over the 4-week campaign period" },
      { metric: "Brand Dwell Time", value: "+220%", description: "vs. standard single-format mall campaign" },
      { metric: "Showroom Traffic Lift", value: "+140%", description: "Toyota showroom visits vs. prior 4-week period" },
      { metric: "Test Drive Bookings", value: "3.2×", description: "Increase during and post-campaign period" },
    ],
    keywords: ["mall advertising Egypt", "outdoor advertising Cairo", "advertising agency Egypt"],
  },
  {
    id: "nestlé-airport-cai",
    slug: "nestle-cairo-airport-advertising",
    title: "Nestlé Cairo Airport — Terminal 2",
    client: "Nestlé Egypt",
    location: "Cairo International Airport, T2",
    city: "Cairo",
    category: "Airport",
    tags: ["Airport", "Cairo", "FMCG"],
    year: "2024",
    duration: "12 weeks",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1600&q=90&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=900&q=85&fit=crop",
    ],
    tagline: "Premium terminal presence reaching 15 million annual passengers.",
    overview:
      "Nestlé Egypt engaged HORIZON OOH for a strategic airport advertising campaign across Cairo International Airport Terminal 2 — targeting both departing Egyptian travellers and arriving international visitors during a 12-week brand equity campaign.",
    objective:
      "Build premium brand equity and reinforce Nestlé's positioning among Egypt's high-value international traveller segment — reaching business travellers, expatriates, and tourists during the high-dwell airport environment.",
    execution:
      "HORIZON OOH deployed a multi-touchpoint terminal journey: large-format panels at T2 check-in (facing 100% of departing passengers), digital screen domination across the departure lounge, backlit panels at security, and arrivals hall takeover. The campaign ran in English and Arabic, with localised creative for each terminal zone.",
    results: [
      { metric: "Terminal Reach", value: "1.2M", description: "Unique passenger impressions over 12 weeks" },
      { metric: "Brand Recall", value: "78%", description: "Unaided brand recall among surveyed passengers" },
      { metric: "Engagement Score", value: "+195%", description: "vs. equivalent roadside billboard campaign" },
      { metric: "Campaign ROI", value: "4.8×", description: "vs. media investment benchmark" },
    ],
    keywords: ["airport advertising Cairo", "outdoor advertising Egypt", "billboard campaigns Egypt"],
  },
  {
    id: "samsung-sheikh-zayed",
    slug: "samsung-sheikh-zayed-billboard",
    title: "Samsung Galaxy — Sheikh Zayed Corridor",
    client: "Samsung Egypt",
    location: "26 July Corridor, Sheikh Zayed",
    city: "Sheikh Zayed",
    category: "Billboard",
    tags: ["Billboard", "Sheikh Zayed", "Tech"],
    year: "2024",
    duration: "10 weeks",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1735506943281-4b4502be999d?w=1400&q=90&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1735506943281-4b4502be999d?w=1600&q=90&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=900&q=85&fit=crop",
    ],
    tagline: "Commanding the most premium western corridor in Greater Cairo.",
    overview:
      "Samsung Egypt partnered with HORIZON OOH to execute the outdoor component of a major Galaxy product launch — targeting Sheikh Zayed City and the 26 July Corridor, home to Egypt's most affluent technology-adopter demographic.",
    objective:
      "Achieve category leadership visibility among premium smartphone buyers in West Cairo ahead of a major Galaxy launch date, reinforcing Samsung's position as the premium alternative in the Egyptian market.",
    execution:
      "HORIZON OOH activated 9 premium billboard sites across the 26 July Corridor and Sheikh Zayed main strip — including 3 mega-format unipoles (18m+) at the highest-visibility intersections. Creative was produced at multiple sizes with a unified visual identity across all formats, creating a cohesive corridor domination effect.",
    results: [
      { metric: "Daily Reach", value: "310,000+", description: "Vehicles exposed daily across the corridor" },
      { metric: "Brand Visibility Index", value: "+240%", description: "vs. category benchmark for the corridor" },
      { metric: "Product Awareness Lift", value: "+155%", description: "Measured via pre/post campaign survey" },
      { metric: "Sales Uplift (Week 1)", value: "+88%", description: "Retail partner reported in-store uplift" },
    ],
    keywords: ["billboard advertising Cairo", "outdoor advertising Egypt", "advertising agency Egypt"],
  },
  {
    id: "orange-alexandria",
    slug: "orange-alexandria-corniche-campaign",
    title: "Orange — Alexandria Corniche",
    client: "Orange Egypt",
    location: "Corniche, Alexandria",
    city: "Alexandria",
    category: "Billboard",
    tags: ["Billboard", "Alexandria", "Telecom"],
    year: "2024",
    duration: "6 weeks",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1600&q=90&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=900&q=85&fit=crop",
    ],
    tagline: "26km of Mediterranean seafront — the most iconic address in Egypt.",
    overview:
      "Orange Egypt commissioned HORIZON OOH to execute a seasonal summer campaign across Alexandria's Corniche — Egypt's most iconic outdoor advertising address — to capitalise on peak summer footfall and tourist traffic.",
    objective:
      "Drive brand awareness and data plan activations among Alexandria's summer population — including seasonal visitors from Cairo and international tourists — during the peak Q3 summer travel window.",
    execution:
      "HORIZON OOH placed a network of 11 consecutive Corniche panels along the seafront route from Sidi Bishr to Stanley — creating an unbroken visual presence across Alexandria's most-trafficked leisure corridor. Creative was adapted for an outdoor and tourism audience with bold, minimal design built for high-speed viewing.",
    results: [
      { metric: "Corniche Panel Coverage", value: "26km", description: "Continuous brand presence along the full seafront" },
      { metric: "Daily Impressions", value: "520,000+", description: "Peak-season combined traffic across all panels" },
      { metric: "Data Plan Activations", value: "+210%", description: "vs. equivalent non-OOH summer period" },
      { metric: "Brand Preference Lift", value: "+72%", description: "Among Alexandria 18–35 post-campaign survey" },
    ],
    keywords: ["billboard advertising Alexandria", "outdoor advertising Egypt", "billboard campaigns Egypt"],
  },
];

// ─── Trust / Stats ────────────────────────────────────────────────────────
export const TRUST_STATS = [
  { value: "9,500+", label: "Locations" },
  { value: "Nationwide", label: "Coverage" },
  { value: "Premium", label: "Inventory" },
];

export const RESULTS = [
  { value: "2.7×", label: "Conversions", sublabel: "Average campaign lift" },
  { value: "+180%", label: "Engagement", sublabel: "Brand recall uplift" },
  { value: "100+", label: "Nationwide Campaigns", sublabel: "Delivered annually" },
];

export const CLIENT_BRANDS = [
  "Pepsi", "Vodafone", "CIB", "Toyota", "Samsung",
  "Nestlé", "Orange", "Etisalat", "Banque Misr", "L'Oréal",
];

// ─── Process ──────────────────────────────────────────────────────────────
export const PROCESS = [
  { step: "01", label: "Plan", description: "We map locations, audience data, and campaign objectives." },
  { step: "02", label: "Book", description: "Secure prime inventory across your target markets." },
  { step: "03", label: "Execute", description: "Professional installation with exacting quality control." },
  { step: "04", label: "Monitor", description: "Real-time reporting and performance analytics." },
];

// ─── Services ─────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  longDescription: string;
  whatIs: string;
  benefits: string[];
  whereUsed: string;
  process: string[];
  image: string;
  icon: string;
}

export const SERVICES: Service[] = [
  {
    id: "billboard",
    slug: "billboard-advertising",
    title: "Billboard Advertising",
    shortTitle: "Billboard",
    tagline: "Own the road.",
    description: "Commanding roadside presence across Egypt's most-trafficked corridors.",
    longDescription:
      "Large-format billboard advertising gives your brand unparalleled visibility along Egypt's busiest highways, ring roads, and arterial routes. With creative measured in square metres, your message becomes an architectural landmark that millions encounter every day.",
    whatIs:
      "Billboard advertising (OOH) uses large-format static or backlit panels positioned along high-traffic roads and intersections. Formats range from standard 4×8m roadside panels to mega-format 18m+ structures on prime arterial routes.",
    benefits: [
      "Millions of daily impressions on Egypt's highest-traffic corridors",
      "24/7 brand presence — your message never sleeps",
      "Large creative canvas with maximum visual impact",
    ],
    whereUsed:
      "Ring Road, Salah Salem, 6th of October Corridor, 90th Street New Cairo, Corniche Alexandria, and 200+ prime roadside locations nationwide.",
    process: [
      "Site selection based on traffic data and target audience mapping",
      "Creative brief and design approval to maximise visual impact",
      "Professional installation with quality-controlled printing",
      "Campaign monitoring and post-campaign performance report",
    ],
    image: "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop",
    icon: "BB",
  },
  {
    id: "dooh",
    slug: "digital-out-of-home",
    title: "Digital Out-of-Home (DOOH)",
    shortTitle: "DOOH",
    tagline: "Dynamic. Real-time. Unmissable.",
    description: "Dynamic digital screens delivering real-time content in high-footfall zones.",
    longDescription:
      "Digital Out-of-Home advertising transforms static media into dynamic storytelling. Daypart scheduling, real-time content updates, and data-driven targeting combine to deliver the right message to the right audience at the right moment.",
    whatIs:
      "DOOH uses high-brightness LED and LCD digital screens positioned in malls, airports, transport hubs, and roadside locations. Content is managed remotely and can be updated in real time, enabling contextual and programmatic campaigns.",
    benefits: [
      "Real-time content updates — react to news, weather, and events",
      "Daypart targeting — optimise your message by time and audience",
      "Programmatic buying capabilities for precision reach",
    ],
    whereUsed:
      "Mall atria and digital towers, airport terminals, metro stations, roadside LED screens across Greater Cairo and Alexandria.",
    process: [
      "Audience and context analysis to select optimal screen network",
      "Content format specification for each screen environment",
      "Campaign scheduling and daypart optimisation",
      "Live performance dashboard and impression reporting",
    ],
    image: "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop",
    icon: "DH",
  },
  {
    id: "mall",
    slug: "mall-advertising",
    title: "Mall Advertising",
    shortTitle: "Mall",
    tagline: "Reach buyers at peak intent.",
    description: "Premium in-mall placements reaching affluent shoppers at peak intent moments.",
    longDescription:
      "Mall advertising connects your brand to Egypt's most valuable retail audiences — people actively engaged in discovery and purchase. From grand atrium banners to digital totems and sampling zones, mall environments deliver unmatched brand-consumer proximity.",
    whatIs:
      "Mall advertising encompasses all paid media formats within shopping centre environments: atrium banners, digital screens, floor graphics, experiential stands, entrance takeovers, elevator wraps, and escalator panels.",
    benefits: [
      "Captive audience in a high-dwell, high-spend environment",
      "Multiple touchpoints — from car park entry to store exit",
      "Adjacency to premium retail brands elevates brand perception",
    ],
    whereUsed:
      "Cairo Festival City, Mall of Egypt, CityStars, City Centre Alexandria, Point 90, and 40+ premium malls nationwide.",
    process: [
      "Mall selection matched to brand demographics and footfall data",
      "Format mix recommendation for maximum journey coverage",
      "Creative production to mall specification standards",
      "Installation, monitoring, and campaign wrap reporting",
    ],
    image: "https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop",
    icon: "ML",
  },
  {
    id: "airport",
    slug: "airport-advertising",
    title: "Airport Advertising",
    shortTitle: "Airport",
    tagline: "First impressions at 30,000 feet.",
    description: "Exclusive terminal placements targeting high-value travellers at key touchpoints.",
    longDescription:
      "Airport advertising gives your brand exclusive access to Egypt's most affluent and influential audience — international and domestic travellers. High-dwell environments, premium creative formats, and aspirational context make airports Egypt's most prestigious advertising estate.",
    whatIs:
      "Airport OOH spans check-in halls, security queues, departure lounges, baggage reclaim, and arrivals halls. Formats include large-format digital walls, branded zones, column wraps, and gate-area takeovers at Cairo International, Hurghada, and Sharm El-Sheikh airports.",
    benefits: [
      "Premium audience — business travellers, tourists, and expatriates",
      "Extended dwell time creates deep brand engagement",
      "Aspirational context elevates perceived brand value",
    ],
    whereUsed:
      "Cairo International Airport (Terminal 1 & 2), Hurghada International, Sharm El-Sheikh International — all passenger journey touchpoints.",
    process: [
      "Terminal zone and passenger flow analysis for optimal placement",
      "Airport authority creative approval and compliance management",
      "Precision installation with airport operational coordination",
      "Post-campaign passenger impression and recall reporting",
    ],
    image: "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop",
    icon: "AP",
  },
  {
    id: "street",
    slug: "street-furniture",
    title: "Street Furniture",
    shortTitle: "Street",
    tagline: "Embedded in everyday journeys.",
    description: "Bus shelters, kiosks, and urban panels integrated into daily commuter life.",
    longDescription:
      "Street furniture advertising places your brand directly in the path of pedestrians and commuters at eye level — the most intimate scale of outdoor media. Bus shelters, wayfinding kiosks, and urban panels build cumulative frequency through daily repetition.",
    whatIs:
      "Street furniture OOH includes bus shelter panels, information kiosks, metro entrance advertising, pillar wraps, phone booth panels, and street-level digital screens in high-pedestrian urban environments.",
    benefits: [
      "Eye-level engagement — closest proximity to the consumer",
      "High-frequency exposure drives brand recall through repetition",
      "Hyper-local targeting by neighbourhood and commuter route",
    ],
    whereUsed:
      "Downtown Cairo, Heliopolis, Nasr City, Zamalek, New Cairo, Dokki, Mohandessin, and major bus and metro interchange points.",
    process: [
      "Route and zone mapping aligned to target consumer movement",
      "Network selection for density and frequency optimisation",
      "Creative format adaptation for street-level dimensions",
      "Installation and bi-weekly maintenance quality checks",
    ],
    image: "https://images.unsplash.com/photo-1772895343662-d597635b8168?w=1400&q=90&fit=crop",
    icon: "SF",
  },
  {
    id: "production",
    slug: "commercial-video-production",
    title: "Commercial & Video Production",
    shortTitle: "Production",
    tagline: "Content built for scale.",
    description: "Full-service creative production for outdoor, digital, and broadcast campaigns.",
    longDescription:
      "Great outdoor advertising starts with great creative. Our in-house production studio handles everything from concept and scripting to filming, post-production, and final delivery — ensuring your creative is engineered for maximum impact at every format and scale.",
    whatIs:
      "Our production service covers TV commercials, digital video assets, DOOH content production, large-format print artwork, outdoor photography, and motion graphics — all optimised for outdoor and broadcast delivery specifications.",
    benefits: [
      "One creative partner — from concept to final outdoor-ready artwork",
      "Production optimised for large-format outdoor specifications",
      "Faster deployment — integrated with our media booking process",
    ],
    whereUsed:
      "All formats: static billboard artwork, DOOH motion content, mall digital screens, airport video walls, and broadcast TV.",
    process: [
      "Creative brief development and concept presentation",
      "Scriptwriting, storyboarding, and pre-production planning",
      "Production, filming, and post-production with colour grading",
      "Format adaptation and delivery to all media specifications",
    ],
    image: "https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop",
    icon: "VP",
  },
];

// ─── Locations ────────────────────────────────────────────────────────────
export interface Location {
  id: string;
  slug: string;
  city: string;
  headline: string;
  description: string;
  detail: string;
  longDescription: string;
  availableFormats: string[];
  image: string;
  products: Product[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  location: string;
  city: string;
  district: string;
  type: string;
  size: string;
  visibility: string;
  traffic: string;
  image: string;
  lat: number;
  lng: number;
  specs: { label: string; value: string }[];
  benefits: string[];
  relatedSlugs: string[];
}

const CAIRO_PRODUCTS: Product[] = [
  {
    id: "ring-road-north",
    slug: "ring-road-north-face",
    name: "Ring Road North Face",
    location: "Ring Road, km 28 North — Nasr City Direction",
    city: "Cairo",
    district: "Nasr City",
    type: "Unipole Billboard",
    size: "12m × 6m",
    visibility: "1.2km visible distance",
    traffic: "420,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1200&q=90&fit=crop",
    lat: 30.0722, lng: 31.3987,
    specs: [
      { label: "Size", value: "12m × 6m (72 sqm)" },
      { label: "Type", value: "Backlit Unipole" },
      { label: "Height", value: "18m above road level" },
      { label: "Location", value: "Ring Road North, km 28" },
      { label: "Visibility", value: "1.2km approach distance" },
      { label: "Traffic", value: "420,000+ vehicles daily" },
      { label: "Illumination", value: "24/7 LED backlit" },
    ],
    benefits: [
      "Dominant position on Egypt's busiest orbital motorway",
      "North-facing — prime orientation for peak morning commute",
      "LED backlit for equal impact day and night",
    ],
    relatedSlugs: ["salah-salem-south", "6th-october-bridge"],
  },
  {
    id: "salah-salem-south",
    slug: "salah-salem-south",
    name: "Salah Salem Southbound",
    location: "Salah Salem Street, Southbound — Heliopolis Gate",
    city: "Cairo",
    district: "Heliopolis",
    type: "Rooftop Billboard",
    size: "8m × 4m",
    visibility: "800m visible distance",
    traffic: "280,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1200&q=90&fit=crop",
    lat: 30.0912, lng: 31.3360,
    specs: [
      { label: "Size", value: "8m × 4m (32 sqm)" },
      { label: "Type", value: "Rooftop Billboard" },
      { label: "Height", value: "22m above road level" },
      { label: "Location", value: "Salah Salem, Heliopolis Gate" },
      { label: "Visibility", value: "800m approach distance" },
      { label: "Traffic", value: "280,000+ vehicles daily" },
      { label: "Illumination", value: "Frontlit night lighting" },
    ],
    benefits: [
      "Prime position on Cairo's central heritage boulevard",
      "Elevated rooftop position — unobstructed sightlines",
      "Adjacent to Heliopolis, Cairo's premium residential district",
    ],
    relatedSlugs: ["ring-road-north-face", "6th-october-bridge"],
  },
  {
    id: "tahrir-square-north",
    slug: "tahrir-square-north",
    name: "Tahrir Square — North Panel",
    location: "Tahrir Square, Downtown Cairo",
    city: "Cairo",
    district: "Downtown",
    type: "Mega Billboard",
    size: "14m × 7m",
    visibility: "900m visible distance",
    traffic: "380,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1200&q=90&fit=crop",
    lat: 30.0444, lng: 31.2357,
    specs: [
      { label: "Size", value: "14m × 7m (98 sqm)" },
      { label: "Type", value: "Mega Billboard" },
      { label: "Height", value: "20m above road level" },
      { label: "Location", value: "Tahrir Square, Downtown" },
      { label: "Visibility", value: "900m approach distance" },
      { label: "Traffic", value: "380,000+ vehicles daily" },
      { label: "Illumination", value: "24/7 LED backlit" },
    ],
    benefits: [
      "Cairo's most iconic public square — global recognition",
      "Maximum dwell time — surrounded by tourist and commercial traffic",
      "24/7 illuminated for round-the-clock brand presence",
    ],
    relatedSlugs: ["ring-road-north-face", "salah-salem-south"],
  },
  {
    id: "zamalek-corniche",
    slug: "zamalek-corniche",
    name: "Zamalek Corniche Billboard",
    location: "Corniche El Nil, Zamalek",
    city: "Cairo",
    district: "Zamalek",
    type: "Rooftop Billboard",
    size: "10m × 5m",
    visibility: "700m visible distance",
    traffic: "190,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1559533189-9bd27271f4c4?w=1200&q=90&fit=crop",
    lat: 30.0644, lng: 31.2168,
    specs: [
      { label: "Size", value: "10m × 5m (50 sqm)" },
      { label: "Type", value: "Rooftop Billboard" },
      { label: "Height", value: "16m above road level" },
      { label: "Location", value: "Corniche El Nil, Zamalek" },
      { label: "Visibility", value: "700m approach distance" },
      { label: "Traffic", value: "190,000+ vehicles daily" },
      { label: "Illumination", value: "Frontlit night lighting" },
    ],
    benefits: [
      "Zamalek — Cairo's most premium residential and diplomatic enclave",
      "Nile-facing — luxury brand environment with upscale pedestrian traffic",
      "Low clutter high-value corridor for premium brand positioning",
    ],
    relatedSlugs: ["ring-road-north-face", "salah-salem-south"],
  },
  {
    id: "maadi-ring-road",
    slug: "maadi-ring-road",
    name: "Maadi Ring Road West",
    location: "Ring Road West, Maadi Interchange",
    city: "Cairo",
    district: "Maadi",
    type: "Unipole Billboard",
    size: "12m × 6m",
    visibility: "1.1km visible distance",
    traffic: "350,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1638659782541-15c52f28dadb?w=1200&q=90&fit=crop",
    lat: 29.9602, lng: 31.2569,
    specs: [
      { label: "Size", value: "12m × 6m (72 sqm)" },
      { label: "Type", value: "Backlit Unipole" },
      { label: "Height", value: "18m above road level" },
      { label: "Location", value: "Ring Road West, Maadi Exit" },
      { label: "Visibility", value: "1.1km approach distance" },
      { label: "Traffic", value: "350,000+ vehicles daily" },
      { label: "Illumination", value: "24/7 LED backlit" },
    ],
    benefits: [
      "Maadi — Cairo's largest expat and upper-income residential zone",
      "Dual audience: local premium residents + corporate traffic",
      "LED backlit unipole for equal day and night impact",
    ],
    relatedSlugs: ["ring-road-north-face", "salah-salem-south"],
  },
];

const NEW_CAIRO_PRODUCTS: Product[] = [
  {
    id: "90th-street-east",
    slug: "90th-street-east-face",
    name: "90th Street East Face",
    location: "90th Street, East Face — Fifth Settlement Intersection",
    city: "New Cairo",
    district: "Fifth Settlement",
    type: "Mega Billboard",
    size: "18m × 8m",
    visibility: "1.5km visible distance",
    traffic: "310,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1735506943281-4b4502be999d?w=1200&q=90&fit=crop",
    lat: 30.0071, lng: 31.4472,
    specs: [
      { label: "Size", value: "18m × 8m (144 sqm)" },
      { label: "Type", value: "Mega Format Unipole" },
      { label: "Height", value: "24m above road level" },
      { label: "Location", value: "90th Street, Fifth Settlement" },
      { label: "Visibility", value: "1.5km approach distance" },
      { label: "Traffic", value: "310,000+ vehicles daily" },
      { label: "Illumination", value: "24/7 LED backlit" },
    ],
    benefits: [
      "Largest format on New Cairo's premier commercial boulevard",
      "Surrounded by premium retail and A1 residential catchment",
      "Mega-format creative canvas — unmissable at 1.5km range",
    ],
    relatedSlugs: ["ring-road-north-face", "salah-salem-south"],
  },
  {
    id: "south-teseen",
    slug: "south-teseen-west",
    name: "South Teseen West Face",
    location: "South Teseen Street, New Cairo",
    city: "New Cairo",
    district: "New Cairo Centre",
    type: "Unipole Billboard",
    size: "12m × 6m",
    visibility: "1.0km visible distance",
    traffic: "240,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1586189393824-dfaafc3691dc?w=1200&q=90&fit=crop",
    lat: 29.9924, lng: 31.4619,
    specs: [
      { label: "Size", value: "12m × 6m (72 sqm)" },
      { label: "Type", value: "Backlit Unipole" },
      { label: "Height", value: "18m above road level" },
      { label: "Location", value: "South Teseen, New Cairo" },
      { label: "Visibility", value: "1.0km approach distance" },
      { label: "Traffic", value: "240,000+ vehicles daily" },
      { label: "Illumination", value: "24/7 LED backlit" },
    ],
    benefits: [
      "Key artery in New Cairo's fastest-growing commercial zone",
      "Surrounded by high-income residential and premium retail",
      "LED backlit for 24-hour brand presence",
    ],
    relatedSlugs: ["90th-street-east-face", "ring-road-north-face"],
  },
];

const SHEIKH_ZAYED_PRODUCTS: Product[] = [
  {
    id: "26july-west",
    slug: "26-july-corridor-west-face",
    name: "26 July Corridor — West Face",
    location: "26 July Corridor, Sheikh Zayed City",
    city: "Sheikh Zayed",
    district: "26 July Corridor",
    type: "Unipole Billboard",
    size: "10m × 5m",
    visibility: "900m visible distance",
    traffic: "195,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1735506943281-4b4502be999d?w=1200&q=90&fit=crop",
    lat: 30.0527, lng: 30.9808,
    specs: [
      { label: "Size", value: "10m × 5m (50 sqm)" },
      { label: "Type", value: "Frontlit Unipole" },
      { label: "Height", value: "14m above road level" },
      { label: "Location", value: "26 July Corridor, Sheikh Zayed" },
      { label: "Visibility", value: "900m approach distance" },
      { label: "Traffic", value: "195,000+ vehicles daily" },
      { label: "Illumination", value: "Frontlit night lighting" },
    ],
    benefits: [
      "Prime position on West Cairo's highest-value commercial corridor",
      "West-facing — dominant afternoon and evening commute exposure",
      "Surrounded by Sheikh Zayed City's premium A1 residential demographic",
    ],
    relatedSlugs: ["ring-road-north-face", "90th-street-east-face"],
  },
  {
    id: "sheikh-zayed-main",
    slug: "sheikh-zayed-main-strip",
    name: "Sheikh Zayed Main Strip",
    location: "Main Commercial Strip, Sheikh Zayed City",
    city: "Sheikh Zayed",
    district: "City Centre",
    type: "Digital Billboard",
    size: "8m × 4m",
    visibility: "600m visible distance",
    traffic: "160,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1622058030255-6f54f94cfb3b?w=1200&q=90&fit=crop",
    lat: 30.0612, lng: 30.9721,
    specs: [
      { label: "Size", value: "8m × 4m (32 sqm)" },
      { label: "Type", value: "Digital DOOH Screen" },
      { label: "Height", value: "10m above road level" },
      { label: "Location", value: "Main Strip, Sheikh Zayed" },
      { label: "Visibility", value: "600m approach distance" },
      { label: "Traffic", value: "160,000+ vehicles daily" },
      { label: "Illumination", value: "Full-motion digital 24/7" },
    ],
    benefits: [
      "Digital screen — dynamic creative with dayparting capability",
      "Sheikh Zayed's premium commercial and F&B zone",
      "A1 upscale demographic — high disposable income audience",
    ],
    relatedSlugs: ["26-july-corridor-west-face", "ring-road-north-face"],
  },
];

const ALEXANDRIA_PRODUCTS: Product[] = [
  {
    id: "corniche-central",
    slug: "corniche-central-alexandria",
    name: "Alexandria Corniche — Central",
    location: "Corniche El-Nil Road, Central Alexandria",
    city: "Alexandria",
    district: "Corniche",
    type: "Seafront Billboard",
    size: "8m × 4m",
    visibility: "600m visible distance",
    traffic: "520,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1200&q=90&fit=crop",
    lat: 31.2001, lng: 29.9187,
    specs: [
      { label: "Size", value: "8m × 4m (32 sqm)" },
      { label: "Type", value: "Backlit Seafront Panel" },
      { label: "Height", value: "10m above road level" },
      { label: "Location", value: "Corniche Road, Central Alexandria" },
      { label: "Visibility", value: "600m approach distance" },
      { label: "Traffic", value: "520,000+ vehicles daily" },
      { label: "Illumination", value: "LED backlit 24/7" },
    ],
    benefits: [
      "Egypt's most iconic outdoor advertising address — 26km of seafront visibility",
      "Peak summer season reaches millions of tourists and seasonal visitors",
      "LED backlit for equal day and night-time brand presence",
    ],
    relatedSlugs: ["ring-road-north-face", "salah-salem-south"],
  },
  {
    id: "horreya-east",
    slug: "el-horreya-east-face",
    name: "El-Horreya Road — East Face",
    location: "El-Horreya Road, Alexandria",
    city: "Alexandria",
    district: "El-Horreya",
    type: "Rooftop Billboard",
    size: "9m × 4.5m",
    visibility: "750m visible distance",
    traffic: "310,000+ daily vehicles",
    image: "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1200&q=90&fit=crop",
    lat: 31.2157, lng: 29.9434,
    specs: [
      { label: "Size", value: "9m × 4.5m (40.5 sqm)" },
      { label: "Type", value: "Rooftop Billboard" },
      { label: "Height", value: "20m above road level" },
      { label: "Location", value: "El-Horreya Road, Alexandria" },
      { label: "Visibility", value: "750m approach distance" },
      { label: "Traffic", value: "310,000+ vehicles daily" },
      { label: "Illumination", value: "Frontlit night lighting" },
    ],
    benefits: [
      "Elevated rooftop position on Alexandria's central commercial boulevard",
      "East-facing — maximum morning commute exposure into the city centre",
      "Adjacent to Alexandria's premium retail and hospitality district",
    ],
    relatedSlugs: ["corniche-central-alexandria", "ring-road-north-face"],
  },
];

export const LOCATIONS: Location[] = [
  {
    id: "cairo",
    slug: "cairo",
    city: "Cairo",
    headline: "Billboard Advertising in Cairo",
    description: "Egypt's capital and commercial heart.",
    detail: "Ring Road, Salah Salem, Downtown",
    longDescription:
      "Cairo is Egypt's advertising capital — 22 million inhabitants, 8 million daily commuters, and the country's highest concentration of premium consumer and B2B audiences. Our Cairo inventory spans the Ring Road, Salah Salem, Corniche El-Nil, and every major arterial route, ensuring your brand is seen by the full spectrum of Cairo's consumer base.",
    availableFormats: ["Unipole Billboard", "Rooftop Billboard", "Bridge Panel", "DOOH Screen", "Street Furniture", "Mall Advertising"],
    image: "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop",
    products: CAIRO_PRODUCTS,
  },
  {
    id: "new-cairo",
    slug: "new-cairo",
    city: "New Cairo",
    headline: "Billboard Advertising in New Cairo",
    description: "Egypt's fastest-growing premium district.",
    detail: "90th Street, Fifth Settlement",
    longDescription:
      "New Cairo is Egypt's most affluent and fastest-growing urban district — home to premium residential compounds, Egypt's leading universities, and a rapidly expanding retail and F&B landscape. The 90th Street corridor is the single highest-value outdoor media address in Egypt outside of the Ring Road.",
    availableFormats: ["Mega Billboard", "Unipole Billboard", "DOOH Screen", "Mall Advertising", "Street Furniture"],
    image: "https://images.unsplash.com/photo-1735506943281-4b4502be999d?w=1400&q=90&fit=crop",
    products: NEW_CAIRO_PRODUCTS,
  },
  {
    id: "sheikh-zayed",
    slug: "sheikh-zayed",
    city: "Sheikh Zayed",
    headline: "Billboard Advertising in Sheikh Zayed",
    description: "West Cairo's premium residential corridor.",
    detail: "Hyper One Strip, 26 July Corridor",
    longDescription:
      "Sheikh Zayed City sits at the intersection of Cairo's wealthiest western residential communities and the 26 July Corridor — one of Egypt's busiest non-Ring Road arterials. Brands here communicate directly with Egypt's most valuable consumer demographic.",
    availableFormats: ["Unipole Billboard", "Rooftop Billboard", "DOOH Screen", "Mall Advertising"],
    image: "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop",
    products: SHEIKH_ZAYED_PRODUCTS,
  },
  {
    id: "6th-october",
    slug: "6th-october",
    city: "6th of October",
    headline: "Billboard Advertising in 6th of October",
    description: "Industrial hub and residential expansion zone.",
    detail: "Hadayek October, Wahat Road",
    longDescription:
      "6th of October City combines Egypt's largest industrial zone with growing upper-middle residential developments. The Wahat Road and Hadayek October main strip offer high-volume commuter traffic — ideal for mass-market and FMCG brands targeting both workers and residents.",
    availableFormats: ["Unipole Billboard", "Bridge Panel", "Street Furniture"],
    image: "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop",
    products: [],
  },
  {
    id: "alexandria",
    slug: "alexandria",
    city: "Alexandria",
    headline: "Billboard Advertising in Alexandria",
    description: "Egypt's second city and Mediterranean gateway.",
    detail: "Corniche, El-Horreya Road",
    longDescription:
      "Alexandria is Egypt's second-largest city and Mediterranean commercial hub — with 6 million residents, a thriving port economy, and major retail and hospitality markets. The Corniche is Egypt's most iconic outdoor advertising address: 26km of seafront road with no visual competition.",
    availableFormats: ["Unipole Billboard", "Corniche Panel", "DOOH Screen", "Mall Advertising", "Street Furniture"],
    image: "https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop",
    products: ALEXANDRIA_PRODUCTS,
  },
];

// ─── Blog ──────────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  body: BlogSection[];
}

export interface BlogSection {
  type: "h2" | "p" | "ul" | "cta";
  content?: string;
  items?: string[];
}

// ─── Flat map of ALL billboard products (for search + map) ───────────────
export type MapBillboard = Product & { citySlug: string };

export const ALL_BILLBOARDS: MapBillboard[] = [];
// Populated after LOCATIONS is defined — see bottom of file

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "ooh-egypt-2026",
    slug: "ooh-advertising-egypt-2026-guide",
    title: "The Complete Guide to OOH Advertising in Egypt (2026)",
    excerpt:
      "Egypt's outdoor advertising market is growing rapidly. Here's everything you need to know about formats, costs, and strategy for 2026.",
    category: "Industry Guide",
    readTime: "8 min read",
    date: "March 2026",
    image: "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1200&q=90&fit=crop",
    body: [
      { type: "p", content: "Egypt's out-of-home advertising market reached EGP 4.2 billion in 2025 and is forecast to grow a further 28% through 2026, driven by rapid urbanisation, rising disposable incomes in premium districts, and the continued expansion of Egypt's retail and real estate sectors." },
      { type: "h2", content: "What is OOH Advertising?" },
      { type: "p", content: "Out-of-home advertising — commonly abbreviated OOH — is any form of paid media that reaches consumers while they are outside their homes. Billboards, DOOH screens, mall advertising, airport panels, and street furniture are all forms of OOH." },
      { type: "h2", content: "OOH Formats Available in Egypt" },
      { type: "ul", items: ["Static billboards and unipoles along highways and ring roads", "Digital OOH (DOOH) screens in malls, airports, and urban centres", "Mall advertising: atrium banners, digital towers, floor graphics", "Airport advertising: terminal panels, video walls, arrivals branding", "Street furniture: bus shelters, kiosks, pedestrian panels"] },
      { type: "h2", content: "Choosing the Right OOH Format for Your Brand" },
      { type: "p", content: "The right format depends on three factors: your target audience, your campaign objective (awareness vs. purchase intent), and your budget. Mass-market FMCG brands typically anchor their OOH investment in high-reach roadside billboards, while luxury and financial brands favour airport, mall, and premium urban locations." },
      { type: "h2", content: "OOH Advertising in Cairo vs. Alexandria" },
      { type: "p", content: "Cairo accounts for approximately 62% of Egypt's total OOH investment, driven by its population size and commercial concentration. Alexandria is the second-largest market and offers significantly more cost-efficient CPM rates — typically 35-45% lower than equivalent Cairo locations — while still reaching a large, commercially active audience." },
      { type: "h2", content: "How to Plan an OOH Campaign in Egypt" },
      { type: "ul", items: ["Define your audience: demographic profile, geography, commute patterns", "Map your formats: which OOH environments index highest for your audience", "Build your network: select sites for reach, frequency, and impact", "Produce your creative: OOH creative must communicate in under 3 seconds"] },
      { type: "cta", content: "Ready to launch your OOH campaign in Egypt?" },
    ],
  },
  {
    id: "dooh-programmatic",
    slug: "digital-ooh-programmatic-advertising-egypt",
    title: "DOOH and Programmatic Advertising: Egypt's Digital Outdoor Revolution",
    excerpt:
      "Digital out-of-home advertising is transforming Egypt's media landscape. Here's what brands need to know about DOOH and programmatic buying.",
    category: "DOOH",
    readTime: "6 min read",
    date: "February 2026",
    image: "https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1200&q=90&fit=crop",
    body: [
      { type: "p", content: "Digital out-of-home (DOOH) advertising is the fastest-growing segment of Egypt's media market. The number of digital screens in Egypt's premium urban environments has grown 340% over the past four years, and programmatic DOOH buying is now available across 1,200+ screens in Cairo and Alexandria." },
      { type: "h2", content: "What Makes DOOH Different from Static OOH?" },
      { type: "p", content: "Unlike static billboards, DOOH screens allow brands to update their creative in real time, schedule different messages by time of day, and respond dynamically to external triggers such as weather, traffic conditions, and live events." },
      { type: "h2", content: "Key DOOH Formats in Egypt" },
      { type: "ul", items: ["Roadside LED screens: large-format digital unipoles on Cairo's Ring Road", "Mall digital towers: full-motion video in Egypt's premium shopping centres", "Airport video walls: high-impact digital branding at Cairo International", "Urban digital totems: street-level engagement in pedestrian zones"] },
      { type: "h2", content: "Programmatic DOOH Buying" },
      { type: "p", content: "Programmatic DOOH enables brands to buy impressions rather than fixed time slots — targeting specific audience segments by location, time, and context. Egypt's programmatic DOOH ecosystem is rapidly maturing, with DSP integrations available across all Horizon OOH's digital inventory." },
      { type: "cta", content: "Explore DOOH Advertising with Horizon OOH" },
    ],
  },
  {
    id: "billboard-design-tips",
    slug: "billboard-design-tips-outdoor-advertising",
    title: "7 Billboard Design Rules That Actually Work",
    excerpt:
      "Most billboards fail before they're even printed. Here are the design principles that separate effective outdoor creative from wasted spend.",
    category: "Creative",
    readTime: "5 min read",
    date: "January 2026",
    image: "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1200&q=90&fit=crop",
    body: [
      { type: "p", content: "A billboard has approximately 2.5 seconds to communicate with a driver travelling at 80km/h. That constraint — brutal by any media standard — defines every effective billboard design principle." },
      { type: "h2", content: "Rule 1: One Message Only" },
      { type: "p", content: "The most common billboard mistake is asking it to do too much. One headline. One image. One call to action. Every element added beyond that reduces comprehension by an estimated 20%." },
      { type: "h2", content: "Rule 2: Six Words Maximum" },
      { type: "p", content: "Research consistently shows that copy beyond six words fails to register for drivers. The world's most effective billboards — Nike's 'Just Do It', Apple's 'Think Different' — often use three words or fewer." },
      { type: "h2", content: "Rule 3: Extreme Contrast" },
      { type: "p", content: "Outdoor creative must work in full sun, rain, dust, and at night. Design for maximum contrast — dark text on light background or white on deep colour. Gradient backgrounds and pastel palettes consistently underperform." },
      { type: "h2", content: "Rule 4: Brand First, Message Second" },
      { type: "p", content: "Your brand mark should be identifiable at 500m. If someone can read your headline but can't identify your brand, the spend is wasted. Integrate your brand identity into the primary visual, not as a small logo in the corner." },
      { type: "ul", items: ["Use your brand colour as the dominant background", "Ensure logo is minimum 15% of the creative width", "Test your design at thumbnail scale — if unreadable, redesign"] },
      { type: "cta", content: "Need award-winning outdoor creative? Talk to our studio." },
    ],
  },
  {
    id: "airport-advertising-guide",
    slug: "airport-advertising-egypt-guide",
    title: "Airport Advertising in Egypt: A Brand's Complete Guide",
    excerpt:
      "Cairo International Airport reaches 15 million passengers annually. Here's how smart brands use airport OOH to dominate first and last impressions.",
    category: "Airport",
    readTime: "7 min read",
    date: "December 2025",
    image: "https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1200&q=90&fit=crop",
    body: [
      { type: "p", content: "Cairo International Airport is Egypt's largest gateway — handling over 15 million passengers annually across Terminal 1 and Terminal 2. It is also Egypt's most premium outdoor advertising environment: a captive, affluent, internationally connected audience with dwell times averaging 2.5 hours per passenger." },
      { type: "h2", content: "Why Airport Advertising Works" },
      { type: "p", content: "Airport passengers are uniquely receptive to advertising. Research shows 78% of airport passengers recall advertising they saw in the terminal — compared to 38% for roadside billboards. The combination of extended dwell time, a premium mindset, and reduced media noise creates exceptional conditions for brand communication." },
      { type: "h2", content: "Cairo Airport Advertising Formats" },
      { type: "ul", items: ["Check-in hall banners: large-format panels facing 100% of departing passengers", "Security queue displays: close-range, eye-level digital screens with 8-12 minute dwell", "Departure lounge digital walls: full-motion video in premium lounge environments", "Baggage reclaim panels: 100% arrivals coverage for inbound business and tourism"] },
      { type: "h2", content: "Which Brands Benefit Most from Airport Advertising?" },
      { type: "p", content: "Airport advertising delivers best results for financial services (banks, insurance, investment), automotive (premium and luxury vehicles), real estate (developments targeting expatriate and high-net-worth buyers), and hospitality brands (hotels, resorts, travel operators)." },
      { type: "cta", content: "Secure your airport advertising position today" },
    ],
  },
  {
    id: "mall-advertising-egypt",
    slug: "mall-advertising-egypt-ultimate-guide",
    title: "Mall Advertising in Egypt: Reaching Shoppers at Peak Intent",
    excerpt:
      "Egypt's 80+ premium shopping malls attract 180 million visits annually. Here's how to use mall OOH to convert browsers into buyers.",
    category: "Mall",
    readTime: "6 min read",
    date: "November 2025",
    image: "https://images.unsplash.com/photo-1772895343662-d597635b8168?w=1200&q=90&fit=crop",
    body: [
      { type: "p", content: "Egypt's mall sector has experienced explosive growth over the past decade, with over 80 premium shopping centres now operating across Greater Cairo and Alexandria. These environments attract an estimated 180 million visitor journeys annually — making them one of Egypt's highest-reach advertising networks." },
      { type: "h2", content: "The Mall Advertising Advantage" },
      { type: "p", content: "Mall visitors are in an active purchasing mindset. They have discretionary spending power, extended dwell time (average 2.2 hours per visit), and are receptive to brand discovery. Unlike roadside billboards, mall advertising operates in a controlled, brand-safe environment at close physical proximity to point of purchase." },
      { type: "h2", content: "Mall Advertising Formats" },
      { type: "ul", items: ["Atrium banners: large-format suspended displays in the mall's primary thoroughfare", "Digital totems: freestanding digital screens in high-footfall common areas", "Entrance branding: full-takeover of mall main entrance — maximum first impression", "Escalator panels: eye-level sequential panels on every floor transition", "Sampling and activation zones: branded experiential spaces in key traffic areas"] },
      { type: "cta", content: "Plan your mall advertising campaign with Horizon OOH" },
    ],
  },
  {
    id: "ooh-vs-digital",
    slug: "ooh-vs-digital-advertising-comparison",
    title: "OOH vs. Digital Advertising: Why Outdoor Wins on Brand Recall",
    excerpt:
      "Digital advertising dominates media budgets — but research consistently shows OOH outperforms digital on brand recall and purchase intent. Here's the data.",
    category: "Strategy",
    readTime: "5 min read",
    date: "October 2025",
    image: "https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1200&q=90&fit=crop",
    body: [
      { type: "p", content: "Digital advertising accounts for 54% of Egypt's total media spend — yet out-of-home advertising consistently outperforms digital channels on brand recall, purchase intent, and trust metrics. Understanding why OOH works differently from digital is essential for any serious media strategist." },
      { type: "h2", content: "The Ad Avoidance Problem" },
      { type: "p", content: "92% of internet users use some form of ad blocking or actively skip digital ads. The average digital display ad receives 0.06 seconds of genuine attention. Outdoor advertising, by contrast, cannot be skipped, blocked, or scrolled past — it occupies physical space that the consumer must visually process." },
      { type: "h2", content: "Brand Recall Comparison" },
      { type: "ul", items: ["Airport advertising: 78% unaided brand recall", "Roadside billboard: 38% unaided brand recall", "Digital display ad: 12% unaided brand recall", "Social media ad: 9% unaided brand recall"] },
      { type: "h2", content: "OOH and Digital Work Best Together" },
      { type: "p", content: "The most effective media strategies combine OOH for brand-building and digital for performance. Research shows campaigns that use both OOH and digital achieve 26% higher ROI than digital-only campaigns — OOH creates the brand context that makes digital advertising convert." },
      { type: "cta", content: "See how OOH can transform your brand's media strategy" },
    ],
  },
];


// ─── Populate ALL_BILLBOARDS flat array from LOCATIONS ───────────────────
LOCATIONS.forEach((loc) => {
  loc.products.forEach((p) => {
    ALL_BILLBOARDS.push({ ...p, citySlug: loc.slug });
  });
});
