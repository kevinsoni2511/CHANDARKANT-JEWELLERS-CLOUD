<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;

class DashboardRoleTest extends TestCase
{
    public function test_roles_receive_tailored_dashboard_data(): void
    {
        $tenant = Tenant::where('subdomain', 'chandarkant')->firstOrFail();

        // 1. Sales User
        $salesUser = User::where('email', 'sales@chandarkantjewellers.com')->firstOrFail();
        $responseSales = $this->actingAs($salesUser, 'sanctum')->getJson('/api/v1/dashboard');
        $responseSales->assertStatus(200);
        $responseSales->assertJsonPath('data.role', 'sales');
        $this->assertArrayHasKey('my_today_sales', $responseSales->json('data'));

        // 2. Accountant User
        $accountantUser = User::where('email', 'accountant@chandarkantjewellers.com')->firstOrFail();
        $responseAcc = $this->actingAs($accountantUser, 'sanctum')->getJson('/api/v1/dashboard');
        $responseAcc->assertStatus(200);
        $responseAcc->assertJsonPath('data.role', 'accountant');
        $this->assertArrayHasKey('cash_in_hand', $responseAcc->json('data'));

        // 3. Stock User
        $stockUser = User::where('email', 'stock@chandarkantjewellers.com')->firstOrFail();
        $responseStock = $this->actingAs($stockUser, 'sanctum')->getJson('/api/v1/dashboard');
        $responseStock->assertStatus(200);
        $responseStock->assertJsonPath('data.role', 'stock');
        $this->assertArrayHasKey('total_items_in_stock', $responseStock->json('data'));

        // 4. Karigar User
        $karigarUser = User::where('email', 'karigar.ramesh@chandarkantjewellers.com')->firstOrFail();
        $responseKarigar = $this->actingAs($karigarUser, 'sanctum')->getJson('/api/v1/dashboard');
        $responseKarigar->assertStatus(200);
        $responseKarigar->assertJsonPath('data.role', 'karigar');
        $this->assertArrayHasKey('active_jobs_count', $responseKarigar->json('data'));

        // 5. Owner User
        $ownerUser = User::where('email', 'owner@chandarkantjewellers.com')->firstOrFail();
        $responseOwner = $this->actingAs($ownerUser, 'sanctum')->getJson('/api/v1/dashboard');
        $responseOwner->assertStatus(200);
        $responseOwner->assertJsonPath('data.role', 'owner');
        $this->assertArrayHasKey('branch_comparison', $responseOwner->json('data'));
    }
}
