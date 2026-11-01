<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OldGoldPurchase extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'gross_weight' => 'decimal:3',
        'stone_deduction' => 'decimal:3',
        'net_weight' => 'decimal:3',
        'purity_percentage' => 'decimal:3',
        'fine_metal_weight' => 'decimal:3',
        'rate_per_gram' => 'decimal:2',
        'calculated_value' => 'decimal:2',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
