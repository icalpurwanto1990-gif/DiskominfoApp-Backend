<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use App\Models\PartnerLink;
use App\Models\SocialMedia;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the data that is shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'visitorStats' => fn () => [
                'today' => \App\Models\VisitorLog::whereDate('visited_at', \Carbon\Carbon::today())->count(),
                'yesterday' => \App\Models\VisitorLog::whereDate('visited_at', \Carbon\Carbon::yesterday())->count(),
                'weekly' => \App\Models\VisitorLog::where('visited_at', '>=', \Carbon\Carbon::now()->subDays(7))->count(),
                'total' => \App\Models\AppStatistic::where('key', 'TOTAL_VISITORS')->value('value') ?? 0,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'menus' => fn () => Menu::active()
                ->topLevel()
                ->with(['children' => fn ($q) => $q->active()])
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($menu) => [
                    'id' => $menu->id,
                    'label' => $menu->label,
                    'url' => $menu->url,
                    'target' => $menu->target,
                    'children' => $menu->children->map(fn ($child) => [
                        'id' => $child->id,
                        'label' => $child->label,
                        'url' => $child->url,
                        'target' => $child->target,
                    ]),
                ]),
            'partnerLinks' => fn () => PartnerLink::where('active', true)
                ->orderBy('orderIndex')
                ->get()
                ->map(fn ($link) => [
                    'id' => $link->id,
                    'name' => $link->name,
                    'short' => $link->short,
                    'url' => $link->url,
                    'color' => $link->color,
                    'logo' => $link->logo,
                    'desc' => $link->desc,
                ]),
            'socialMedia' => fn () => SocialMedia::where('active', true)
                ->orderBy('orderIndex')
                ->get()
                ->map(fn ($sm) => [
                    'id' => $sm->id,
                    'platform' => $sm->platform,
                    'url' => $sm->url,
                ]),
            'leaderSettings' => fn () => \App\Models\LeaderSetting::getAllFormatted(),
        ]);
    }
}
