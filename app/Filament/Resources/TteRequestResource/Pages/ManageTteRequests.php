<?php

namespace App\Filament\Resources\TteRequestResource\Pages;

use App\Filament\Resources\TteRequestResource;
use Filament\Resources\Pages\ManageRecords;

class ManageTteRequests extends ManageRecords
{
    protected static string $resource = TteRequestResource::class;

    protected static ?string $title = 'Manajemen Permohonan TTE ASN';

    protected function getHeaderActions(): array
    {
        return []; // The admin reviews, user creates them from frontend portal, so no creation from admin.
    }
}
