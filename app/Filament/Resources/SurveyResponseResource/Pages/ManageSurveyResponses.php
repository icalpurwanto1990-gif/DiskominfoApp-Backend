<?php

namespace App\Filament\Resources\SurveyResponseResource\Pages;

use App\Filament\Resources\SurveyResponseResource;
use Filament\Resources\Pages\ManageRecords;

class ManageSurveyResponses extends ManageRecords
{
    protected static string $resource = SurveyResponseResource::class;

    protected static ?string $title = 'Daftar Respon & Hasil Survey Kepuasan';

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\Action::make('settings')
                ->label('Pengaturan Widget Survey')
                ->icon('heroicon-o-adjustments-horizontal')
                ->color('warning')
                ->url('/admin/survey'),
            \Filament\Actions\Action::make('categories')
                ->label('Kelola Kategori Survey')
                ->icon('heroicon-o-list-bullet')
                ->color('gray')
                ->url('/admin/survey-categories'),
        ];
    }
}
