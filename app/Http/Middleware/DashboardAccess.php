<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/** Authorize management operations using the current database role, never JWT claims. */
class DashboardAccess
{
    public function handle(Request $request, Closure $next)
    {
        $role = $request->user('api')?->role;
        if (!in_array($role, ['admin', 'editor', 'viewer'], true)) {
            return response()->json(['message' => 'Dashboard access is required.'], 403);
        }
        $users = $request->is('api/users', 'api/users/*');
        $settings = $request->is('api/settings', 'api/home-content', 'api/about-content');
        if (($users && $role !== 'admin') || (!$request->isMethodSafe() && ($role === 'viewer' || ($settings && $role !== 'admin')))) {
            return response()->json(['message' => 'Your role does not permit this operation.'], 403);
        }
        return $next($request);
    }
}
