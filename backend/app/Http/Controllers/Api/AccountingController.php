<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Voucher;
use App\Models\VoucherEntry;
use App\Services\AccountingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountingController extends Controller
{
    public function __construct(
        protected AccountingService $accountingService
    ) {}

    public function chartOfAccounts(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $accounts = ChartOfAccount::where('tenant_id', $tenantId)->orderBy('code')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    public function trialBalance(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $branchId = $request->branch_id;

        $trialBalance = $this->accountingService->getTrialBalance($tenantId, $branchId);

        return response()->json([
            'success' => true,
            'data' => $trialBalance,
        ]);
    }

    public function vouchers(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $query = Voucher::where('tenant_id', $tenantId)->with(['entries.account', 'branch']);

        if ($request->filled('voucher_type')) {
            $query->where('voucher_type', $request->voucher_type);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('voucher_date', [$request->start_date, $request->end_date]);
        }

        $vouchers = $query->latest('voucher_date')->paginate($request->input('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $vouchers->items(),
            'meta' => [
                'current_page' => $vouchers->currentPage(),
                'last_page' => $vouchers->lastPage(),
                'total' => $vouchers->total(),
            ],
        ]);
    }

    public function dayBook(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $date = $request->input('date', now()->toDateString());

        $vouchers = Voucher::where('tenant_id', $tenantId)
            ->where('voucher_date', $date)
            ->with(['entries.account', 'branch'])
            ->get();

        $cashAccountId = ChartOfAccount::where('tenant_id', $tenantId)->where('code', '1001')->value('id');
        $bankAccountId = ChartOfAccount::where('tenant_id', $tenantId)->where('code', '1002')->value('id');

        $cashIn = 0; $cashOut = 0;
        $bankIn = 0; $bankOut = 0;

        foreach ($vouchers as $v) {
            foreach ($v->entries as $entry) {
                if ($entry->account_id === $cashAccountId) {
                    $cashIn += (float) $entry->debit;
                    $cashOut += (float) $entry->credit;
                }
                if ($entry->account_id === $bankAccountId) {
                    $bankIn += (float) $entry->debit;
                    $bankOut += (float) $entry->credit;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'vouchers' => $vouchers,
                'summary' => [
                    'cash_received' => $cashIn,
                    'cash_paid' => $cashOut,
                    'net_cash' => $cashIn - $cashOut,
                    'bank_received' => $bankIn,
                    'bank_paid' => $bankOut,
                    'net_bank' => $bankIn - $bankOut,
                ],
            ],
        ]);
    }
}
