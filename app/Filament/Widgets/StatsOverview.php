<?php

namespace App\Filament\Widgets;

use App\Models\Post;
use App\Models\PpidRequest;
use App\Models\ServiceRequest;
use App\Models\SurveyResponse;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $pendingPpid = PpidRequest::where('status', 'PENDING')->count();
        $pendingService = ServiceRequest::where('status', 'PENDING')->count();
        $totalNews = Post::count();
        $totalSurvey = SurveyResponse::count();
        $avgSurveyRating = SurveyResponse::avg('rating') ?: 0;
        $formattedRating = number_format($avgSurveyRating, 1);

        return [
            Stat::make('Berita & Artikel', $totalNews)
                ->description('Total berita & pengumuman terbit')
                ->descriptionIcon('heroicon-m-newspaper')
                ->color('success'),
            Stat::make('Permohonan PPID (Pending)', $pendingPpid)
                ->description('Menunggu verifikasi admin')
                ->descriptionIcon('heroicon-m-document-text')
                ->color($pendingPpid > 0 ? 'danger' : 'success'),
            Stat::make('Pengajuan Layanan (Pending)', $pendingService)
                ->description('Menunggu verifikasi admin')
                ->descriptionIcon('heroicon-m-inbox-stack')
                ->color($pendingService > 0 ? 'warning' : 'success'),
            Stat::make('Survei Kepuasan Publik', "{$totalSurvey} Responden")
                ->description("Rata-rata rating: {$formattedRating} / 5.0")
                ->descriptionIcon('heroicon-m-presentation-chart-line')
                ->color('info'),
        ];
    }
}
