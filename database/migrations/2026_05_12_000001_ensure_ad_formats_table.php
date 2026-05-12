<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ad_formats')) {
            Schema::create('ad_formats', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('label')->nullable();
                $table->text('description')->nullable();
                $table->decimal('width_m', 8, 2)->nullable();
                $table->decimal('height_m', 8, 2)->nullable();
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        } else {
            // Table exists — ensure all columns are present
            Schema::table('ad_formats', function (Blueprint $table) {
                if (!Schema::hasColumn('ad_formats', 'label')) {
                    $table->string('label')->nullable()->after('slug');
                }
                if (!Schema::hasColumn('ad_formats', 'description')) {
                    $table->text('description')->nullable();
                }
                if (!Schema::hasColumn('ad_formats', 'width_m')) {
                    $table->decimal('width_m', 8, 2)->nullable();
                }
                if (!Schema::hasColumn('ad_formats', 'height_m')) {
                    $table->decimal('height_m', 8, 2)->nullable();
                }
                if (!Schema::hasColumn('ad_formats', 'sort_order')) {
                    $table->integer('sort_order')->default(0);
                }
            });
        }
    }

    public function down(): void
    {
        // intentionally no-op — do not drop the table on rollback
    }
};
