<?php

namespace App\Filament\Resources\InteropLogResource\Pages;

use App\Filament\Resources\InteropLogResource;
use App\Models\InteropLog;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;

class ManageInteropLogs extends ManageRecords
{
    protected static string $resource = InteropLogResource::class;

    protected static ?string $title = 'Log Transaksi Interoperabilitas SPBE (MPP & SPLP)';

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('clearLogs')
                ->label('Bersihkan Log Lama')
                ->icon('heroicon-o-trash')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Hapus Seluruh Riwayat Log?')
                ->modalDescription('Tindakan ini akan mengosongkan riwayat audit transaksi interoperabilitas.')
                ->action(function () {
                    InteropLog::truncate();
                    Notification::make()
                        ->title('Riwayat log berhasil dikosongkan.')
                        ->success()
                        ->send();
                }),
        ];
    }
}
