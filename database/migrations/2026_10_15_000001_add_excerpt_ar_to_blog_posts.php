<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasColumn('blog_posts', 'excerpt_ar')) {
            Schema::table('blog_posts', fn (Blueprint $table) => $table->text('excerpt_ar')->nullable());
        }
    }
    public function down(): void {
        Schema::table('blog_posts', fn (Blueprint $table) => $table->dropColumn('excerpt_ar'));
    }
};
