<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Filament2FAMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // If user is authenticated in Filament admin panel
        if ($user) {
            // Check if 2FA is enabled but not verified in the current session
            if ($user->two_factor_enabled && !$request->session()->get('filament_2fa_verified')) {
                // Allow request to pass if they are already on the verification page or logging out
                $allowedPaths = [
                    'admin/verify-2fa',
                    'admin/logout',
                ];

                $currentPath = $request->path();
                foreach ($allowedPaths as $allowed) {
                    if ($currentPath === $allowed || str_starts_with($currentPath, $allowed . '/')) {
                        return $next($request);
                    }
                }

                return redirect()->route('admin.2fa.view');
            }
        }

        return $next($request);
    }
}
