<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'slug','name','short_title','tagline','icon','eyebrow','headline',
        'description','long_description','what_is','where_used','image','image_alt',
        'features','benefits','process','stats','sort_order','why_choose',
        'title_ar','description_ar','long_description_ar',
    ];
    protected $casts = [
        'features'   => 'array',
        'stats'      => 'array',
        'benefits'   => 'array',
        'process'    => 'array',
        'why_choose' => 'array',
    ];
}
