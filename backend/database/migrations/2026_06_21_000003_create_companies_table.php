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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->string('company_code');
            $table->string('company_name');
            $table->string('gstin')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('email')->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('pincode')->nullable();
            $table->text('footer_text')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['vendor_id', 'company_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
