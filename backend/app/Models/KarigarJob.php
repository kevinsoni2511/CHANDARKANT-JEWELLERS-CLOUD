<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KarigarJob extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'gold_issued_gross' => 'decimal:3',
        'gold_issued_purity' => 'decimal:3',
        'gold_issued_pure' => 'decimal:3',
        'gold_returned_gross' => 'decimal:3',
        'gold_returned_pure' => 'decimal:3',
        'scrap_returned_pure' => 'decimal:3',
        'allowed_wastage' => 'decimal:3',
        'actual_wastage' => 'decimal:3',
        'shortage_excess' => 'decimal:3',
        'labour_charges' => 'decimal:2',
    ];

    public function karigar(): BelongsTo
    {
        return $this->belongsTo(Karigar::class);
    }
}
