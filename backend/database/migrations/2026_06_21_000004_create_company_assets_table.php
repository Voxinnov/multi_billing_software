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
        Schema::create('company_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->enum('asset_type', ['logo', 'seal', 'signature']);
            $table->string('asset_name');
            $table->string('asset_path');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->unique(['company_id', 'asset_type', 'asset_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_assets');
    }
};
