<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'slug','title','title_ar','client','client_logo','client_logo_alt',
        'client_industry','client_description','client_page_description','campaign_brief',
        'category','eyebrow','tagline','tagline_ar','description','long_description',
        'overview','overview_ar','objective','objective_ar','execution','execution_ar',
        'cover_image','cover_image_alt','hero_image','hero_image_alt',
        'images','gallery_images','results_json','stats','tags','keywords',
        'location','city','year','duration','featured','sort_order',
    ];
    protected $casts = [
        'images'         => 'array',
        'gallery_images' => 'array',
        'results_json'   => 'array',
        'stats'          => 'array',
        'tags'           => 'array',
        'keywords'       => 'array',
        'featured'       => 'boolean',
    ];
}
