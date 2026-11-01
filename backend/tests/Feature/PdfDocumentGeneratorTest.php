<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Tenant;
use App\Services\PdfDocumentService;
use Tests\TestCase;

class PdfDocumentGeneratorTest extends TestCase
{
    public function test_a4_tax_invoice_renders_in_english_hindi_and_gujarati(): void
    {
        $tenant = Tenant::where('subdomain', 'chandarkant')->firstOrFail();
        $invoice = Invoice::where('tenant_id', $tenant->id)->with(['items', 'customer', 'branch', 'tenant'])->firstOrFail();

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
        $invoice = Invoice::where('tenant_id', $tenant->id)->with(['items', 'customer', 'branch', 'tenant'])->firstOrFail();

        /** @var PdfDocumentService $pdfService */
        $pdfService = app(PdfDocumentService::class);

        $htmlThermal = $pdfService->renderThermalReceipt($invoice);

        $this->assertStringContainsString('width: 78mm', $htmlThermal);
        $this->assertStringContainsString($invoice->invoice_number, $htmlThermal);
        $this->assertStringContainsString('GST 3%', $htmlThermal);
        $this->assertStringContainsString('TOTAL PAID', $htmlThermal);
    }
}
