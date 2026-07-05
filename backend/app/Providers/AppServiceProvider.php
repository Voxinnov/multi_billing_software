<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (!class_exists('FPDF') && class_exists(\Fpdf\Fpdf::class)) {
            class_alias(\Fpdf\Fpdf::class, 'FPDF');
        }

        $this->app->bind(\App\Repositories\CompanyRepositoryInterface::class, \App\Repositories\CompanyRepository::class);
        $this->app->bind(\App\Repositories\InvoiceRepositoryInterface::class, \App\Repositories\InvoiceRepository::class);
        $this->app->bind(\App\Repositories\InvoiceBatchRepositoryInterface::class, \App\Repositories\InvoiceBatchRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
