<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory, BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'voucher_date' => 'date',
        'is_posted' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(VoucherEntry::class);
    }

    public function totalDebit(): string
    {
        return number_format((float) $this->entries()->sum('debit'), 2, '.', '');
    }

    public function totalCredit(): string
    {
        return number_format((float) $this->entries()->sum('credit'), 2, '.', '');
    }

    public function isBalanced(): bool
    {
        return bccomp($this->totalDebit(), $this->totalCredit(), 2) === 0;
    }
}
