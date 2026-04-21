<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProcessStep extends Model
{
    protected $fillable = ['step','title','description','icon','label','sort_order'];
}
