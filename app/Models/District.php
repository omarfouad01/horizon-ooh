<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class District extends Model
{
    protected $fillable = ['location_id','name','name_ar','city_ar'];
    public function location(): BelongsTo { return $this->belongsTo(Location::class); }
}
