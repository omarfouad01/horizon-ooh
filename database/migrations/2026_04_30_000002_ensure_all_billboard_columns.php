<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 2026_04_30_000002_ensure_all_billboard_columns.php
 *
 * Idempotent migration — safely adds every column the app needs.
 * Uses hasColumn() guards so it's safe to run even if some already exist.
 * This fixes: SQLSTATE[42S22] Unknown column 'type' in SET
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('billboards', function (Blueprint $table) {
            // ── Core extra fields ─────────────────────────────────────────
            if (!Schema::hasColumn('billboards', 'name_ar')) {
                $table->string('name_ar')->nullable()->after('title');
            }
            if (!Schema::hasColumn('billboards', 'type')) {
                $table->string('type')->nullable()->after('format');
            }
            if (!Schema::hasColumn('billboards', 'quantity')) {
                $table->unsignedInteger('quantity')->default(1)->after('type');
            }
            if (!Schema::hasColumn('billboards', 'size')) {
                $table->string('size')->nullable()->after('quantity');
            }
            if (!Schema::hasColumn('billboards', 'sqm')) {
                $table->decimal('sqm', 8, 2)->nullable()->after('size');
            }
            if (!Schema::hasColumn('billboards', 'sides')) {
                $table->integer('sides')->default(1)->after('sqm');
            }
            if (!Schema::hasColumn('billboards', 'material')) {
                $table->string('material')->nullable()->after('sides');
            }
            if (!Schema::hasColumn('billboards', 'brightness')) {
                $table->string('brightness')->nullable()->after('material');
            }
            if (!Schema::hasColumn('billboards', 'description_ar')) {
                $table->text('description_ar')->nullable()->after('description');
            }
            if (!Schema::hasColumn('billboards', 'supplier_id')) {
                $table->unsignedBigInteger('supplier_id')->nullable()->after('sort_order');
            }
        });

        // ── Districts extra columns ────────────────────────────────────────
        Schema::table('districts', function (Blueprint $table) {
            if (!Schema::hasColumn('districts', 'name_ar')) {
                $table->string('name_ar')->nullable()->after('name');
            }
            if (!Schema::hasColumn('districts', 'city_ar')) {
                $table->string('city_ar')->nullable()->after('name_ar');
            }
        });

        // ── Locations extra columns ────────────────────────────────────────
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'city_ar')) {
                $table->string('city_ar')->nullable()->after('city');
            }
            if (!Schema::hasColumn('locations', 'headline_ar')) {
                $table->string('headline_ar')->nullable()->after('headline');
            }
            if (!Schema::hasColumn('locations', 'description_ar')) {
                $table->text('description_ar')->nullable()->after('description');
            }
        });

        // ── Billboard Sizes table ──────────────────────────────────────────
        if (!Schema::hasTable('billboard_sizes')) {
            Schema::create('billboard_sizes', function (Blueprint $table) {
                $table->id();
                $table->string('label');
                $table->decimal('width_m', 8, 2)->nullable();
                $table->decimal('height_m', 8, 2)->nullable();
                $table->string('notes')->nullable();
                $table->timestamps();
            });
        }

        // ── Simulator Templates table ──────────────────────────────────────
        if (!Schema::hasTable('simulator_templates')) {
            Schema::create('simulator_templates', function (Blueprint $table) {
                $table->id();
                $table->string('type_name');
                $table->string('size_label');
                $table->string('mockup_url');
                $table->json('panels');
                $table->string('notes')->nullable();
                $table->timestamps();
            });
        }

        // ── Design Uploads table ───────────────────────────────────────────
        if (!Schema::hasTable('design_uploads')) {
            Schema::create('design_uploads', function (Blueprint $table) {
                $table->id();
                $table->string('user_id')->nullable();
                $table->string('user_name')->nullable();
                $table->string('user_email')->nullable();
                $table->string('user_phone')->nullable();
                $table->string('design_url');
                $table->string('template_id')->nullable();
                $table->string('type_name')->nullable();
                $table->string('size_label')->nullable();
                $table->string('product_id')->nullable();
                $table->string('product_name')->nullable();
                $table->string('status')->default('pending');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // Intentionally left minimal — dropping these would cause data loss
        // Only remove tables we created
        Schema::dropIfExists('design_uploads');
        Schema::dropIfExists('simulator_templates');
        Schema::dropIfExists('billboard_sizes');
    }
};
