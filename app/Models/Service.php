<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'slug','name','icon','eyebrow','headline','description',
        'long_description','image','features','stats','sort_order',
    ];
    protected $casts = ['features' => 'array', 'stats' => 'array'];
}
