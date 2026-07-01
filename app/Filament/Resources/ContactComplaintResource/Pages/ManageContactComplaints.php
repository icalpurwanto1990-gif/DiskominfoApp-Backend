<?php

namespace App\Filament\Resources\ContactComplaintResource\Pages;

use App\Filament\Resources\ContactComplaintResource;
use Filament\Resources\Pages\ManageRecords;

class ManageContactComplaints extends ManageRecords
{
    protected static string $resource = ContactComplaintResource::class;

    protected static ?string $title = 'Pengaduan & Kontak Masuk';

    protected function getHeaderActions(): array
    {
        return []; // We don't want admins creating complaints manually from admin panel, only view/reply.
    }
}
