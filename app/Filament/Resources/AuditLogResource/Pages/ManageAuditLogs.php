<?php

namespace App\Filament\Resources\AuditLogResource\Pages;

use App\Filament\Resources\AuditLogResource;
use Filament\Resources\Pages\ManageRecords;

class ManageAuditLogs extends ManageRecords
{
    protected static string $resource = AuditLogResource::class;

    protected static ?string $title = 'Log Audit Aktivitas Administrator';

    protected function getHeaderActions(): array
    {
        return []; // Empty means read-only, no Create button
    }
}
