<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $table = 'blog_posts';
    protected $fillable = [
        'slug','title','title_ar','category','author','read_time','image','image_alt',
        'excerpt','excerpt_ar','content','body','body_ar','tags',
        'meta_title','meta_desc','meta_title_ar','meta_desc_ar',
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
