<?php

namespace App\Services;

use App\Models\ChartOfAccount;
use App\Models\Invoice;
use App\Models\OldGoldPurchase;
use App\Models\Voucher;
use App\Models\VoucherEntry;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AccountingService
{
    /**
     * Post a balanced double-entry voucher for a finalized sales invoice
     */
    public function postSaleInvoiceVoucher(Invoice $invoice): Voucher
    {
        return DB::transaction(function () use ($invoice) {
            $tenantId = $invoice->tenant_id;

            // Ensure system accounts exist
            $cashAccount = $this->getOrCreateAccount($tenantId, '1001', 'Cash in Hand', 'asset');
            $bankAccount = $this->getOrCreateAccount($tenantId, '1002', 'Bank Account / UPI', 'asset');
            $customerAccount = $this->getOrCreateAccount($tenantId, '1101', 'Customer Receivables', 'asset');
            $oldGoldAccount = $this->getOrCreateAccount($tenantId, '1102', 'Old Gold Stock', 'asset');
            $salesAccount = $this->getOrCreateAccount($tenantId, '3001', 'Jewellery Sales', 'income');
            $cgstAccount = $this->getOrCreateAccount($tenantId, '2101', 'Output CGST (1.5%)', 'liability');
            $sgstAccount = $this->getOrCreateAccount($tenantId, '2102', 'Output SGST (1.5%)', 'liability');
            $igstAccount = $this->getOrCreateAccount($tenantId, '2103', 'Output IGST (3.0%)', 'liability');
            $roundOffAccount = $this->getOrCreateAccount($tenantId, '4999', 'Round Off Expense / Income', 'expense');

            $voucherNumber = 'VCH-SALES-' . str_pad((string) $invoice->id, 6, '0', STR_PAD_LEFT);

            $voucher = Voucher::create([
                'tenant_id' => $tenantId,
                'branch_id' => $invoice->branch_id,
                'voucher_type' => 'sales',
                'voucher_number' => $voucherNumber,
                'voucher_date' => $invoice->invoice_date,
                'narration' => "Sales Invoice {$invoice->invoice_number} to " . ($invoice->customer?->name ?? 'Walk-in Customer'),
                'reference_type' => 'Invoice',
                'reference_id' => $invoice->id,
                'is_posted' => true,
            ]);

            // Debits: Payments received
            $totalDebit = '0.00';
            $cashPaid = '0.00';
            $bankPaid = '0.00';

            foreach ($invoice->payments as $payment) {
                if ($payment->payment_mode === 'cash') {
                    $cashPaid = bcadd($cashPaid, (string) $payment->amount, 2);
                } else {
                    $bankPaid = bcadd($bankPaid, (string) $payment->amount, 2);
                }
            }

            if (bccomp($cashPaid, '0.00', 2) > 0) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $cashAccount->id,
                    'debit' => $cashPaid,
                    'credit' => '0.00',
                    'entry_narration' => 'Cash received against invoice',
                ]);
                $totalDebit = bcadd($totalDebit, $cashPaid, 2);
            }

            if (bccomp($bankPaid, '0.00', 2) > 0) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $bankAccount->id,
                    'debit' => $bankPaid,
                    'credit' => '0.00',
                    'entry_narration' => 'Bank/UPI received against invoice',
                ]);
                $totalDebit = bcadd($totalDebit, $bankPaid, 2);
            }

            // Old Gold Exchange debit
            if (bccomp((string) $invoice->old_gold_amount, '0.00', 2) > 0) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $oldGoldAccount->id,
                    'debit' => (string) $invoice->old_gold_amount,
                    'credit' => '0.00',
                    'entry_narration' => 'Old gold exchange deduction against invoice',
                ]);
                $totalDebit = bcadd($totalDebit, (string) $invoice->old_gold_amount, 2);
            }

            // Credit sale due amount debit
            if (bccomp((string) $invoice->due_amount, '0.00', 2) > 0) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $customerAccount->id,
                    'debit' => (string) $invoice->due_amount,
                    'credit' => '0.00',
                    'entry_narration' => 'Customer outstanding balance',
                ]);
                $totalDebit = bcadd($totalDebit, (string) $invoice->due_amount, 2);
            }

            // Credits: Income & GST Liabilities
            $totalCredit = '0.00';

            // Taxable Sales Credit
            VoucherEntry::create([
                'voucher_id' => $voucher->id,
                'account_id' => $salesAccount->id,
                'debit' => '0.00',
                'credit' => (string) $invoice->taxable_amount,
                'entry_narration' => 'Jewellery Sales Taxable Value',
            ]);
            $totalCredit = bcadd($totalCredit, (string) $invoice->taxable_amount, 2);

            // CGST Credit
            if (bccomp((string) $invoice->cgst_amount, '0.00', 2) > 0) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $cgstAccount->id,
                    'debit' => '0.00',
                    'credit' => (string) $invoice->cgst_amount,
                    'entry_narration' => 'Output CGST 1.5%',
                ]);
                $totalCredit = bcadd($totalCredit, (string) $invoice->cgst_amount, 2);
            }

            // SGST Credit
            if (bccomp((string) $invoice->sgst_amount, '0.00', 2) > 0) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $sgstAccount->id,
                    'debit' => '0.00',
                    'credit' => (string) $invoice->sgst_amount,
                    'entry_narration' => 'Output SGST 1.5%',
                ]);
                $totalCredit = bcadd($totalCredit, (string) $invoice->sgst_amount, 2);
            }

            // IGST Credit
            if (bccomp((string) $invoice->igst_amount, '0.00', 2) > 0) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $igstAccount->id,
                    'debit' => '0.00',
                    'credit' => (string) $invoice->igst_amount,
                    'entry_narration' => 'Output IGST 3.0%',
                ]);
                $totalCredit = bcadd($totalCredit, (string) $invoice->igst_amount, 2);
            }

            // Balancing Round Off if variance exists
            $variance = bcsub($totalDebit, $totalCredit, 2);
            if (bccomp($variance, '0.00', 2) !== 0) {
                if (bccomp($variance, '0.00', 2) > 0) {
                    // Credit round off
                    VoucherEntry::create([
                        'voucher_id' => $voucher->id,
                        'account_id' => $roundOffAccount->id,
                        'debit' => '0.00',
                        'credit' => $variance,
                        'entry_narration' => 'Round off rounding adjustment',
                    ]);
                } else {
                    // Debit round off
                    $absDiff = bcmul($variance, '-1.0', 2);
                    VoucherEntry::create([
                        'voucher_id' => $voucher->id,
                        'account_id' => $roundOffAccount->id,
                        'debit' => $absDiff,
                        'credit' => '0.00',
                        'entry_narration' => 'Round off discount adjustment',
                    ]);
                }
            }

            // Verify strict balance
            if (!$voucher->isBalanced()) {
                throw new RuntimeException("Financial voucher {$voucherNumber} failed to balance! Debit: {$voucher->totalDebit()} vs Credit: {$voucher->totalCredit()}");
            }

            return $voucher;
        });
    }

    /**
     * Helper to get or create system chart of accounts
     */
    public function getOrCreateAccount(int $tenantId, string $code, string $name, string $type): ChartOfAccount
    {
        return ChartOfAccount::firstOrCreate(
            ['tenant_id' => $tenantId, 'code' => $code],
            ['name' => $name, 'type' => $type, 'is_system' => true]
        );
    }

    /**
     * Generate Real-Time Trial Balance
     */
    public function getTrialBalance(int $tenantId, ?int $branchId = null): array
    {
        $accounts = ChartOfAccount::where('tenant_id', $tenantId)->get();

        $rows = [];
        $totalDebit = '0.00';
        $totalCredit = '0.00';

        foreach ($accounts as $acc) {
            $query = VoucherEntry::where('account_id', $acc->id);
            if ($branchId) {
                $query->whereHas('voucher', fn($q) => $q->where('branch_id', $branchId));
            }

            $debitSum = number_format((float) $query->sum('debit'), 2, '.', '');
            $creditSum = number_format((float) $query->sum('credit'), 2, '.', '');

            if (bccomp($debitSum, '0.00', 2) > 0 || bccomp($creditSum, '0.00', 2) > 0) {
                $rows[] = [
                    'account_id' => $acc->id,
                    'code' => $acc->code,
                    'name' => $acc->name,
                    'type' => $acc->type,
                    'debit' => $debitSum,
                    'credit' => $creditSum,
                ];

                $totalDebit = bcadd($totalDebit, $debitSum, 2);
                $totalCredit = bcadd($totalCredit, $creditSum, 2);
            }
        }

        return [
            'rows' => $rows,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'is_balanced' => bccomp($totalDebit, $totalCredit, 2) === 0,
        ];
    }
}
