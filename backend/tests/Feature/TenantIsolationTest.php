<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\Tenant;
use App\Services\TenantContext;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    public function test_tenant_cannot_see_other_tenants_inventory(): void
    {
        // Tenant A: Chandarkant Jewellers
        $tenantA = Tenant::where('subdomain', 'chandarkant')->firstOrFail();

        // Total items created for Tenant A
        TenantContext::setTenantId($tenantA->id);
        $countTenantA = InventoryItem::count();
        $this->assertGreaterThan(0, $countTenantA, 'Tenant A must have inventory items.');

        // Create Tenant B: Rival Jewellers
        $tenantB = Tenant::firstOrCreate(
            ['subdomain' => 'rival-jewellers'],
            [
                'name' => 'Rival Jewellers Surat',
                'business_type' => 'retail',
                'state' => 'Gujarat',
                'state_code' => '24',
            ]
        );

        // Switch to Tenant B context
        TenantContext::setTenantId($tenantB->id);

        // Querying InventoryItem must be scoped to Tenant B (count is 0)
        $countTenantB = InventoryItem::count();
        $this->assertEquals(0, $countTenantB, 'Tenant B must not see any items belonging to Tenant A.');

        // Restore context
        TenantContext::setTenantId($tenantA->id);
    }
}
