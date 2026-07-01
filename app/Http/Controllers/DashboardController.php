<?php

namespace App\Http\Controllers;

use App\Models\AppStatistic;
use App\Models\Dataset;
use App\Models\DigitalService;
use App\Models\ServiceRequest;
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
            $actualSrvRequestCount = ServiceRequest::count();
            $actualCompletedTteCount = ServiceRequest::where('serviceType', 'TTE')->where('status', 'SELESAI')->count();
            $actualDigitalServiceCount = DigitalService::where('active', true)->count();

            $stats = [
                'TOTAL_VISITORS' => $statsMap['TOTAL_VISITORS'] ?? 14258,
                'TOTAL_TTE_ISSUED' => ($statsMap['TOTAL_TTE_ISSUED'] ?? 377) + $actualCompletedTteCount,
                'APP_OPD_COUNT' => $actualDigitalServiceCount > 0 ? $actualDigitalServiceCount : ($statsMap['APP_OPD_COUNT'] ?? 45),
                'OPD_WEBSITE_COUNT' => $statsMap['OPD_WEBSITE_COUNT'] ?? 28,
                'TOTAL_SERVICES_REQUESTED' => ($statsMap['TOTAL_SERVICES_REQUESTED'] ?? 684) + $actualSrvRequestCount,
            ];

            // 2. TTE Monthly Data
            $monthMap = [
                'Januari' => 'Jan',
                'Februari' => 'Feb',
                'Maret' => 'Mar',
                'April' => 'Apr',
                'Mei' => 'Mei',
                'Juni' => 'Jun',
                'Juli' => 'Jul',
                'Agustus' => 'Ags',
                'September' => 'Sep',
                'Oktober' => 'Okt',
                'November' => 'Nov',
                'Desember' => 'Des',
            ];

            $tteMonthlyData = [
                ['label' => 'Jan', 'value' => 24],
                ['label' => 'Feb', 'value' => 30],
                ['label' => 'Mar', 'value' => 45],
                ['label' => 'Apr', 'value' => 18],
                ['label' => 'Mei', 'value' => 50],
                ['label' => 'Jun', 'value' => 29],
                ['label' => 'Jul', 'value' => 40],
                ['label' => 'Ags', 'value' => 35],
                ['label' => 'Sep', 'value' => 58],
                ['label' => 'Okt', 'value' => 15],
                ['label' => 'Nov', 'value' => 22],
                ['label' => 'Des', 'value' => 11],
            ];

            $tteDataset = Dataset::where('slug', 'jumlah-tte-asn-banggai-kep-2025')->first();
            if ($tteDataset && is_array($tteDataset->jsonData)) {
                $mapped = [];
                foreach ($tteDataset->jsonData as $row) {
                    $row = (array) $row;
                    $bulan = $row['bulan'] ?? '';
                    $label = $monthMap[$bulan] ?? substr($bulan, 0, 3);
                    $value = (int) ($row['disetujui'] ?? $row['value'] ?? 0);
                    $mapped[] = ['label' => $label, 'value' => $value];
                }
                if (count($mapped) > 0) {
                    $tteMonthlyData = $mapped;
                }
            }

            // 3. Service Ticket Breakdown (100% Real DB counts)
            $countSelesai = ServiceRequest::where('status', 'SELESAI')->count();
            $countDiproses = ServiceRequest::where('status', 'DIPROSES')->count();
            $countPending = ServiceRequest::where('status', 'PENDING')->count();
            $countDitolak = ServiceRequest::where('status', 'DITOLAK')->count();

            $ticketBreakdown = [
                ['label' => 'Selesai', 'value' => $countSelesai, 'color' => '#10B981'],
                ['label' => 'Diproses', 'value' => $countDiproses, 'color' => '#F59E0B'],
                ['label' => 'Pending', 'value' => $countPending, 'color' => '#3B82F6'],
                ['label' => 'Ditolak', 'value' => $countDitolak, 'color' => '#EF4444'],
            ];

            // 4. Completed Service Requests (Layanan yang sudah terlaksana)
            $completedServices = ServiceRequest::where('status', 'SELESAI')
                ->orderBy('updatedAt', 'desc')
                ->take(10)
                ->get();

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'tteMonthlyData' => $tteMonthlyData,
                'ticketBreakdown' => $ticketBreakdown,
                'completedServices' => $completedServices,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
