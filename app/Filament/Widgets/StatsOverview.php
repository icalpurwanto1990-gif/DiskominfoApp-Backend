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
        $pendingPpidObjection = \App\Models\PpidObjection::where('status', 'PENDING')->count();
        $pendingService = ServiceRequest::where('status', 'PENDING')->count();
        $pendingTte = \App\Models\TteRequest::where('status', 'PENDING')->count();
        $pendingComplaint = \App\Models\ContactComplaint::where('status', 'PENDING')->count();
        $totalNews = Post::count();
        $totalSurvey = SurveyResponse::count();
        $avgSurveyRating = SurveyResponse::avg('rating') ?: 0;
        $formattedRating = number_format($avgSurveyRating, 1);

        return [
            Stat::make('Tiket Layanan OPD (Pending)', $pendingService)
                ->description('Menunggu verifikasi admin')
                ->descriptionIcon('heroicon-m-inbox-stack')
                ->color($pendingService > 0 ? 'warning' : 'success'),
            Stat::make('Permohonan TTE ASN (Pending)', $pendingTte)
                ->description('Menunggu verifikasi admin')
                ->descriptionIcon('heroicon-m-pencil-square')
                ->color($pendingTte > 0 ? 'info' : 'success'),
            Stat::make('Permohonan PPID (Pending)', $pendingPpid)
                ->description('Menunggu verifikasi admin')
                ->descriptionIcon('heroicon-m-document-text')
                ->color($pendingPpid > 0 ? 'danger' : 'success'),
            Stat::make('Keberatan PPID (Pending)', $pendingPpidObjection)
                ->description('Keberatan masuk')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($pendingPpidObjection > 0 ? 'danger' : 'success'),
            Stat::make('Pengaduan Pengguna (Pending)', $pendingComplaint)
                ->description('Aduan & kontak masuk')
                ->descriptionIcon('heroicon-m-chat-bubble-left-right')
                ->color($pendingComplaint > 0 ? 'warning' : 'success'),
            Stat::make('Survei Kepuasan Publik', "{$totalSurvey} Responden")
                ->description("Rata-rata rating: {$formattedRating} / 5.0")
                ->descriptionIcon('heroicon-m-presentation-chart-line')
                ->color('success'),
        ];
    }
}
