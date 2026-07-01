<?php

namespace App\Filament\Resources\PartnerLinkResource\Pages;

use App\Filament\Resources\PartnerLinkResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManagePartnerLinks extends ManageRecords
{
    protected static string $resource = PartnerLinkResource::class;

    protected static ?string $title = 'Kelola Link Kolaborasi & Mitra';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Tambah Link Mitra Baru'),
        ];
    }
}
