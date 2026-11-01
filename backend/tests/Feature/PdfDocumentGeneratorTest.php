<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Tenant;
use App\Services\PdfDocumentService;
use Tests\TestCase;

class PdfDocumentGeneratorTest extends TestCase
{
    private function getOrCreateInvoice(Tenant $tenant): Invoice
    {
        $invoice = Invoice::where('tenant_id', $tenant->id)->with(['items', 'customer', 'branch', 'tenant'])->first();
        if ($invoice) {
            return $invoice;
        }

        $branch = $tenant->branches()->first();
        $customer = $tenant->customers()->first();

        $invoice = Invoice::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $branch->id,
            'customer_id' => $customer?->id,
            'invoice_number' => 'INV-TEST-0001',
            'invoice_date' => now()->toDateString(),
            'subtotal' => 150000.00,
            'discount_amount' => 0.00,
            'old_gold_amount' => 0.00,
            'taxable_amount' => 150000.00,
            'cgst_rate' => 1.50,
            'cgst_amount' => 2250.00,
            'sgst_rate' => 1.50,
            'sgst_amount' => 2250.00,
            'grand_total' => 154500.00,
            'paid_amount' => 154500.00,
            'status' => 'paid',
        ]);

        $invoice->items()->create([
            'item_name' => '22K Gold Bangle',
            'sku' => 'CJ-G-BGL-1002',
            'huid' => 'HUID-4F8X2D',
            'metal_type' => 'gold',
            'purity_karat' => '22K',
            'gross_weight' => 20.000,
            'stone_weight' => 0.000,
            'net_weight' => 20.000,
            'metal_rate_applied' => 7287.50,
            'metal_value' => 145750.00,
            'making_charges' => 4250.00,
            'item_total' => 150000.00,
        ]);

        return $invoice->load(['items', 'customer', 'branch', 'tenant']);
    }

    public function test_a4_tax_invoice_renders_in_english_hindi_and_gujarati(): void
    {
        $tenant = Tenant::where('subdomain', 'chandarkant')->firstOrFail();
        $invoice = $this->getOrCreateInvoice($tenant);

        /** @var PdfDocumentService $pdfService */
        $pdfService = app(PdfDocumentService::class);

        // 1. English A4 Invoice
        $htmlEn = $pdfService->renderA4Invoice($invoice, 'en');
        $this->assertStringContainsString('TAX INVOICE', $htmlEn);
        $this->assertStringContainsString($invoice->invoice_number, $htmlEn);
        $this->assertStringContainsString($tenant->gstin, $htmlEn);
        $this->assertStringContainsString('BIS Hallmarked with 6-Digit HUID', $htmlEn);

        // 2. Gujarati A4 Invoice
        $htmlGu = $pdfService->renderA4Invoice($invoice, 'gu');
        $this->assertStringContainsString('જીએસટી કર ઇન્વૉઇસ', $htmlGu);
        $this->assertStringContainsString('બીઆઈએસ હોલમાર્ક ૬-અંક HUID સાથે પ્રમાણિત', $htmlGu);
        $this->assertStringContainsString($invoice->invoice_number, $htmlGu);

        // 3. Hindi A4 Invoice
        $htmlHi = $pdfService->renderA4Invoice($invoice, 'hi');
        $this->assertStringContainsString('जीएसटी कर चालान', $htmlHi);
        $this->assertStringContainsString('बीआईएस हॉलमार्क ६-अंकीय HUID प्रमाणित', $htmlHi);
        $this->assertStringContainsString($invoice->invoice_number, $htmlHi);
    }

    public function test_80mm_thermal_receipt_renders_pos_slip(): void
    {
        $tenant = Tenant::where('subdomain', 'chandarkant')->firstOrFail();
        $invoice = $this->getOrCreateInvoice($tenant);

        /** @var PdfDocumentService $pdfService */
        $pdfService = app(PdfDocumentService::class);

        $htmlThermal = $pdfService->renderThermalReceipt($invoice);

        $this->assertStringContainsString('width: 78mm', $htmlThermal);
        $this->assertStringContainsString($invoice->invoice_number, $htmlThermal);
        $this->assertStringContainsString('GST 3%', $htmlThermal);
        $this->assertStringContainsString('TOTAL PAID', $htmlThermal);
    }
}
