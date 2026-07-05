<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'vendor_id',
        'company_code',
        'company_name',
        'gstin',
        'phone_number',
        'email',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'country',
        'pincode',
        'bank_name',
        'bank_branch',
        'bank_account_no',
        'bank_ifsc',
        'signer_name',
        'footer_text',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(CompanyAsset::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
