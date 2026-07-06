<?php

namespace App\Filament\Widgets;

use App\Models\PpidRequest;
use App\Models\ServiceRequest;
use App\Models\TteRequest;
use Filament\Widgets\ChartWidget;

class ServiceRequestsChart extends ChartWidget
{
    protected static ?string $heading = 'Tren Pengajuan Layanan (6 Bulan Terakhir)';

    protected static ?int $sort = 2;

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $months = [];
        $serviceCounts = [];
        $tteCounts = [];
        $ppidCounts = [];

        // Loop over the last 6 months to construct chart data
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = $date->translatedFormat('F Y');
            
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $serviceCounts[] = ServiceRequest::whereBetween('createdAt', [$start, $end])->count();
            $tteCounts[] = TteRequest::whereBetween('createdAt', [$start, $end])->count();
            $ppidCounts[] = PpidRequest::whereBetween('createdAt', [$start, $end])->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Tiket Layanan OPD',
                    'data' => $serviceCounts,
                    'borderColor' => '#10B981', // Emerald
                    'backgroundColor' => 'rgba(16, 185, 129, 0.05)',
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Permohonan TTE ASN',
                    'data' => $tteCounts,
                    'borderColor' => '#3B82F6', // Blue
                    'backgroundColor' => 'rgba(59, 130, 246, 0.05)',
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Permohonan Informasi PPID',
                    'data' => $ppidCounts,
                    'borderColor' => '#F59E0B', // Amber
                    'backgroundColor' => 'rgba(245, 158, 11, 0.05)',
                    'tension' => 0.3,
                ],
            ],
            'labels' => $months,
        ];
    }
}
