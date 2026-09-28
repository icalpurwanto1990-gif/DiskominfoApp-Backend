<?php

namespace App\Filament\Resources\GisInfrastructureResource\Pages;

use App\Filament\Resources\GisInfrastructureResource;
use App\Models\GisInfrastructure;
use Filament\Actions;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\View;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;
use Illuminate\Support\Str;

class ManageGisInfrastructures extends ManageRecords
{
    protected static string $resource = GisInfrastructureResource::class;

    protected static ?string $title = 'Kelola Penanda Lokasi Sebaran GIS';

    protected function getHeaderActions(): array
    {
        return [
            // ── Import Excel Action ───────────────────────────────────────
            Action::make('importExcel')
                ->label('Import Excel')
                ->icon('heroicon-o-document-arrow-up')
                ->color('info')
                ->modalHeading('Import Data GIS dari File Excel')
                ->modalDescription('Upload file Excel (.xlsx/.xls/.csv) berisi data titik infrastruktur GIS. Sistem akan memproses dan menyimpan seluruh baris valid secara otomatis.')
                ->modalWidth('4xl')
                ->modalSubmitActionLabel('Proses & Simpan ke Database')
                ->form([
                    View::make('filament.gis-excel-import'),
                    Textarea::make('import_rows_json')
                        ->label('')
                        ->placeholder('[]')
                        ->hidden()
                        ->dehydrated(true)
                        ->extraAttributes(['id' => 'gis-import-json-field', 'style' => 'display:none!important']),
                ])
                ->action(function (array $data): void {
                    // Data JSON dikirim dari Alpine.js via hidden input 'import_rows_json'
                    $rawJson = $data['import_rows_json'] ?? '[]';
                    $rows = json_decode($rawJson, true);

                    if (empty($rows) || ! is_array($rows)) {
                        Notification::make()
                            ->title('Tidak ada data')
                            ->body('Tidak ada baris valid yang bisa diimpor. Pastikan file Excel sudah diisi dan format kolom benar.')
                            ->warning()
                            ->send();
                        return;
                    }

                    $validTypes = ['BTS_TOWER', 'BLANKSPOT', 'VSAT', 'FIBER_OPTIK'];
                    $inserted = 0;
                    $skipped  = 0;

                    foreach ($rows as $row) {
                        try {
                            $name      = trim($row['name'] ?? '');
                            $type      = strtoupper(trim($row['type'] ?? ''));
                            $latitude  = (float) ($row['latitude'] ?? 0);
                            $longitude = (float) ($row['longitude'] ?? 0);
                            $status    = strtoupper(trim($row['status'] ?? 'AKTIF'));
                            $desc      = trim($row['description'] ?? '');

                            if (empty($name) || ! in_array($type, $validTypes)) {
                                $skipped++;
                                continue;
                            }

                            if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
                                $skipped++;
                                continue;
                            }

                            GisInfrastructure::create([
                                'id'        => (string) Str::uuid(),
                                'name'      => $name,
                                'type'      => $type,
                                'latitude'  => $latitude,
                                'longitude' => $longitude,
                                'status'    => $status ?: 'AKTIF',
                                'details'   => ['description' => $desc],
                            ]);

                            $inserted++;
                        } catch (\Exception $e) {
                            $skipped++;
                        }
                    }

                    if ($inserted > 0) {
                        Notification::make()
                            ->title("✅ Import berhasil!")
                            ->body("{$inserted} titik GIS berhasil ditambahkan" . ($skipped ? ", {$skipped} baris dilewati." : "."))
                            ->success()
                            ->send();
                    } else {
                        Notification::make()
                            ->title('Import gagal')
                            ->body('Tidak ada data valid yang berhasil diimpor. Periksa format kolom file Excel Anda.')
                            ->danger()
                            ->send();
                    }
                }),

            Actions\CreateAction::make(),
        ];
    }
}
