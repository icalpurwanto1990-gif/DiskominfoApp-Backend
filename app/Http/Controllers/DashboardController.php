<?php

namespace App\Http\Controllers;

use App\Models\AppStatistic;
use App\Models\DigitalService;
use App\Models\ServiceRequest;
use App\Models\TteRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard');
    }

    public function apiStats()
    {
        try {
            // 1. Fetch app stats
            $dbStats = AppStatistic::all();
            $statsMap = [];
            foreach ($dbStats as $s) {
                $statsMap[$s->key] = $s->value;
            }

            // Count actual data from DB
            $actualSrvRequestCount      = ServiceRequest::count();
            $actualCompletedTteCount    = ServiceRequest::where('serviceType', 'TTE')->where('status', 'SELESAI')->count();
            $actualDigitalServiceCount  = DigitalService::where('active', true)->count();

            $stats = [
                'TOTAL_VISITORS'           => $statsMap['TOTAL_VISITORS'] ?? 14258,
                'TOTAL_TTE_ISSUED'         => ($statsMap['TOTAL_TTE_ISSUED'] ?? 377) + $actualCompletedTteCount,
                'APP_OPD_COUNT'            => $actualDigitalServiceCount > 0 ? $actualDigitalServiceCount : ($statsMap['APP_OPD_COUNT'] ?? 45),
                'OPD_WEBSITE_COUNT'        => $statsMap['OPD_WEBSITE_COUNT'] ?? 28,
                'TOTAL_SERVICES_REQUESTED' => ($statsMap['TOTAL_SERVICES_REQUESTED'] ?? 684) + $actualSrvRequestCount,
            ];

            // 2. TTE Monthly Data (default: tahun berjalan)
            $tteMonthlyData = $this->buildTteMonthlyData(now()->year);

            // 3. Service Ticket Breakdown (100% Real DB counts)
            $ticketBreakdown = [
                ['label' => 'Selesai',  'value' => ServiceRequest::where('status', 'SELESAI')->count(),  'color' => '#10B981'],
                ['label' => 'Diproses', 'value' => ServiceRequest::where('status', 'DIPROSES')->count(), 'color' => '#F59E0B'],
                ['label' => 'Pending',  'value' => ServiceRequest::where('status', 'PENDING')->count(),  'color' => '#3B82F6'],
                ['label' => 'Ditolak',  'value' => ServiceRequest::where('status', 'DITOLAK')->count(),  'color' => '#EF4444'],
            ];

            // 4. Completed Service Requests (Layanan yang sudah terlaksana)
            $completedServices = ServiceRequest::where('status', 'SELESAI')
                ->orderBy('updatedAt', 'desc')
                ->take(10)
                ->get();

            return response()->json([
                'success'          => true,
                'stats'            => $stats,
                'tteMonthlyData'   => $tteMonthlyData,
                'ticketBreakdown'  => $ticketBreakdown,
                'completedServices' => $completedServices,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * API: Kembalikan data TTE bulanan berdasarkan tahun yang dipilih.
     * GET /api/dashboard/tte-stats?year=2026
     */
    public function apiTteStats(Request $request)
    {
        try {
            $year = (int) $request->get('year', now()->year);
            // Batasi tahun antara 2020 s.d. tahun depan
            $year = max(2020, min($year, now()->year + 1));

            $data = $this->buildTteMonthlyData($year);

            // Daftar tahun yang pernah ada di TteRequest (untuk opsi dropdown)
            $availableYears = TteRequest::selectRaw('EXTRACT(YEAR FROM "createdAt")::int AS yr')
                ->groupByRaw('EXTRACT(YEAR FROM "createdAt")')
                ->orderByRaw('yr DESC')
                ->pluck('yr')
                ->toArray();

            // Pastikan tahun berjalan selalu ada
            if (! in_array(now()->year, $availableYears)) {
                array_unshift($availableYears, now()->year);
            }

            return response()->json([
                'success'        => true,
                'year'           => $year,
                'data'           => $data,
                'availableYears' => $availableYears,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper: Bangun data TTE bulanan (Jan–Des) untuk tahun tertentu.
     * Mengambil data riil dari tabel TteRequest, status SELESAI.
     */
    private function buildTteMonthlyData(int $year): array
    {
        $monthLabels = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

        $rows = TteRequest::selectRaw('EXTRACT(MONTH FROM "createdAt")::int AS bulan, COUNT(*) AS total')
            ->whereRaw('EXTRACT(YEAR FROM "createdAt") = ?', [$year])
            ->where('status', 'SELESAI')
            ->groupByRaw('EXTRACT(MONTH FROM "createdAt")')
            ->orderByRaw('bulan')
            ->get()
            ->keyBy('bulan');

        $result = [];
        for ($m = 1; $m <= 12; $m++) {
            $result[] = [
                'label' => $monthLabels[$m - 1],
                'value' => (int) ($rows->get($m)?->total ?? 0),
            ];
        }

        return $result;
    }
}
