<?php

namespace App\Filament\Resources\DigitalServiceResource\Pages;

use App\Filament\Resources\DigitalServiceResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageDigitalServices extends ManageRecords
{
    protected static string $resource = DigitalServiceResource::class;

    protected static ?string $title = 'Kelola Katalog Layanan Digital';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->mutateFormDataUsing(function (array $data): array {
                    if (($data['icon_type'] ?? 'preset') === 'preset') {
                        $data['icon'] = $data['preset_icon'] ?? 'Globe';
                    } else {
                        $uploaded = $data['custom_icon_path'] ?? null;
                        if (is_array($uploaded)) {
                            $data['icon'] = reset($uploaded);
                        } else {
                            $data['icon'] = $uploaded;
                        }
                    }
                    unset($data['icon_type'], $data['preset_icon'], $data['custom_icon_path']);

                    return $data;
                }),
        ];
    }
}
