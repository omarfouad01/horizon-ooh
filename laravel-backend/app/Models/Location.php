<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    protected $fillable = [
        'slug','city','headline','detail','description',
        'long_description','image','available_formats','sort_order',
    ];
    protected $casts = ['available_formats' => 'array'];

    public function districts(): HasMany { return $this->hasMany(District::class); }
    public function billboards(): HasMany { return $this->hasMany(Billboard::class); }
}
