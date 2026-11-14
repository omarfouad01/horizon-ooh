<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Service;
return new class extends Migration {
    public function up(): void
    {
        $rows = json_decode(file_get_contents(database_path('data/digital-services.json')), true, 512, JSON_THROW_ON_ERROR);
        DB::transaction(function () use ($rows) {
            $sortOrder = (int) Service::max('sort_order');
            foreach ($rows as [$slug, $name, $arabic, $icon, $tagline, , $short, $shortAr, $long, $longAr, $overview, , $audience, , $benefits, $process]) {
                Service::firstOrCreate(['slug' => $slug], [
                    'name' => $name, 'short_title' => $name, 'title_ar' => $arabic,
                    'icon' => $icon, 'tagline' => $tagline, 'description' => $short,
                    'description_ar' => $shortAr, 'long_description' => $long, 'long_description_ar' => $longAr,
                    'what_is' => $overview, 'where_used' => $audience, 'features' => [],
                    'benefits' => array_column($benefits, 0), 'process' => array_column($process, 0),
                    'stats' => [], 'sort_order' => ++$sortOrder,
                ]);
            }
        });
    }
    public function down(): void
    {
        // Preserve service content and dashboard edits on rollback.
    }
};
