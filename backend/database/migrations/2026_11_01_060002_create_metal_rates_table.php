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
        Schema::create('metal_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('metal_type', 30); // gold, silver, platinum
            $table->string('purity_karat', 20); // 24K, 22K, 20K, 18K, 14K, 999, 925
            $table->decimal('purity_percentage', 6, 3); // 99.900, 91.667, 75.000
            $table->decimal('rate_per_gram', 14, 2); // Retail rate in INR
            $table->date('effective_date');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'metal_type', 'purity_karat', 'effective_date'], 'idx_metal_rates_lookup');
        });

        Schema::create('metal_rate_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('metal_type', 30);
            $table->string('purity_karat', 20);
            $table->decimal('old_rate', 14, 2)->nullable();
            $table->decimal('new_rate', 14, 2);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('change_source', 50)->default('manual'); // manual, api_sync, bulk_update
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metal_rate_logs');
        Schema::dropIfExists('metal_rates');
    }
};
