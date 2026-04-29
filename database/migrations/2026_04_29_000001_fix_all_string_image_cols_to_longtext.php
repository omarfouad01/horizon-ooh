<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Comprehensive fix: ensure ALL columns that may hold base64 images
 * or long content are LONGTEXT. Safe to re-run (uses hasColumn checks
 * and DB::statement for change operations that ignore if already correct).
 */
return new class extends Migration
{
    public function up(): void
    {
        // Helper: change a column to LONGTEXT only if it exists and isn't already LONGTEXT
        // We use raw ALTER TABLE because ->change() on already-LONGTEXT can error on some MySQL versions
        $toLongText = function (string $table, string $col) {
            if (Schema::hasColumn($table, $col)) {
                \DB::statement("ALTER TABLE `{$table}` MODIFY `{$col}` LONGTEXT NULL");
            }
        };

        // ── client_brands ──────────────────────────────────────────────────────
        $toLongText('client_brands', 'logo');
        $toLongText('client_brands', 'logo_url');

        // ── projects ───────────────────────────────────────────────────────────
        $toLongText('projects', 'cover_image');
        $toLongText('projects', 'hero_image');
        $toLongText('projects', 'client_logo');
        $toLongText('projects', 'cover_image_alt');
        $toLongText('projects', 'hero_image_alt');

        // ── services ──────────────────────────────────────────────────────────
        $toLongText('services', 'image');

        // ── blog_posts ────────────────────────────────────────────────────────
        $toLongText('blog_posts', 'image');

        // ── locations ─────────────────────────────────────────────────────────
        $toLongText('locations', 'image');

        // ── ad_formats ────────────────────────────────────────────────────────
        if (Schema::hasColumn('ad_formats', 'image')) {
            $toLongText('ad_formats', 'image');
        }

        // ── simulator_templates ───────────────────────────────────────────────
        if (Schema::hasTable('simulator_templates')) {
            $toLongText('simulator_templates', 'mockup_url');
        }

        // ── design_uploads ────────────────────────────────────────────────────
        if (Schema::hasTable('design_uploads')) {
            $toLongText('design_uploads', 'design_url');
        }

        // ── billboard_images ──────────────────────────────────────────────────
        $toLongText('billboard_images', 'url');

        // ── settings (key-value blob) ─────────────────────────────────────────
        if (Schema::hasTable('settings')) {
            $toLongText('settings', 'value');
        }
    }

    public function down(): void
    {
        // Intentionally a no-op: reverting LONGTEXT to VARCHAR(255)
        // would potentially truncate data, which is unsafe.
    }
};
