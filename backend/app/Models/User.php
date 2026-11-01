<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, BelongsToTenant;

    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'permissions' => 'array',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isOwner(): bool
    {
        return in_array($this->role, ['owner', 'super_admin']);
    }

    public function isManager(): bool
    {
        return in_array($this->role, ['manager', 'owner', 'super_admin']);
    }

    public function isAccountant(): bool
    {
        return in_array($this->role, ['accountant', 'owner', 'super_admin']);
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isOwner() || $this->isSuperAdmin()) {
            return true;
        }

        $perms = $this->permissions ?? [];
        return in_array($permission, $perms) || in_array('*', $perms);
    }
}
