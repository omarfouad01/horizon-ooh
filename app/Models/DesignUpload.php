<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DesignUpload extends Model
{
    protected $fillable = [
        'user_id', 'user_name', 'user_email', 'user_phone',
        'design_url', 'template_id', 'type_name', 'size_label',
        'product_id', 'product_name', 'status', 'notes',
    ];
}
