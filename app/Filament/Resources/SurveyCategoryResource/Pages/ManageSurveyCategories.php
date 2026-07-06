<?php

namespace App\Filament\Resources\SurveyCategoryResource\Pages;

use App\Filament\Resources\SurveyCategoryResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageSurveyCategories extends ManageRecords
{
    protected static string $resource = SurveyCategoryResource::class;

    protected static ?string $title = 'Manajemen Kategori Layanan Survey';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
