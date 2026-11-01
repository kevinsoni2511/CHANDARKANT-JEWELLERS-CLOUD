<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\InventoryStone;
use App\Services\DecimalMathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $query = InventoryItem::where('tenant_id', $tenantId)->with(['category', 'branch', 'stones']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('metal_type')) {
            $query->where('metal_type', $request->metal_type);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'ilike', "%{$s}%")
                  ->orWhere('sku', 'ilike', "%{$s}%")
                  ->orWhere('huid', 'ilike', "%{$s}%")
                  ->orWhere('barcode', 'ilike', "%{$s}%");
            });
        }

        $items = $query->latest()->paginate($request->input('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function lookup(string $code, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $item = InventoryItem::where('tenant_id', $tenantId)
            ->where(function ($q) use ($code) {
                $q->where('sku', $code)
                  ->orWhere('barcode', $code)
                  ->orWhere('huid', $code);
            })
            ->with(['category', 'branch', 'stones'])
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => "Item with code '{$code}' not found.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'metal_type' => 'required|string',
            'purity_karat' => 'required|string',
            'gross_weight' => 'required|numeric|gt:0',
            'stone_weight' => 'nullable|numeric|min:0',
            'huid' => 'nullable|string|max:20',
            'wastage_percent' => 'nullable|numeric|min:0',
            'making_charge_type' => 'required|in:per_gram,fixed,percentage',
            'making_charge_rate' => 'required|numeric|min:0',
            'stone_charges' => 'nullable|numeric|min:0',
            'purchase_cost' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
            'branch_id' => 'nullable|exists:branches,id',
            'stones' => 'nullable|array',
        ]);

        $user = $request->user();
        $tenantId = $user->tenant_id;
        $branchId = $request->branch_id ?? $user->branch_id;

        $gross = (float) $request->gross_weight;
        $stone = (float) ($request->stone_weight ?? 0.0);

        if ($gross <= $stone) {
            return response()->json([
                'success' => false,
                'message' => 'Gross weight must be greater than stone weight.',
            ], 422);
        }

        $netWeight = DecimalMathService::netWeight($gross, $stone);
        $fineWeight = DecimalMathService::pureFineWeight($netWeight, $request->purity_karat);

        // Generate SKU if not provided e.g. CJ-G-RING-00124
        $count = InventoryItem::where('tenant_id', $tenantId)->count() + 1;
        $metalPrefix = strtoupper(substr($request->metal_type, 0, 1));
        $sku = $request->sku ?? ('CJ-' . $metalPrefix . '-' . str_pad((string) $count, 5, '0', STR_PAD_LEFT));

        $item = DB::transaction(function () use ($request, $tenantId, $branchId, $sku, $gross, $stone, $netWeight, $fineWeight) {
            $inv = InventoryItem::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'category_id' => $request->category_id,
                'sku' => $sku,
                'barcode' => $sku,
                'name' => $request->name,
                'huid' => $request->huid ? strtoupper(trim($request->huid)) : null,
                'metal_type' => $request->metal_type,
                'purity_karat' => $request->purity_karat,
                'gross_weight' => $gross,
                'stone_weight' => $stone,
                'net_weight' => $netWeight,
                'fine_gold_weight' => $fineWeight,
                'wastage_percent' => $request->wastage_percent ?? 0.00,
                'making_charge_type' => $request->making_charge_type,
                'making_charge_rate' => $request->making_charge_rate,
                'stone_charges' => $request->stone_charges ?? 0.00,
                'purchase_cost' => $request->purchase_cost ?? 0.00,
                'status' => 'in_stock',
                'image_url' => $request->image_url,
                'notes' => $request->notes,
            ]);

            if (!empty($request->stones)) {
                foreach ($request->stones as $st) {
                    InventoryStone::create([
                        'inventory_item_id' => $inv->id,
                        'stone_type' => $st['stone_type'] ?? 'cz',
                        'carat_weight' => $st['carat_weight'] ?? 0.0000,
                        'pieces' => $st['pieces'] ?? 1,
                        'clarity' => $st['clarity'] ?? null,
                        'color' => $st['color'] ?? null,
                        'rate_per_carat' => $st['rate_per_carat'] ?? 0.00,
                        'total_amount' => $st['total_amount'] ?? 0.00,
                    ]);
                }
            }

            return $inv;
        });

        return response()->json([
            'success' => true,
            'message' => "Item {$sku} created and tagged successfully.",
            'data' => $item->load(['category', 'branch', 'stones']),
        ], 201);
    }
}
