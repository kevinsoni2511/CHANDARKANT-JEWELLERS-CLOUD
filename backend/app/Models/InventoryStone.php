<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryStone extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'carat_weight' => 'decimal:4',
        'rate_per_carat' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
