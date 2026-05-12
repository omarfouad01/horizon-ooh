<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BillboardFormat extends Model {
    protected $fillable = ['name', 'slug', 'label', 'sort_order'];
}
