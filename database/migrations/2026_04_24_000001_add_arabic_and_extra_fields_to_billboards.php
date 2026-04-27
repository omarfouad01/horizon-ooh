<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Extra billboard fields (Arabic names, size string, etc.) ──────────
        Schema::table('billboards', function (Blueprint $table) {
            if (!Schema::hasColumn('billboards', 'name_ar'))        $table->string('name_ar')->nullable()->after('title');
            if (!Schema::hasColumn('billboards', 'description_ar')) $table->text('description_ar')->nullable()->after('description');
            if (!Schema::hasColumn('billboards', 'size'))           $table->string('size')->nullable()->after('format');
            if (!Schema::hasColumn('billboards', 'sqm'))            $table->decimal('sqm', 8, 2)->nullable()->after('size');
            if (!Schema::hasColumn('billboards', 'sides'))          $table->integer('sides')->default(1)->after('sqm');
            if (!Schema::hasColumn('billboards', 'material'))       $table->string('material')->nullable()->after('sides');
            if (!Schema::hasColumn('billboards', 'brightness'))     $table->string('brightness')->nullable()->after('material');
            if (!Schema::hasColumn('billboards', 'supplier_id'))    $table->unsignedBigInteger('supplier_id')->nullable()->after('brightness');
        });

        // ── Add name_ar to districts ─────────────────────────────────────────
        Schema::table('districts', function (Blueprint $table) {
            if (!Schema::hasColumn('districts', 'name_ar')) $table->string('name_ar')->nullable()->after('name');
            if (!Schema::hasColumn('districts', 'city_ar'))  $table->string('city_ar')->nullable()->after('name_ar');
        });

        // ── Add Arabic fields to locations ───────────────────────────────────
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'city_ar'))         $table->string('city_ar')->nullable()->after('city');
            if (!Schema::hasColumn('locations', 'headline_ar'))     $table->string('headline_ar')->nullable()->after('headline');
            if (!Schema::hasColumn('locations', 'description_ar'))  $table->text('description_ar')->nullable()->after('description');
        });

        // ── Billboard Sizes ─────────────────────────────────────────────────
        if (!Schema::hasTable('billboard_sizes')) {
            Schema::create('billboard_sizes', function (Blueprint $table) {
                $table->id();
                $table->string('label');             // e.g. "8×16 m"
                $table->decimal('width_m', 8, 2)->nullable();
                $table->decimal('height_m', 8, 2)->nullable();
                $table->string('notes')->nullable();
                $table->timestamps();
            });
        }

        // ── Simulator Templates ──────────────────────────────────────────────
        if (!Schema::hasTable('simulator_templates')) {
            Schema::create('simulator_templates', function (Blueprint $table) {
                $table->id();
                $table->string('type_name');         // billboard type (e.g. "Unipole")
                $table->string('size_label');        // matches billboard_sizes.label
                $table->string('mockup_url');        // street photo URL
                $table->json('panels');              // array of corner sets [[{x,y}×4], ...]
                $table->string('notes')->nullable();
                $table->timestamps();
            });
        }

        // ── Design Uploads ───────────────────────────────────────────────────
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
                $table->string('status')->default('pending'); // pending|reviewed|approved|rejected
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::table('billboards', function (Blueprint $table) {
            $table->dropColumn(array_filter([
                Schema::hasColumn('billboards', 'name_ar')        ? 'name_ar'        : null,
                Schema::hasColumn('billboards', 'description_ar') ? 'description_ar' : null,
                Schema::hasColumn('billboards', 'size')           ? 'size'           : null,
                Schema::hasColumn('billboards', 'sqm')            ? 'sqm'            : null,
                Schema::hasColumn('billboards', 'sides')          ? 'sides'          : null,
                Schema::hasColumn('billboards', 'material')       ? 'material'       : null,
                Schema::hasColumn('billboards', 'brightness')     ? 'brightness'     : null,
                Schema::hasColumn('billboards', 'supplier_id')    ? 'supplier_id'    : null,
            ]));
        });

        Schema::table('districts', function (Blueprint $table) {
            foreach (['name_ar','city_ar'] as $col) {
                if (Schema::hasColumn('districts', $col)) $table->dropColumn($col);
            }
        });

        Schema::table('locations', function (Blueprint $table) {
            foreach (['city_ar','headline_ar','description_ar'] as $col) {
                if (Schema::hasColumn('locations', $col)) $table->dropColumn($col);
            }
        });

        Schema::dropIfExists('design_uploads');
        Schema::dropIfExists('simulator_templates');
        Schema::dropIfExists('billboard_sizes');
    }
};
