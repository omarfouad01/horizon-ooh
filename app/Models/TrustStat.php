<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TrustStat extends Model
{
    protected $fillable = ['value','label','sublabel','icon','sort_order'];
}
