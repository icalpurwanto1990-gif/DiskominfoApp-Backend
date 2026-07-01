<?php

namespace App\Filament\Resources\PpidObjectionResource\Pages;

use App\Filament\Resources\PpidObjectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManagePpidObjections extends ManageRecords
{
    protected static string $resource = PpidObjectionResource::class;

    protected static ?string $title = 'Kelola Keberatan PPID';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
