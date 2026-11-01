<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('captured_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source_type', 50); // invoice_scan, pdf_document, voice_command, excel_import, weighing_scale, whatsapp_command, barcode_scan
            $table->string('document_type', 50)->default('sales_invoice'); // sales_invoice, purchase_bill, inventory_tag, customer_record, payment_receipt
            $table->string('original_filename')->nullable();
            $table->string('file_path')->nullable();
            $table->json('extracted_data'); // Structured parsed payload
            $table->decimal('confidence_score', 5, 2)->default(95.00); // 0.00 to 100.00%
            $table->json('validation_warnings')->nullable(); // duplicate warnings, calculation checks
            $table->string('status', 30)->default('pending_approval'); // pending_approval, approved, rejected, reversed
            $table->text('approval_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->string('entity_type', 100)->nullable(); // Invoice, InventoryItem, Customer
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status'], 'idx_captured_status');
            $table->index(['tenant_id', 'source_type'], 'idx_captured_source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('captured_documents');
    }
};
