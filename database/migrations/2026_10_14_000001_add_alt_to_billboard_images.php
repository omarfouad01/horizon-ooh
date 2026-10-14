<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        if (!Schema::hasColumn('blog_posts', 'image_alt')) Schema::table('blog_posts', fn (Blueprint $table) => $table->string('image_alt', 1000)->nullable());
        if (!Schema::hasColumn('billboard_images', 'alt')) Schema::table('billboard_images', fn (Blueprint $table) => $table->string('alt', 1000)->nullable());
    }
    public function down(): void {
        if (Schema::hasColumn('blog_posts', 'image_alt')) Schema::table('blog_posts', fn (Blueprint $table) => $table->dropColumn('image_alt'));
        if (Schema::hasColumn('billboard_images', 'alt')) Schema::table('billboard_images', fn (Blueprint $table) => $table->dropColumn('alt'));
    }
};
