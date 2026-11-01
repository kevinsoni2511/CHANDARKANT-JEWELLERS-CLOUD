<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::withoutGlobalScopes()->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is deactivated. Please contact your administrator.',
            ], 403);
        }

        // Revoke older tokens for clean session
        $user->tokens()->delete();

        $token = $user->createToken('cjc_auth_token', ['*'], now()->addDays(7))->plainTextToken;

        $tenant = $user->tenant_id ? Tenant::with('branches')->find($user->tenant_id) : null;

        return response()->json([
            'success' => true,
            'message' => 'Logged in successfully',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'avatar_url' => $user->avatar_url,
                    'permissions' => $user->permissions,
                    'branch_id' => $user->branch_id,
                    'branch' => $user->branch,
                ],
                'tenant' => $tenant,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['branch']);
        $tenant = $user->tenant_id ? Tenant::with('branches')->find($user->tenant_id) : null;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'tenant' => $tenant,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function switchBranch(Request $request): JsonResponse
    {
        $request->validate(['branch_id' => 'required|exists:branches,id']);
        $user = $request->user();

        // Verify branch belongs to user's tenant
        $branch = $user->tenant->branches()->findOrFail($request->branch_id);
        $user->update(['branch_id' => $branch->id]);

        return response()->json([
            'success' => true,
            'message' => "Switched active branch to {$branch->name}",
            'data' => ['branch' => $branch],
        ]);
    }
}
