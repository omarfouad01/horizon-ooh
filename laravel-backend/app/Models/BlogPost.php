<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $table = 'blog_posts';
    protected $fillable = [
        'slug','title','category','author','read_time','image',
        'excerpt','content','tags','featured','published','published_at','sort_order',
    ];
    protected $casts = [
        'tags'         => 'array',
        'featured'     => 'boolean',
        'published'    => 'boolean',
        'published_at' => 'datetime',
    ];
}
