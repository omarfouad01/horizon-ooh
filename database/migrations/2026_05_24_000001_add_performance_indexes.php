<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Add database indexes for commonly queried columns.
 * These speed up billboard/location/project lookups by 10-100x on large datasets.
 * All operations are idempotent — safe to run multiple times.
 */
return new class extends Migration
{
    private function addIndexSafe(string $table, array $columns, string $name): void
    {
        try {
            // Check if index already exists
            $indexes = DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$name]);
            if (empty($indexes)) {
                Schema::table($table, function (Blueprint $t) use ($columns, $name) {
                    $t->index($columns, $name);
                });
            }
        } catch (\Throwable $e) {
            // Log but don't fail if index can't be added
            \Log::warning("Could not add index {$name} on {$table}: " . $e->getMessage());
        }
    }

    public function up(): void
    {
        // ── billboards ──────────────────────────────────────────────────────────
        if (Schema::hasTable('billboards')) {
            $this->addIndexSafe('billboards', ['created_at'],         'idx_billboards_created_at');
            $this->addIndexSafe('billboards', ['location_id'],        'idx_billboards_location_id');
            $this->addIndexSafe('billboards', ['district_id'],        'idx_billboards_district_id');
            $this->addIndexSafe('billboards', ['billboard_format_id'],'idx_billboards_format_id');
        }

        // ── projects ────────────────────────────────────────────────────────────
        if (Schema::hasTable('projects')) {
            $this->addIndexSafe('projects', ['sort_order'],  'idx_projects_sort_order');
            $this->addIndexSafe('projects', ['created_at'],  'idx_projects_created_at');
            $this->addIndexSafe('projects', ['featured'],    'idx_projects_featured');
        }

        // ── blog_posts ──────────────────────────────────────────────────────────
        if (Schema::hasTable('blog_posts')) {
            $this->addIndexSafe('blog_posts', ['created_at'], 'idx_blog_created_at');
            $this->addIndexSafe('blog_posts', ['slug'],       'idx_blog_slug');
        }

        // ── services ────────────────────────────────────────────────────────────
        if (Schema::hasTable('services')) {
            $this->addIndexSafe('services', ['sort_order'], 'idx_services_sort_order');
        }

        // ── billboard_images ────────────────────────────────────────────────────
        if (Schema::hasTable('billboard_images')) {
            $this->addIndexSafe('billboard_images', ['billboard_id'], 'idx_billboard_images_billboard_id');
        }
    }

    public function down(): void
    {
        // Intentionally a no-op — removing indexes is safe but not necessary on rollback
    }
};
