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
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Billed by
            $table->string('invoice_number', 100);
            $table->date('invoice_date');
            $table->decimal('subtotal', 14, 2); // Gross items sum
            $table->decimal('discount_amount', 14, 2)->default(0.00);
            $table->decimal('old_gold_amount', 14, 2)->default(0.00);
            $table->decimal('taxable_amount', 14, 2);
            $table->decimal('cgst_rate', 5, 2)->default(1.50);
            $table->decimal('cgst_amount', 14, 2)->default(0.00);
            $table->decimal('sgst_rate', 5, 2)->default(1.50);
            $table->decimal('sgst_amount', 14, 2)->default(0.00);
            $table->decimal('igst_rate', 5, 2)->default(0.00);
            $table->decimal('igst_amount', 14, 2)->default(0.00);
            $table->decimal('round_off', 14, 2)->default(0.00);
            $table->decimal('grand_total', 14, 2);
            $table->decimal('paid_amount', 14, 2)->default(0.00);
            $table->decimal('due_amount', 14, 2)->default(0.00);
            $table->string('status', 30)->default('paid'); // paid, partial, pending, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'invoice_number']);
            $table->index(['tenant_id', 'branch_id', 'invoice_date'], 'idx_invoices_date');
            $table->index(['tenant_id', 'customer_id'], 'idx_invoices_customer');
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->nullable()->constrained('inventory_items')->nullOnDelete();
            $table->string('item_name', 255);
            $table->string('sku', 100)->nullable();
            $table->string('huid', 20)->nullable();
            $table->string('metal_type', 30);
            $table->string('purity_karat', 20);
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('stone_weight', 10, 3)->default(0.000);
            $table->decimal('net_weight', 10, 3);
            $table->decimal('metal_rate_applied', 14, 2);
            $table->decimal('metal_value', 14, 2);
            $table->decimal('wastage_percent', 5, 2)->default(0.00);
            $table->decimal('wastage_weight', 10, 3)->default(0.000);
            $table->decimal('wastage_amount', 14, 2)->default(0.00);
            $table->string('making_charge_type', 20)->default('per_gram');
            $table->decimal('making_charge_rate', 14, 2)->default(0.00);
            $table->decimal('making_charges', 14, 2)->default(0.00);
            $table->decimal('stone_charges', 14, 2)->default(0.00);
            $table->decimal('item_total', 14, 2);
            $table->json('item_snapshot')->nullable(); // Immutable frozen snapshot
            $table->timestamps();
        });

        Schema::create('old_gold_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('receipt_number', 100);
            $table->string('metal_type', 30)->default('gold');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('stone_deduction', 10, 3)->default(0.000);
            $table->decimal('net_weight', 10, 3);
            $table->string('purity_karat', 20)->default('22K');
            $table->decimal('purity_percentage', 6, 3)->default(91.667);
            $table->decimal('fine_metal_weight', 10, 3);
            $table->decimal('rate_per_gram', 14, 2);
            $table->decimal('calculated_value', 14, 2);
            $table->string('settlement_type', 50)->default('exchange_against_invoice'); // exchange_against_invoice, cash_payout, bank_transfer
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'receipt_number']);
        });

        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->string('payment_mode', 50); // cash, upi, card, bank_transfer, old_gold, saving_scheme
            $table->decimal('amount', 14, 2);
            $table->string('reference_number', 100)->nullable();
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_payments');
        Schema::dropIfExists('old_gold_purchases');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};
