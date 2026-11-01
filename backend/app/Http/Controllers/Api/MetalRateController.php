<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MetalRate;
use App\Models\MetalRateLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MetalRateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $rates = MetalRate::where('tenant_id', $tenantId)
            ->orderBy('metal_type')
            ->orderByDesc('purity_percentage')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rates,
        ]);
    }

    public function updateRates(Request $request): JsonResponse
    {
        $request->validate([
            'rates' => 'required|array',
            'rates.*.metal_type' => 'required|string',
            'rates.*.purity_karat' => 'required|string',
            'rates.*.rate_per_gram' => 'required|numeric|min:0',
            'rates.*.purity_percentage' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $tenantId = $user->tenant_id;
        $today = now()->toDateString();
        $updated = [];

        foreach ($request->rates as $r) {
            $existing = MetalRate::where('tenant_id', $tenantId)
                ->where('metal_type', $r['metal_type'])
                ->where('purity_karat', $r['purity_karat'])
                ->first();

            $oldRate = $existing?->rate_per_gram;

            $purityPct = $r['purity_percentage'] ?? match ($r['purity_karat']) {
                '24K' => 99.900,
                '22K' => 91.667,
                '20K' => 83.333,
                '18K' => 75.000,
                '14K' => 58.333,
                '999' => 99.900,
                '925' => 92.500,
                default => 91.667,
            };

            $record = MetalRate::updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'metal_type' => $r['metal_type'],
                    'purity_karat' => $r['purity_karat'],
                ],
                [
                    'purity_percentage' => $purityPct,
                    'rate_per_gram' => $r['rate_per_gram'],
                    'effective_date' => $today,
                    'updated_by' => $user->id,
                ]
            );

            // Log change
            MetalRateLog::create([
                'tenant_id' => $tenantId,
                'metal_type' => $r['metal_type'],
                'purity_karat' => $r['purity_karat'],
                'old_rate' => $oldRate,
                'new_rate' => $r['rate_per_gram'],
                'changed_by' => $user->id,
            ]);

            $updated[] = $record;
        }

        return response()->json([
            'success' => true,
            'message' => 'Metal rates updated successfully',
            'data' => $updated,
        ]);
    }
}
