<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'gross_weight' => 'decimal:3',
        'stone_weight' => 'decimal:3',
        'net_weight' => 'decimal:3',
        'metal_rate_applied' => 'decimal:2',
        'metal_value' => 'decimal:2',
        'wastage_percent' => 'decimal:2',
        'wastage_weight' => 'decimal:3',
        'wastage_amount' => 'decimal:2',
        'making_charge_rate' => 'decimal:2',
        'making_charges' => 'decimal:2',
        'stone_charges' => 'decimal:2',
        'item_total' => 'decimal:2',
        'item_snapshot' => 'array',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
