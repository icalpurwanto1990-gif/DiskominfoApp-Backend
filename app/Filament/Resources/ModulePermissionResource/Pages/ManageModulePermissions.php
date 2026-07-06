<?php

namespace App\Filament\Resources\ModulePermissionResource\Pages;

use App\Filament\Resources\ModulePermissionResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageModulePermissions extends ManageRecords
{
    protected static string $resource = ModulePermissionResource::class;

    protected static ?string $title = 'Pengaturan Hak Akses Modul';

    protected function getHeaderActions(): array
    {
        return [
            // No create actions because modules are registered via seeder / code
        ];
    }
}
