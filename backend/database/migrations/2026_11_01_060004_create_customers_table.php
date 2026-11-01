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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->string('phone', 20);
            $table->string('email', 100)->nullable();
            $table->string('pan_number', 20)->nullable(); // Statutory compliance for > 2 Lakh transactions
            $table->string('aadhaar_number', 20)->nullable();
            $table->string('gstin', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->default('Surat');
            $table->string('state', 100)->default('Gujarat');
            $table->string('pincode', 10)->nullable();
            $table->date('birthday')->nullable();
            $table->date('anniversary')->nullable();
            $table->integer('loyalty_points')->default(0);
            $table->decimal('outstanding_balance', 14, 2)->default(0.00);
            $table->string('loyalty_tier', 30)->default('standard'); // standard, silver, gold, diamond, platinum
            $table->boolean('marketing_consent')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'phone']);
            $table->index(['tenant_id', 'name'], 'idx_customers_name');
            $table->index(['tenant_id', 'birthday'], 'idx_customers_birthday');
            $table->index(['tenant_id', 'anniversary'], 'idx_customers_anniversary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
