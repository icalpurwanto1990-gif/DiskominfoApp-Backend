<?php

namespace App\Filament\Resources\SplpConfigResource\Pages;

use App\Filament\Resources\SplpConfigResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageSplpConfigs extends ManageRecords
{
    protected static string $resource = SplpConfigResource::class;

    protected static ?string $title = 'Konfigurasi Integrasi SPLP (Pemerintah Pusat)';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Tambah Koneksi SPLP Pusat')
                ->modalHeading('Tambah Konfigurasi Gateway SPLP Pusat'),
        ];
    }
}
