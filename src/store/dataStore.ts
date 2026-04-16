
// ─────────────────────────────────────────────────────────────────────────────
// HORIZON OOH — Central Data Store (localStorage-backed)
// ─────────────────────────────────────────────────────────────────────────────
import {
  LOCATIONS, SERVICES, PROJECTS, BLOG_POSTS,
  TRUST_STATS, CLIENT_BRANDS, PROCESS, RESULTS,
  type Location as _Location, type Service, type Project, type BlogPost,
} from '../data/index'
// ── Extended Billboard / Product type ────────────────────────────────────────
export interface BillboardImage {
  url:  string
  alt:  string   // uses filename for SEO
}

export interface Product {
  id:             string
  slug:           string
  // Names
  nameEn:         string
  nameAr:         string
  name:           string        // alias for nameEn (website compat)
  // Location
  location:       string        // address
  locationName:   string        // landmark / place name
  city:           string
  district:       string
  lat:            number
  lng:            number
  // Classification
  adFormat:       string        // Billboard | Digital Screens | Mall Advertising | Airport Advertising | Transit Ads
  type:           string        // from admin-managed type list
  // Physical
  size:           string        // e.g. "12m × 6m"
  sqm:            number        // auto-computed from size
  sides:          number
  material:       string
  brightness:     string        // Back Light | Internal Light
  // Digital-only
  resolution:     string        // visible only when adFormat === Digital Screens
  spot:           string        // visible only when adFormat === Digital Screens
  // Commercial
  agencyPrice:    number
  clientPrice:    number
  availability:   string        // ISO date string
  status:         'Available' | 'Not Available'
  quantity:       number
  // Descriptions
  descriptionEn:  string
  descriptionAr:  string
  // Traffic
  traffic:        string
  visibility:     string
  // Supplier
  supplierId:     string
  supplierNote:   string
  // Media
  images:         BillboardImage[]
  image:          string        // compat: first image url
  // Legacy
  specs:          { label: string; value: string }[]
  benefits:       string[]
  relatedSlugs:   string[]
}

// Location type that uses our extended Product
export type Location = Omit<_Location, 'products'> & { products: Product[] }

// Admin-managed Ad Format types
export interface AdFormatType { id: string; label: string }



// ── Types ─────────────────────────────────────────────────────────────────────
export interface District   { id: string; name: string; locationId: string }
export interface Contact    { id: string; name: string; email: string; phone?: string; company?: string; subject?: string; message: string; status: 'new'|'read'|'replied'|'archived'; createdAt: string }
export interface TrustStat  { id: string; value: string; label: string }
export interface ProcessStep{ id: string; step: string; label: string; description: string }
export interface SocialLinks { facebook:string; instagram:string; linkedin:string; twitter:string; tiktok:string; youtube:string }
export interface SiteSettings { companyName:string; tagline:string; email:string; phone:string; address:string; hqLabel:string; whatsapp:string; metaDescription:string; headerLogoUrl:string; footerLogoUrl:string; faviconUrl:string; socialLinks:SocialLinks; homeCoverageLimit:number }

export interface WhyChooseItem { id:string; num:string; title:string; desc:string }
export interface AboutStat     { id:string; value:string; label:string; sub:string }
export interface AboutContent {
  heroEyebrow:    string
  heroTitle:      string
  heroAccent:     string
  introHeadline:  string
  introParagraph1:string
  introParagraph2:string
  seoHeading:     string
  seoParagraph:   string
  darkTitle:      string
  darkAccent:     string
  darkParagraphs: string[]
  whyTitle:       string
  whyAccent:      string
  whyItems:       WhyChooseItem[]
  keyStats:       AboutStat[]
}

export interface ClientBrand  { id:string; name:string; logoUrl:string }
export interface Supplier     { id:string; name:string; contact:string; email:string; phone:string; description:string; category:string }


export interface Customer {
  id:          string
  name:        string
  company:     string
  email:       string
  phone:       string
  industry:    string
  notes:       string
  createdAt:   string
}

export interface SiteUser {
  id:          string
  name:        string
  email:       string
  phone:       string
  source:      'signup' | 'login' | 'contact'
  createdAt:   string
  lastSeen:    string
  notes:       string
}

export interface HomeContent {
  heroEyebrow: string
  heroTitleLines: string[]
  heroChannels: string
  heroStatement: string
  searchTitle: string
  statementEyebrow: string
  statementLines: string[]
  statementBrand: string
  featureEyebrow: string
  featureTitleLine1: string
  featureTitleLine2: string
  featureBullets: string[]
  featureButtonText: string
  featureImage: string
  featureStatsLabel: string
  featureStatsValue: string
  signatureEyebrow: string
  signatureLines: string[]
  finalCtaEyebrow: string
  finalCtaTitleLine1: string
  finalCtaTitleLine2: string
  finalCtaSubtext: string
  finalCtaPrimaryText: string
  finalCtaSecondaryText: string
  finalCtaBadges: string[]
}

export interface StoreState {
  locations:    Location[]
  districts:    District[]
  services:     Service[]
  projects:     Project[]
  blogPosts:    BlogPost[]
  contacts:     Contact[]
  settings:     SiteSettings
  trustStats:   TrustStat[]
  clientBrands: ClientBrand[]
  suppliers:    Supplier[]
  process:      ProcessStep[]
  results:      { value:string; label:string; sublabel:string }[]
  about:        AboutContent
  homeContent:  HomeContent
  adFormats:    AdFormatType[]
  customers:    Customer[]
  siteUsers:    SiteUser[]
  _bbCodeSeq:   number
}

