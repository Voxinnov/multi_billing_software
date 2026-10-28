<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Public login endpoint
Route::post('/login', [AuthController::class, 'login']);

// Protected API routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Branding Settings
    Route::get('/vendor/branding', [CompanyController::class, 'getBranding']);
    Route::post('/vendor/branding', [CompanyController::class, 'updateBranding']);

    // Admin Module (Super Admin only)
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::post('/admin/users', [AdminController::class, 'storeUser']);
        Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'destroyUser']);
        Route::get('/admin/subscriptions', [AdminController::class, 'subscriptions']);
        Route::post('/admin/subscriptions', [AdminController::class, 'storeSubscription']);
        Route::put('/admin/subscriptions/{id}', [AdminController::class, 'updateSubscription']);
        Route::delete('/admin/subscriptions/{id}', [AdminController::class, 'destroySubscription']);
        Route::get('/admin/vendors', [AdminController::class, 'vendors']);
        Route::post('/admin/vendors', [AdminController::class, 'storeVendor']);
        Route::put('/admin/vendors/{id}', [AdminController::class, 'updateVendor']);
        Route::delete('/admin/vendors/{id}', [AdminController::class, 'destroyVendor']);
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/admin/permissions', [AdminController::class, 'getPermissions']);
        Route::post('/admin/permissions', [AdminController::class, 'updatePermissions']);
    });

    // Company Module
    Route::post('/company', [CompanyController::class, 'store'])
        ->middleware('role:super_admin,vendor_admin');
    Route::get('/company/list', [CompanyController::class, 'index'])
        ->middleware('role:super_admin,vendor_admin,staff,viewer');

    // Company Assets Module
    Route::post('/company/assets', [CompanyController::class, 'uploadAsset'])
        ->middleware('role:super_admin,vendor_admin');
    Route::get('/assets', [CompanyController::class, 'listAssets'])
        ->middleware('role:super_admin,vendor_admin,staff,viewer');
    Route::get('/company/all-assets', [InvoiceController::class, 'listAllAssets'])
        ->middleware('role:super_admin,vendor_admin,staff,viewer');
    Route::delete('/company/assets/{id}', [CompanyController::class, 'deleteAsset'])
        ->middleware('role:super_admin,vendor_admin');
    Route::put('/company/assets/{id}', [CompanyController::class, 'updateAsset'])
        ->middleware('role:super_admin,vendor_admin');
    Route::put('/company/assets/{id}/default', [CompanyController::class, 'setDefaultAsset'])
        ->middleware('role:super_admin,vendor_admin');

    // Excel and Invoice Processing
    Route::post('/upload-excel', [InvoiceController::class, 'uploadExcel'])
        ->middleware('role:super_admin,vendor_admin,staff');
    Route::post('/generate-invoices', [InvoiceController::class, 'uploadExcel']) // Alias endpoint
        ->middleware('role:super_admin,vendor_admin,staff');

    // Manual single-invoice generation
    Route::post('/manual-invoice', [InvoiceController::class, 'generateManual'])
        ->middleware('role:super_admin,vendor_admin,staff');

    // History and Polling
    Route::get('/history', [InvoiceController::class, 'index'])
        ->middleware('role:super_admin,vendor_admin,staff,viewer');
    Route::get('/history/{id}', [InvoiceController::class, 'show'])
        ->middleware('role:super_admin,vendor_admin,staff,viewer');
    Route::delete('/history/{id}', [InvoiceController::class, 'destroy'])
        ->middleware('role:super_admin,vendor_admin');

    // Bulk Downloads
    Route::get('/download/pdf/{batchId}', [InvoiceController::class, 'downloadPdf'])
        ->middleware('role:super_admin,vendor_admin,staff,viewer');
    Route::get('/download/zip/{batchId}', [InvoiceController::class, 'downloadZip'])
        ->middleware('role:super_admin,vendor_admin,staff,viewer');
});
