
// ─────────────────────────────────────────────────────────────────────────────
// HORIZON OOH — Central Data Store (localStorage-backed)
// ─────────────────────────────────────────────────────────────────────────────

import {
  LOCATIONS, SERVICES, PROJECTS, BLOG_POSTS,
  TRUST_STATS, CLIENT_BRANDS, PROCESS, RESULTS,
  type Location, type Service, type Project, type BlogPost,
} from '../data/index'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface District {
  id:         string
  name:       string
  locationId: string   // governorate id
}

export interface Contact {
  id:        string
  name:      string
  email:     string
  phone?:    string
  company?:  string
  subject?:  string
  message:   string
  status:    'new' | 'read' | 'replied' | 'archived'
  createdAt: string
}

export interface SiteSettings {
  companyName:     string
  tagline:         string
  email:           string
  phone:           string
  address:         string
  whatsapp:        string
  metaDescription: string
}

export interface TrustStat  { id: string; value: string; label: string }
export interface ProcessStep { id: string; step: string; label: string; description: string }

export interface StoreState {
  locations:    Location[]
  districts:    District[]
  services:     Service[]
  projects:     Project[]
  blogPosts:    BlogPost[]
  contacts:     Contact[]
  settings:     SiteSettings
  trustStats:   TrustStat[]
  clientBrands: string[]
  process:      ProcessStep[]
  results:      { value: string; label: string; sublabel: string }[]
}

