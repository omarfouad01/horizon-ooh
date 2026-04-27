<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fix image/media columns that were VARCHAR(255) but need LONGTEXT
 * to accommodate base64-encoded images and long URLs.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── client_brands ────────────────────────────────────────────────────
        Schema::table('client_brands', function (Blueprint $table) {
            $table->longText('logo')->nullable()->change();
            $table->longText('logo_url')->nullable()->change();
        });

        // ── simulator_templates ──────────────────────────────────────────────
        // mockup_url stores either a URL or a path to uploaded file
        Schema::table('simulator_templates', function (Blueprint $table) {
            $table->longText('mockup_url')->nullable()->change();
        });

        // ── design_uploads ───────────────────────────────────────────────────
        Schema::table('design_uploads', function (Blueprint $table) {
            $table->longText('design_url')->change();
        });

        // ── services ─────────────────────────────────────────────────────────
        Schema::table('services', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });

        // ── projects ─────────────────────────────────────────────────────────
        Schema::table('projects', function (Blueprint $table) {
            $table->longText('cover_image')->nullable()->change();
            $table->longText('hero_image')->nullable()->change();
            if (Schema::hasColumn('projects', 'client_logo')) {
                $table->longText('client_logo')->nullable()->change();
            }
        });

        // ── blog_posts ───────────────────────────────────────────────────────
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });

        // ── locations ────────────────────────────────────────────────────────
        Schema::table('locations', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });

        // ── ad_formats ───────────────────────────────────────────────────────
        Schema::table('ad_formats', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Revert to varchar (note: data may be truncated — use with caution)
        Schema::table('client_brands', function (Blueprint $table) {
            $table->string('logo')->nullable()->change();
            $table->string('logo_url')->nullable()->change();
        });
    }
};
