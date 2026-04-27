<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ClientBrand extends Model
{
    protected $fillable = [
        'name','logo','logo_url','industry','website','sort_order',
        'description','name_ar','description_ar',
    ];
}
