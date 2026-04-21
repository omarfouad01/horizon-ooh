<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillboardImage extends Model
{
    protected $fillable = ['billboard_id','path','url','is_primary','sort_order'];
    protected $casts    = ['is_primary' => 'boolean'];
    public function billboard(): BelongsTo { return $this->belongsTo(Billboard::class); }
}
