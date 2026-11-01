<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'birthday' => 'date',
        'anniversary' => 'date',
        'outstanding_balance' => 'decimal:2',
        'marketing_consent' => 'boolean',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function savingSchemeEnrollments(): HasMany
    {
        return $this->hasMany(SavingSchemeEnrollment::class);
    }
}
