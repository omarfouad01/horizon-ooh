<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AdFormat extends Model
{
    protected $fillable = ['name','slug','label','description','width_m','height_m','sort_order'];
}
