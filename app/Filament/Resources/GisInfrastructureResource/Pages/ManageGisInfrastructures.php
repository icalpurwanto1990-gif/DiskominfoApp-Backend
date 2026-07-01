<?php

namespace App\Filament\Resources\GisInfrastructureResource\Pages;

use App\Filament\Resources\GisInfrastructureResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageGisInfrastructures extends ManageRecords
{
    protected static string $resource = GisInfrastructureResource::class;

    protected static ?string $title = 'Kelola Penanda Lokasi Sebaran GIS';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