// ── Official 27 Egyptian Governorates ─────────────────────────────────────────
const ALL_GOVS: Omit<Location,'products'>[] = [
  { id:'gov-cairo',       slug:'cairo',        city:'Cairo',          headline:'Billboard Advertising in Cairo',          description:"Egypt's capital and commercial heart.",            detail:'Ring Road, Salah Salem, Downtown',          longDescription:"Cairo is Egypt's advertising capital — 22 million inhabitants, 8 million daily commuters, and the country's highest concentration of premium consumer and B2B audiences.",                          availableFormats:['Unipole Billboard','Rooftop Billboard','Bridge Panel','DOOH Screen','Street Furniture','Mall Advertising','Airport Advertising'], image:'https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop' },
  { id:'gov-alexandria',  slug:'alexandria',   city:'Alexandria',     headline:'Billboard Advertising in Alexandria',     description:"Egypt's second city and Mediterranean gateway.",   detail:'Corniche, El-Horreya Road',                 longDescription:"Alexandria is Egypt's second-largest city — 6 million residents, iconic Corniche seafront, and a thriving port economy.",                                                                          availableFormats:['Unipole Billboard','Corniche Panel','DOOH Screen','Mall Advertising','Street Furniture','Airport Advertising'],                   image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-giza',        slug:'giza',         city:'Giza',           headline:'Billboard Advertising in Giza',           description:'Home to the pyramids and 9 million residents.',   detail:'Haram, Mohandessin, Dokki, Sheikh Zayed',   longDescription:"Giza spans from the Pyramids plateau to the Nile banks — covering Mohandessin, Dokki, Sheikh Zayed City, 6th of October City, and the Haram corridor.",                                           availableFormats:['Unipole Billboard','Rooftop Billboard','DOOH Screen','Street Furniture','Mall Advertising'],                                      image:'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1400&q=90&fit=crop' },
  { id:'gov-qalyubia',    slug:'qalyubia',     city:'Qalyubia',       headline:'Billboard Advertising in Qalyubia',       description:'Northern Greater Cairo gateway.',                  detail:'Banha, Shubra El-Khayma, 10th of Ramadan',  longDescription:"Qalyubia borders Greater Cairo to the north, covering major industrial and residential areas including the New Administrative Capital corridor.",                                              availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-port-said',   slug:'port-said',    city:'Port Said',      headline:'Billboard Advertising in Port Said',      description:'Northern Canal gateway and free trade zone.',      detail:'Port Said City, Port Fouad',                longDescription:"Port Said is a major Canal Zone city and free trade hub — attracting commercial traffic and tourists year-round.",                                                                               availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-suez',        slug:'suez',         city:'Suez',           headline:'Billboard Advertising in Suez',           description:'Southern Canal industrial powerhouse.',            detail:'Suez City, Ain Sokhna',                     longDescription:"Suez anchors the southern Canal Zone with major industrial zones and the growing Ain Sokhna resort and logistics corridor.",                                                                       availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-ismailia',    slug:'ismailia',     city:'Ismailia',       headline:'Billboard Advertising in Ismailia',       description:'Canal Zone commercial and tourism hub.',           detail:'Ismailia City, Fayed, Abu Sweir',            longDescription:"Ismailia sits at the heart of the Suez Canal Zone — a strategic crossroads with a high-income government and canal authority population.",                                                         availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-damietta',    slug:'damietta',     city:'Damietta',       headline:'Billboard Advertising in Damietta',       description:'Northern Delta furniture and trade capital.',      detail:'Damietta City, New Damietta, Ras El Bar',   longDescription:"Damietta is a northern Delta governorate known for its furniture industry and coastal city of Ras El Bar, attracting summer tourism traffic.",                                                     availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-dakahlia',    slug:'dakahlia',     city:'Dakahlia',       headline:'Billboard Advertising in Dakahlia',       description:'Central Delta commercial centre.',                 detail:'Mansoura, Mit Ghamr, Talkha',               longDescription:"Dakahlia is a key Delta governorate centred on Mansoura, a major commercial and university city with a large catchment audience.",                                                                availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-sharqia',     slug:'sharqia',      city:'Sharqia',        headline:'Billboard Advertising in Sharqia',        description:'Eastern Delta agricultural and industrial zone.',   detail:'Zagazig, 10th of Ramadan City, Belbeis',    longDescription:"Sharqia is one of Egypt's most populous governorates, anchored by Zagazig city and the major industrial 10th of Ramadan City corridor.",                                                        availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-gharbia',     slug:'gharbia',      city:'Gharbia',        headline:'Billboard Advertising in Gharbia',        description:'Textile capital of the Delta.',                    detail:'Tanta, Mahalla El-Kubra, Kafr El-Zayat',    longDescription:"Gharbia is home to Tanta — a major Delta city — and Mahalla El-Kubra, one of Egypt's largest industrial and textile cities.",                                                                   availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop' },
  { id:'gov-kafr-elsheikh',slug:'kafr-el-sheikh',city:'Kafr El Sheikh',headline:'Billboard Advertising in Kafr El Sheikh',description:'Northern Delta coastal governorate.',              detail:'Kafr El Sheikh City, Desouk, Baltim',       longDescription:"Kafr El Sheikh is a northern Delta governorate with a growing commercial centre and coastal agricultural economy.",                                                                          availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-menofia',     slug:'menofia',      city:'Menofia',        headline:'Billboard Advertising in Menofia',        description:'Central Delta governorate.',                       detail:'Shebin El-Kom, Sadat City, Menouf',         longDescription:"Menofia covers a densely populated agricultural Delta region, with Sadat City emerging as a key industrial new city.",                                                                          availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-beheira',     slug:'beheira',      city:'Beheira',        headline:'Billboard Advertising in Beheira',        description:'Western Delta gateway to Alexandria.',             detail:'Damanhur, Kafr El-Dawwar, Rashid',          longDescription:"Beheira is the largest Delta governorate by area, connecting Cairo and Alexandria with a large agricultural and industrial population.",                                                           availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-faiyum',      slug:'faiyum',       city:'Faiyum',         headline:'Billboard Advertising in Faiyum',         description:'Oasis governorate with growing population.',       detail:'Faiyum City, Ibsheway, Sinnuris',           longDescription:"Faiyum is one of Egypt's oldest cities, growing as a residential and agricultural hub west of the Nile.",                                                                                        availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-beni-suef',   slug:'beni-suef',    city:'Beni Suef',      headline:'Billboard Advertising in Beni Suef',      description:'Upper Egypt northern gateway.',                   detail:'Beni Suef City, New Beni Suef, Nasser City', longDescription:"Beni Suef is a growing Upper Egypt governorate with expanding commercial and industrial activity along the Nile corridor.",                                                                  availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-minya',       slug:'minya',        city:'Minya',          headline:'Billboard Advertising in Minya',          description:"Upper Egypt's largest governorate.",               detail:'Minya City, New Minya, Mallawi',            longDescription:"Minya is the largest Upper Egypt governorate by population — a major commercial and agricultural centre with high brand reach potential.",                                                       availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-asyut',       slug:'asyut',        city:'Asyut',          headline:'Billboard Advertising in Asyut',          description:'Commercial capital of Upper Egypt.',               detail:'Asyut City, New Asyut, Abnoub',             longDescription:"Asyut is the commercial and administrative capital of Upper Egypt — a rapidly growing city with a large university and government audience.",                                                    availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-sohag',       slug:'sohag',        city:'Sohag',          headline:'Billboard Advertising in Sohag',          description:'Fast-growing Upper Egypt governorate.',            detail:'Sohag City, Akhmim, Girga',                 longDescription:"Sohag is one of Egypt's fastest-growing Upper Egypt governorates, with significant infrastructure investment and a large young population.",                                                       availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-qena',        slug:'qena',         city:'Qena',           headline:'Billboard Advertising in Qena',           description:'Tourism and Upper Egypt crossroads.',              detail:'Qena City, Nag Hammadi, Luxor border',      longDescription:"Qena links Luxor and Asyut along the Nile — a strategic location for brands targeting both tourism and domestic Upper Egypt audiences.",                                                         availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-luxor',       slug:'luxor',        city:'Luxor',          headline:'Billboard Advertising in Luxor',          description:'World heritage tourism capital.',                  detail:'Luxor City, West Bank, Karnak',             longDescription:"Luxor is one of Egypt's premier tourism destinations — home to the Valley of the Kings, Karnak Temple, and millions of international visitors annually.",                                         availableFormats:['Unipole Billboard','DOOH Screen','Airport Advertising','Street Furniture'],                                                       image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-aswan',       slug:'aswan',        city:'Aswan',          headline:'Billboard Advertising in Aswan',          description:'Southern Egypt gateway and tourism hub.',          detail:'Aswan City, Corniche, Kom Ombo',            longDescription:"Aswan is Egypt's southernmost major city — a premium tourism and hospitality market attracting affluent domestic and international visitors.",                                                      availableFormats:['Unipole Billboard','DOOH Screen','Airport Advertising','Street Furniture'],                                                       image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-red-sea',     slug:'red-sea',      city:'Red Sea',        headline:'Billboard Advertising — Red Sea',         description:'Premier resort and tourism corridor.',             detail:'Hurghada, El Gouna, Marsa Alam',            longDescription:"The Red Sea governorate covers Egypt's premier resort coastline — Hurghada, El Gouna, Marsa Alam — attracting millions of domestic and international tourists.",                                  availableFormats:['Unipole Billboard','DOOH Screen','Airport Advertising','Street Furniture'],                                                       image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-new-valley',  slug:'new-valley',   city:'New Valley',     headline:'Billboard Advertising — New Valley',      description:'Western desert development corridor.',             detail:'Kharga, Dakhla, Farafra',                   longDescription:"New Valley is Egypt's largest governorate by area, covering the Western Desert oases of Kharga, Dakhla, and Farafra with growing infrastructure investment.",                                      availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-matrouh',     slug:'matrouh',      city:'Matrouh',        headline:'Billboard Advertising in Matrouh',        description:'Mediterranean coast resort governorate.',          detail:'Marsa Matrouh, El-Alamein, Sidi Barrani',   longDescription:"Matrouh governorate spans Egypt's Mediterranean coastline — Marsa Matrouh city is the capital, with El-Alamein and the North Coast corridor experiencing massive tourism and real estate growth.", availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                            image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-north-sinai', slug:'north-sinai',  city:'North Sinai',    headline:'Billboard Advertising — North Sinai',     description:'Arish and development corridor.',                  detail:'El-Arish, Sheikh Zuweid, Rafah',            longDescription:"North Sinai is a developing governorate centred on El-Arish, with growing infrastructure and commercial activity.",                                                                              availableFormats:['Unipole Billboard','Street Furniture'],                                                                                          image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-south-sinai', slug:'south-sinai',  city:'South Sinai',    headline:'Billboard Advertising — South Sinai',     description:"Sharm El-Sheikh resort corridor.",                 detail:'Sharm El-Sheikh, Dahab, Taba, Nuweiba',    longDescription:"South Sinai is Egypt's premium international resort destination — Sharm El-Sheikh alone handles millions of tourist arrivals annually.",                                                         availableFormats:['Unipole Billboard','DOOH Screen','Airport Advertising','Street Furniture'],                                                       image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
]

// ── Default districts per governorate ─────────────────────────────────────────
const DEFAULT_DISTRICTS: District[] = [
  // Cairo
  {id:'d-cairo-1', locationId:'gov-cairo',       name:'Nasr City'},
  {id:'d-cairo-2', locationId:'gov-cairo',       name:'Heliopolis'},
  {id:'d-cairo-3', locationId:'gov-cairo',       name:'Maadi'},
  {id:'d-cairo-4', locationId:'gov-cairo',       name:'Zamalek'},
  {id:'d-cairo-5', locationId:'gov-cairo',       name:'Downtown'},
  {id:'d-cairo-6', locationId:'gov-cairo',       name:'Shubra'},
  {id:'d-cairo-7', locationId:'gov-cairo',       name:'Ain Shams'},
  {id:'d-cairo-8', locationId:'gov-cairo',       name:'Abbassia'},
  {id:'d-cairo-9', locationId:'gov-cairo',       name:'New Cairo (Tagammu)'},
  {id:'d-cairo-10',locationId:'gov-cairo',       name:'Badr City'},
  {id:'d-cairo-11',locationId:'gov-cairo',       name:'New Administrative Capital'},
  // Alexandria
  {id:'d-alex-1',  locationId:'gov-alexandria',  name:'Corniche'},
  {id:'d-alex-2',  locationId:'gov-alexandria',  name:'Smouha'},
  {id:'d-alex-3',  locationId:'gov-alexandria',  name:'Sidi Bishr'},
  {id:'d-alex-4',  locationId:'gov-alexandria',  name:'Stanley'},
  {id:'d-alex-5',  locationId:'gov-alexandria',  name:'Miami'},
  {id:'d-alex-6',  locationId:'gov-alexandria',  name:'El-Horreya'},
  {id:'d-alex-7',  locationId:'gov-alexandria',  name:'Montaza'},
  {id:'d-alex-8',  locationId:'gov-alexandria',  name:'Agami'},
  {id:'d-alex-9',  locationId:'gov-alexandria',  name:'Borg El Arab'},
  // Giza (includes Sheikh Zayed and 6th of October as districts)
  {id:'d-giza-1',  locationId:'gov-giza',        name:'Mohandessin'},
  {id:'d-giza-2',  locationId:'gov-giza',        name:'Dokki'},
  {id:'d-giza-3',  locationId:'gov-giza',        name:'Haram'},
  {id:'d-giza-4',  locationId:'gov-giza',        name:'Agouza'},
  {id:'d-giza-5',  locationId:'gov-giza',        name:'Imbaba'},
  {id:'d-giza-6',  locationId:'gov-giza',        name:'Sheikh Zayed City'},
  {id:'d-giza-7',  locationId:'gov-giza',        name:'6th of October City'},
  {id:'d-giza-8',  locationId:'gov-giza',        name:'26 July Corridor'},
  {id:'d-giza-9',  locationId:'gov-giza',        name:'Hadayek October'},
  {id:'d-giza-10', locationId:'gov-giza',        name:'Giza City Centre'},
  // Qalyubia
  {id:'d-qal-1',   locationId:'gov-qalyubia',    name:'Banha'},
  {id:'d-qal-2',   locationId:'gov-qalyubia',    name:'Shubra El-Khayma'},
  {id:'d-qal-3',   locationId:'gov-qalyubia',    name:'Qalyub'},
  {id:'d-qal-4',   locationId:'gov-qalyubia',    name:'Khanka'},
  {id:'d-qal-5',   locationId:'gov-qalyubia',    name:'10th of Ramadan City'},
  // Port Said
  {id:'d-ps-1',    locationId:'gov-port-said',   name:'Port Said City'},
  {id:'d-ps-2',    locationId:'gov-port-said',   name:'Port Fouad'},
  {id:'d-ps-3',    locationId:'gov-port-said',   name:'El-Manakh'},
  // Suez
  {id:'d-suez-1',  locationId:'gov-suez',        name:'Suez City'},
  {id:'d-suez-2',  locationId:'gov-suez',        name:'Ain Sokhna'},
  {id:'d-suez-3',  locationId:'gov-suez',        name:'Ataqah'},
  {id:'d-suez-4',  locationId:'gov-suez',        name:'El-Arbaeen'},
  // Ismailia
  {id:'d-ism-1',   locationId:'gov-ismailia',    name:'Ismailia City'},
  {id:'d-ism-2',   locationId:'gov-ismailia',    name:'Fayed'},
  {id:'d-ism-3',   locationId:'gov-ismailia',    name:'Abu Sweir'},
  // Damietta
  {id:'d-dam-1',   locationId:'gov-damietta',    name:'Damietta City'},
  {id:'d-dam-2',   locationId:'gov-damietta',    name:'New Damietta'},
  {id:'d-dam-3',   locationId:'gov-damietta',    name:'Ras El Bar'},
  {id:'d-dam-4',   locationId:'gov-damietta',    name:'Faraskur'},
  // Dakahlia
  {id:'d-dak-1',   locationId:'gov-dakahlia',    name:'Mansoura'},
  {id:'d-dak-2',   locationId:'gov-dakahlia',    name:'Mit Ghamr'},
  {id:'d-dak-3',   locationId:'gov-dakahlia',    name:'Talkha'},
  {id:'d-dak-4',   locationId:'gov-dakahlia',    name:'Aga'},
  // Sharqia
  {id:'d-sha-1',   locationId:'gov-sharqia',     name:'Zagazig'},
  {id:'d-sha-2',   locationId:'gov-sharqia',     name:'10th of Ramadan City'},
  {id:'d-sha-3',   locationId:'gov-sharqia',     name:'Belbeis'},
  {id:'d-sha-4',   locationId:'gov-sharqia',     name:'Abu Hammad'},
  // Gharbia
  {id:'d-gha-1',   locationId:'gov-gharbia',     name:'Tanta'},
  {id:'d-gha-2',   locationId:'gov-gharbia',     name:'Mahalla El-Kubra'},
  {id:'d-gha-3',   locationId:'gov-gharbia',     name:'Kafr El-Zayat'},
  {id:'d-gha-4',   locationId:'gov-gharbia',     name:'Zefta'},
  // Kafr El Sheikh
  {id:'d-kfs-1',   locationId:'gov-kafr-elsheikh',name:'Kafr El Sheikh City'},
  {id:'d-kfs-2',   locationId:'gov-kafr-elsheikh',name:'Desouk'},
  {id:'d-kfs-3',   locationId:'gov-kafr-elsheikh',name:'Baltim'},
  // Menofia
  {id:'d-men-1',   locationId:'gov-menofia',     name:'Shebin El-Kom'},
  {id:'d-men-2',   locationId:'gov-menofia',     name:'Sadat City'},
  {id:'d-men-3',   locationId:'gov-menofia',     name:'Menouf'},
  {id:'d-men-4',   locationId:'gov-menofia',     name:'Quesna'},
  // Beheira
  {id:'d-beh-1',   locationId:'gov-beheira',     name:'Damanhur'},
  {id:'d-beh-2',   locationId:'gov-beheira',     name:'Kafr El-Dawwar'},
  {id:'d-beh-3',   locationId:'gov-beheira',     name:'Rashid (Rosetta)'},
  {id:'d-beh-4',   locationId:'gov-beheira',     name:'Edku'},
  // Faiyum
  {id:'d-fai-1',   locationId:'gov-faiyum',      name:'Faiyum City'},
  {id:'d-fai-2',   locationId:'gov-faiyum',      name:'Ibsheway'},
  {id:'d-fai-3',   locationId:'gov-faiyum',      name:'Sinnuris'},
  // Beni Suef
  {id:'d-bs-1',    locationId:'gov-beni-suef',   name:'Beni Suef City'},
  {id:'d-bs-2',    locationId:'gov-beni-suef',   name:'New Beni Suef'},
  {id:'d-bs-3',    locationId:'gov-beni-suef',   name:'El Fashn'},
  // Minya
  {id:'d-min-1',   locationId:'gov-minya',       name:'Minya City'},
  {id:'d-min-2',   locationId:'gov-minya',       name:'New Minya'},
  {id:'d-min-3',   locationId:'gov-minya',       name:'Mallawi'},
  {id:'d-min-4',   locationId:'gov-minya',       name:'Beni Mazar'},
  // Asyut
  {id:'d-asy-1',   locationId:'gov-asyut',       name:'Asyut City'},
  {id:'d-asy-2',   locationId:'gov-asyut',       name:'New Asyut'},
  {id:'d-asy-3',   locationId:'gov-asyut',       name:'Abnoub'},
  {id:'d-asy-4',   locationId:'gov-asyut',       name:'El Qusiya'},
  // Sohag
  {id:'d-soh-1',   locationId:'gov-sohag',       name:'Sohag City'},
  {id:'d-soh-2',   locationId:'gov-sohag',       name:'Akhmim'},
  {id:'d-soh-3',   locationId:'gov-sohag',       name:'Girga'},
  // Qena
  {id:'d-qen-1',   locationId:'gov-qena',        name:'Qena City'},
  {id:'d-qen-2',   locationId:'gov-qena',        name:'Nag Hammadi'},
  {id:'d-qen-3',   locationId:'gov-qena',        name:'Qus'},
  // Luxor
  {id:'d-lux-1',   locationId:'gov-luxor',       name:'Luxor City'},
  {id:'d-lux-2',   locationId:'gov-luxor',       name:'West Bank'},
  {id:'d-lux-3',   locationId:'gov-luxor',       name:'Karnak'},
  {id:'d-lux-4',   locationId:'gov-luxor',       name:'New Luxor'},
  // Aswan
  {id:'d-asw-1',   locationId:'gov-aswan',       name:'Aswan City'},
  {id:'d-asw-2',   locationId:'gov-aswan',       name:'Corniche Aswan'},
  {id:'d-asw-3',   locationId:'gov-aswan',       name:'Kom Ombo'},
  {id:'d-asw-4',   locationId:'gov-aswan',       name:'Edfu'},
  // Red Sea
  {id:'d-rs-1',    locationId:'gov-red-sea',     name:'Hurghada'},
  {id:'d-rs-2',    locationId:'gov-red-sea',     name:'El Gouna'},
  {id:'d-rs-3',    locationId:'gov-red-sea',     name:'Marsa Alam'},
  {id:'d-rs-4',    locationId:'gov-red-sea',     name:'Safaga'},
  {id:'d-rs-5',    locationId:'gov-red-sea',     name:'Sahl Hasheesh'},
  // New Valley
  {id:'d-nv-1',    locationId:'gov-new-valley',  name:'Kharga'},
  {id:'d-nv-2',    locationId:'gov-new-valley',  name:'Dakhla'},
  {id:'d-nv-3',    locationId:'gov-new-valley',  name:'Farafra'},
  // Matrouh
  {id:'d-mat-1',   locationId:'gov-matrouh',     name:'Marsa Matrouh'},
  {id:'d-mat-2',   locationId:'gov-matrouh',     name:'El-Alamein'},
  {id:'d-mat-3',   locationId:'gov-matrouh',     name:'Sidi Barrani'},
  {id:'d-mat-4',   locationId:'gov-matrouh',     name:'North Coast'},
  {id:'d-mat-5',   locationId:'gov-matrouh',     name:'Ras El Hekma'},
  // North Sinai
  {id:'d-ns-1',    locationId:'gov-north-sinai', name:'El-Arish'},
  {id:'d-ns-2',    locationId:'gov-north-sinai', name:'Sheikh Zuweid'},
  {id:'d-ns-3',    locationId:'gov-north-sinai', name:'Rafah'},
  // South Sinai
  {id:'d-ss-1',    locationId:'gov-south-sinai', name:'Sharm El-Sheikh'},
  {id:'d-ss-2',    locationId:'gov-south-sinai', name:'Dahab'},
  {id:'d-ss-3',    locationId:'gov-south-sinai', name:'Taba'},
  {id:'d-ss-4',    locationId:'gov-south-sinai', name:'Nuweiba'},
  {id:'d-ss-5',    locationId:'gov-south-sinai', name:'El-Tor'},
]

// ── About Us default content ──────────────────────────────────────────────────
const DEFAULT_ABOUT: AboutContent = {
  heroEyebrow:   'Our Story',
  heroTitle:     'About Horizon OOH.',
  heroAccent:    'We control visibility.',
  introHeadline: "Egypt's leading outdoor advertising partner — since 2008.",
  introParagraph1: "Horizon OOH was founded with one conviction: that the most powerful advertising in the world happens in the physical world — where brands and people share real space.",
  introParagraph2: "We built Egypt's largest premium outdoor network from the ground up, and today we manage 9,500+ locations across Cairo, Alexandria, the North Coast, and every major urban centre in the country.",
  seoHeading: "Egypt's Leading Outdoor Advertising Agency",
  seoParagraph: "Since 2008, HORIZON OOH has been the outdoor advertising agency of choice for Egypt's most iconic brands. Our billboard advertising network spans Cairo's Ring Road, Giza, New Cairo, and Alexandria's Corniche — delivering unparalleled outdoor advertising reach across Egypt's 100 million+ population.",
  darkTitle:  'More than media.',
  darkAccent: 'A visibility partner.',
  darkParagraphs: [
    "Horizon OOH is Egypt's most trusted outdoor advertising company. We don't just sell space — we engineer visibility. Our proprietary network spans highways, malls, airports, city streets, and digital screens, giving brands the infrastructure to be seen everywhere that matters.",
    "Our team of 200+ professionals combines media strategy, data science, creative production, and operational excellence to deliver campaigns that move the needle. We work with Egypt's leading FMCG brands, financial institutions, automotive companies, real estate developers, and international brands entering the Egyptian market.",
    "In 2025 alone, we delivered 1,200+ campaigns, generating over 12 billion OOH impressions across Egypt. Our proprietary traffic and audience data platform lets us predict campaign performance before a single panel goes up.",
  ],
  whyTitle:  'Five reasons brands',
  whyAccent: 'choose us.',
  whyItems: [
    { id:'w1', num:'01', title:'Largest Network in Egypt',   desc:'9,500+ premium locations nationwide — more inventory, more reach, more impact.' },
    { id:'w2', num:'02', title:'Data-Driven Site Selection', desc:'Every location selected using traffic count data, audience mapping, and visibility analysis.' },
    { id:'w3', num:'03', title:'Full-Service Execution',     desc:'From creative brief to installation and monitoring — one partner for your entire campaign.' },
    { id:'w4', num:'04', title:'Proven Performance',         desc:'Average 2.7× conversion lift and +180% brand recall across campaigns tracked in 2025.' },
    { id:'w5', num:'05', title:'Exclusive Premium Inventory',desc:"First-access rights to Egypt's most sought-after outdoor advertising positions." },
  ],
  keyStats: [
    { id:'ks1', value:'9,500+', label:'Premium Locations', sub:'Nationwide' },
    { id:'ks2', value:'18',     label:'Years in Business',  sub:'Since 2008'  },
    { id:'ks3', value:'100+',   label:'Brand Partners',     sub:'Active clients' },
  ],
}

function buildDefaultLocations(): Location[] {
  return ALL_GOVS.map(gov => {
    const legacy = LOCATIONS.find(l => l.id === gov.id || l.slug === gov.slug)
    return { ...gov, products: legacy?.products || [] } as Location
  })
}

// ── Default state ─────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: SiteSettings = {
  companyName:'HORIZON OOH', tagline:"Egypt's Premier Out-of-Home Media Company",
  email:'hello@horizonooh.com', phone:'+20 2 1234 5678',
  address:'Cairo, Egypt', whatsapp:'+201234567890',
  metaDescription:"Egypt's leading outdoor advertising company. Premium billboard, DOOH, mall, and airport advertising across Cairo, Alexandria, and nationwide.",
  headerLogoUrl:'', footerLogoUrl:'', faviconUrl:'',
  hqLabel:'Cairo HQ', homeCoverageLimit:6,
  socialLinks:{ facebook:'', instagram:'', linkedin:'', twitter:'', tiktok:'', youtube:'' },
}
const DEFAULT_CLIENT_BRANDS: ClientBrand[] = CLIENT_BRANDS.map((name,i) => ({id:String(i+1), name, logoUrl:''}))
const DEFAULT_SUPPLIERS: Supplier[] = []
const DEFAULT_TRUST_STATS: TrustStat[]  = TRUST_STATS.map((s,i) => ({id:String(i+1),...s}))
const DEFAULT_PROCESS:     ProcessStep[] = PROCESS.map((p,i) => ({id:String(i+1),...p}))


const DEFAULT_HOME_CONTENT: HomeContent = {
  heroEyebrow:        "Egypt's Premier OOH Network",
  heroTitleLines:     ['Outdoor', 'Advertising', 'Agency.'],
  heroChannels:       'Billboards · DOOH · Malls · Airports',
  heroStatement:      'We make brands impossible to ignore.',
  searchTitle:        'Find a Billboard',
  statementEyebrow:   'A thought',
  statementLines:     ['"If your brand', "isn't seen,", 'it doesn\'t exist."'],
  statementBrand:     'HORIZON OOH',
  featureEyebrow:     'Billboard Advertising',
  featureTitleLine1:  'Own',
  featureTitleLine2:  'the road.',
  featureBullets: [
    "Prime roadside locations across Egypt's highest-traffic corridors",
    'Millions of daily impressions — maximum brand visibility',
    'High-impact large-format that stops people in their tracks',
  ],
  featureButtonText:  'Book a Billboard',
  featureImage:       'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1000&q=90&fit=crop',
  featureStatsLabel:  'Daily Impressions',
  featureStatsValue:  '4.2M+',
  signatureEyebrow:   'Brand Philosophy',
  signatureLines:     ['WE MAKE BRANDS', 'IMPOSSIBLE', 'TO IGNORE.'],
  finalCtaEyebrow:    "Let's Work Together",
  finalCtaTitleLine1: 'Ready to launch',
  finalCtaTitleLine2: 'your campaign?',
  finalCtaSubtext:    "Let's put your brand where it gets seen.",
  finalCtaPrimaryText:   'Get a Quote',
  finalCtaSecondaryText: 'Call Us',
  finalCtaBadges: ['No long-term contracts', 'Nationwide coverage', '24-hr response'],
}

const DEFAULT_AD_FORMATS: AdFormatType[] = [
  { id:'af1', label:'Billboard' },
  { id:'af2', label:'Digital Screens' },
  { id:'af3', label:'Mall Advertising' },
  { id:'af4', label:'Airport Advertising' },
  { id:'af5', label:'Transit Ads' },
]

function defaultState(): StoreState {
  return {
    locations:    buildDefaultLocations(),
    districts:    DEFAULT_DISTRICTS,
    services:     SERVICES,
    projects:     PROJECTS,
    blogPosts:    BLOG_POSTS,
    contacts:     [],
    settings:     DEFAULT_SETTINGS,
    trustStats:   DEFAULT_TRUST_STATS,
    clientBrands: DEFAULT_CLIENT_BRANDS,
    suppliers:    DEFAULT_SUPPLIERS,
    process:      DEFAULT_PROCESS,
    results:      RESULTS,
    about:        DEFAULT_ABOUT,
    homeContent:  DEFAULT_HOME_CONTENT,
    adFormats:    DEFAULT_AD_FORMATS,
    customers:    [],
    siteUsers:    [],
    _bbCodeSeq:   1918,
  }
}

// ── Storage ───────────────────────────────────────────────────────────────────
const KEY = 'horizon_store'
function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const p = JSON.parse(raw) as Partial<StoreState>
    const d = defaultState()
    return {
      locations:    p.locations    ?? d.locations,
      districts:    p.districts    ?? d.districts,
      services:     p.services     ?? d.services,
      projects:     p.projects     ?? d.projects,
      blogPosts:    p.blogPosts    ?? d.blogPosts,
      contacts:     p.contacts     ?? d.contacts,
      settings:     p.settings     ? { ...d.settings, ...p.settings }         : d.settings,
      trustStats:   p.trustStats   ?? d.trustStats,
      clientBrands: p.clientBrands ?? d.clientBrands,
      suppliers:    p.suppliers    ?? d.suppliers,
      process:      p.process      ?? d.process,
      results:      p.results      ?? d.results,
      about:        p.about        ? { ...d.about, ...p.about }               : d.about,
      homeContent:  p.homeContent  ? { ...d.homeContent, ...p.homeContent }   : d.homeContent,
      adFormats:    p.adFormats    ?? d.adFormats,
      customers:    p.customers    ?? d.customers,
      siteUsers:    p.siteUsers    ?? d.siteUsers,
      _bbCodeSeq:   p._bbCodeSeq   ?? d._bbCodeSeq,
    }
  } catch { return defaultState() }
}
function save(s: StoreState) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} }

