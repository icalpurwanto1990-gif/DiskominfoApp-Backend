<?php

namespace App\Filament\Resources\LeaderAgendaResource\Pages;

use App\Filament\Resources\LeaderAgendaResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageLeaderAgendas extends ManageRecords
{
    protected static string $resource = LeaderAgendaResource::class;

    protected static ?string $title = 'Manajemen Agenda Pimpinan';

    protected function getHeaderActions(): array
    {
        $user = auth()->user();
        
        // Show create action to OPD and SUPERADMIN/ADMIN
        $canCreate = $user && in_array($user->role, ['OPD', 'SUPERADMIN', 'ADMIN']);

        return $canCreate ? [
            Actions\CreateAction::make()
                ->label('Ajukan Agenda Pimpinan')
                ->modalHeading('Form Permohonan Agenda Pimpinan')
                ->mutateFormDataUsing(function (array $data): array {
                    $data['user_id'] = auth()->id();
                    $data['status'] = 'PENDING';
                    return $data;
                })
        ] : [];
    }
}
