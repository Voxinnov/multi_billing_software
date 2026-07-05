<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'item_name',
        'rate',
        'qty',
        'tax_percent',
        'taxable_value',
        'tax_amount',
        'total_amount',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'qty' => 'integer',
        'tax_percent' => 'decimal:2',
        'taxable_value' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
