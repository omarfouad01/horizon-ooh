<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'phone', 'company', 'source', 'notes'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['email_verified_at' => 'datetime'];

    public function getJWTIdentifier(): mixed         { return $this->getKey(); }
    public function getJWTCustomClaims(): array        { return ['role' => $this->role ?? 'admin']; }
}
