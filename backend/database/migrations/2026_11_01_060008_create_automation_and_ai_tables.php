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
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->string('trigger_type', 100); // customer_birthday, customer_anniversary, stock_low, payment_due, daily_summary
            $table->json('conditions')->nullable(); // rules/predicates
            $table->json('actions'); // actions to execute (send_whatsapp, send_sms, alert_manager)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('workflow_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('workflow_id')->nullable()->constrained('workflows')->nullOnDelete();
            $table->string('trigger_event', 100);
            $table->string('status', 30)->default('success'); // success, failed, skipped
            $table->json('payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('session_id', 100);
            $table->string('role', 20); // user, assistant, system
            $table->text('message');
            $table->json('meta')->nullable();
            $table->integer('tokens_used')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'session_id'], 'idx_ai_session');
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100); // created, updated, deleted, approved, cancelled
            $table->string('entity_type', 100);
            $table->unsignedBigInteger('entity_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'entity_type', 'entity_id'], 'idx_audit_entity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('workflow_logs');
        Schema::dropIfExists('workflows');
    }
};
