<?php

namespace App\Filament\Resources\PpidRequestResource\Pages;

use App\Filament\Resources\PpidRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManagePpidRequests extends ManageRecords
{
    protected static string $resource = PpidRequestResource::class;

    protected static ?string $title = 'Kelola Permohonan Informasi PPID';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
