<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request and attach recommended defensive security headers.
     * Conforms to BSSN & OWASP Top 10 recommendations for public government portals.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Clickjacking Protection (Permit embedding only within the same origin)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME-sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Referrer Information Leakage Prevention
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Restrict sensitive browser features (Permissions Policy)
        $response->headers->set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(), payment=()');

        // Cross-Site Scripting Filter (Legacy browsers defense)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Force HTTPS in production / when requested via SSL
        if ($request->isSecure() || app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