// ── Reactive store ────────────────────────────────────────────────────────────
type Listener = ()=>void
const listeners = new Set<Listener>()
let _state: StoreState = load()
export function getState(): StoreState { return _state }
function setState(u: (s:StoreState)=>StoreState) { _state=u(_state); save(_state); listeners.forEach(l=>l()) }
export function subscribe(fn:Listener) { listeners.add(fn); return ()=>listeners.delete(fn) }
export function resetToDefaults() { _state=defaultState(); localStorage.removeItem(KEY); listeners.forEach(l=>l()) }

import { useState, useEffect } from 'react'
export function useStore(): StoreState {
  const [s,set] = useState<StoreState>(getState)
  useEffect(()=>{ const unsub=subscribe(()=>set(getState())); return ()=>{ unsub() } },[])
  return s
}
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2) }

// ── CRUD exports ──────────────────────────────────────────────────────────────
export const locationStore = {
  add:    (x:Omit<Location,'id'>)            => setState(s=>({...s,locations:[...s.locations,{...x,id:uid()} as Location]})),
  update: (id:string,p:Partial<Location>)    => setState(s=>({...s,locations:s.locations.map(l=>l.id===id?{...l,...p}:l)})),
  remove: (id:string)                         => setState(s=>({...s,locations:s.locations.filter(l=>l.id!==id)})),
}
export const districtStore = {
  add:    (x:Omit<District,'id'>)            => setState(s=>({...s,districts:[...s.districts,{...x,id:uid()}]})),
  update: (id:string,p:Partial<District>)    => setState(s=>({...s,districts:s.districts.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                         => setState(s=>({...s,districts:s.districts.filter(x=>x.id!==id)})),
}
export const serviceStore = {
  add:    (x:Omit<Service,'id'>)             => setState(s=>({...s,services:[...s.services,{...x,id:uid()} as Service]})),
  update: (id:string,p:Partial<Service>)     => setState(s=>({...s,services:s.services.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                         => setState(s=>({...s,services:s.services.filter(x=>x.id!==id)})),
}
export const projectStore = {
  add:    (x:Omit<Project,'id'>)             => setState(s=>({...s,projects:[...s.projects,{...x,id:uid()} as Project]})),
  update: (id:string,p:Partial<Project>)     => setState(s=>({...s,projects:s.projects.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                         => setState(s=>({...s,projects:s.projects.filter(x=>x.id!==id)})),
}
export const blogStore = {
  add:    (x:Omit<BlogPost,'id'>)            => setState(s=>({...s,blogPosts:[...s.blogPosts,{...x,id:uid()} as BlogPost]})),
  update: (id:string,p:Partial<BlogPost>)    => setState(s=>({...s,blogPosts:s.blogPosts.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                         => setState(s=>({...s,blogPosts:s.blogPosts.filter(x=>x.id!==id)})),
}
export const contactStore = {
  add:    (x:Omit<Contact,'id'|'status'|'createdAt'>) => setState(s=>({...s,contacts:[{...x,id:uid(),status:'new',createdAt:new Date().toISOString()},...s.contacts]})),
  update: (id:string,p:Partial<Contact>)     => setState(s=>({...s,contacts:s.contacts.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                         => setState(s=>({...s,contacts:s.contacts.filter(x=>x.id!==id)})),
}
export const settingsStore   = { update:(p:Partial<SiteSettings>)=>setState(s=>({...s,settings:{...s.settings,...p}})) }
export const trustStatStore  = {
  add:    (x:Omit<TrustStat,'id'>)           => setState(s=>({...s,trustStats:[...s.trustStats,{...x,id:uid()}]})),
  update: (id:string,p:Partial<TrustStat>)   => setState(s=>({...s,trustStats:s.trustStats.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                         => setState(s=>({...s,trustStats:s.trustStats.filter(x=>x.id!==id)})),
}
export const brandStore = {
  add:    (x:Omit<ClientBrand,'id'>)           => setState(s=>({...s,clientBrands:[...s.clientBrands,{...x,id:uid()}]})),
  update: (id:string,p:Partial<ClientBrand>)   => setState(s=>({...s,clientBrands:s.clientBrands.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                           => setState(s=>({...s,clientBrands:s.clientBrands.filter(x=>x.id!==id)})),
  set:    (brands:ClientBrand[])               => setState(s=>({...s,clientBrands:brands})),
}
export const supplierStore = {
  add:    (x:Omit<Supplier,'id'>)              => setState(s=>({...s,suppliers:[...s.suppliers,{...x,id:uid()}]})),
  update: (id:string,p:Partial<Supplier>)      => setState(s=>({...s,suppliers:s.suppliers.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                           => setState(s=>({...s,suppliers:s.suppliers.filter(x=>x.id!==id)})),
}
export const processStore    = {
  add:    (x:Omit<ProcessStep,'id'>)          => setState(s=>({...s,process:[...s.process,{...x,id:uid()}]})),
  update: (id:string,p:Partial<ProcessStep>)  => setState(s=>({...s,process:s.process.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                          => setState(s=>({...s,process:s.process.filter(x=>x.id!==id)})),
  reorder:(steps:ProcessStep[])                => setState(s=>({...s,process:steps})),
}
export const resultStore     = { set:(results:StoreState['results'])=>setState(s=>({...s,results})) }
export const aboutStore      = { update:(p:Partial<AboutContent>)=>setState(s=>({...s,about:{...s.about,...p}})) }
export const homeStore       = { update:(p:Partial<HomeContent>)=>setState(s=>({...s,homeContent:{...s.homeContent,...p}})) }

export const customerStore = {
  add:    (x:Omit<Customer,'id'|'createdAt'>)         => setState(s=>({...s,customers:[{...x,id:uid(),createdAt:new Date().toISOString()},...s.customers]})),
  update: (id:string,p:Partial<Customer>)             => setState(s=>({...s,customers:s.customers.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                                  => setState(s=>({...s,customers:s.customers.filter(x=>x.id!==id)})),
}
export const siteUserStore = {
  upsert: (email:string, data:Partial<Omit<SiteUser,'id'>>) => setState(s=>{
    const existing = s.siteUsers.find(u=>u.email===email)
    if (existing) {
      return {...s, siteUsers: s.siteUsers.map(u=>u.email===email ? {...u,...data,lastSeen:new Date().toISOString()} : u)}
    }
    return {...s, siteUsers:[{id:uid(),name:'',phone:'',notes:'',source:'signup',createdAt:new Date().toISOString(),lastSeen:new Date().toISOString(),...data,email},...s.siteUsers]}
  }),
  update: (id:string,p:Partial<SiteUser>)             => setState(s=>({...s,siteUsers:s.siteUsers.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                                  => setState(s=>({...s,siteUsers:s.siteUsers.filter(x=>x.id!==id)})),
}
/** Generate next unique billboard code like H-1918 */
export function nextBillboardCode(): string {
  let seq = 0
  setState(s=>{ seq=s._bbCodeSeq; return {...s,_bbCodeSeq:s._bbCodeSeq+1} })
  return `H-${seq}`
}
export const adFormatStore = {
  add:    (x:Omit<AdFormatType,'id'>)           => setState(s=>({...s,adFormats:[...s.adFormats,{...x,id:uid()}]})),
  update: (id:string,p:Partial<AdFormatType>)   => setState(s=>({...s,adFormats:s.adFormats.map(x=>x.id===id?{...x,...p}:x)})),
  remove: (id:string)                            => setState(s=>({...s,adFormats:s.adFormats.filter(x=>x.id!==id)})),
}
