<?php

namespace App\Filament\Resources\ServiceRequestResource\Pages;

use App\Filament\Resources\ServiceRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageServiceRequests extends ManageRecords
{
    protected static string $resource = ServiceRequestResource::class;

    protected static ?string $title = 'Kelola Tiket Pengajuan OPD';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
