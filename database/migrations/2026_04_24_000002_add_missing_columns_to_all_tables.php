<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add all missing columns needed by the React admin dashboard.
 *
 * Tables affected:
 *  - client_brands  : description, name_ar, description_ar
 *  - services       : title_ar, tagline, short_title, what_is, where_used,
 *                     long_description, description_ar, long_description_ar, title_ar, benefits, image_alt
 *  - projects       : title_ar, overview_ar, objective_ar, execution_ar, tagline_ar,
 *                     gallery_images, results_json, client_logo, client_description,
 *                     client_page_description, campaign_brief, duration, tagline,
 *                     overview, objective, execution, hero_image, cover_image_alt, hero_image_alt
 *  - blog_posts     : title_ar, body, body_ar, meta_title, meta_desc
 *  - suppliers      : (already complete)
 *  - customers      : (already complete)
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── client_brands ──────────────────────────────────────────────────────
        Schema::table('client_brands', function (Blueprint $table) {
            if (!Schema::hasColumn('client_brands', 'description'))    $table->text('description')->nullable()->after('website');
            if (!Schema::hasColumn('client_brands', 'name_ar'))        $table->string('name_ar')->nullable()->after('description');
            if (!Schema::hasColumn('client_brands', 'description_ar')) $table->text('description_ar')->nullable()->after('name_ar');
        });

        // ── services ───────────────────────────────────────────────────────────
        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'short_title'))          $table->string('short_title')->nullable()->after('name');
            if (!Schema::hasColumn('services', 'tagline'))              $table->string('tagline')->nullable()->after('short_title');
            if (!Schema::hasColumn('services', 'what_is'))              $table->text('what_is')->nullable()->after('description');
            if (!Schema::hasColumn('services', 'where_used'))           $table->text('where_used')->nullable()->after('what_is');
            if (!Schema::hasColumn('services', 'image_alt'))            $table->string('image_alt')->nullable()->after('image');
            if (!Schema::hasColumn('services', 'benefits'))             $table->json('benefits')->nullable()->after('features');
            if (!Schema::hasColumn('services', 'title_ar'))             $table->string('title_ar')->nullable()->after('benefits');
            if (!Schema::hasColumn('services', 'description_ar'))       $table->text('description_ar')->nullable()->after('title_ar');
            if (!Schema::hasColumn('services', 'long_description_ar'))  $table->text('long_description_ar')->nullable()->after('description_ar');
        });

        // ── projects ───────────────────────────────────────────────────────────
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'tagline'))                  $table->string('tagline')->nullable()->after('category');
            if (!Schema::hasColumn('projects', 'overview'))                 $table->text('overview')->nullable()->after('long_description');
            if (!Schema::hasColumn('projects', 'objective'))                $table->text('objective')->nullable()->after('overview');
            if (!Schema::hasColumn('projects', 'execution'))                $table->text('execution')->nullable()->after('objective');
            if (!Schema::hasColumn('projects', 'duration'))                 $table->string('duration')->nullable()->after('year');
            if (!Schema::hasColumn('projects', 'hero_image'))               $table->string('hero_image')->nullable()->after('cover_image');
            if (!Schema::hasColumn('projects', 'cover_image_alt'))          $table->string('cover_image_alt')->nullable()->after('hero_image');
            if (!Schema::hasColumn('projects', 'hero_image_alt'))           $table->string('hero_image_alt')->nullable()->after('cover_image_alt');
            if (!Schema::hasColumn('projects', 'gallery_images'))           $table->json('gallery_images')->nullable()->after('images');
            if (!Schema::hasColumn('projects', 'results_json'))             $table->json('results_json')->nullable()->after('stats');
            if (!Schema::hasColumn('projects', 'tags'))                     $table->json('tags')->nullable()->after('results_json');
            if (!Schema::hasColumn('projects', 'keywords'))                 $table->json('keywords')->nullable()->after('tags');
            if (!Schema::hasColumn('projects', 'client_logo'))              $table->string('client_logo')->nullable()->after('client');
            if (!Schema::hasColumn('projects', 'client_logo_alt'))          $table->string('client_logo_alt')->nullable()->after('client_logo');
            if (!Schema::hasColumn('projects', 'client_industry'))          $table->string('client_industry')->nullable()->after('client_logo_alt');
            if (!Schema::hasColumn('projects', 'client_description'))       $table->text('client_description')->nullable()->after('client_industry');
            if (!Schema::hasColumn('projects', 'client_page_description'))  $table->text('client_page_description')->nullable()->after('client_description');
            if (!Schema::hasColumn('projects', 'campaign_brief'))           $table->text('campaign_brief')->nullable()->after('client_page_description');
            if (!Schema::hasColumn('projects', 'location'))                 $table->string('location')->nullable()->after('campaign_brief');
            if (!Schema::hasColumn('projects', 'city'))                     $table->string('city')->nullable()->after('location');
            if (!Schema::hasColumn('projects', 'title_ar'))                 $table->string('title_ar')->nullable()->after('title');
            if (!Schema::hasColumn('projects', 'overview_ar'))              $table->text('overview_ar')->nullable()->after('overview');
            if (!Schema::hasColumn('projects', 'objective_ar'))             $table->text('objective_ar')->nullable()->after('objective');
            if (!Schema::hasColumn('projects', 'execution_ar'))             $table->text('execution_ar')->nullable()->after('execution');
            if (!Schema::hasColumn('projects', 'tagline_ar'))               $table->string('tagline_ar')->nullable()->after('tagline');
        });

        // ── blog_posts ─────────────────────────────────────────────────────────
        Schema::table('blog_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('blog_posts', 'body'))       $table->json('body')->nullable()->after('content');
            if (!Schema::hasColumn('blog_posts', 'title_ar'))   $table->string('title_ar')->nullable()->after('title');
            if (!Schema::hasColumn('blog_posts', 'body_ar'))    $table->json('body_ar')->nullable()->after('body');
            if (!Schema::hasColumn('blog_posts', 'meta_title')) $table->string('meta_title')->nullable()->after('body_ar');
            if (!Schema::hasColumn('blog_posts', 'meta_desc'))  $table->text('meta_desc')->nullable()->after('meta_title');
        });
    }

    public function down(): void
    {
        Schema::table('client_brands', function (Blueprint $table) {
            $table->dropColumn(['description', 'name_ar', 'description_ar']);
        });
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['short_title','tagline','what_is','where_used','image_alt','benefits','title_ar','description_ar','long_description_ar']);
        });
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['tagline','overview','objective','execution','duration','hero_image','cover_image_alt','hero_image_alt','gallery_images','results_json','tags','keywords','client_logo','client_logo_alt','client_industry','client_description','client_page_description','campaign_brief','location','city','title_ar','overview_ar','objective_ar','execution_ar','tagline_ar']);
        });
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['body','title_ar','body_ar','meta_title','meta_desc']);
        });
    }
};
