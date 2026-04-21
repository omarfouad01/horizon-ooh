<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\TrustStat;
use App\Models\ProcessStep;
use App\Models\AdFormat;
use App\Models\Setting;
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
    }
}
