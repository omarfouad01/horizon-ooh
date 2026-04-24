<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $table = 'blog_posts';
    protected $fillable = [
        'slug','title','title_ar','category','author','read_time','image',
        'excerpt','content','body','body_ar','tags',
        'meta_title','meta_desc',
        'featured','published','published_at','sort_order',
    ];
    protected $casts = [
        'tags'         => 'array',
        'body'         => 'array',
        'body_ar'      => 'array',
        'featured'     => 'boolean',
        'published'    => 'boolean',
        'published_at' => 'datetime',
    ];
}
