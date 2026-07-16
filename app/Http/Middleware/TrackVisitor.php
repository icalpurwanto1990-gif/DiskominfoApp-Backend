<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\VisitorLog;
use App\Models\AppStatistic;
use Symfony\Component\HttpFoundation\Response;

class TrackVisitor
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();

        // Exclude admin, api, auth, or ignition assets
        if (
            Str::startsWith($path, 'admin') ||
            Str::startsWith($path, 'api') ||
            Str::startsWith($path, 'auth') ||
            Str::startsWith($path, '_ignition') ||
            $request->ajax()
        ) {
            return $next($request);
        }

        // Use session to track unique visit
        if (!$request->session()->has('visitor_logged')) {
            $ip = $request->ip();
            $userAgent = $request->userAgent() ?? '';

            // Parse User Agent
            $device = self::getDeviceType($userAgent);
            $browser = self::getBrowserType($userAgent);
            $platform = self::getPlatformType($userAgent);

            try {
                VisitorLog::create([
                    'id' => (string) Str::uuid(),
                    'ip_address' => $ip,
                    'user_agent' => $userAgent,
                    'device' => $device,
                    'browser' => $browser,
                    'platform' => $platform,
                    'visited_at' => now(),
                ]);

                // Dynamic increment TOTAL_VISITORS
                $stat = AppStatistic::where('key', 'TOTAL_VISITORS')->first();
                if ($stat) {
                    $stat->increment('value');
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('TrackVisitor failed: ' . $e->getMessage());
            }

            $request->session()->put('visitor_logged', true);
        }

        return $next($request);
    }

    private static function getDeviceType(string $userAgent): string
    {
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $userAgent)) {
            return 'Tablet';
        }
        if (preg_match('/(up\.browser|up\.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile|iphone|ipad|ipod|blackberry|webos)/i', $userAgent)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    private static function getBrowserType(string $userAgent): string
    {
        if (preg_match('/msie/i', $userAgent) && !preg_match('/opera/i', $userAgent)) {
            return 'Internet Explorer';
        }
        if (preg_match('/firefox/i', $userAgent)) {
            return 'Firefox';
        }
        if (preg_match('/chrome/i', $userAgent)) {
            return 'Chrome';
        }
        if (preg_match('/safari/i', $userAgent)) {
            return 'Safari';
        }
        if (preg_match('/opera/i', $userAgent)) {
            return 'Opera';
        }
        if (preg_match('/netscape/i', $userAgent)) {
            return 'Netscape';
        }
        if (preg_match('/edge/i', $userAgent)) {
            return 'Edge';
        }
        return 'Other';
    }

    private static function getPlatformType(string $userAgent): string
    {
        if (preg_match('/windows|win32/i', $userAgent)) {
            return 'Windows';
        }
        if (preg_match('/macintosh|mac os x/i', $userAgent)) {
            return 'macOS';
        }
        if (preg_match('/linux/i', $userAgent)) {
            return 'Linux';
        }
        if (preg_match('/android/i', $userAgent)) {
            return 'Android';
        }
        if (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            return 'iOS';
        }
        return 'Other';
    }
}
