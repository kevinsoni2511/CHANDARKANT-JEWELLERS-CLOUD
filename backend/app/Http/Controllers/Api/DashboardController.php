<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Category;
use App\Models\ChartOfAccount;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Karigar;
use App\Models\KarigarJob;
use App\Models\MetalRate;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role ?? 'sales';

        // 1. Super Admin (Global SaaS Platform Dashboard)
        if ($user->isSuperAdmin() && !$user->tenant_id) {
            $totalTenants = Tenant::count();
            $totalUsers = User::count();
            $activeSubscriptions = Tenant::where('status', 'active')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'super_admin',
                    'is_super_admin' => true,
                    'total_tenants' => $totalTenants,
                    'total_users' => $totalUsers,
                    'active_subscriptions' => $activeSubscriptions,
                    'tenants' => Tenant::withCount(['branches', 'users'])->latest()->take(10)->get(),
                ],
            ]);
        }

        $tenantId = $user->tenant_id;
        $branchId = $user->branch_id;
        $today = now()->toDateString();
        $rates = MetalRate::where('tenant_id', $tenantId)->latest('effective_date')->get();

        // 2. Sales Executive Dashboard (Personal Sales, Live Rates, Quick POS, Customer Leads)
        if ($role === 'sales') {
            $myTodaySales = Invoice::where('tenant_id', $tenantId)
                ->where('user_id', $user->id)
                ->where('invoice_date', $today)
                ->sum('grand_total');

            $myTodayInvoicesCount = Invoice::where('tenant_id', $tenantId)
                ->where('user_id', $user->id)
                ->where('invoice_date', $today)
                ->count();

            $myMonthSales = Invoice::where('tenant_id', $tenantId)
                ->where('user_id', $user->id)
                ->whereMonth('invoice_date', now()->month)
                ->whereYear('invoice_date', now()->year)
                ->sum('grand_total');

            $myRecentInvoices = Invoice::where('tenant_id', $tenantId)
                ->where('user_id', $user->id)
                ->with(['customer', 'branch'])
                ->withCount('items')
                ->latest()
                ->take(6)
                ->get();

            // Customers with birthdays or anniversaries this week
            $crmAlerts = Customer::where('tenant_id', $tenantId)
                ->where(function ($q) {
                    $q->whereNotNull('birthday')
                      ->orWhereNotNull('anniversary');
                })
                ->latest()
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'sales',
                    'my_today_sales' => (float) $myTodaySales,
                    'my_today_invoices_count' => $myTodayInvoicesCount,
                    'my_month_sales' => (float) $myMonthSales,
                    'sales_target_month' => 1500000.00, // Dynamic target benchmark
                    'metal_rates' => $rates,
                    'recent_invoices' => $myRecentInvoices,
                    'crm_alerts' => $crmAlerts,
                ],
            ]);
        }

        // 3. Chief Accountant Dashboard (Cash/Bank, GST Liability, Debtors/Creditors, Vouchers)
        if ($role === 'accountant') {
            $getAccountBalance = function (string $code) use ($tenantId) {
                $account = ChartOfAccount::where('tenant_id', $tenantId)->where('code', $code)->first();
                if (!$account) return 0.0;
                $debit = VoucherEntry::where('account_id', $account->id)->sum('debit');
                $credit = VoucherEntry::where('account_id', $account->id)->sum('credit');
                return (float) ($debit - $credit);
            };

            $cashInHand = $getAccountBalance('1001');
            $bankBalance = $getAccountBalance('1002');

            // Monthly GST summary
            $cgstAccount = ChartOfAccount::where('tenant_id', $tenantId)->where('code', '2101')->first();
            $sgstAccount = ChartOfAccount::where('tenant_id', $tenantId)->where('code', '2102')->first();

            $outputCgst = $cgstAccount ? VoucherEntry::where('account_id', $cgstAccount->id)
                ->whereHas('voucher', fn($q) => $q->whereMonth('voucher_date', now()->month))
                ->sum('credit') : 0.0;
            $outputSgst = $sgstAccount ? VoucherEntry::where('account_id', $sgstAccount->id)
                ->whereHas('voucher', fn($q) => $q->whereMonth('voucher_date', now()->month))
                ->sum('credit') : 0.0;
            $totalOutputGst = (float) ($outputCgst + $outputSgst);

            $receivables = Customer::where('tenant_id', $tenantId)->sum('outstanding_balance');

            $recentVouchers = Voucher::where('tenant_id', $tenantId)
                ->with('entries.account')
                ->latest('voucher_date')
                ->take(8)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'accountant',
                    'cash_in_hand' => (float) $cashInHand,
                    'bank_balance' => (float) $bankBalance,
                    'month_output_gst' => (float) $totalOutputGst,
                    'output_cgst' => (float) $outputCgst,
                    'output_sgst' => (float) $outputSgst,
                    'customer_receivables' => (float) $receivables,
                    'recent_vouchers' => $recentVouchers,
                    'metal_rates' => $rates,
                ],
            ]);
        }

        // 4. Inventory Head / Stock Manager (Bullion Weights, Categories, HUID, Low Stock)
        if ($role === 'stock') {
            $goldGrossStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'gold')->sum('gross_weight');
            $goldNetStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'gold')->sum('net_weight');
            $silverGrossStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'silver')->sum('gross_weight');
            $totalItemsInStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->count();
            $huidVerifiedCount = InventoryItem::where('tenant_id', $tenantId)->whereNotNull('huid')->count();

            $categoryBreakdown = InventoryItem::where('inventory_items.tenant_id', $tenantId)
                ->where('inventory_items.status', 'in_stock')
                ->join('categories', 'inventory_items.category_id', '=', 'categories.id')
                ->select('categories.name as category_name', DB::raw('count(*) as item_count'), DB::raw('sum(gross_weight) as total_gross_weight'))
                ->groupBy('categories.name')
                ->get();

            $recentInventory = InventoryItem::where('tenant_id', $tenantId)
                ->with('category')
                ->latest()
                ->take(8)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'stock',
                    'gold_gross_stock' => (float) $goldGrossStock,
                    'gold_net_stock' => (float) $goldNetStock,
                    'silver_gross_stock' => (float) $silverGrossStock,
                    'total_items_in_stock' => $totalItemsInStock,
                    'huid_verified_count' => $huidVerifiedCount,
                    'category_breakdown' => $categoryBreakdown,
                    'recent_items' => $recentInventory,
                    'metal_rates' => $rates,
                ],
            ]);
        }

        // 5. Karigar / Workshop Master (Job Cards, Metal Issued vs Received, Melting Loss)
        if ($role === 'karigar') {
            $activeJobs = KarigarJob::where('tenant_id', $tenantId)
                ->whereIn('status', ['issued', 'in_progress'])
                ->with('karigar')
                ->latest()
                ->get();

            $completedJobsCount = KarigarJob::where('tenant_id', $tenantId)
                ->where('status', 'completed')
                ->count();

            $totalIssuedGold = KarigarJob::where('tenant_id', $tenantId)
                ->whereIn('status', ['issued', 'in_progress'])
                ->sum('gold_issued_pure');

            $karigarsList = Karigar::where('tenant_id', $tenantId)->withCount(['jobs' => function ($q) {
                $q->whereIn('status', ['issued', 'in_progress']);
            }])->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'karigar',
                    'active_jobs_count' => $activeJobs->count(),
                    'completed_jobs_count' => $completedJobsCount,
                    'gold_issued_in_workshop' => (float) $totalIssuedGold,
                    'active_jobs' => $activeJobs->take(6),
                    'karigars' => $karigarsList,
                    'metal_rates' => $rates,
                ],
            ]);
        }

        // 6. Branch Manager (Branch-specific Sales, Staff Leaderboard, Stock & Daily Invoices)
        if ($role === 'manager') {
            $branchQuery = Invoice::where('tenant_id', $tenantId)->when($branchId, fn($q) => $q->where('branch_id', $branchId));

            $branchTodaySales = (clone $branchQuery)->where('invoice_date', $today)->sum('grand_total');
            $branchTodayInvoicesCount = (clone $branchQuery)->where('invoice_date', $today)->count();
            $branchMonthSales = (clone $branchQuery)->whereMonth('invoice_date', now()->month)->whereYear('invoice_date', now()->year)->sum('grand_total');

            // Staff leaderboard for this branch
            $staffPerformance = Invoice::where('invoices.tenant_id', $tenantId)
                ->when($branchId, fn($q) => $q->where('invoices.branch_id', $branchId))
                ->whereMonth('invoices.invoice_date', now()->month)
                ->whereYear('invoices.invoice_date', now()->year)
                ->join('users', 'invoices.user_id', '=', 'users.id')
                ->select('users.name as staff_name', DB::raw('count(invoices.id) as bills_count'), DB::raw('sum(invoices.grand_total) as total_revenue'))
                ->groupBy('users.name')
                ->orderByDesc('total_revenue')
                ->take(5)
                ->get();

            $branchInStock = InventoryItem::where('tenant_id', $tenantId)->when($branchId, fn($q) => $q->where('branch_id', $branchId))->where('status', 'in_stock')->count();
            $branchGoldWeight = InventoryItem::where('tenant_id', $tenantId)->when($branchId, fn($q) => $q->where('branch_id', $branchId))->where('status', 'in_stock')->where('metal_type', 'gold')->sum('gross_weight');

            $recentInvoices = (clone $branchQuery)->with(['customer', 'branch'])->withCount('items')->latest()->take(6)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'manager',
                    'branch_today_sales' => (float) $branchTodaySales,
                    'branch_today_invoices_count' => $branchTodayInvoicesCount,
                    'branch_month_sales' => (float) $branchMonthSales,
                    'branch_items_in_stock' => $branchInStock,
                    'branch_gold_weight' => (float) $branchGoldWeight,
                    'staff_performance' => $staffPerformance,
                    'recent_invoices' => $recentInvoices,
                    'metal_rates' => $rates,
                ],
            ]);
        }

        // 7. Owner (Full Enterprise Executive Overview: Consolidated Multi-branch, Profit, Vault, Trend)
        $todaySales = Invoice::where('tenant_id', $tenantId)->where('invoice_date', $today)->sum('grand_total');
        $todayInvoicesCount = Invoice::where('tenant_id', $tenantId)->where('invoice_date', $today)->count();
        $monthSales = Invoice::where('tenant_id', $tenantId)->whereMonth('invoice_date', now()->month)->whereYear('invoice_date', now()->year)->sum('grand_total');

        $goldGrossStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'gold')->sum('gross_weight');
        $goldNetStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'gold')->sum('net_weight');
        $silverStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'silver')->sum('gross_weight');
        $totalItems = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->count();

        $totalCustomers = Customer::where('tenant_id', $tenantId)->count();
        $outstandingReceivables = Customer::where('tenant_id', $tenantId)->sum('outstanding_balance');

        $recentInvoices = Invoice::where('tenant_id', $tenantId)
            ->with(['customer', 'branch'])
            ->withCount('items')
            ->latest()
            ->take(6)
            ->get();

        // Multi-branch sales breakdown
        $branchComparison = Branch::where('tenant_id', $tenantId)
            ->withCount(['invoices' => fn($q) => $q->whereMonth('invoice_date', now()->month)])
            ->withSum(['invoices' => fn($q) => $q->whereMonth('invoice_date', now()->month)], 'grand_total')
            ->get()
            ->map(fn($b) => [
                'branch_name' => $b->name,
                'invoices_count' => $b->invoices_count,
                'month_revenue' => (float) ($b->invoices_sum_grand_total ?? 0),
            ]);

        // 6-month sales trend
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $sales = Invoice::where('tenant_id', $tenantId)
                ->whereYear('invoice_date', $date->year)
                ->whereMonth('invoice_date', $date->month)
                ->sum('grand_total');

            $monthlyTrends[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $sales,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'role' => 'owner',
                'today_sales' => (float) $todaySales,
                'today_invoices_count' => $todayInvoicesCount,
                'month_sales' => (float) $monthSales,
                'gold_gross_stock' => (float) $goldGrossStock,
                'gold_net_stock' => (float) $goldNetStock,
                'silver_stock' => (float) $silverStock,
                'total_items_in_stock' => $totalItems,
                'total_customers' => $totalCustomers,
                'outstanding_receivables' => (float) $outstandingReceivables,
                'branch_comparison' => $branchComparison,
                'metal_rates' => $rates,
                'recent_invoices' => $recentInvoices,
                'sales_trend' => $monthlyTrends,
            ],
        ]);
    }
}
