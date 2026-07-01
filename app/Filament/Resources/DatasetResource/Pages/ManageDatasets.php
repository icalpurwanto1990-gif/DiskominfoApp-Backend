<?php

namespace App\Filament\Resources\DatasetResource\Pages;

use App\Filament\Resources\DatasetResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageDatasets extends ManageRecords
{
    protected static string $resource = DatasetResource::class;

    protected static ?string $title = 'Kelola Satu Data Sektoral';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
