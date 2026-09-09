<?php

namespace App\Filament\Resources\AppStatisticResource\Pages;

use App\Filament\Resources\AppStatisticResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageAppStatistics extends ManageRecords
{
    protected static string $resource = AppStatisticResource::class;

    protected static ?string $title = 'Kelola Statistik & Indeks Realtime';

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('syncVisitors')
                ->label('Sinkronkan Pengunjung')
                ->icon('heroicon-o-arrow-path')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Sinkronkan Total Kunjungan Otomatis')
                ->modalDescription('Tindakan ini akan memeriksa akumulasi log pengunjung nyata di tabel VisitorLog dan memastikan total terhitung akurat secara real-time.')
                ->action(function () {
                    $realCount = \App\Models\VisitorLog::count();
                    $stat = \App\Models\AppStatistic::firstOrCreate(
                        ['key' => 'TOTAL_VISITORS'],
                        [
                            'id'           => (string) \Illuminate\Support\Str::uuid(),
                            'label'        => 'Pengunjung Website',
                            'value'        => '1',
                            'suffix'       => '+',
                            'desc'         => 'Total kunjungan terakumulasi',
                            'icon'         => 'TrendingUp',
                            'color'        => 'emerald',
                            'is_published' => true,
                            'order_index'  => 1,
                        ]
                    );
                    $current = is_numeric($stat->value) ? (int) $stat->value : 0;
                    $newTotal = max($current, $realCount);
                    $stat->update(['value' => (string) $newTotal]);

                    \Filament\Notifications\Notification::make()
                        ->title('Sinkronisasi Berhasil')
                        ->body('Total pengunjung live saat ini: ' . number_format($newTotal, 0, ',', '.') . ' kunjungan.')
                        ->success()
                        ->send();
                }),

            Actions\CreateAction::make()
                ->label('Tambah Indeks Baru')
                ->modalHeading('Tambah Indeks / Data Statistik Baru'),
        ];
    }
}

