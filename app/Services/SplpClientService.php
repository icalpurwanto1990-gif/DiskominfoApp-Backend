<?php

namespace App\Services;

use App\Models\InteropLog;
use App\Models\SplpConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SplpClientService
{
    /**
     * Test connection (Handshake / Ping) to the central SPLP Gateway.
     */
    public function testConnection(SplpConfig $config): array
    {
        $startTime = microtime(true);
        $url = rtrim($config->base_url, '/');

        try {
            $client = Http::timeout(8)->withHeaders($this->buildHeaders($config));

            // Attempt ping/health or fallback to base url
            $response = $client->get($url . '/ping');
            if ($response->status() === 404) {
                $response = $client->get($url);
            }

            $durationMs = round((microtime(true) - $startTime) * 1000, 2);
            $isSuccess = $response->successful() || in_array($response->status(), [200, 204, 301, 302, 401]); // 401 means server is reachable but auth might need token

            $statusText = $response->successful() ? 'ONLINE' : 'HTTP_' . $response->status();
            $config->update([
                'last_sync_at' => now(),
                'last_status'  => $statusText,
            ]);

            InteropLog::logOutbound(
                $config->service_name,
                $url,
                'GET',
                $response->status(),
                $durationMs,
                $response->successful() ? null : 'Status: ' . $response->status()
            );

            return [
                'success'     => $isSuccess,
                'status_code' => $response->status(),
                'latency_ms'  => $durationMs,
                'message'     => $response->successful()
                    ? "Koneksi ke gateway SPLP berhasil ({$durationMs} ms)."
                    : "Gateway merespons dengan kode HTTP {$response->status()}.",
            ];
        } catch (\Exception $e) {
            $durationMs = round((microtime(true) - $startTime) * 1000, 2);

            $config->update([
                'last_sync_at' => now(),
                'last_status'  => 'ERROR',
            ]);

            InteropLog::logOutbound(
                $config->service_name,
                $url,
                'GET',
                0,
                $durationMs,
                $e->getMessage()
            );

            return [
                'success'     => false,
                'status_code' => 0,
                'latency_ms'  => $durationMs,
                'message'     => 'Gagal terhubung ke gateway SPLP: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Call an endpoint on the central SPLP Gateway.
     */
    public function call(string $endpoint, string $method = 'GET', array $data = [], ?SplpConfig $config = null): array
    {
        $startTime = microtime(true);
        $config = $config ?? SplpConfig::where('is_active', true)->first();

        if (! $config) {
            return [
                'success' => false,
                'error'   => 'Konfigurasi SPLP aktif belum disetel di panel admin.',
            ];
        }

        $fullUrl = rtrim($config->base_url, '/') . '/' . ltrim($endpoint, '/');

        try {
            $client = Http::timeout(15)->withHeaders($this->buildHeaders($config));

            $response = match (strtoupper($method)) {
                'POST'  => $client->post($fullUrl, $data),
                'PUT'   => $client->put($fullUrl, $data),
                'DELETE'=> $client->delete($fullUrl, $data),
                default => $client->get($fullUrl, $data),
            };

            $durationMs = round((microtime(true) - $startTime) * 1000, 2);

            InteropLog::logOutbound(
                $config->service_name,
                $endpoint,
                $method,
                $response->status(),
                $durationMs,
                $response->successful() ? null : 'HTTP ' . $response->status()
            );

            return [
                'success'     => $response->successful(),
                'status_code' => $response->status(),
                'latency_ms'  => $durationMs,
                'data'        => $response->json() ?? $response->body(),
            ];
        } catch (\Exception $e) {
            $durationMs = round((microtime(true) - $startTime) * 1000, 2);

            InteropLog::logOutbound(
                $config->service_name,
                $endpoint,
                $method,
                0,
                $durationMs,
                $e->getMessage()
            );

            return [
                'success' => false,
                'error'   => 'Gagal memanggil endpoint SPLP: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Build appropriate headers for central SPLP Gateway.
     */
    protected function buildHeaders(SplpConfig $config): array
    {
        $headers = [
            'Accept'       => 'application/json',
            'User-Agent'   => 'Diskominfo-Bangkep-SPBE-Client/1.0',
        ];

        if ($config->service_code) {
            $headers['X-SPLP-Service-ID'] = $config->service_code;
        }

        if ($config->client_id) {
            $headers['X-Client-ID'] = $config->client_id;
        }

        // Authentication type
        if ($config->auth_type === 'API_KEY' && $config->client_secret) {
            $headers['X-API-KEY'] = $config->client_secret;
        } elseif ($config->auth_type === 'BEARER_TOKEN' && $config->client_secret) {
            $headers['Authorization'] = 'Bearer ' . $config->client_secret;
        }

        // Custom headers configured in JSON
        if (is_array($config->headers)) {
            $headers = array_merge($headers, $config->headers);
        }

        return $headers;
    }
}
