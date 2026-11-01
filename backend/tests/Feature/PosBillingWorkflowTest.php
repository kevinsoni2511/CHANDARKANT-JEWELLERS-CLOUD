<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Voucher;
use App\Services\PosBillingService;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosBillingWorkflowTest extends TestCase
{
    public function test_pos_billing_creates_invoice_deducts_stock_and_balances_accounting(): void
    {
        $tenant = Tenant::where('subdomain', 'chandarkant')->firstOrFail();
        $user = User::where('email', 'sales@chandarkantjewellers.com')->firstOrFail();
        $item = InventoryItem::where('tenant_id', $tenant->id)->where('status', 'in_stock')->first();
        if (!$item) {
            $item = InventoryItem::where('tenant_id', $tenant->id)->firstOrFail();
            $item->update(['status' => 'in_stock']);
        }
        $customer = Customer::where('tenant_id', $tenant->id)->firstOrFail();

        TenantContext::setTenantId($tenant->id);

        /** @var PosBillingService $service */
        $service = app(PosBillingService::class);

        $payload = [
            'customer_id' => $customer->id,
            'branch_id' => $item->branch_id,
            'items' => [
                [
                    'inventory_item_id' => $item->id,
                ],
            ],
            'payments' => [
                [
                    'payment_mode' => 'upi',
                    'amount' => 50000.00,
                    'reference_number' => 'UPI/TEST/9912',
                ],
            ],
        ];

        $invoice = $service->createInvoice($payload, $user);

        $this->assertInstanceOf(Invoice::class, $invoice);
        $this->assertTrue(in_array($invoice->status, ['paid', 'partial']), "Invoice status was: {$invoice->status}");

        // 1. Verify Inventory Item is marked SOLD
        $item->refresh();
        $this->assertEquals('sold', $item->status);

        // 2. Verify Voucher is created and strictly BALANCED
        $voucher = Voucher::where('reference_type', 'Invoice')
            ->where('reference_id', $invoice->id)
            ->first();

        $this->assertNotNull($voucher);
        $this->assertTrue($voucher->isBalanced(), "Voucher must be strictly balanced. Total Debit: {$voucher->totalDebit()} vs Total Credit: {$voucher->totalCredit()}");
    }
}
