<?php

namespace Tests\Feature;

use App\Models\CapturedDocument;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Voucher;
use App\Services\IntelligentDataCaptureService;
use App\Services\TenantContext;
use Tests\TestCase;

class ZeroManualDataCaptureTest extends TestCase
{
    protected Tenant $tenant;
    protected User $owner;
    protected User $salesUser;
    protected IntelligentDataCaptureService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = Tenant::where('subdomain', 'chandarkant')->firstOrFail();
        $this->owner = User::where('email', 'owner@chandarkantjewellers.com')->firstOrFail();
        $this->salesUser = User::where('email', 'sales@chandarkantjewellers.com')->firstOrFail();
        $this->service = app(IntelligentDataCaptureService::class);
        TenantContext::setTenantId($this->tenant->id);
    }

    public function test_document_extraction_calculates_confidence_and_detects_warnings(): void
    {
        $payload = [
            'document_type' => 'sales_invoice',
            'customer_name' => 'Rekha Ben Shah',
            'customer_phone' => '+91 98250 88776',
            'item_name' => '22K Gold Antique Bangle',
            'gross_weight' => 20.000,
            'stone_weight' => 0.500,
            'net_weight' => 19.500, // matches 20 - 0.5 = 19.5
            'rate_per_gram' => 7350.00,
            'making_charges' => 6000.00,
            'grand_total' => 153800.00,
            'huid' => 'HUID' . strtoupper(substr(md5(uniqid()), 0, 6)),
        ];

        $doc = $this->service->extractFromDocument(
            null,
            'manual_ai',
            $this->tenant->id,
            $this->salesUser,
            $payload
        );

        $this->assertInstanceOf(CapturedDocument::class, $doc);
        $this->assertEquals('pending_approval', $doc->status);
        $this->assertGreaterThanOrEqual(90.0, (float) $doc->confidence_score);
        $this->assertEquals('Rekha Ben Shah', $doc->extracted_data['customer_name']);
    }

    public function test_multilingual_voice_commands_in_hindi_gujarati_english(): void
    {
        // 1. Hindi sales query
        $resHi = $this->service->processVoiceCommand('Aaj ki total sale batao', 'hi', $this->salesUser);
        $this->assertEquals('query_response', $resHi['action']);
        $this->assertEquals('check_daily_sales', $resHi['intent']);
        $this->assertStringContainsString('बिक्री', $resHi['reply']);

        // 2. Gujarati customer balance query
        $resGu = $this->service->processVoiceCommand('ગ્રાહકનું બાકી લેણું જણાવો', 'gu', $this->salesUser);
        $this->assertEquals('query_response', $resGu['action']);
        $this->assertEquals('check_outstanding_balance', $resGu['intent']);
        $this->assertStringContainsString('બાકી', $resGu['reply']);

        // 3. English inventory draft creation
        $resEn = $this->service->processVoiceCommand('Add this 22K gold necklace to inventory', 'en', $this->salesUser);
        $this->assertEquals('draft_created', $resEn['action']);
        $this->assertEquals('create_inventory_draft', $resEn['intent']);
        $this->assertNotNull($resEn['captured_document']);
        $this->assertEquals('pending_approval', $resEn['captured_document']->status);
    }

    public function test_digital_weighing_scale_ingestion_with_milligram_precision(): void
    {
        $gross = 18.752;
        $tare = 0.500;
        $doc = $this->service->processWeighingScaleReading(
            $gross,
            $tare,
            $this->tenant->id,
            $this->salesUser,
            'Calibrated 22K Gold Bangle'
        );

        $this->assertInstanceOf(CapturedDocument::class, $doc);
        $this->assertEquals('weighing_scale', $doc->source_type);
        $this->assertEquals(18.752, $doc->extracted_data['gross_weight']);
        $this->assertEquals(18.252, $doc->extracted_data['net_weight']);
        $this->assertEquals('pending_approval', $doc->status);
    }

    public function test_barcode_optical_scan_and_live_bullion_valuation(): void
    {
        $item = InventoryItem::where('tenant_id', $this->tenant->id)->firstOrFail();
        $code = $item->barcode ?? $item->sku;

        $result = $this->service->processBarcodeOrRfidScan($code, $this->tenant->id, $this->salesUser);

        $this->assertTrue($result['success']);
        $this->assertTrue($result['found']);
        $this->assertEquals($item->id, $result['item']->id);
        $this->assertGreaterThan(0, $result['live_valuation']['estimated_retail_price']);
    }

    public function test_human_approval_gate_commits_invoice_and_balances_accounting(): void
    {
        // Ensure in_stock item exists
        $item = InventoryItem::where('tenant_id', $this->tenant->id)->where('status', 'in_stock')->first();
        if (!$item) {
            $item = InventoryItem::where('tenant_id', $this->tenant->id)->firstOrFail();
            $item->update(['status' => 'in_stock']);
        }

        $payload = [
            'document_type' => 'sales_invoice',
            'customer_name' => 'Ketan Bhai Patel',
            'customer_phone' => '+91 98250 ' . rand(10000, 99999),
            'item_name' => $item->name,
            'gross_weight' => (float) $item->gross_weight,
            'rate_per_gram' => 7350.00,
            'making_charges' => 5000.00,
            'grand_total' => 55000.00,
        ];

        $doc = $this->service->extractFromDocument(
            null,
            'invoice_scan',
            $this->tenant->id,
            $this->salesUser,
            $payload
        );

        // Human Owner Approves
        $res = $this->service->approveAndCommit($doc, $this->owner);

        $this->assertTrue($res['success']);
        $this->assertEquals('Invoice', $res['entity_type']);
        $invoiceId = $res['entity_id'];

        $invoice = Invoice::findOrFail($invoiceId);
        $this->assertEquals($this->tenant->id, $invoice->tenant_id);

        // Verify balanced double-entry accounting voucher was automatically posted
        $voucher = Voucher::where('reference_type', 'Invoice')->where('reference_id', $invoice->id)->firstOrFail();
        $this->assertTrue($voucher->isBalanced());

        // Test Reversal flow
        $reverseRes = $this->service->reverseOperation($doc, $this->owner, 'Customer return request');
        $this->assertTrue($reverseRes['success']);
        $this->assertEquals('reversed', $reverseRes['captured_document']->status);

        $invoice->refresh();
        $this->assertEquals('cancelled', $invoice->status);
    }
}
