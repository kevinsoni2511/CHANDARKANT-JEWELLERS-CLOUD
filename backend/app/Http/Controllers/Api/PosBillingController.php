<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\PosBillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosBillingController extends Controller
{
    public function __construct(
        protected PosBillingService $billingService
    ) {}

    public function estimate(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'discount_amount' => 'nullable|numeric|min:0',
            'old_gold_items' => 'nullable|array',
            'is_interstate' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $estimate = $this->billingService->calculateEstimate(
            $request->all(),
            $user->tenant_id,
            $request->branch_id ?? $user->branch_id
        );

        return response()->json([
            'success' => true,
            'data' => $estimate,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'customer_id' => 'nullable|exists:customers,id',
            'payments' => 'nullable|array',
            'payments.*.payment_mode' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'old_gold_items' => 'nullable|array',
            'is_interstate' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $invoice = $this->billingService->createInvoice($request->all(), $user);

        return response()->json([
            'success' => true,
            'message' => "Invoice {$invoice->invoice_number} created and posted successfully.",
            'data' => $invoice,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $query = Invoice::where('tenant_id', $tenantId)->with(['customer', 'branch', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('invoice_date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('invoice_number', 'ilike', "%{$s}%")
                  ->orWhereHas('customer', fn($cq) => $cq->where('name', 'ilike', "%{$s}%")->orWhere('phone', 'ilike', "%{$s}%"));
            });
        }

        $invoices = $query->latest('invoice_date')->paginate($request->input('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $invoices->items(),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $invoice = Invoice::where('tenant_id', $tenantId)
            ->with(['customer', 'branch', 'user', 'items', 'payments', 'oldGoldPurchases'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }
}
