<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BillboardSize extends Model
{
    protected $fillable = ['label', 'width_m', 'height_m', 'notes'];
}
