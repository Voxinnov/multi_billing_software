<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (empty($roles)) {
            return $next($request);
        }

        // Try load customized dynamic role permissions
        $path = 'role_permissions.json';
        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($path)) {
            try {
                $permissions = json_decode(\Illuminate\Support\Facades\Storage::disk('local')->get($path), true);
                
                $uri = $request->getRequestUri();
                $feature = null;

                if (str_contains($uri, '/company/assets')) {
                    $feature = 'upload_assets';
                } elseif (str_contains($uri, '/company')) {
                    $feature = 'manage_companies';
                } elseif (str_contains($uri, '/upload-excel') || str_contains($uri, '/generate-invoices')) {
                    $feature = 'compile_invoices';
                } elseif (str_contains($uri, '/history') || str_contains($uri, '/assets') || str_contains($uri, '/download')) {
                    $feature = 'access_audit_logs';
                }

                if ($feature && isset($permissions[$user->role])) {
                    if (in_array($feature, $permissions[$user->role])) {
                        return $next($request);
                    } else {
                        return response()->json([
                            'message' => 'Unauthorized. Your custom role permissions do not allow this action.'
                        ], 403);
                    }
                }
            } catch (\Exception $e) {
                // Fallback to default string role matching below
            }
        }

        // Check if user has any of the requested roles
        if (!$user->hasRole($roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the permissions required for this action.'
            ], 403);
        }

        return $next($request);
    }
}
