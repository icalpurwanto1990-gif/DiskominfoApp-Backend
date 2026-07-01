<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check if user is logged in
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized. Silakan login terlebih dahulu.'
                ], 401);
            }
            return redirect()->route('login');
        }

        // 2. Check if logged in user has Admin / Superadmin role
        $role = Auth::user()->role;
        if ($role !== 'ADMIN' && $role !== 'SUPERADMIN') {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Forbidden. Anda tidak memiliki hak akses admin.'
                ], 403);
            }
            // Logout user from session and redirect to login
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors(['email' => 'Hanya admin yang diizinkan mengakses panel ini.']);
        }

        return $next($request);
    }
}
