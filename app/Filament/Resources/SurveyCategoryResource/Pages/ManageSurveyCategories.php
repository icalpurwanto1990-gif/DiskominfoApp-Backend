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
            Actions\Action::make('settings')
                ->label('Pengaturan Widget Survey')
                ->icon('heroicon-o-adjustments-horizontal')
                ->color('warning')
                ->url('/admin/survey'),
            Actions\Action::make('responses')
                ->label('Lihat Respon Survey')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->color('gray')
                ->url('/admin/survey-responses'),
            Actions\CreateAction::make()
                ->label('Tambah Kategori Baru'),
        ];
    }
}
