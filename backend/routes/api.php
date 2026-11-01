<?php

use App\Http\Controllers\Api\AccountingController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\KarigarController;
use App\Http\Controllers\Api\MetalRateController;
use App\Http\Controllers\Api\PosBillingController;
use App\Http\Controllers\Api\SavingSchemeController;
use App\Http\Middleware\TenantMiddleware;
use Illuminate\Support\Facades\Route;

// Public Endpoints
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/auth/login', function () {
        if (request()->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'The login route requires an HTTP POST request with email and password.',
            ], 405);
        }
        return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5174/login'));
    });

    // Authenticated Endpoints
    Route::middleware(['auth:sanctum', TenantMiddleware::class])->group(function () {
        // Authentication & Context
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/switch-branch', [AuthController::class, 'switchBranch']);

        // Executive & Branch Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Precious Metal Rate Engine
        Route::get('/metal-rates', [MetalRateController::class, 'index']);
        Route::post('/metal-rates', [MetalRateController::class, 'updateRates']);

        // Jewellery Inventory & Tagging
        Route::get('/inventory', [InventoryController::class, 'index']);
        Route::post('/inventory', [InventoryController::class, 'store']);
        Route::get('/inventory/lookup/{code}', [InventoryController::class, 'lookup']);

        // POS & Billing
        Route::post('/pos/estimate', [PosBillingController::class, 'estimate']);
        Route::post('/pos/invoices', [PosBillingController::class, 'store']);
        Route::get('/pos/invoices', [PosBillingController::class, 'index']);
        Route::get('/pos/invoices/{id}', [PosBillingController::class, 'show']);

        // Double-Entry Financial Accounting
        Route::get('/accounting/chart-of-accounts', [AccountingController::class, 'chartOfAccounts']);
        Route::get('/accounting/trial-balance', [AccountingController::class, 'trialBalance']);
        Route::get('/accounting/vouchers', [AccountingController::class, 'vouchers']);
        Route::get('/accounting/day-book', [AccountingController::class, 'dayBook']);

        // Customer CRM
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::get('/customers/{id}', [CustomerController::class, 'show']);

        // Karigar Management
        Route::get('/karigars', [KarigarController::class, 'index']);
        Route::get('/karigar-jobs', [KarigarController::class, 'jobs']);
        Route::post('/karigar-jobs', [KarigarController::class, 'issueJob']);

        // Saving Schemes
        Route::get('/saving-schemes', [SavingSchemeController::class, 'schemes']);
        Route::get('/saving-schemes/enrollments', [SavingSchemeController::class, 'enrollments']);
        Route::post('/saving-schemes/enroll', [SavingSchemeController::class, 'enroll']);
        Route::post('/saving-schemes/pay', [SavingSchemeController::class, 'payInstallment']);

        // AI Copilot
        Route::post('/ai/query', [AiController::class, 'query']);
    });
});
