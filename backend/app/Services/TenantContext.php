<?php

namespace App\Services;

use App\Models\Tenant;

class TenantContext
{
    protected static ?int $tenantId = null;
    protected static ?Tenant $tenant = null;

    public static function setTenant(?Tenant $tenant): void
    {
        static::$tenant = $tenant;
        static::$tenantId = $tenant?->id;
    }

    public static function setTenantId(?int $id): void
    {
        static::$tenantId = $id;
        if ($id && (static::$tenant === null || static::$tenant->id !== $id)) {
            static::$tenant = Tenant::find($id);
        }
    }

    public static function getTenant(): ?Tenant
    {
        return static::$tenant;
    }

    public static function id(): ?int
    {
        return static::$tenantId;
    }

    public static function clear(): void
    {
        static::$tenant = null;
        static::$tenantId = null;
    }
}
