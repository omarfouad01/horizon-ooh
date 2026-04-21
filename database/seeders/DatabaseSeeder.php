<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\TrustStat;
use App\Models\ProcessStep;
use App\Models\AdFormat;
use App\Models\Setting;
use App\Models\Location;
use App\Models\District;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin user ───────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@horizonooh.com'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ]
        );

        // ── Ad Formats ───────────────────────────────────────────────────
        $formats = [
            ['name'=>'Unipole',       'slug'=>'unipole',       'label'=>'Unipole',       'description'=>'Large single-pole billboard',  'width_m'=>12,'height_m'=>6,  'sort_order'=>1],
            ['name'=>'Mega Unipole',  'slug'=>'mega-unipole',  'label'=>'Mega Unipole',  'description'=>'Extra-large highway format',   'width_m'=>18,'height_m'=>8,  'sort_order'=>2],
            ['name'=>'Bridge Banner', 'slug'=>'bridge-banner', 'label'=>'Bridge Banner', 'description'=>'Spanning bridge format',        'width_m'=>20,'height_m'=>4,  'sort_order'=>3],
            ['name'=>'DOOH Screen',   'slug'=>'dooh-screen',   'label'=>'DOOH Screen',   'description'=>'Digital LED screen',            'width_m'=>6, 'height_m'=>4,  'sort_order'=>4],
            ['name'=>'Mall Banner',   'slug'=>'mall-banner',   'label'=>'Mall Banner',   'description'=>'Indoor mall banner',            'width_m'=>3, 'height_m'=>6,  'sort_order'=>5],
            ['name'=>'Trivision',     'slug'=>'trivision',     'label'=>'Trivision',     'description'=>'Three-sided rotating panel',    'width_m'=>12,'height_m'=>4,  'sort_order'=>6],
        ];
        foreach ($formats as $f) AdFormat::firstOrCreate(['slug' => $f['slug']], $f);

        // ── Trust Stats ──────────────────────────────────────────────────
        $stats = [
            ['value'=>'9,500+', 'label'=>'Billboard Locations', 'sublabel'=>'Nationwide',        'sort_order'=>1],
            ['value'=>'27',     'label'=>'Governorates',        'sublabel'=>'Full coverage',      'sort_order'=>2],
            ['value'=>'15M+',   'label'=>'Daily Impressions',   'sublabel'=>'Combined reach',     'sort_order'=>3],
            ['value'=>'200+',   'label'=>'Happy Clients',       'sublabel'=>'Brands served',      'sort_order'=>4],
        ];
        foreach ($stats as $s) TrustStat::firstOrCreate(['label' => $s['label']], $s);

        // ── Process Steps ────────────────────────────────────────────────
        $steps = [
            ['step'=>1,'title'=>'Brief & Strategy',     'description'=>'We learn your brand goals and define the ideal OOH campaign strategy.',                       'icon'=>'Lightbulb', 'sort_order'=>1],
            ['step'=>2,'title'=>'Location Planning',    'description'=>'Our planners identify the highest-impact sites for your target audience and budget.',          'icon'=>'MapPin',    'sort_order'=>2],
            ['step'=>3,'title'=>'Creative Production',  'description'=>'Our in-house studio designs and prints your artwork to the highest outdoor specification.',    'icon'=>'Palette',   'sort_order'=>3],
            ['step'=>4,'title'=>'Installation',         'description'=>'Certified installers mount your creative across all selected sites within 72 hours.',          'icon'=>'Hammer',    'sort_order'=>4],
            ['step'=>5,'title'=>'Live Reporting',       'description'=>'You receive a real-time campaign dashboard with photo proof-of-posting for every site.',       'icon'=>'BarChart',  'sort_order'=>5],
        ];
        foreach ($steps as $s) ProcessStep::firstOrCreate(['step' => $s['step']], $s);

        // ── Site Settings ────────────────────────────────────────────────
        $settings = [
            'site_name'       => 'HORIZON OOH',
            'tagline'         => "Egypt's Premium Out-of-Home Advertising Partner",
            'phone'           => '+20 100 123 4567',
            'email'           => 'info@horizonooh.com',
            'address'         => 'Smart Village, Km 28, Cairo–Alexandria Desert Road, Cairo, Egypt',
            'whatsapp'        => '+201234567890',
            'facebook'        => 'https://facebook.com/horizonooh',
            'instagram'       => 'https://instagram.com/horizonooh',
            'linkedin'        => 'https://linkedin.com/company/horizonooh',
        ];
        foreach ($settings as $k => $v) Setting::set($k, $v);

        // ── Home content ─────────────────────────────────────────────────
        Setting::set('home_content', [
            'hero_headline'      => "Own Every Road.\nDominate Every Screen.",
            'hero_subheadline'   => "Egypt's most trusted OOH advertising partner.",
            'heroEyebrow'        => "Egypt's #1 OOH Agency",
            'heroTitleLines'     => ['Visibility','That Moves'],
            'heroChannels'       => ['Billboard','DOOH','Mall','Airport','Transit'],
            'featureEyebrow'     => 'Why HORIZON OOH',
            'featureTitleLine1'  => 'Outdoor advertising',
            'featureTitleLine2'  => 'that performs.',
            'featureBullets'     => ["9,500+ premium locations nationwide","Egypt's most experienced OOH team","Full-service: strategy, production, installation"],
            'featureStatsValue'  => '9,500+',
            'featureStatsLabel'  => 'Billboard Locations',
            'finalCtaEyebrow'    => 'Ready to be seen?',
            'finalCtaTitleLine1' => 'Start your campaign',
            'finalCtaTitleLine2' => 'today.',
        ]);

        // ── About content ────────────────────────────────────────────────
        Setting::set('about_content', [
            'heroEyebrow'     => 'Who We Are',
            'heroTitle'       => "Egypt's Premier",
            'heroAccent'      => 'OOH Partner',
            'introHeadline'   => 'We put your brand on every major road in Egypt',
            'introParagraph1' => "HORIZON OOH is Egypt's leading outdoor advertising company, delivering premium billboard and DOOH solutions across all 27 governorates.",
            'introParagraph2' => 'Founded on precision planning and creative excellence, we help brands own the streets.',
            'darkTitle'       => 'Our',
            'darkAccent'      => 'Mission',
            'darkParagraphs'  => ['To connect brands with audiences at scale through precision-placed, premium outdoor media.'],
            'whyTitle'        => 'Why Choose',
            'whyAccent'       => 'HORIZON OOH',
        ]);

        // ── Locations (27 official Egyptian governorates) + Districts ────
        $this->seedLocationsAndDistricts();
    }

    private function seedLocationsAndDistricts(): void
    {
        // Truncate existing to allow clean re-seed
        District::query()->delete();
        Location::query()->delete();

        /**
         * 27 Egyptian Governorates — official list
         * Each entry: [ slug, city, headline, detail, description, long_description, available_formats[], districts[] ]
         */
        $governorates = [

            // ── Greater Cairo ──────────────────────────────────────────
            [
                'slug'              => 'cairo',
                'city'              => 'Cairo',
                'headline'          => 'Billboard Advertising in Cairo',
                'detail'            => 'Ring Road, Salah Salem, Downtown, Corniche El-Nil',
                'description'       => "Egypt's capital — 22 million people, 8 million daily commuters.",
                'long_description'  => "Cairo is Egypt's advertising capital — 22 million inhabitants, 8 million daily commuters, and the country's highest concentration of premium consumer and B2B audiences. Our Cairo inventory spans the Ring Road, Salah Salem, Corniche El-Nil, and every major arterial route.",
                'available_formats' => ['Unipole Billboard','Rooftop Billboard','Bridge Panel','DOOH Screen','Street Furniture','Mall Advertising'],
                'image'             => 'https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop',
                'sort_order'        => 1,
                'districts'         => [
                    'Cairo Downtown (Wust El-Balad)','Garden City','Zamalek','Maadi','Heliopolis (Misr El-Gedida)',
                    'Nasr City','New Cairo (5th Settlement)','Helwan','Ain Shams','Shubra','Matariya',
                    'El-Salam','El-Marg','El-Basatin','Mokattam','15th of May City','El-Khalifa',
                    'Rod El-Farag','El-Sharabia','Dar El-Salam','El-Amiriya','El-Zeitoun',
                ],
            ],
            [
                'slug'              => 'giza',
                'city'              => 'Giza',
                'headline'          => 'Billboard Advertising in Giza',
                'detail'            => 'Faisal St, Pyramids Road, Mohandiseen, Dokki',
                'description'       => 'Home to the Pyramids and Egypt\'s largest west-bank population.',
                'long_description'  => "Giza Governorate borders Cairo to the west and houses over 9 million residents. Key corridors include Faisal Street, Pyramids Road, Mohandiseen, and Dokki.",
                'available_formats' => ['Unipole Billboard','Rooftop Billboard','Bridge Panel','DOOH Screen','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1400&q=90&fit=crop',
                'sort_order'        => 2,
                'districts'         => [
                    'Dokki','Mohandiseen','Agouza','Imbaba','Giza City Centre','Pyramids (Haram)',
                    'Faisal','Omraniya','Badrasheen','El-Ayat','El-Saff','El-Wahat El-Bahriya',
                    'Abu El-Nomros','Kerdasa','Abu Rawash','Saft El-Laban',
                    '6th of October City','Sheikh Zayed City',
                ],
            ],
            [
                'slug'              => 'qalyubia',
                'city'              => 'Qalyubia',
                'headline'          => 'Billboard Advertising in Qalyubia',
                'detail'            => 'Cairo-Alexandria Desert Rd, Banha, Qalyub',
                'description'       => 'Northern gateway of Greater Cairo — gateway to the Delta.',
                'long_description'  => 'Qalyubia lies directly north of Cairo and serves as the main gateway to the Nile Delta.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=1400&q=90&fit=crop',
                'sort_order'        => 3,
                'districts'         => [
                    'Banha','Qalyub','Shubra El-Kheima','El-Khanka','El-Qanater El-Khayria',
                    'Kafr Shukr','Tukh','El-Obour City','Qaha','Shibin El-Qanater',
                    'Abu Zaabal','Mostorod',
                ],
            ],

            // ── Alexandria & North Coast ───────────────────────────────
            [
                'slug'              => 'alexandria',
                'city'              => 'Alexandria',
                'headline'          => 'Billboard Advertising in Alexandria',
                'detail'            => 'Corniche, El-Horreya Road, Smouha, Stanley',
                'description'       => "Egypt's second city and Mediterranean gateway — 6 million residents.",
                'long_description'  => "Alexandria is Egypt's second-largest city and Mediterranean commercial hub — with 6 million residents, a thriving port economy, and major retail and hospitality markets. The Corniche is Egypt's most iconic outdoor advertising address.",
                'available_formats' => ['Unipole Billboard','Corniche Panel','DOOH Screen','Mall Advertising','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1765398073978-94f84257baf7?w=1400&q=90&fit=crop',
                'sort_order'        => 4,
                'districts'         => [
                    'El-Montaza','Miami','Sidi Gaber','Cleopatra','Roushdy','Smouha',
                    'Stanley','Louran','El-Raml','Azarita','El-Mansheya','Anfushi',
                    'El-Gomrok','El-Mex','Agami','Borg El-Arab','Amreya','King Mariout',
                    'Abu Qir','El-Dekhela',
                ],
            ],
            [
                'slug'              => 'beheira',
                'city'              => 'Beheira',
                'headline'          => 'Billboard Advertising in Beheira',
                'detail'            => 'Damanhour, Cairo–Alexandria Desert Road, Delta Ring Road',
                'description'       => 'Largest Delta governorate by area — agriculture and industry hub.',
                'long_description'  => 'Beheira is the largest governorate in the Nile Delta by area, with Damanhour as its capital.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1400&q=90&fit=crop',
                'sort_order'        => 5,
                'districts'         => [
                    'Damanhour','Kafr El-Dawwar','Rashid (Rosetta)','Edku','Abu El-Matamir',
                    'Abu Hummus','El-Delengat','El-Mahmoudiya','El-Rahmaniya','Itay El-Barud',
                    'Hosh Issa','Shubrakhit','Kom Hamada','Badr City (Beheira)',
                ],
            ],
            [
                'slug'              => 'matruh',
                'city'              => 'Matruh',
                'headline'          => 'Billboard Advertising in Matruh',
                'detail'            => 'North Coast, Marsa Matruh, Alamein Road',
                'description'       => "Egypt's North Coast — premium summer tourism destination.",
                'long_description'  => 'Matruh Governorate spans Egypt\'s Mediterranean North Coast, including the booming resort areas of El-Alamein, Hacienda, and Marassi.',
                'available_formats' => ['Unipole Billboard','Corniche Panel','Bridge Panel'],
                'image'             => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=90&fit=crop',
                'sort_order'        => 6,
                'districts'         => [
                    'Marsa Matruh','El-Alamein','El-Dabaa','Sidi Barrani','Siwa',
                    'El-Hamam','El-Negila','El-Daba\'a New City',
                ],
            ],

            // ── Nile Delta ────────────────────────────────────────────
            [
                'slug'              => 'dakahlia',
                'city'              => 'Dakahlia',
                'headline'          => 'Billboard Advertising in Dakahlia',
                'detail'            => 'Mansoura, Talkha, Mit Ghamr',
                'description'       => "Nile Delta core — Mansoura, Egypt's medical capital.",
                'long_description'  => "Dakahlia is one of Egypt's most populous Delta governorates, with Mansoura serving as a major medical, educational, and commercial hub.",
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture','DOOH Screen'],
                'image'             => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=90&fit=crop',
                'sort_order'        => 7,
                'districts'         => [
                    'Mansoura','Talkha','Mit Ghamr','El-Senbellawein','Aga','Belkas',
                    'Sherbin','El-Manzala','El-Matariya','Dekernes','Minyat El-Nasr',
                    'Nabroh','Gammasa',
                ],
            ],
            [
                'slug'              => 'gharbia',
                'city'              => 'Gharbia',
                'headline'          => 'Billboard Advertising in Gharbia',
                'detail'            => 'Tanta, Mahalla El-Kubra, Kafr El-Zayat',
                'description'       => 'Central Delta — Tanta, major textile and trade centre.',
                'long_description'  => 'Gharbia sits at the heart of the Nile Delta. Tanta is one of Egypt\'s largest cities outside Greater Cairo, with a major railway interchange.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=90&fit=crop',
                'sort_order'        => 8,
                'districts'         => [
                    'Tanta','Mahalla El-Kubra','Kafr El-Zayat','Zifta','El-Mahalla El-Kubra Industrial',
                    'Samannoud','Basyoun','El-Santa','Qutur',
                ],
            ],
            [
                'slug'              => 'monufia',
                'city'              => 'Monufia',
                'headline'          => 'Billboard Advertising in Monufia',
                'detail'            => 'Shibin El-Kom, Menouf, Agricultural Road',
                'description'       => 'Dense Delta governorate between Cairo and Tanta.',
                'long_description'  => 'Monufia is a densely populated Delta governorate with strong commuter flows between Greater Cairo and the central Delta.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=90&fit=crop',
                'sort_order'        => 9,
                'districts'         => [
                    'Shibin El-Kom','Menouf','Sadat City','El-Bagour','Quesna',
                    'Tala','Ashmoun','El-Shohada','Birket El-Sab\' (Berket El-Sabaa)',
                ],
            ],
            [
                'slug'              => 'kafr-el-sheikh',
                'city'              => 'Kafr El Sheikh',
                'headline'          => 'Billboard Advertising in Kafr El Sheikh',
                'detail'            => 'Kafr El Sheikh City, Rosetta Road, Coastal Strip',
                'description'       => 'Northern Delta — fishing industry and agricultural hub.',
                'long_description'  => 'Kafr El Sheikh governorate covers the northern Delta coastline and is a major fishing and agricultural region.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1400&q=90&fit=crop',
                'sort_order'        => 10,
                'districts'         => [
                    'Kafr El Sheikh','Desouk','Fuwwah','Qallin','El-Reyad',
                    'Metoubes','Burg (Burj)','Baltim','Sidi Salem','Hamoul',
                ],
            ],
            [
                'slug'              => 'damietta',
                'city'              => 'Damietta',
                'headline'          => 'Billboard Advertising in Damietta',
                'detail'            => 'Damietta City, Port Road, New Damietta',
                'description'       => 'Furniture capital of Egypt — port city on the Mediterranean.',
                'long_description'  => 'Damietta is Egypt\'s furniture manufacturing capital and a key Mediterranean port city.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=90&fit=crop',
                'sort_order'        => 11,
                'districts'         => [
                    'Damietta City','New Damietta','Faraskur','El-Zarka','El-Rouwda',
                    'Kafr Saad','Kafr El-Bateekh','El-Serw',
                ],
            ],
            [
                'slug'              => 'sharqia',
                'city'              => 'Sharqia',
                'headline'          => 'Billboard Advertising in Sharqia',
                'detail'            => 'Zagazig, 10th of Ramadan City, Desert Road',
                'description'       => 'Eastern Delta — Zagazig, gateway to Suez Canal cities.',
                'long_description'  => 'Sharqia is a major Delta governorate with Zagazig as its capital and 10th of Ramadan City as one of Egypt\'s key industrial free zones.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','DOOH Screen','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=90&fit=crop',
                'sort_order'        => 12,
                'districts'         => [
                    'Zagazig','10th of Ramadan City','Abu Hammad','El-Husseiniya','Belbeis',
                    'Hehia','Kafr Saqr','Mashtoul El-Souq','Minya El-Qamh','Faqous',
                    'El-Ibrahimiya','El-Qurayn','Diyarb Negm','Abu Kebir','El-Salihiya El-Gadida',
                ],
            ],

            // ── Suez Canal Zone ───────────────────────────────────────
            [
                'slug'              => 'port-said',
                'city'              => 'Port Said',
                'headline'          => 'Billboard Advertising in Port Said',
                'detail'            => 'Port Fouad, Canal Authority Road, Free Zone',
                'description'       => 'Suez Canal gateway — free trade zone and port city.',
                'long_description'  => 'Port Said is a major port city and free trade zone at the northern entrance of the Suez Canal.',
                'available_formats' => ['Unipole Billboard','Corniche Panel','DOOH Screen','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=90&fit=crop',
                'sort_order'        => 13,
                'districts'         => [
                    'Port Said City','Port Fouad','El-Arab District','El-Manakh','El-Dawahy','El-Zohour',
                ],
            ],
            [
                'slug'              => 'ismailia',
                'city'              => 'Ismailia',
                'headline'          => 'Billboard Advertising in Ismailia',
                'detail'            => 'Canal Road, Ismailia–Cairo Desert Road, Lake Timsah',
                'description'       => 'The Suez Canal city — logistics and tourism hub.',
                'long_description'  => 'Ismailia sits at the midpoint of the Suez Canal and serves as its administrative and logistics hub.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Corniche Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1400&q=90&fit=crop',
                'sort_order'        => 14,
                'districts'         => [
                    'Ismailia City','Abu Suwair','El-Qantara East','El-Qantara West',
                    'El-Tal El-Kebir','Fayed','El-Qassasin',
                ],
            ],
            [
                'slug'              => 'suez',
                'city'              => 'Suez',
                'headline'          => 'Billboard Advertising in Suez',
                'detail'            => 'Suez City, Cairo–Suez Road, Port Tawfik',
                'description'       => 'Southern Canal gateway — industrial powerhouse of Egypt.',
                'long_description'  => 'Suez Governorate anchors the southern end of the Suez Canal. The Cairo–Suez Road is a major national highway.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=90&fit=crop',
                'sort_order'        => 15,
                'districts'         => [
                    'Suez City (El-Arbaeen)','El-Ganayen','Ataka','Faisal District','Port Tawfik',
                ],
            ],

            // ── Sinai ─────────────────────────────────────────────────
            [
                'slug'              => 'north-sinai',
                'city'              => 'North Sinai',
                'headline'          => 'Billboard Advertising in North Sinai',
                'detail'            => 'El-Arish, Sinai Coastal Road, El-Qantara',
                'description'       => 'Arish and the gateway to Sinai Peninsula.',
                'long_description'  => 'North Sinai is the gateway to the Sinai Peninsula with El-Arish as its capital.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=90&fit=crop',
                'sort_order'        => 16,
                'districts'         => [
                    'El-Arish','Rafah','Sheikh Zuweid','El-Hasana','Bir El-Abd','Nekhel',
                ],
            ],
            [
                'slug'              => 'south-sinai',
                'city'              => 'South Sinai',
                'headline'          => 'Billboard Advertising in South Sinai',
                'detail'            => 'Sharm El-Sheikh, Dahab, St. Catherine, Ras Sedr',
                'description'       => "Sharm El-Sheikh, Dahab, Taba — Egypt's premier tourism coast.",
                'long_description'  => 'South Sinai is Egypt\'s most internationally recognized tourism destination — home to Sharm El-Sheikh, Dahab, and Taba.',
                'available_formats' => ['Unipole Billboard','Airport Advertising','Corniche Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1400&q=90&fit=crop',
                'sort_order'        => 17,
                'districts'         => [
                    'Sharm El-Sheikh','Dahab','Nuweiba','Taba','St. Catherine','Ras Sedr',
                    'Abu Rudeis','El-Tur (Al-Tor)',
                ],
            ],

            // ── Upper Egypt ───────────────────────────────────────────
            [
                'slug'              => 'beni-suef',
                'city'              => 'Beni Suef',
                'headline'          => 'Billboard Advertising in Beni Suef',
                'detail'            => 'Beni Suef City, Cairo–Assiut Road, El-Fashn',
                'description'       => "Upper Egypt's northern gateway — cement and industry hub.",
                'long_description'  => 'Beni Suef is the northernmost Upper Egypt governorate and the first major city south of Cairo on the Cairo–Assiut Desert Road.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=90&fit=crop',
                'sort_order'        => 18,
                'districts'         => [
                    'Beni Suef City','El-Fashn','Beba','Ihnasya El-Madina','El-Wasta',
                    'Nasser','Sumusta El-Waqf',
                ],
            ],
            [
                'slug'              => 'faiyum',
                'city'              => 'Faiyum',
                'headline'          => 'Billboard Advertising in Faiyum',
                'detail'            => 'Faiyum City, Bahr Yusuf Road, Qarun Lake',
                'description'       => 'The Oasis Governorate — agriculture and eco-tourism hub.',
                'long_description'  => 'Faiyum is Egypt\'s only inland oasis governorate, located southwest of Cairo.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=1400&q=90&fit=crop',
                'sort_order'        => 19,
                'districts'         => [
                    'Faiyum City','Sinnuris','Ibsheway','Tamiya','Yusuf El-Seddiq',
                ],
            ],
            [
                'slug'              => 'minya',
                'city'              => 'Minya',
                'headline'          => 'Billboard Advertising in Minya',
                'detail'            => 'Minya City, Corniche El-Nil, Cairo–Assiut Road',
                'description'       => "Heart of Upper Egypt — Bride of Upper Egypt.",
                'long_description'  => "Minya is one of Egypt's most populous Upper Egypt governorates and sits centrally along the Nile.",
                'available_formats' => ['Unipole Billboard','Corniche Panel','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1400&q=90&fit=crop',
                'sort_order'        => 20,
                'districts'         => [
                    'Minya City','Abu Qurqas','Beni Mazar','Deir Mawas','El-Edwa',
                    'Maghagha','Matai','Samalut','Mallawi',
                ],
            ],
            [
                'slug'              => 'asyut',
                'city'              => 'Asyut',
                'headline'          => 'Billboard Advertising in Asyut',
                'detail'            => 'Asyut City, University Road, Cairo–Assiut Desert Road',
                'description'       => "Upper Egypt's commercial capital — largest Upper Egypt city.",
                'long_description'  => 'Asyut is the largest city and commercial capital of Upper Egypt.',
                'available_formats' => ['Unipole Billboard','Rooftop Billboard','DOOH Screen','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=90&fit=crop',
                'sort_order'        => 21,
                'districts'         => [
                    'Asyut City','Abnoub','Abu Tig','El-Badari','El-Fateh','El-Ghanaim',
                    'El-Qusiya','Manfalut','Sadfa','Sahel Selim','Deirut','Dayrut',
                ],
            ],
            [
                'slug'              => 'sohag',
                'city'              => 'Sohag',
                'headline'          => 'Billboard Advertising in Sohag',
                'detail'            => 'Sohag City, Nile Corniche, Cairo–Assiut–Luxor Road',
                'description'       => 'Central Upper Egypt — agriculture and manufacturing hub.',
                'long_description'  => 'Sohag governorate sits between Asyut and Qena along the Nile Valley.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Corniche Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=90&fit=crop',
                'sort_order'        => 22,
                'districts'         => [
                    'Sohag City','Akhmim','El-Balyana','El-Maragha','El-Monshah',
                    'Dar El-Salam (Sohag)','Gerga','Girgis','Sakulta','Tahta','Tima',
                ],
            ],
            [
                'slug'              => 'qena',
                'city'              => 'Qena',
                'headline'          => 'Billboard Advertising in Qena',
                'detail'            => 'Qena City, Luxor Road, Nile Corniche',
                'description'       => 'Upper Egypt gateway to Luxor — pharaonic tourism corridor.',
                'long_description'  => 'Qena governorate is the gateway to the Luxor tourism corridor and one of Egypt\'s most historically significant regions.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Corniche Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1400&q=90&fit=crop',
                'sort_order'        => 23,
                'districts'         => [
                    'Qena City','Abu Tesht','El-Waqf','Farshut','Nag Hammadi',
                    'Naqada','Qift','Qus',
                ],
            ],
            [
                'slug'              => 'luxor',
                'city'              => 'Luxor',
                'headline'          => 'Billboard Advertising in Luxor',
                'detail'            => 'Luxor City, Corniche El-Nil, Airport Road, Karnak',
                'description'       => "World's greatest open-air museum — 14 million tourists annually.",
                'long_description'  => 'Luxor is Egypt\'s top domestic and international tourism destination — home to the Valley of the Kings, Karnak Temple, and Luxor Temple.',
                'available_formats' => ['Unipole Billboard','Corniche Panel','Airport Advertising','DOOH Screen','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1400&q=90&fit=crop',
                'sort_order'        => 24,
                'districts'         => [
                    'Luxor City (East Bank)','Armant','El-Bayadiya','El-Tod','Esna','Luxor West Bank',
                ],
            ],
            [
                'slug'              => 'aswan',
                'city'              => 'Aswan',
                'headline'          => 'Billboard Advertising in Aswan',
                'detail'            => 'Aswan City, Corniche El-Nil, Airport Road, High Dam',
                'description'       => 'Nubian gateway and Nile tourism jewel of Egypt.',
                'long_description'  => 'Aswan is Egypt\'s southernmost major city and one of its most picturesque tourism destinations.',
                'available_formats' => ['Unipole Billboard','Corniche Panel','Airport Advertising','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1400&q=90&fit=crop',
                'sort_order'        => 25,
                'districts'         => [
                    'Aswan City','Daraw','Kom Ombo','Edfu','El-Rauda','Nasr El-Nuba',
                    'Abu Simbel','Toshka',
                ],
            ],

            // ── Red Sea & Desert ──────────────────────────────────────
            [
                'slug'              => 'red-sea',
                'city'              => 'Red Sea',
                'headline'          => 'Billboard Advertising in Red Sea Governorate',
                'detail'            => 'Hurghada, El Gouna, Safaga, Marsa Alam, Airport Road',
                'description'       => "Hurghada, El Gouna, Marsa Alam — Egypt's Red Sea Riviera.",
                'long_description'  => 'The Red Sea Governorate spans Egypt\'s entire Red Sea coastline, anchored by Hurghada — Egypt\'s largest beach resort city.',
                'available_formats' => ['Unipole Billboard','Airport Advertising','Corniche Panel','DOOH Screen','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=90&fit=crop',
                'sort_order'        => 26,
                'districts'         => [
                    'Hurghada','El Gouna','Safaga','El-Quseir','Marsa Alam',
                    'Ras Gharib','El-Shalateen','Halayeb',
                ],
            ],
            [
                'slug'              => 'new-valley',
                'city'              => 'New Valley',
                'headline'          => 'Billboard Advertising in New Valley',
                'detail'            => 'Kharga, Dakhla, Farafra Oases, Desert Highway',
                'description'       => "Egypt's largest governorate by area — the Western Desert Oases.",
                'long_description'  => 'New Valley is Egypt\'s largest governorate by land area, encompassing the Western Desert oases of Kharga, Dakhla, and Farafra.',
                'available_formats' => ['Unipole Billboard','Bridge Panel','Street Furniture'],
                'image'             => 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=90&fit=crop',
                'sort_order'        => 27,
                'districts'         => [
                    'El-Kharga','Dakhla (Mut)','Farafra','El-Bahariya (Bawiti)','El-Paris',
                ],
            ],
        ];

        foreach ($governorates as $gov) {
            $districts = $gov['districts'];
            unset($gov['districts']);

            $location = Location::create([
                'slug'              => $gov['slug'],
                'city'              => $gov['city'],
                'headline'          => $gov['headline'],
                'detail'            => $gov['detail'],
                'description'       => $gov['description'],
                'long_description'  => $gov['long_description'],
                'image'             => $gov['image'],
                'available_formats' => $gov['available_formats'],
                'sort_order'        => $gov['sort_order'],
            ]);

            foreach ($districts as $districtName) {
                District::create([
                    'location_id' => $location->id,
                    'name'        => $districtName,
                ]);
            }
        }
    }
}