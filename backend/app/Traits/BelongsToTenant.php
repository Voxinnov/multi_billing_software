<?php

namespace App\Traits;

use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * Boot the trait.
     */
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            if (Auth::hasUser() && Auth::user()->vendor_id !== null && !$model->vendor_id) {
                $model->vendor_id = Auth::user()->vendor_id;
            }
        });
    }
}
