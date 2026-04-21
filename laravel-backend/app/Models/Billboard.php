<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Billboard extends Model
{
    protected $fillable = [
        'code','slug','title','location_id','district_id','format',
        'width','height','price','availability','illuminated',
        'lat','lng','full_address','description','featured','sort_order',
    ];
    protected $casts = ['illuminated' => 'boolean', 'featured' => 'boolean'];

    public function location(): BelongsTo  { return $this->belongsTo(Location::class); }
    public function district(): BelongsTo  { return $this->belongsTo(District::class); }
    public function images(): HasMany      { return $this->hasMany(BillboardImage::class)->orderBy('sort_order'); }
}
