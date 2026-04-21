<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Locations (Governorates) ─────────────────────────────────────
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('city');
            $table->string('headline')->nullable();
            $table->string('detail')->nullable();
            $table->text('description')->nullable();
            $table->text('long_description')->nullable();
            $table->string('image')->nullable();
            $table->json('available_formats')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Districts ────────────────────────────────────────────────────
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        // ── Ad Formats ───────────────────────────────────────────────────
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

        // ── Billboards ───────────────────────────────────────────────────
        Schema::create('billboards', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->string('title')->nullable();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('district_id')->nullable()->constrained()->nullOnDelete();
            $table->string('format')->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->string('availability')->default('available');
            $table->boolean('illuminated')->default(false);
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('full_address')->nullable();
            $table->text('description')->nullable();
            $table->boolean('featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Billboard Images ─────────────────────────────────────────────
        Schema::create('billboard_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billboard_id')->constrained()->cascadeOnDelete();
            $table->string('path');           // storage path
            $table->string('url')->nullable(); // public URL
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Services ─────────────────────────────────────────────────────
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('eyebrow')->nullable();
            $table->string('headline')->nullable();
            $table->text('description')->nullable();
            $table->text('long_description')->nullable();
            $table->string('image')->nullable();
            $table->json('features')->nullable();
            $table->json('stats')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Projects ─────────────────────────────────────────────────────
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('client')->nullable();
            $table->string('category')->nullable();
            $table->string('eyebrow')->nullable();
            $table->text('description')->nullable();
            $table->text('long_description')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('images')->nullable();
            $table->json('stats')->nullable();
            $table->string('year')->nullable();
            $table->boolean('featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Blog Posts ───────────────────────────────────────────────────
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('category')->nullable();
            $table->string('author')->nullable();
            $table->string('read_time')->nullable();
            $table->string('image')->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Contact Enquiries ────────────────────────────────────────────
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'read', 'replied', 'archived'])->default('new');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });

        // ── Client Brands ────────────────────────────────────────────────
        Schema::create('client_brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('industry')->nullable();
            $table->string('website')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Trust Stats ──────────────────────────────────────────────────
        Schema::create('trust_stats', function (Blueprint $table) {
            $table->id();
            $table->string('value');
            $table->string('label');
            $table->string('sublabel')->nullable();
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Process Steps ────────────────────────────────────────────────
        Schema::create('process_steps', function (Blueprint $table) {
            $table->id();
            $table->integer('step')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('label')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Suppliers ────────────────────────────────────────────────────
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('category')->nullable();
            $table->text('notes')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // ── Customers ────────────────────────────────────────────────────
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('industry')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── Site Settings (key-value) ────────────────────────────────────
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('process_steps');
        Schema::dropIfExists('trust_stats');
        Schema::dropIfExists('client_brands');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('services');
        Schema::dropIfExists('billboard_images');
        Schema::dropIfExists('billboards');
        Schema::dropIfExists('ad_formats');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('locations');
    }
};
