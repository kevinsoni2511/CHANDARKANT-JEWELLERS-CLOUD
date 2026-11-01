<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingSchemeEnrollment extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'start_date' => 'date',
        'total_paid' => 'decimal:2',
        'maturity_value' => 'decimal:2',
    ];

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(SavingScheme::class, 'scheme_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(SavingSchemeInstallment::class, 'enrollment_id');
    }
}
