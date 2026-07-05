<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class InvoiceBatch extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'vendor_id',
        'company_id',
        'logo_asset_id',
        'seal_asset_id',
        'sign_asset_id',
        'batch_no',
        'invoice_count',
        'pdf_path',
        'zip_path',
        'status',
        'gst_enabled',
        'gst_rate',
        'generated_by',
    ];

    protected $appends = ['pdf_url', 'zip_url'];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function logoAsset(): BelongsTo
    {
        return $this->belongsTo(CompanyAsset::class, 'logo_asset_id');
    }

    public function sealAsset(): BelongsTo
    {
        return $this->belongsTo(CompanyAsset::class, 'seal_asset_id');
    }

    public function signAsset(): BelongsTo
    {
        return $this->belongsTo(CompanyAsset::class, 'sign_asset_id');
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'batch_id');
    }

    /**
     * Get accessible URL for the combined batch PDF file.
     */
    public function getPdfUrlAttribute(): ?string
    {
        if (!$this->pdf_path) {
            return null;
        }
        return url(Storage::url($this->pdf_path));
    }

    /**
     * Get accessible URL for the compressed batch ZIP file.
     */
    public function getZipUrlAttribute(): ?string
    {
        if (!$this->zip_path) {
            return null;
        }
        return url(Storage::url($this->zip_path));
    }
}
