<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'slug','title','client','category','eyebrow','description',
        'long_description','cover_image','images','stats','year','featured','sort_order',
    ];
    protected $casts = ['images' => 'array', 'stats' => 'array', 'featured' => 'boolean'];
}
