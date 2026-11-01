<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $query = Customer::where('tenant_id', $tenantId);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'ilike', "%{$s}%")
                  ->orWhere('phone', 'ilike', "%{$s}%")
                  ->orWhere('pan_number', 'ilike', "%{$s}%")
                  ->orWhere('city', 'ilike', "%{$s}%");
            });
        }

        $customers = $query->latest()->paginate($request->input('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'pan_number' => 'nullable|string|max:20',
            'gstin' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'birthday' => 'nullable|date',
            'anniversary' => 'nullable|date',
        ]);

        $customer = Customer::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'pan_number' => $request->pan_number ? strtoupper(trim($request->pan_number)) : null,
            'gstin' => $request->gstin ? strtoupper(trim($request->gstin)) : null,
            'address' => $request->address,
            'city' => $request->city ?? 'Surat',
            'state' => $request->state ?? 'Gujarat',
            'pincode' => $request->pincode,
            'birthday' => $request->birthday,
            'anniversary' => $request->anniversary,
            'marketing_consent' => $request->boolean('marketing_consent', true),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Customer registered successfully',
            'data' => $customer,
        ], 201);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $customer = Customer::where('tenant_id', $tenantId)
            ->with(['invoices' => fn($q) => $q->latest()->take(10), 'savingSchemeEnrollments.scheme'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }
}
