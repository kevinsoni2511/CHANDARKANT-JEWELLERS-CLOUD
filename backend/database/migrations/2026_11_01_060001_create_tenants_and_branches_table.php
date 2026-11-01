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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subdomain')->unique();
            $table->string('business_type')->default('retail'); // retail, wholesale, manufacturer, hybrid
            $table->string('legal_entity')->nullable(); // Pvt Ltd, Proprietorship, Partnership
            $table->string('pan', 20)->nullable();
            $table->string('gstin', 20)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->default('Gujarat');
            $table->string('state_code', 5)->default('24');
            $table->string('pincode', 10)->nullable();
            $table->string('currency', 10)->default('INR');
            $table->string('logo_url')->nullable();
            $table->string('status', 30)->default('active'); // active, suspended, expired, trial
            $table->string('subscription_plan', 50)->default('enterprise');
            $table->timestamp('trial_ends_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->string('code', 30);
            $table->text('address')->nullable();
            $table->string('city', 100);
            $table->string('state', 100)->default('Gujarat');
            $table->string('state_code', 5)->default('24');
            $table->string('pincode', 10)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->boolean('is_main')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tenant_id')->nullable()->after('id')->constrained('tenants')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->after('tenant_id')->constrained('branches')->nullOnDelete();
            $table->string('role', 50)->default('sales')->after('email'); // super_admin, owner, manager, accountant, sales, stock, karigar
            $table->string('phone', 20)->nullable()->after('role');
            $table->string('avatar_url')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('avatar_url');
            $table->json('permissions')->nullable()->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['branch_id']);
            $table->dropColumn(['tenant_id', 'branch_id', 'role', 'phone', 'avatar_url', 'is_active', 'permissions']);
        });

        Schema::dropIfExists('branches');
        Schema::dropIfExists('tenants');
    }
};
