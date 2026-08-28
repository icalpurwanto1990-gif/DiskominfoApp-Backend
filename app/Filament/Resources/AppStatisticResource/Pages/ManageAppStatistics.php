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
            Actions\CreateAction::make()
                ->label('Tambah Indeks Baru')
                ->modalHeading('Tambah Indeks / Data Statistik Baru'),
        ];
    }
}

