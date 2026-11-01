<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\MetalRate;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // If Super Admin without tenant context, show multi-tenant SaaS stats
        if ($user->isSuperAdmin() && !$user->tenant_id) {
            $totalTenants = Tenant::count();
            $totalUsers = User::count();
            $activeSubscriptions = Tenant::where('status', 'active')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_super_admin' => true,
                    'total_tenants' => $totalTenants,
                    'total_users' => $totalUsers,
                    'active_subscriptions' => $activeSubscriptions,
                    'tenants' => Tenant::withCount(['branches', 'users'])->latest()->take(10)->get(),
                ],
            ]);
        }

        $tenantId = $user->tenant_id;
        $today = now()->toDateString();

        $todaySales = Invoice::where('tenant_id', $tenantId)->where('invoice_date', $today)->sum('grand_total');
        $todayInvoicesCount = Invoice::where('tenant_id', $tenantId)->where('invoice_date', $today)->count();
        $monthSales = Invoice::where('tenant_id', $tenantId)->whereMonth('invoice_date', now()->month)->whereYear('invoice_date', now()->year)->sum('grand_total');

        $goldGrossStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'gold')->sum('gross_weight');
        $goldNetStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'gold')->sum('net_weight');
        $silverStock = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->where('metal_type', 'silver')->sum('gross_weight');
        $totalItems = InventoryItem::where('tenant_id', $tenantId)->where('status', 'in_stock')->count();

        $totalCustomers = Customer::where('tenant_id', $tenantId)->count();
        $outstandingReceivables = Customer::where('tenant_id', $tenantId)->sum('outstanding_balance');

        $rates = MetalRate::where('tenant_id', $tenantId)->latest('effective_date')->get();

        $recentInvoices = Invoice::where('tenant_id', $tenantId)
            ->with(['customer', 'branch'])
            ->withCount('items')
            ->latest()
            ->take(6)
            ->get();

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
                'today_sales' => (float) $todaySales,
                'today_invoices_count' => $todayInvoicesCount,
                'month_sales' => (float) $monthSales,
                'gold_gross_stock' => (float) $goldGrossStock,
                'gold_net_stock' => (float) $goldNetStock,
                'silver_stock' => (float) $silverStock,
                'total_items_in_stock' => $totalItems,
                'total_customers' => $totalCustomers,
                'outstanding_receivables' => (float) $outstandingReceivables,
                'metal_rates' => $rates,
                'recent_invoices' => $recentInvoices,
                'sales_trend' => $monthlyTrends,
            ],
        ]);
    }
}
