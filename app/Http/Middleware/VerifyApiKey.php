<?php

namespace App\Http\Middleware;

use App\Models\ApiClient;
use App\Models\InteropLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiKey
{
    /**
     * Handle an incoming request from MPP or external SPBE clients.
     */
    public function handle(Request $request, Closure $next, ?string $requiredScope = null): Response
    {
        $startTime = microtime(true);

        // 1. Extract API Key from Header
        $apiKey = $request->header('X-API-KEY')
            ?? $request->bearerToken()
            ?? $request->query('api_key');

        if (! $apiKey) {
            InteropLog::logInbound(
                null,
                $request->path(),
                $request->method(),
                401,
                $request->ip(),
                0,
                'Missing API Key'
            );

            return response()->json([
                'success' => false,
                'code'    => 401,
                'error'   => 'Unauthorized: Header X-API-KEY atau Bearer Token wajib disertakan.',
            ], 401);
        }

        // 2. Identify candidate client by prefix for high performance
        $prefix = substr($apiKey, 0, 12); // e.g. "bkp_xxxxxxxx"
        $client = ApiClient::where('is_active', true)
            ->where('api_key_prefix', 'LIKE', $prefix . '%')
            ->first();

        // Fallback: search all active clients if prefix not matched
        if (! $client) {
            $allClients = ApiClient::where('is_active', true)->get();
            foreach ($allClients as $c) {
                if (Hash::check($apiKey, $c->api_key_hash)) {
                    $client = $c;
                    break;
                }
            }
        } elseif (! Hash::check($apiKey, $client->api_key_hash)) {
            $client = null;
        }

        if (! $client) {
            InteropLog::logInbound(
                null,
                $request->path(),
                $request->method(),
                401,
                $request->ip(),
                0,
                'Invalid API Key'
            );

            return response()->json([
                'success' => false,
                'code'    => 401,
                'error'   => 'Unauthorized: Kunci API tidak valid atau telah dinonaktifkan.',
            ], 401);
        }

        // 3. Check Expiry
        if ($client->expires_at && $client->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'code'    => 403,
                'error'   => 'Forbidden: Kunci API telah kedaluwarsa pada ' . $client->expires_at->format('Y-m-d H:i:s'),
            ], 403);
        }

        // 4. Check IP Whitelist
        if (! $client->isIpAllowed($request->ip())) {
            return response()->json([
                'success' => false,
                'code'    => 403,
                'error'   => "Forbidden: Alamat IP [{$request->ip()}] tidak diizinkan mengakses endpoint ini.",
            ], 403);
        }

        // 5. Check Scope / Permission
        if ($requiredScope && ! $client->hasScope($requiredScope)) {
            return response()->json([
                'success' => false,
                'code'    => 403,
                'error'   => "Forbidden: Kunci API tidak memiliki hak akses (scope: {$requiredScope}).",
            ], 403);
        }

        // Attach client to request
        $request->attributes->set('api_client', $client);

        // Update last used asynchronously / quietly
        $client->updateQuietly(['last_used_at' => now()]);

        // Proceed
        $response = $next($request);

        $durationMs = round((microtime(true) - $startTime) * 1000, 2);

        // Log transaction
        InteropLog::logInbound(
            $client->name,
            $request->path(),
            $request->method(),
            $response->getStatusCode(),
            $request->ip(),
            $durationMs,
            $response->getStatusCode() >= 400 ? 'HTTP Error ' . $response->getStatusCode() : null
        );

        return $response;
    }
}
