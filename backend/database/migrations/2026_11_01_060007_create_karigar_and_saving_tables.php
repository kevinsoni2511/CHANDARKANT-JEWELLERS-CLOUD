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
        Schema::create('karigars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->string('phone', 20);
            $table->string('specialization', 100)->nullable(); // Antique, Diamond Setting, Polishing, Plain Gold
            $table->text('address')->nullable();
            $table->decimal('pure_gold_balance', 10, 3)->default(0.000); // Current fine gold balance with artisan
            $table->decimal('labour_rate_default', 14, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'phone']);
        });

        Schema::create('karigar_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('karigar_id')->constrained('karigars')->onDelete('restrict');
            $table->string('job_number', 100);
            $table->string('item_description', 255);
            $table->decimal('gold_issued_gross', 10, 3);
            $table->decimal('gold_issued_purity', 6, 3)->default(99.900);
            $table->decimal('gold_issued_pure', 10, 3);
            $table->decimal('gold_returned_gross', 10, 3)->default(0.000);
            $table->decimal('gold_returned_pure', 10, 3)->default(0.000);
            $table->decimal('scrap_returned_pure', 10, 3)->default(0.000);
            $table->decimal('allowed_wastage', 10, 3)->default(0.000);
            $table->decimal('actual_wastage', 10, 3)->default(0.000);
            $table->decimal('shortage_excess', 10, 3)->default(0.000);
            $table->decimal('labour_charges', 14, 2)->default(0.00);
            $table->string('status', 30)->default('in_progress'); // issued, in_progress, completed, settled
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'job_number']);
            $table->index(['tenant_id', 'karigar_id', 'status'], 'idx_karigar_jobs_lookup');
        });

        Schema::create('saving_schemes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->integer('duration_months')->default(11); // e.g. 11 months + 1 month bonus
            $table->decimal('monthly_installment', 14, 2);
            $table->decimal('bonus_amount', 14, 2)->default(0.00);
            $table->text('terms_and_conditions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('saving_scheme_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('scheme_id')->constrained('saving_schemes')->onDelete('restrict');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->string('passbook_number', 50);
            $table->date('start_date');
            $table->string('status', 30)->default('active'); // active, matured, redeemed, defaulted
            $table->decimal('total_paid', 14, 2)->default(0.00);
            $table->decimal('maturity_value', 14, 2)->default(0.00);
            $table->timestamps();

            $table->unique(['tenant_id', 'passbook_number']);
        });

        Schema::create('saving_scheme_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('saving_scheme_enrollments')->onDelete('cascade');
            $table->integer('installment_no');
            $table->decimal('amount_paid', 14, 2);
            $table->date('payment_date');
            $table->string('receipt_number', 100);
            $table->string('payment_mode', 50)->default('upi'); // upi, cash, card, bank
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saving_scheme_installments');
        Schema::dropIfExists('saving_scheme_enrollments');
        Schema::dropIfExists('saving_schemes');
        Schema::dropIfExists('karigar_jobs');
        Schema::dropIfExists('karigars');
    }
};
