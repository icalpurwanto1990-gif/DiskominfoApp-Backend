<?php

namespace App\Filament\Resources\ApiClientResource\Pages;

use App\Filament\Resources\ApiClientResource;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ManageApiClients extends ManageRecords
{
    protected static string $resource = ApiClientResource::class;

    protected static ?string $title = 'Manajemen Klien API (MPP & Sistem Eksternal)';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Buat Kunci API Baru')
                ->modalHeading('Generate Kunci API Baru untuk Mitra / MPP')
                ->mutateFormDataBeforeCreate(function (array $data): array {
                    $secret = Str::random(40);
                    $fullApiKey = 'bkp_' . Str::random(8) . '_' . $secret;

                    $data['id'] = (string) Str::uuid();
                    $data['client_id'] = 'mpp_' . Str::random(10);
                    $data['api_key_hash'] = Hash::make($fullApiKey);
                    $data['api_key_prefix'] = substr($fullApiKey, 0, 12) . '...';

                    session()->flash('new_generated_api_key', $fullApiKey);

                    return $data;
                })
                ->after(function () {
                    $newKey = session()->get('new_generated_api_key');
                    if ($newKey) {
                        Notification::make()
                            ->title('Kunci API Berhasil Dibuat!')
                            ->body("Salin dan simpan kunci ini sekarang karena tidak akan ditampilkan kembali:<br><br><code style='padding: 8px; background: #0f172a; color: #34d399; border-radius: 6px; display: block; font-family: monospace; font-size: 11px; word-break: break-all;'>{$newKey}</code>")
                            ->success()
                            ->persistent()
                            ->send();
                    }
                }),
        ];
    }
}