// ── All 27 Egyptian Governorates ──────────────────────────────────────────────
const ALL_GOVS: Omit<Location, 'products'>[] = [
  { id:'gov-cairo',        slug:'cairo',         city:'Cairo',           headline:'Billboard Advertising in Cairo',           description:"Egypt's capital and commercial heart.",      detail:'Ring Road, Salah Salem, Downtown',         longDescription:'Cairo is Egypt\'s advertising capital — 22 million inhabitants, 8 million daily commuters, and the country\'s highest concentration of premium consumer audiences.',        availableFormats:['Unipole Billboard','Rooftop Billboard','Bridge Panel','DOOH Screen','Street Furniture','Mall Advertising'], image:'https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop' },
  { id:'gov-giza',         slug:'giza',          city:'Giza',            headline:'Billboard Advertising in Giza',            description:'Home to the pyramids and 9 million residents.',  detail:'Haram, Mohandessin, Dokki',                longDescription:'Giza spans from the Pyramids plateau to the banks of the Nile — covering some of Egypt\'s most densely populated and commercially active districts.',                   availableFormats:['Unipole Billboard','Rooftop Billboard','DOOH Screen','Street Furniture','Mall Advertising'],                          image:'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1400&q=90&fit=crop' },
  { id:'gov-alexandria',   slug:'alexandria',    city:'Alexandria',      headline:'Billboard Advertising in Alexandria',      description:"Egypt's second city and Mediterranean gateway.", detail:'Corniche, El-Horreya Road',                longDescription:'Alexandria is Egypt\'s second-largest city and Mediterranean commercial hub — with 6 million residents and the iconic Corniche seafront.',                             availableFormats:['Unipole Billboard','Corniche Panel','DOOH Screen','Mall Advertising','Street Furniture'],                              image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-qalyubia',     slug:'qalyubia',      city:'Qalyubia',        headline:'Billboard Advertising in Qalyubia',        description:'Northern Greater Cairo industrial hub.',          detail:'Banha, Qalyub, Shubra El-Khayma',          longDescription:'Qalyubia governorate borders Greater Cairo to the north, covering major industrial and residential areas with high commuter traffic.',                               availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-sharqia',      slug:'sharqia',       city:'Sharqia',         headline:'Billboard Advertising in Sharqia',         description:'Eastern Delta agricultural and industrial zone.',  detail:'Zagazig, 10th of Ramadan City',            longDescription:'Sharqia is one of Egypt\'s most populous governorates, anchored by Zagazig city and the major industrial 10th of Ramadan City.',                                   availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-dakahlia',     slug:'dakahlia',      city:'Dakahlia',        headline:'Billboard Advertising in Dakahlia',        description:'Central Delta commercial centre.',                detail:'Mansoura, Mit Ghamr',                      longDescription:'Dakahlia is a key Delta governorate centred on Mansoura, a major commercial and university city with a large catchment audience.',                                  availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-gharbia',      slug:'gharbia',       city:'Gharbia',         headline:'Billboard Advertising in Gharbia',         description:'Textile capital of the Delta.',                  detail:'Tanta, Mahalla El-Kubra',                  longDescription:'Gharbia governorate is home to Tanta — a major Delta city — and Mahalla El-Kubra, one of Egypt\'s largest industrial and textile cities.',                         availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop' },
  { id:'gov-menofia',      slug:'menofia',       city:'Menofia',         headline:'Billboard Advertising in Menofia',         description:'Central Delta governorate.',                     detail:'Shebin El-Kom, Sadat City',                longDescription:'Menofia covers a densely populated agricultural Delta region, with Sadat City emerging as a key industrial new city.',                                              availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-beheira',      slug:'beheira',       city:'Beheira',         headline:'Billboard Advertising in Beheira',         description:'Western Delta gateway to Alexandria.',            detail:'Damanhur, Kafr El-Dawwar',                 longDescription:'Beheira is the largest Delta governorate by area, connecting Cairo and Alexandria with a large agricultural and industrial population.',                              availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-kafr-elsheikh',slug:'kafr-el-sheikh',city:'Kafr El Sheikh',  headline:'Billboard Advertising in Kafr El Sheikh',  description:'Northern Delta coastal governorate.',            detail:'Kafr El Sheikh City, Desouk',              longDescription:'Kafr El Sheikh is a northern Delta governorate with a growing commercial centre and coastal agricultural economy.',                                               availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-ismailia',     slug:'ismailia',      city:'Ismailia',        headline:'Billboard Advertising in Ismailia',        description:'Canal Zone commercial and tourism hub.',          detail:'Ismailia City, New Ismailia',              longDescription:'Ismailia sits at the heart of the Suez Canal Zone — a strategic commercial crossroads with a high-income government and canal authority population.',               availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-port-said',    slug:'port-said',     city:'Port Said',       headline:'Billboard Advertising in Port Said',       description:'Northern Canal gateway and free trade zone.',    detail:'Port Said City, Port Fouad',               longDescription:'Port Said is a major Canal Zone city and free trade hub — attracting commercial traffic and tourists year-round.',                                                  availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-suez',         slug:'suez',          city:'Suez',            headline:'Billboard Advertising in Suez',            description:'Southern Canal industrial powerhouse.',           detail:'Suez City, Ain Sokhna',                    longDescription:'Suez governorate anchors the southern Canal Zone, with major industrial zones and the growing Ain Sokhna resort and logistics corridor.',                           availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-new-cairo',    slug:'new-cairo',     city:'New Cairo',       headline:'Billboard Advertising in New Cairo',       description:"Egypt's fastest-growing premium district.",       detail:'90th Street, Fifth Settlement',            longDescription:'New Cairo is Egypt\'s most affluent and fastest-growing urban district — home to premium residential compounds and Egypt\'s leading universities.',                  availableFormats:['Mega Billboard','Unipole Billboard','DOOH Screen','Mall Advertising','Street Furniture'],                              image:'https://images.unsplash.com/photo-1735506943281-4b4502be999d?w=1400&q=90&fit=crop' },
  { id:'gov-sheikh-zayed', slug:'sheikh-zayed',  city:'Sheikh Zayed',    headline:'Billboard Advertising in Sheikh Zayed',    description:"West Cairo's premium residential corridor.",       detail:'26 July Corridor, Hyper One Strip',        longDescription:'Sheikh Zayed City sits at the intersection of Cairo\'s wealthiest western residential communities and the 26 July Corridor.',                                         availableFormats:['Unipole Billboard','Rooftop Billboard','DOOH Screen','Mall Advertising'],                                              image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-6th-october',  slug:'6th-october',   city:'6th of October',  headline:'Billboard Advertising in 6th of October',  description:'Industrial hub and residential expansion zone.',  detail:'Hadayek October, Wahat Road',              longDescription:'6th of October City combines Egypt\'s largest industrial zone with growing upper-middle residential developments.',                                                  availableFormats:['Unipole Billboard','Bridge Panel','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-beni-suef',    slug:'beni-suef',     city:'Beni Suef',       headline:'Billboard Advertising in Beni Suef',       description:'Upper Egypt northern gateway.',                  detail:'Beni Suef City, New Beni Suef',             longDescription:'Beni Suef is a growing Upper Egypt governorate with expanding commercial and industrial activity along the Nile corridor.',                                          availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-faiyum',       slug:'faiyum',        city:'Faiyum',          headline:'Billboard Advertising in Faiyum',          description:'Oasis governorate with growing population.',      detail:'Faiyum City, New Faiyum',                  longDescription:'Faiyum is one of Egypt\'s oldest cities, now growing as a residential and agricultural hub west of the Nile.',                                                       availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-minya',        slug:'minya',         city:'Minya',           headline:'Billboard Advertising in Minya',           description:'Upper Egypt\'s largest governorate.',            detail:'Minya City, Abu Qurqas',                   longDescription:'Minya is the largest Upper Egypt governorate by population — a major commercial and agricultural centre with high brand reach potential.',                          availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-asyut',        slug:'asyut',         city:'Asyut',           headline:'Billboard Advertising in Asyut',           description:'Commercial capital of Upper Egypt.',             detail:'Asyut City, New Asyut',                    longDescription:'Asyut is the commercial and administrative capital of Upper Egypt — a rapidly growing city with a large university and government audience.',                        availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture'],                                                                 image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-sohag',        slug:'sohag',         city:'Sohag',           headline:'Billboard Advertising in Sohag',           description:'Fast-growing Upper Egypt governorate.',          detail:'Sohag City, Akhmim',                       longDescription:'Sohag is one of Egypt\'s fastest-growing Upper Egypt governorates, with significant infrastructure investment and a large young population.',                        availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-qena',         slug:'qena',          city:'Qena',            headline:'Billboard Advertising in Qena',            description:'Tourism and Upper Egypt crossroads.',            detail:'Qena City, Nag Hammadi',                   longDescription:'Qena links Luxor and Asyut along the Nile — a strategic location for brands targeting both tourism and domestic Upper Egypt audiences.',                            availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-luxor',        slug:'luxor',         city:'Luxor',           headline:'Billboard Advertising in Luxor',           description:'World heritage tourism capital.',                detail:'Luxor City, West Bank, Karnak',             longDescription:'Luxor is one of Egypt\'s premier tourism destinations — home to the Valley of the Kings, Karnak Temple, and millions of international visitors annually.',          availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture','Airport Advertising'],                                            image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
  { id:'gov-aswan',        slug:'aswan',         city:'Aswan',           headline:'Billboard Advertising in Aswan',           description:'Southern Egypt gateway and tourism hub.',        detail:'Aswan City, Corniche, Abu Simbel Corridor', longDescription:'Aswan is Egypt\'s southernmost major city — a premium tourism and hospitality market attracting affluent domestic and international visitors.',                    availableFormats:['Unipole Billboard','DOOH Screen','Street Furniture','Airport Advertising'],                                            image:'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop' },
  { id:'gov-red-sea',      slug:'red-sea',       city:'Red Sea',         headline:'Billboard Advertising — Red Sea',          description:'Premier resort and tourism corridor.',           detail:'Hurghada, El Gouna, Marsa Alam',            longDescription:'The Red Sea governorate covers Egypt\'s premier resort coastline — Hurghada, El Gouna, Marsa Alam — attracting millions of domestic and international tourists.',    availableFormats:['Unipole Billboard','DOOH Screen','Airport Advertising','Street Furniture'],                                            image:'https://images.unsplash.com/photo-1616418625172-c607e16733ca?w=1400&q=90&fit=crop' },
  { id:'gov-south-sinai',  slug:'south-sinai',   city:'South Sinai',     headline:'Billboard Advertising — South Sinai',      description:'Sharm El-Sheikh resort corridor.',               detail:'Sharm El-Sheikh, Dahab, Taba',              longDescription:'South Sinai is Egypt\'s premium international resort destination — Sharm El-Sheikh alone handles millions of tourist arrivals annually.',                          availableFormats:['Unipole Billboard','DOOH Screen','Airport Advertising','Street Furniture'],                                            image:'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1400&q=90&fit=crop' },
  { id:'gov-north-sinai',  slug:'north-sinai',   city:'North Sinai',     headline:'Billboard Advertising — North Sinai',      description:'Arish and development corridor.',                detail:'El-Arish, Sheikh Zuweid',                   longDescription:'North Sinai is a developing governorate centred on El-Arish, with growing infrastructure and commercial activity.',                                                  availableFormats:['Unipole Billboard','Street Furniture'],                                                                               image:'https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1400&q=90&fit=crop' },
]

// ── Default districts per governorate ────────────────────────────────────────
const DEFAULT_DISTRICTS: District[] = [
  // Cairo
  { id:'d-cairo-1',  locationId:'gov-cairo',        name:'Nasr City' },
  { id:'d-cairo-2',  locationId:'gov-cairo',        name:'Heliopolis' },
  { id:'d-cairo-3',  locationId:'gov-cairo',        name:'Maadi' },
  { id:'d-cairo-4',  locationId:'gov-cairo',        name:'Zamalek' },
  { id:'d-cairo-5',  locationId:'gov-cairo',        name:'Downtown' },
  { id:'d-cairo-6',  locationId:'gov-cairo',        name:'Shubra' },
  { id:'d-cairo-7',  locationId:'gov-cairo',        name:'Ain Shams' },
  { id:'d-cairo-8',  locationId:'gov-cairo',        name:'Abbassia' },
  { id:'d-cairo-9',  locationId:'gov-cairo',        name:'Tagammu' },
  { id:'d-cairo-10', locationId:'gov-cairo',        name:'Badr City' },
  // Giza
  { id:'d-giza-1',   locationId:'gov-giza',         name:'Mohandessin' },
  { id:'d-giza-2',   locationId:'gov-giza',         name:'Dokki' },
  { id:'d-giza-3',   locationId:'gov-giza',         name:'Haram' },
  { id:'d-giza-4',   locationId:'gov-giza',         name:'Agouza' },
  { id:'d-giza-5',   locationId:'gov-giza',         name:'Imbaba' },
  { id:'d-giza-6',   locationId:'gov-giza',         name:'Boulaq El Dakrour' },
  { id:'d-giza-7',   locationId:'gov-giza',         name:'Giza City Centre' },
  // Alexandria
  { id:'d-alex-1',   locationId:'gov-alexandria',   name:'Corniche' },
  { id:'d-alex-2',   locationId:'gov-alexandria',   name:'Smouha' },
  { id:'d-alex-3',   locationId:'gov-alexandria',   name:'Sidi Bishr' },
  { id:'d-alex-4',   locationId:'gov-alexandria',   name:'Stanley' },
  { id:'d-alex-5',   locationId:'gov-alexandria',   name:'Miami' },
  { id:'d-alex-6',   locationId:'gov-alexandria',   name:'El-Horreya' },
  { id:'d-alex-7',   locationId:'gov-alexandria',   name:'Montaza' },
  { id:'d-alex-8',   locationId:'gov-alexandria',   name:'Agami' },
  // New Cairo
  { id:'d-nc-1',     locationId:'gov-new-cairo',    name:'Fifth Settlement' },
  { id:'d-nc-2',     locationId:'gov-new-cairo',    name:'90th Street' },
  { id:'d-nc-3',     locationId:'gov-new-cairo',    name:'South Teseen' },
  { id:'d-nc-4',     locationId:'gov-new-cairo',    name:'North Teseen' },
  { id:'d-nc-5',     locationId:'gov-new-cairo',    name:'Rehab City' },
  { id:'d-nc-6',     locationId:'gov-new-cairo',    name:'Madinaty' },
  { id:'d-nc-7',     locationId:'gov-new-cairo',    name:'AUC Area' },
  // Sheikh Zayed
  { id:'d-sz-1',     locationId:'gov-sheikh-zayed', name:'26 July Corridor' },
  { id:'d-sz-2',     locationId:'gov-sheikh-zayed', name:'City Centre' },
  { id:'d-sz-3',     locationId:'gov-sheikh-zayed', name:'Beverly Hills' },
  { id:'d-sz-4',     locationId:'gov-sheikh-zayed', name:'Hyper One Strip' },
  { id:'d-sz-5',     locationId:'gov-sheikh-zayed', name:'Zayed 2000' },
  // 6th of October
  { id:'d-6oct-1',   locationId:'gov-6th-october',  name:'Hadayek October' },
  { id:'d-6oct-2',   locationId:'gov-6th-october',  name:'Wahat Road' },
  { id:'d-6oct-3',   locationId:'gov-6th-october',  name:'Dream Land' },
  { id:'d-6oct-4',   locationId:'gov-6th-october',  name:'Juhayna Square' },
  // Red Sea
  { id:'d-rs-1',     locationId:'gov-red-sea',      name:'Hurghada' },
  { id:'d-rs-2',     locationId:'gov-red-sea',      name:'El Gouna' },
  { id:'d-rs-3',     locationId:'gov-red-sea',      name:'Marsa Alam' },
  { id:'d-rs-4',     locationId:'gov-red-sea',      name:'Safaga' },
  { id:'d-rs-5',     locationId:'gov-red-sea',      name:'Sahl Hasheesh' },
  // South Sinai
  { id:'d-ss-1',     locationId:'gov-south-sinai',  name:'Sharm El-Sheikh' },
  { id:'d-ss-2',     locationId:'gov-south-sinai',  name:'Dahab' },
  { id:'d-ss-3',     locationId:'gov-south-sinai',  name:'Taba' },
  { id:'d-ss-4',     locationId:'gov-south-sinai',  name:'Nuweiba' },
  // Suez
  { id:'d-suez-1',   locationId:'gov-suez',         name:'Suez City' },
  { id:'d-suez-2',   locationId:'gov-suez',         name:'Ain Sokhna' },
  { id:'d-suez-3',   locationId:'gov-suez',         name:'Ataqah' },
  // Port Said
  { id:'d-ps-1',     locationId:'gov-port-said',    name:'Port Said City' },
  { id:'d-ps-2',     locationId:'gov-port-said',    name:'Port Fouad' },
  // Ismailia
  { id:'d-ism-1',    locationId:'gov-ismailia',     name:'Ismailia City' },
  { id:'d-ism-2',    locationId:'gov-ismailia',     name:'Fayed' },
  { id:'d-ism-3',    locationId:'gov-ismailia',     name:'New Ismailia' },
  // Luxor
  { id:'d-lux-1',    locationId:'gov-luxor',        name:'Luxor City' },
  { id:'d-lux-2',    locationId:'gov-luxor',        name:'West Bank' },
  { id:'d-lux-3',    locationId:'gov-luxor',        name:'Karnak' },
  // Aswan
  { id:'d-asw-1',    locationId:'gov-aswan',        name:'Aswan City' },
  { id:'d-asw-2',    locationId:'gov-aswan',        name:'Corniche Aswan' },
  { id:'d-asw-3',    locationId:'gov-aswan',        name:'Kom Ombo' },
  // Qalyubia
  { id:'d-qal-1',    locationId:'gov-qalyubia',     name:'Banha' },
  { id:'d-qal-2',    locationId:'gov-qalyubia',     name:'Shubra El-Khayma' },
  { id:'d-qal-3',    locationId:'gov-qalyubia',     name:'Qalyub' },
  { id:'d-qal-4',    locationId:'gov-qalyubia',     name:'Khanka' },
  // Dakahlia
  { id:'d-dak-1',    locationId:'gov-dakahlia',     name:'Mansoura' },
  { id:'d-dak-2',    locationId:'gov-dakahlia',     name:'Mit Ghamr' },
  { id:'d-dak-3',    locationId:'gov-dakahlia',     name:'Talkha' },
  // Gharbia
  { id:'d-gha-1',    locationId:'gov-gharbia',      name:'Tanta' },
  { id:'d-gha-2',    locationId:'gov-gharbia',      name:'Mahalla El-Kubra' },
  { id:'d-gha-3',    locationId:'gov-gharbia',      name:'Zefta' },
  // Sharqia
  { id:'d-sha-1',    locationId:'gov-sharqia',      name:'Zagazig' },
  { id:'d-sha-2',    locationId:'gov-sharqia',      name:'10th of Ramadan City' },
  { id:'d-sha-3',    locationId:'gov-sharqia',      name:'Belbeis' },
  // Menofia
  { id:'d-men-1',    locationId:'gov-menofia',      name:'Shebin El-Kom' },
  { id:'d-men-2',    locationId:'gov-menofia',      name:'Sadat City' },
  { id:'d-men-3',    locationId:'gov-menofia',      name:'Menouf' },
  // Beheira
  { id:'d-beh-1',    locationId:'gov-beheira',      name:'Damanhur' },
  { id:'d-beh-2',    locationId:'gov-beheira',      name:'Kafr El-Dawwar' },
  { id:'d-beh-3',    locationId:'gov-beheira',      name:'Rashid (Rosetta)' },
  // Kafr El Sheikh
  { id:'d-kfs-1',    locationId:'gov-kafr-elsheikh',name:'Kafr El Sheikh City' },
  { id:'d-kfs-2',    locationId:'gov-kafr-elsheikh',name:'Desouk' },
  // Asyut
  { id:'d-asy-1',    locationId:'gov-asyut',        name:'Asyut City' },
  { id:'d-asy-2',    locationId:'gov-asyut',        name:'New Asyut' },
  { id:'d-asy-3',    locationId:'gov-asyut',        name:'Abnoub' },
  // Minya
  { id:'d-min-1',    locationId:'gov-minya',        name:'Minya City' },
  { id:'d-min-2',    locationId:'gov-minya',        name:'New Minya' },
  { id:'d-min-3',    locationId:'gov-minya',        name:'Mallawi' },
  // Beni Suef
  { id:'d-bs-1',     locationId:'gov-beni-suef',    name:'Beni Suef City' },
  { id:'d-bs-2',     locationId:'gov-beni-suef',    name:'New Beni Suef' },
  // Sohag
  { id:'d-soh-1',    locationId:'gov-sohag',        name:'Sohag City' },
  { id:'d-soh-2',    locationId:'gov-sohag',        name:'Akhmim' },
  { id:'d-soh-3',    locationId:'gov-sohag',        name:'Girga' },
  // Qena
  { id:'d-qen-1',    locationId:'gov-qena',         name:'Qena City' },
  { id:'d-qen-2',    locationId:'gov-qena',         name:'Nag Hammadi' },
  // Faiyum
  { id:'d-fai-1',    locationId:'gov-faiyum',       name:'Faiyum City' },
  { id:'d-fai-2',    locationId:'gov-faiyum',       name:'Ibsheway' },
  // North Sinai
  { id:'d-ns-1',     locationId:'gov-north-sinai',  name:'El-Arish' },
  { id:'d-ns-2',     locationId:'gov-north-sinai',  name:'Sheikh Zuweid' },
]

function buildDefaultLocations(): Location[] {
  // Merge hardcoded billboards from original LOCATIONS data into the new governorate list
  return ALL_GOVS.map(gov => {
    const legacy = LOCATIONS.find(l => l.id === gov.id || l.slug === gov.slug)
    return { ...gov, products: legacy?.products || [] } as Location
  })
}

// ── Default data ──────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: SiteSettings = {
  companyName:     'HORIZON OOH',
  tagline:         "Egypt's Premier Out-of-Home Media Company",
  email:           'hello@horizonooh.com',
  phone:           '+20 2 1234 5678',
  address:         'Cairo, Egypt',
  whatsapp:        '+201234567890',
  metaDescription: "Egypt's leading outdoor advertising company. Premium billboard, DOOH, mall, and airport advertising across Cairo, Alexandria, and nationwide.",
}

const DEFAULT_TRUST_STATS: TrustStat[] = TRUST_STATS.map((s, i) => ({ id: String(i+1), ...s }))
const DEFAULT_PROCESS: ProcessStep[]   = PROCESS.map((p, i) => ({ id: String(i+1), ...p }))

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
    clientBrands: CLIENT_BRANDS,
    process:      DEFAULT_PROCESS,
    results:      RESULTS,
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const KEY = 'horizon_store'

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<StoreState>
    const def    = defaultState()
    return {
      locations:    parsed.locations    ?? def.locations,
      districts:    parsed.districts    ?? def.districts,
      services:     parsed.services     ?? def.services,
      projects:     parsed.projects     ?? def.projects,
      blogPosts:    parsed.blogPosts    ?? def.blogPosts,
      contacts:     parsed.contacts     ?? def.contacts,
      settings:     parsed.settings     ?? def.settings,
      trustStats:   parsed.trustStats   ?? def.trustStats,
      clientBrands: parsed.clientBrands ?? def.clientBrands,
      process:      parsed.process      ?? def.process,
      results:      parsed.results      ?? def.results,
    }
  } catch {
    return defaultState()
  }
}

