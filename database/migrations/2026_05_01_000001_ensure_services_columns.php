<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Idempotent migration: safely add all service-related columns if missing.
 * Safe to run multiple times – uses hasColumn guards.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'short_title')) {
                $table->string('short_title', 200)->nullable()->after('name');
            }
            if (!Schema::hasColumn('services', 'tagline')) {
                $table->text('tagline')->nullable();
            }
            if (!Schema::hasColumn('services', 'what_is')) {
                $table->text('what_is')->nullable();
            }
            if (!Schema::hasColumn('services', 'where_used')) {
                $table->text('where_used')->nullable();
            }
            if (!Schema::hasColumn('services', 'image_alt')) {
                $table->string('image_alt')->nullable();
            }
            if (!Schema::hasColumn('services', 'benefits')) {
                $table->json('benefits')->nullable();
            }
            if (!Schema::hasColumn('services', 'process')) {
                $table->json('process')->nullable();
            }
            if (!Schema::hasColumn('services', 'why_choose')) {
                $table->json('why_choose')->nullable();
            }
            if (!Schema::hasColumn('services', 'title_ar')) {
                $table->string('title_ar', 200)->nullable();
            }
            if (!Schema::hasColumn('services', 'description_ar')) {
                $table->text('description_ar')->nullable();
            }
            if (!Schema::hasColumn('services', 'long_description_ar')) {
                $table->text('long_description_ar')->nullable();
            }
            // icon may already exist but as string – change to text to store Iconify IDs
            // We cannot change the type directly; only add if missing
            if (!Schema::hasColumn('services', 'icon')) {
                $table->text('icon')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Non-destructive rollback – leave columns in place to avoid data loss
    }
};
