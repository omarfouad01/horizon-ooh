<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('billboard_formats')) {
            Schema::create('billboard_formats', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('label')->nullable();
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });

            // Seed default ad formats
            \DB::table('billboard_formats')->insert([
                ['name' => 'Billboard',           'slug' => 'billboard',            'label' => 'Billboard',           'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Digital Screens',     'slug' => 'digital-screens',      'label' => 'Digital Screens',     'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Mall Advertising',    'slug' => 'mall-advertising',     'label' => 'Mall Advertising',    'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Airport Advertising', 'slug' => 'airport-advertising',  'label' => 'Airport Advertising', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Transit Ads',         'slug' => 'transit-ads',          'label' => 'Transit Ads',         'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }
    public function down(): void {}
};
