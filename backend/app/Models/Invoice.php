<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Invoice extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'vendor_id',
        'batch_id',
        'company_id',
        'invoice_no',
        'invoice_date',
        'due_date',
        'customer_name',
        'customer_address',
        'customer_phone',
        'place_of_supply',
        'subtotal',
        'tax_amount',
        'grand_total',
        'remarks',
        'pdf_path',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    protected $appends = ['pdf_url'];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(InvoiceBatch::class, 'batch_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get accessible URL for the single invoice PDF file.
     */
    public function getPdfUrlAttribute(): ?string
    {
        if (!$this->pdf_path) {
            return null;
        }
        return url(Storage::url($this->pdf_path));
    }
}
