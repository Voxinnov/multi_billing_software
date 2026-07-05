<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CompanyAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'asset_type',
        'asset_name',
        'asset_path',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    protected $appends = ['asset_url'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the accessible HTTP URL of the asset.
     */
    public function getAssetUrlAttribute(): string
    {
        if (filter_var($this->asset_path, FILTER_VALIDATE_URL)) {
            return $this->asset_path;
        }
        return url(Storage::url($this->asset_path));
    }
}
