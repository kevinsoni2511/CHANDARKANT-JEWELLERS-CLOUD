<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Services\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->tenant_id) {
            TenantContext::setTenantId($user->tenant_id);
        } elseif ($subdomain = $request->header('X-Tenant-Subdomain')) {
            $tenant = Tenant::where('subdomain', $subdomain)->first();
            if ($tenant) {
                TenantContext::setTenant($tenant);
            }
        } elseif ($tenantId = $request->header('X-Tenant-Id')) {
            // If super_admin or authorized
            if ($user && $user->role === 'super_admin') {
                TenantContext::setTenantId((int) $tenantId);
            }
        }

        return $next($request);
    }
}
