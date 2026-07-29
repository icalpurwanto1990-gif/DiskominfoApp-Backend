<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SitemapController extends Controller
{
    public function index(Request $request)
    {
        $baseUrl = $request->getSchemeAndHttpHost();
        $urls = [];

        // 1. Add static frontend routes
        $staticRoutes = [
            ['path' => '/', 'priority' => '1.0', 'changefreq' => 'daily', 'lastmod' => Carbon::now()->startOfDay()->toAtomString()],
            ['path' => '/profil', 'priority' => '0.8', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/media', 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/berita', 'priority' => '0.9', 'changefreq' => 'daily', 'lastmod' => null],
            ['path' => '/ppid', 'priority' => '0.8', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/ppid/berkala', 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/ppid/serta-merta', 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/ppid/setiap-saat', 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/ppid/daftar-informasi-publik', 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/ppid/sop-pelayanan', 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/layanan', 'priority' => '0.8', 'changefreq' => 'monthly', 'lastmod' => null],
            ['path' => '/dashboard', 'priority' => '0.8', 'changefreq' => 'daily', 'lastmod' => null],
            ['path' => '/satu-data', 'priority' => '0.8', 'changefreq' => 'daily', 'lastmod' => null],
            ['path' => '/gis', 'priority' => '0.8', 'changefreq' => 'daily', 'lastmod' => null],
            ['path' => '/kontak', 'priority' => '0.7', 'changefreq' => 'yearly', 'lastmod' => null],
            ['path' => '/agenda', 'priority' => '0.7', 'changefreq' => 'daily', 'lastmod' => null],
        ];

        foreach ($staticRoutes as $route) {
            $urls[] = [
                'loc' => $baseUrl . $route['path'],
                'priority' => $route['priority'],
                'changefreq' => $route['changefreq'],
                'lastmod' => $route['lastmod']
            ];
        }

        // 2. Add dynamic news articles from database
        try {
            $posts = Post::where('published', true)->get();
            foreach ($posts as $post) {
                // updatedAt & createdAt are already Carbon objects (auto-cast by Eloquent
                // via const UPDATED_AT / CREATED_AT). Use optional() for safe null handling.
                $lastmod = optional($post->updatedAt ?? $post->createdAt)->toAtomString();

                $urls[] = [
                    'loc' => $baseUrl . '/berita/' . $post->slug,
                    'priority' => '0.8',
                    'changefreq' => 'weekly',
                    'lastmod' => $lastmod,
                ];
            }
        } catch (\Exception $e) {
            // Fallback quietly if DB is missing or has issues during initial setup
            logger()->error('Error generating dynamic sitemap articles: ' . $e->getMessage());
        }

        return response()->view('sitemap', [
            'urls' => $urls
        ])->header('Content-Type', 'text/xml');
    }
}
