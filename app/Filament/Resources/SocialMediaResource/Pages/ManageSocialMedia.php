<?php

namespace App\Filament\Resources\SocialMediaResource\Pages;

use App\Filament\Resources\SocialMediaResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageSocialMedia extends ManageRecords
{
    protected static string $resource = SocialMediaResource::class;

    protected static ?string $title = 'Kelola Media Sosial Portal';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Tambah Media Sosial Baru'),
        ];
    }
}
