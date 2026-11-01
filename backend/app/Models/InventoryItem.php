<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'gross_weight' => 'decimal:3',
        'stone_weight' => 'decimal:3',
        'net_weight' => 'decimal:3',
        'fine_gold_weight' => 'decimal:3',
        'wastage_percent' => 'decimal:2',
        'making_charge_rate' => 'decimal:2',
        'stone_charges' => 'decimal:2',
        'purchase_cost' => 'decimal:2',
        'tag_price' => 'decimal:2',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stones(): HasMany
    {
        return $this->hasMany(InventoryStone::class);
    }

    public function scopeInStock($query)
    {
        return $query->where('status', 'in_stock');
    }
}
