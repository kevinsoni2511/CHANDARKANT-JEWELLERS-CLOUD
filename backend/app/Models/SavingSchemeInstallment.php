<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingSchemeInstallment extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(SavingSchemeEnrollment::class, 'enrollment_id');
    }
}
