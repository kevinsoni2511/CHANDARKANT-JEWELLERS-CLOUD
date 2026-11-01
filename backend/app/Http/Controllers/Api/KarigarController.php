<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Karigar;
use App\Models\KarigarJob;
use App\Services\DecimalMathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KarigarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $karigars = Karigar::where('tenant_id', $tenantId)->withCount(['jobs' => fn($q) => $q->where('status', 'in_progress')])->get();

        return response()->json([
            'success' => true,
            'data' => $karigars,
        ]);
    }

    public function jobs(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $query = KarigarJob::where('tenant_id', $tenantId)->with('karigar');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('karigar_id')) {
            $query->where('karigar_id', $request->karigar_id);
        }

        $jobs = $query->latest()->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $jobs->items(),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function issueJob(Request $request): JsonResponse
    {
        $request->validate([
            'karigar_id' => 'required|exists:karigars,id',
            'item_description' => 'required|string',
            'gold_issued_gross' => 'required|numeric|gt:0',
            'gold_issued_purity' => 'nullable|numeric|min:50|max:100',
            'allowed_wastage' => 'nullable|numeric|min:0',
            'labour_charges' => 'required|numeric|min:0',
        ]);

        $tenantId = $request->user()->tenant_id;
        $karigar = Karigar::where('tenant_id', $tenantId)->findOrFail($request->karigar_id);

        $gross = (float) $request->gold_issued_gross;
        $purityPct = (float) ($request->gold_issued_purity ?? 99.900);
        $purityFactor = bcdiv((string) $purityPct, '100.0', 6);
        $pureGold = bcmul((string) $gross, $purityFactor, 3);

        $jobCount = KarigarJob::where('tenant_id', $tenantId)->count() + 1;
        $jobNumber = 'JOB-' . date('Ymd') . '-' . str_pad((string) $jobCount, 4, '0', STR_PAD_LEFT);

        $job = DB::transaction(function () use ($tenantId, $karigar, $jobNumber, $request, $gross, $purityPct, $pureGold) {
            $j = KarigarJob::create([
                'tenant_id' => $tenantId,
                'karigar_id' => $karigar->id,
                'job_number' => $jobNumber,
                'item_description' => $request->item_description,
                'gold_issued_gross' => $gross,
                'gold_issued_purity' => $purityPct,
                'gold_issued_pure' => $pureGold,
                'allowed_wastage' => $request->allowed_wastage ?? 0.000,
                'labour_charges' => $request->labour_charges,
                'status' => 'in_progress',
                'notes' => $request->notes,
            ]);

            // Increment unreturned pure gold balance with karigar
            $newBal = bcadd((string) $karigar->pure_gold_balance, $pureGold, 3);
            $karigar->update(['pure_gold_balance' => $newBal]);

            return $j;
        });

        return response()->json([
            'success' => true,
            'message' => "Job card {$jobNumber} issued to {$karigar->name}",
            'data' => $job->load('karigar'),
        ], 201);
    }
}
