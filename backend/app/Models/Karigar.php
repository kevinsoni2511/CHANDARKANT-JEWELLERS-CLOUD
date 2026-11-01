<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Karigar extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'pure_gold_balance' => 'decimal:3',
        'labour_rate_default' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function jobs(): HasMany
    {
        return $this->hasMany(KarigarJob::class);
    }
}