function save(state: StoreState): void {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

// ── Reactive store ────────────────────────────────────────────────────────────
type Listener = () => void
const listeners = new Set<Listener>()
let _state: StoreState = load()

export function getState(): StoreState { return _state }

function setState(updater: (s: StoreState) => StoreState): void {
  _state = updater(_state)
  save(_state)
  listeners.forEach(l => l())
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetToDefaults(): void {
  _state = defaultState()
  localStorage.removeItem(KEY)
  listeners.forEach(l => l())
}

// ── React hook ────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'

export function useStore(): StoreState {
  const [state, set] = useState<StoreState>(getState)
  useEffect(() => subscribe(() => set(getState())), [])
  return state
}

// ── ID generator ──────────────────────────────────────────────────────────────
function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// ── LOCATIONS ─────────────────────────────────────────────────────────────────
export const locationStore = {
  add: (loc: Omit<Location, 'id'>) =>
    setState(s => ({ ...s, locations: [...s.locations, { ...loc, id: uid() } as Location] })),
  update: (id: string, patch: Partial<Location>) =>
    setState(s => ({ ...s, locations: s.locations.map(l => l.id === id ? { ...l, ...patch } : l) })),
  remove: (id: string) =>
    setState(s => ({ ...s, locations: s.locations.filter(l => l.id !== id) })),
}

// ── DISTRICTS ─────────────────────────────────────────────────────────────────
export const districtStore = {
  add: (d: Omit<District, 'id'>) =>
    setState(s => ({ ...s, districts: [...s.districts, { ...d, id: uid() }] })),
  update: (id: string, patch: Partial<District>) =>
    setState(s => ({ ...s, districts: s.districts.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, districts: s.districts.filter(x => x.id !== id) })),
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
export const serviceStore = {
  add: (svc: Omit<Service, 'id'>) =>
    setState(s => ({ ...s, services: [...s.services, { ...svc, id: uid() } as Service] })),
  update: (id: string, patch: Partial<Service>) =>
    setState(s => ({ ...s, services: s.services.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, services: s.services.filter(x => x.id !== id) })),
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
export const projectStore = {
  add: (proj: Omit<Project, 'id'>) =>
    setState(s => ({ ...s, projects: [...s.projects, { ...proj, id: uid() } as Project] })),
  update: (id: string, patch: Partial<Project>) =>
    setState(s => ({ ...s, projects: s.projects.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, projects: s.projects.filter(x => x.id !== id) })),
}

// ── BLOG POSTS ────────────────────────────────────────────────────────────────
export const blogStore = {
  add: (post: Omit<BlogPost, 'id'>) =>
    setState(s => ({ ...s, blogPosts: [...s.blogPosts, { ...post, id: uid() } as BlogPost] })),
  update: (id: string, patch: Partial<BlogPost>) =>
    setState(s => ({ ...s, blogPosts: s.blogPosts.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, blogPosts: s.blogPosts.filter(x => x.id !== id) })),
}

// ── CONTACTS ──────────────────────────────────────────────────────────────────
export const contactStore = {
  add: (c: Omit<Contact, 'id' | 'status' | 'createdAt'>) =>
    setState(s => ({ ...s, contacts: [{ ...c, id: uid(), status: 'new', createdAt: new Date().toISOString() }, ...s.contacts] })),
  update: (id: string, patch: Partial<Contact>) =>
    setState(s => ({ ...s, contacts: s.contacts.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, contacts: s.contacts.filter(x => x.id !== id) })),
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export const settingsStore = {
  update: (patch: Partial<SiteSettings>) =>
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } })),
}

// ── TRUST STATS ───────────────────────────────────────────────────────────────
export const trustStatStore = {
  add: (stat: Omit<TrustStat, 'id'>) =>
    setState(s => ({ ...s, trustStats: [...s.trustStats, { ...stat, id: uid() }] })),
  update: (id: string, patch: Partial<TrustStat>) =>
    setState(s => ({ ...s, trustStats: s.trustStats.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, trustStats: s.trustStats.filter(x => x.id !== id) })),
}

// ── CLIENT BRANDS ─────────────────────────────────────────────────────────────
export const brandStore = {
  set: (brands: string[]) => setState(s => ({ ...s, clientBrands: brands })),
}

// ── PROCESS STEPS ─────────────────────────────────────────────────────────────
export const processStore = {
  add: (step: Omit<ProcessStep, 'id'>) =>
    setState(s => ({ ...s, process: [...s.process, { ...step, id: uid() }] })),
  update: (id: string, patch: Partial<ProcessStep>) =>
    setState(s => ({ ...s, process: s.process.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id: string) =>
    setState(s => ({ ...s, process: s.process.filter(x => x.id !== id) })),
  reorder: (steps: ProcessStep[]) => setState(s => ({ ...s, process: steps })),
}

// ── RESULTS STATS ─────────────────────────────────────────────────────────────
export const resultStore = {
  set: (results: StoreState['results']) => setState(s => ({ ...s, results })),
}
