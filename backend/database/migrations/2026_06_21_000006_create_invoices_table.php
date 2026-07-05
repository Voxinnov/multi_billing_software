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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->foreignId('batch_id')->constrained('invoice_batches')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('invoice_no');
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->string('customer_name');
            $table->text('customer_address')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('place_of_supply')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->decimal('tax_amount', 12, 2)->default(0.00);
            $table->decimal('grand_total', 12, 2)->default(0.00);
            $table->text('remarks')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
