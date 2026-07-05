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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->string('item_name');
            $table->decimal('rate', 12, 2);
            $table->integer('qty');
            $table->decimal('tax_percent', 5, 2)->default(0.00);
            $table->decimal('taxable_value', 12, 2);
            $table->decimal('tax_amount', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
