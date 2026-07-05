<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_active',
        'logo_path',
        'panel_name',
    ];

    protected $appends = ['logo_url'];

    /**
     * Get accessible URL for the uploaded panel logo.
     */
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }
        return url(\Illuminate\Support\Facades\Storage::url($this->logo_path));
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }

    public function invoiceBatches(): HasMany
    {
        return $this->hasMany(InvoiceBatch::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }
}
