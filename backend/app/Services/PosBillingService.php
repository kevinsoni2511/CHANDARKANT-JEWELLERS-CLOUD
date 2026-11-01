<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use App\Models\MetalRate;
use App\Models\OldGoldPurchase;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PosBillingService
{
    public function __construct(
        protected AccountingService $accountingService
    ) {}

    /**
     * Preview calculation without persistence
     */
    public function calculateEstimate(array $data, int $tenantId, ?int $branchId = null): array
    {
        $today = now()->toDateString();
        $itemsCalculated = [];
        $subtotal = '0.00';

        foreach ($data['items'] as $itemInput) {
            $invItem = InventoryItem::where('tenant_id', $tenantId)->findOrFail($itemInput['inventory_item_id']);

            // Get metal rate
            $rateRecord = MetalRate::where('tenant_id', $tenantId)
                ->where('metal_type', $invItem->metal_type)
                ->where('purity_karat', $invItem->purity_karat)
                ->latest('effective_date')
                ->first();

            $ratePerGram = $rateRecord ? (string) $rateRecord->rate_per_gram : '7500.00';

            // Metal value
            $metalVal = DecimalMathService::metalValue($invItem->net_weight, $ratePerGram);

            // Wastage
            $wastageInfo = DecimalMathService::wastage($invItem->net_weight, $invItem->wastage_percent, $ratePerGram);

            // Making charges (allow client override if permitted, otherwise item default)
            $makingRate = $itemInput['making_charge_rate_override'] ?? $invItem->making_charge_rate;
            $makingType = $invItem->making_charge_type;
            $makingTotal = DecimalMathService::makingCharges($makingType, $makingRate, $invItem->gross_weight, $metalVal);

            // Item total
            $itemTot = DecimalMathService::itemTotal($metalVal, $makingTotal, $wastageInfo['amount'], $invItem->stone_charges);

            $subtotal = bcadd($subtotal, $itemTot, 2);

            $itemsCalculated[] = [
                'inventory_item' => $invItem,
                'metal_rate_applied' => $ratePerGram,
                'metal_value' => $metalVal,
                'wastage_weight' => $wastageInfo['weight'],
                'wastage_amount' => $wastageInfo['amount'],
                'making_charges' => $makingTotal,
                'stone_charges' => (string) $invItem->stone_charges,
                'item_total' => $itemTot,
            ];
        }

        // Old Gold deduction
        $oldGoldTotal = '0.00';
        $oldGoldCalculated = [];
        if (!empty($data['old_gold_items'])) {
            foreach ($data['old_gold_items'] as $og) {
                $rate24K = $og['rate_per_gram'] ?? '7950.00';
                $ogVal = DecimalMathService::oldGoldValue($og['gross_weight'], $og['stone_deduction'] ?? 0, $og['purity_karat'], $rate24K);
                $oldGoldTotal = bcadd($oldGoldTotal, $ogVal['calculated_value'], 2);
                $oldGoldCalculated[] = array_merge($og, $ogVal);
            }
        }

        // Discount
        $discount = number_format((float) ($data['discount_amount'] ?? 0.0), 2, '.', '');
        $afterDiscount = bcsub($subtotal, $discount, 2);

        // Taxable Base
        $taxableAmount = bcsub($afterDiscount, $oldGoldTotal, 2);
        if (bccomp($taxableAmount, '0.00', 2) < 0) {
            $taxableAmount = '0.00';
        }

        // GST
        $isInterstate = !empty($data['is_interstate']);
        $gst = DecimalMathService::gstBreakdown($taxableAmount, $isInterstate);

        $grossPayable = bcadd($taxableAmount, $gst['total_tax'], 2);
        $rounded = DecimalMathService::roundOff($grossPayable);

        return [
            'items' => $itemsCalculated,
            'old_gold_items' => $oldGoldCalculated,
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'old_gold_total' => $oldGoldTotal,
            'taxable_amount' => $taxableAmount,
            'gst' => $gst,
            'round_off' => $rounded['round_off'],
            'grand_total' => $rounded['rounded_total'],
        ];
    }

    /**
     * Finalize sale and commit to database
     */
    public function createInvoice(array $data, User $user): Invoice
    {
        return DB::transaction(function () use ($data, $user) {
            $tenantId = $user->tenant_id;
            $branchId = $data['branch_id'] ?? $user->branch_id;

            $estimate = $this->calculateEstimate($data, $tenantId, $branchId);

            // Sequential invoice number e.g. CJ-SRT-2026-0001
            $invoiceCount = Invoice::where('tenant_id', $tenantId)->count() + 1;
            $invoiceNumber = 'CJ-INV-' . date('Ymd') . '-' . str_pad((string) $invoiceCount, 4, '0', STR_PAD_LEFT);

            // Payments summation
            $paidAmount = '0.00';
            if (!empty($data['payments'])) {
                foreach ($data['payments'] as $p) {
                    $paidAmount = bcadd($paidAmount, number_format((float) $p['amount'], 2, '.', ''), 2);
                }
            }

            $dueAmount = bcsub($estimate['grand_total'], $paidAmount, 2);
            if (bccomp($dueAmount, '0.00', 2) < 0) {
                $dueAmount = '0.00';
            }

            $status = bccomp($dueAmount, '0.00', 2) === 0 ? 'paid' : (bccomp($paidAmount, '0.00', 2) > 0 ? 'partial' : 'pending');

            // 1. Create Invoice Record
            $invoice = Invoice::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => $user->id,
                'invoice_number' => $invoiceNumber,
                'invoice_date' => $data['invoice_date'] ?? now()->toDateString(),
                'subtotal' => $estimate['subtotal'],
                'discount_amount' => $estimate['discount_amount'],
                'old_gold_amount' => $estimate['old_gold_total'],
                'taxable_amount' => $estimate['taxable_amount'],
                'cgst_rate' => $estimate['gst']['cgst_rate'],
                'cgst_amount' => $estimate['gst']['cgst_amount'],
                'sgst_rate' => $estimate['gst']['sgst_rate'],
                'sgst_amount' => $estimate['gst']['sgst_amount'],
                'igst_rate' => $estimate['gst']['igst_rate'],
                'igst_amount' => $estimate['gst']['igst_amount'],
                'round_off' => $estimate['round_off'],
                'grand_total' => $estimate['grand_total'],
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'status' => $status,
                'notes' => $data['notes'] ?? null,
            ]);

            // 2. Create Line Items and transition inventory stock status to 'sold'
            foreach ($estimate['items'] as $itemData) {
                $inv = $itemData['inventory_item'];

                if ($inv->status !== 'in_stock') {
                    throw new InvalidArgumentException("Item {$inv->sku} ({$inv->name}) is not in stock! Status: {$inv->status}");
                }

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'inventory_item_id' => $inv->id,
                    'item_name' => $inv->name,
                    'sku' => $inv->sku,
                    'huid' => $inv->huid,
                    'metal_type' => $inv->metal_type,
                    'purity_karat' => $inv->purity_karat,
                    'gross_weight' => $inv->gross_weight,
                    'stone_weight' => $inv->stone_weight,
                    'net_weight' => $inv->net_weight,
                    'metal_rate_applied' => $itemData['metal_rate_applied'],
                    'metal_value' => $itemData['metal_value'],
                    'wastage_percent' => $inv->wastage_percent,
                    'wastage_weight' => $itemData['wastage_weight'],
                    'wastage_amount' => $itemData['wastage_amount'],
                    'making_charge_type' => $inv->making_charge_type,
                    'making_charge_rate' => $inv->making_charge_rate,
                    'making_charges' => $itemData['making_charges'],
                    'stone_charges' => $itemData['stone_charges'],
                    'item_total' => $itemData['item_total'],
                    'item_snapshot' => [
                        'item_id' => $inv->id,
                        'name' => $inv->name,
                        'sku' => $inv->sku,
                        'huid' => $inv->huid,
                        'weights' => [
                            'gross' => (string) $inv->gross_weight,
                            'stone' => (string) $inv->stone_weight,
                            'net' => (string) $inv->net_weight,
                        ],
                    ],
                ]);

                // Mark inventory item as sold
                $inv->update(['status' => 'sold']);
            }

            // 3. Create Old Gold records if any
            if (!empty($estimate['old_gold_items'])) {
                $ogCount = OldGoldPurchase::where('tenant_id', $tenantId)->count() + 1;
                foreach ($estimate['old_gold_items'] as $og) {
                    OldGoldPurchase::create([
                        'tenant_id' => $tenantId,
                        'branch_id' => $branchId,
                        'invoice_id' => $invoice->id,
                        'customer_id' => $data['customer_id'] ?? null,
                        'receipt_number' => 'OG-' . date('Ymd') . '-' . str_pad((string) $ogCount++, 4, '0', STR_PAD_LEFT),
                        'metal_type' => $og['metal_type'] ?? 'gold',
                        'gross_weight' => $og['gross_weight'],
                        'stone_deduction' => $og['stone_deduction'] ?? 0.000,
                        'net_weight' => $og['net_weight'],
                        'purity_karat' => $og['purity_karat'] ?? '22K',
                        'purity_percentage' => (float) DecimalMathService::purityFactor($og['purity_karat'] ?? '22K') * 100,
                        'fine_metal_weight' => $og['pure_weight'],
                        'rate_per_gram' => $og['rate_per_gram'] ?? 7950.00,
                        'calculated_value' => $og['calculated_value'],
                        'settlement_type' => 'exchange_against_invoice',
                    ]);
                }
            }

            // 4. Create Payments
            if (!empty($data['payments'])) {
                foreach ($data['payments'] as $p) {
                    InvoicePayment::create([
                        'invoice_id' => $invoice->id,
                        'payment_mode' => $p['payment_mode'],
                        'amount' => $p['amount'],
                        'reference_number' => $p['reference_number'] ?? null,
                        'payment_date' => $invoice->invoice_date,
                    ]);
                }
            }

            // 5. Update Customer Loyalty and Outstanding balance if registered
            if (!empty($data['customer_id'])) {
                $customer = Customer::find($data['customer_id']);
                if ($customer) {
                    $earnedPoints = (int) floor((float) $invoice->grand_total / 1000);
                    $newBalance = bcadd((string) $customer->outstanding_balance, $dueAmount, 2);
                    $customer->update([
                        'loyalty_points' => $customer->loyalty_points + $earnedPoints,
                        'outstanding_balance' => $newBalance,
                    ]);
                }
            }

            // 6. Post double-entry accounting voucher
            $invoice->load(['payments', 'customer']);
            $this->accountingService->postSaleInvoiceVoucher($invoice);

            return $invoice->load(['items', 'payments', 'oldGoldPurchases', 'customer', 'branch']);
        });
    }
}
