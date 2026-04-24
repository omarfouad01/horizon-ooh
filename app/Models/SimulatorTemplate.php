<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SimulatorTemplate extends Model
{
    protected $fillable = ['type_name', 'size_label', 'mockup_url', 'panels', 'notes'];
    protected $casts    = ['panels' => 'array'];
}
