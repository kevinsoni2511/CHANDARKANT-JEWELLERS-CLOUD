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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->string('code', 30);
            $table->string('metal_type', 30)->default('gold'); // gold, silver, platinum, diamond
            $table->string('hsn_code', 20)->default('7113'); // Indian HSN for Jewellery
            $table->decimal('default_wastage_percent', 5, 2)->default(0.00);
            $table->string('default_making_charge_type', 20)->default('per_gram');
            $table->decimal('default_making_charge_rate', 14, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('sku', 100);
            $table->string('barcode', 100)->nullable();
            $table->string('name', 255);
            $table->string('huid', 20)->nullable(); // BIS Hallmark Unique Identification
            $table->string('metal_type', 30)->default('gold');
            $table->string('purity_karat', 20)->default('22K');
            $table->decimal('gross_weight', 10, 3); // in grams
            $table->decimal('stone_weight', 10, 3)->default(0.000);
            $table->decimal('net_weight', 10, 3); // gross - stone
            $table->decimal('fine_gold_weight', 10, 3)->default(0.000); // calculated fine purity
            $table->decimal('wastage_percent', 5, 2)->default(0.00);
            $table->string('making_charge_type', 20)->default('per_gram'); // per_gram, fixed, percentage
            $table->decimal('making_charge_rate', 14, 2)->default(0.00);
            $table->decimal('stone_charges', 14, 2)->default(0.00);
            $table->decimal('purchase_cost', 14, 2)->default(0.00);
            $table->decimal('tag_price', 14, 2)->nullable();
            $table->string('status', 30)->default('in_stock'); // in_stock, sold, out_on_memo, in_repair, transferred
            $table->string('image_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'sku']);
            $table->index(['tenant_id', 'branch_id', 'status'], 'idx_inventory_branch_status');
            $table->index(['tenant_id', 'huid'], 'idx_inventory_huid');
        });

        Schema::create('inventory_stones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->string('stone_type', 50); // diamond, ruby, emerald, sapphire, cz, pearl
            $table->decimal('carat_weight', 8, 4); // in carats
            $table->integer('pieces')->default(1);
            $table->string('clarity', 20)->nullable(); // VVS1, VS2, SI1
            $table->string('color', 20)->nullable(); // D, E, F, G, H
            $table->string('cut', 20)->nullable(); // Excellent, Very Good
            $table->decimal('rate_per_carat', 14, 2)->default(0.00);
            $table->decimal('total_amount', 14, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_stones');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('categories');
    }
};
