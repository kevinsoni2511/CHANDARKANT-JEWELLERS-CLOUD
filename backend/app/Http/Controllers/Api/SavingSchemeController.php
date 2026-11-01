<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\SavingScheme;
use App\Models\SavingSchemeEnrollment;
use App\Models\SavingSchemeInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SavingSchemeController extends Controller
{
    public function schemes(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $schemes = SavingScheme::where('tenant_id', $tenantId)->where('is_active', true)->withCount('enrollments')->get();

        return response()->json([
            'success' => true,
            'data' => $schemes,
        ]);
    }

    public function enrollments(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $enrollments = SavingSchemeEnrollment::where('tenant_id', $tenantId)
            ->with(['customer', 'scheme', 'installments'])
            ->latest()
            ->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $enrollments->items(),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'total' => $enrollments->total(),
            ],
        ]);
    }

    public function enroll(Request $request): JsonResponse
    {
        $request->validate([
            'scheme_id' => 'required|exists:saving_schemes,id',
            'customer_id' => 'required|exists:customers,id',
            'start_date' => 'nullable|date',
        ]);

        $tenantId = $request->user()->tenant_id;
        $scheme = SavingScheme::where('tenant_id', $tenantId)->findOrFail($request->scheme_id);
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($request->customer_id);

        $count = SavingSchemeEnrollment::where('tenant_id', $tenantId)->count() + 1;
        $passbook = 'PB-' . date('Y') . '-' . str_pad((string) $count, 5, '0', STR_PAD_LEFT);

        $maturityVal = bcmul((string) $scheme->monthly_installment, (string) ($scheme->duration_months + 1), 2);

        $enrollment = SavingSchemeEnrollment::create([
            'tenant_id' => $tenantId,
            'scheme_id' => $scheme->id,
            'customer_id' => $customer->id,
            'passbook_number' => $passbook,
            'start_date' => $request->start_date ?? now()->toDateString(),
            'status' => 'active',
            'total_paid' => '0.00',
            'maturity_value' => $maturityVal,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Enrolled {$customer->name} in scheme {$scheme->name}. Passbook: {$passbook}",
            'data' => $enrollment->load(['customer', 'scheme']),
        ], 201);
    }

    public function payInstallment(Request $request): JsonResponse
    {
        $request->validate([
            'enrollment_id' => 'required|exists:saving_scheme_enrollments,id',
            'amount_paid' => 'required|numeric|gt:0',
            'payment_mode' => 'required|string',
        ]);

        $tenantId = $request->user()->tenant_id;
        $enrollment = SavingSchemeEnrollment::where('tenant_id', $tenantId)->findOrFail($request->enrollment_id);

        $nextInstallmentNo = $enrollment->installments()->count() + 1;
        $receiptNo = 'REC-SCH-' . date('Ymd') . '-' . str_pad((string) $nextInstallmentNo, 4, '0', STR_PAD_LEFT);

        $installment = DB::transaction(function () use ($enrollment, $request, $nextInstallmentNo, $receiptNo) {
            $inst = SavingSchemeInstallment::create([
                'enrollment_id' => $enrollment->id,
                'installment_no' => $nextInstallmentNo,
                'amount_paid' => $request->amount_paid,
                'payment_date' => now()->toDateString(),
                'receipt_number' => $receiptNo,
                'payment_mode' => $request->payment_mode,
                'notes' => $request->notes,
            ]);

            $newTotal = bcadd((string) $enrollment->total_paid, (string) $request->amount_paid, 2);
            $enrollment->update(['total_paid' => $newTotal]);

            return $inst;
        });

        return response()->json([
            'success' => true,
            'message' => "Installment #{$nextInstallmentNo} recorded. Receipt: {$receiptNo}",
            'data' => $installment,
        ], 201);
    }
}
