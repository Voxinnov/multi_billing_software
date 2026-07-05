<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoice_batches', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('vendor_id')->constrained('companies')->onDelete('set null');
            $table->foreignId('logo_asset_id')->nullable()->after('company_id')->constrained('company_assets')->onDelete('set null');
            $table->foreignId('seal_asset_id')->nullable()->after('logo_asset_id')->constrained('company_assets')->onDelete('set null');
            $table->foreignId('sign_asset_id')->nullable()->after('seal_asset_id')->constrained('company_assets')->onDelete('set null');
            $table->boolean('gst_enabled')->default(false)->after('status');
            $table->decimal('gst_rate', 5, 2)->default(0.00)->after('gst_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoice_batches', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['logo_asset_id']);
            $table->dropForeign(['seal_asset_id']);
            $table->dropForeign(['sign_asset_id']);
            $table->dropColumn(['company_id', 'logo_asset_id', 'seal_asset_id', 'sign_asset_id', 'gst_enabled', 'gst_rate']);
        });
    }
};
