<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingScheme extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'monthly_installment' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function enrollments(): HasMany
    {
        return $this->hasMany(SavingSchemeEnrollment::class, 'scheme_id');
    }
}
