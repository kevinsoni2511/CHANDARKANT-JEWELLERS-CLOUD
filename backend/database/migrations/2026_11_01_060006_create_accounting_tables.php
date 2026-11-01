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
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('code', 50);
            $table->string('name', 255);
            $table->string('type', 50); // asset, liability, equity, income, expense
            $table->foreignId('parent_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('voucher_type', 50); // sales, purchase, receipt, payment, journal, contra
            $table->string('voucher_number', 100);
            $table->date('voucher_date');
            $table->text('narration')->nullable();
            $table->string('reference_type', 100)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->boolean('is_posted')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'voucher_number']);
            $table->index(['tenant_id', 'branch_id', 'voucher_date'], 'idx_vouchers_date');
            $table->index(['reference_type', 'reference_id'], 'idx_vouchers_ref');
        });

        Schema::create('voucher_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_id')->constrained('vouchers')->onDelete('cascade');
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->decimal('debit', 14, 2)->default(0.00);
            $table->decimal('credit', 14, 2)->default(0.00);
            $table->string('entry_narration', 255)->nullable();
            $table->timestamps();

            $table->index(['account_id'], 'idx_voucher_entries_account');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_entries');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('chart_of_accounts');
    }
};
