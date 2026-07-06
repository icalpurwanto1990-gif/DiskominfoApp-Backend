<?php

namespace App\Http\Controllers;

use App\Models\AppStatistic;
use App\Models\Banner;
use App\Models\DigitalService;
use App\Models\Post;
use App\Models\ProfileContent;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function apiAgendas(Request $request)
    {
        try {
            $month = $request->input('month', now()->month);
            $year = $request->input('year', now()->year);

            $agendas = \App\Models\LeaderAgenda::where('status', 'PUBLISHED')
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->orderBy('date', 'asc')
                ->orderBy('time', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'agendas' => $agendas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index()
    {
        // 1. Fetch statistics
        $dbStats = AppStatistic::all();

        // 2. Fetch banners
        $banners = Banner::where('active', true)
            ->orderBy('orderIndex', 'asc')
            ->get()
            ->map(function ($banner) {
                return [
                    'url' => $banner->imageUrl,
                    'title' => $banner->title,
                    'description' => $banner->description ?? '',
                ];
            });

        // 3. Fetch digital services
        $dbServices = DigitalService::where('active', true)
            ->orderBy('createdAt', 'asc')
            ->get();

        // 4. Fetch welcome speech
        $speechKeys = ['sambutan_teks', 'sambutan_nama', 'sambutan_jabatan', 'sambutan_foto'];
        $dbSpeech = ProfileContent::whereIn('key', $speechKeys)->get();

        $welcomeSpeech = [
            'teks' => 'Kami berkomitmen mewujudkan tata kelola pemerintahan yang bersih, efektif, transparan, dan akuntabel melalui Sistem Pemerintahan Berbasis Elektronik (SPBE). Portal ini merupakan wujud nyata integrasi layanan publik digital guna melayani aparatur pemerintah serta seluruh lapisan masyarakat di Kabupaten Banggai Kepulauan secara cepat, aman, dan inklusif.',
            'nama' => 'Ir. H. Sudirman L. Hasan, M.Si',
            'jabatan' => 'Kepala Dinas Komunikasi dan Informatika',
            'foto' => '',
        ];

        foreach ($dbSpeech as $item) {
            if ($item->key === 'sambutan_teks' && $item->value) {
                $welcomeSpeech['teks'] = $item->value;
            }
            if ($item->key === 'sambutan_nama' && $item->value) {
                $welcomeSpeech['nama'] = $item->value;
            }
            if ($item->key === 'sambutan_jabatan' && $item->value) {
                $welcomeSpeech['jabatan'] = $item->value;
            }
            if ($item->key === 'sambutan_foto' && $item->value) {
                $val = $item->value;
                if (! str_starts_with($val, 'http') && ! str_starts_with($val, '/')) {
                    $val = '/uploads/'.$val;
                }
                $welcomeSpeech['foto'] = $val;
            }
        }

        // 5. Fetch latest published news posts (exclude pengumuman category)
        $latestNewsItems = Post::with('category')
            ->where('published', true)
            ->whereDoesntHave('category', function ($query) {
                // Exclude posts categorized as any variation of "pengumuman"
                $query->where('slug', 'LIKE', '%pengumuman%');
            })
            ->orderBy('createdAt', 'desc')
            ->take(3)
            ->get();

        // 6. Fetch latest published announcements (flexible slug match)
        $latestAnnouncements = Post::with('category')
            ->where('published', true)
            ->whereHas('category', function ($query) {
                // Flexible match: handles 'pengumuman', 'pengumuman-resmi', etc.
                $query->where('slug', 'LIKE', '%pengumuman%');
            })
            ->orderBy('createdAt', 'desc')
            ->take(3)
            ->get();

        // 7. Fetch published leader agendas for the current month
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $leaderAgendas = \App\Models\LeaderAgenda::where('status', 'PUBLISHED')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return Inertia::render('Home', [
            'dbStats' => $dbStats,
            'sliderImages' => $banners,
            'dbServices' => $dbServices,
            'welcomeSpeech' => $welcomeSpeech,
            'latestNewsItems' => $latestNewsItems,
            'latestAnnouncements' => $latestAnnouncements,
            'initialAgendas' => $leaderAgendas,
        ]);

    }
}
