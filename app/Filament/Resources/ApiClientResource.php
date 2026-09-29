<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ApiClientResource\Pages;
use App\Models\ApiClient;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiClientResource extends Resource
{
    use \App\Traits\HasDynamicPermission;

    protected static ?string $model = ApiClient::class;

    protected static ?string $navigationIcon = 'heroicon-o-key';

    protected static ?string $navigationLabel = 'Manajemen Klien API (MPP)';

    protected static ?string $modelLabel = 'Klien API';

    protected static ?string $pluralModelLabel = 'Klien API';

    protected static ?string $navigationGroup = 'Integrasi & SPBE';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Identitas Klien & Hak Akses')
                    ->description('Tentukan aplikasi atau instansi yang akan mengonsumsi API Diskominfo (contoh: Aplikasi MPP Banggai Kepulauan)')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->label('Nama Aplikasi / Instansi Mitra')
                            ->placeholder('contoh: Portal Mal Pelayanan Publik (MPP)'),

                        Forms\Components\CheckboxList::make('allowed_scopes')
                            ->label('Hak Akses Endpoint (Scopes)')
                            ->options([
                                'agenda:read'    => 'agenda:read — Baca Jadwal Agenda Pimpinan (Display & Informasi MPP)',
                                'agenda:write'   => 'agenda:write — Ajukan Permohonan Agenda Pimpinan dari Loket MPP',
                                'service:read'   => 'service:read — Lihat Katalog Layanan Digital Diskominfo',
                                'service:apply'  => 'service:apply — Ajukan Permohonan Layanan Diskominfo dari MPP',
                                '*'              => '* — Akses Penuh ke Seluruh Endpoint Interoperabilitas',
                            ])
                            ->default(['agenda:read', 'service:read', 'service:apply'])
                            ->columns(1)
                            ->required(),

                        Forms\Components\TextInput::make('ip_whitelist')
                            ->label('IP Whitelist (Opsional)')
                            ->placeholder('contoh: 103.123.45.67, 192.168.1.50')
                            ->helperText('Kosongkan untuk mengizinkan request dari semua IP address.'),

                        Forms\Components\DateTimePicker::make('expires_at')
                            ->label('Masa Berlaku Kunci (Opsional)')
                            ->helperText('Kosongkan jika kunci API berlaku permanen.'),

                        Forms\Components\Toggle::make('is_active')
                            ->label('Kunci API Aktif')
                            ->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->label('Nama Klien / Mitra'),

                Tables\Columns\TextColumn::make('api_key_prefix')
                    ->label('Prefix Token')
                    ->fontFamily('mono')
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('allowed_scopes')
                    ->label('Scopes')
                    ->badge()
                    ->color('success'),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Status'),

                Tables\Columns\TextColumn::make('last_used_at')
                    ->dateTime('d M Y, H:i')
                    ->label('Terakhir Dipakai')
                    ->placeholder('Belum pernah'),

                Tables\Columns\TextColumn::make('expires_at')
                    ->dateTime('d M Y')
                    ->label('Kedaluwarsa')
                    ->placeholder('Permanen'),
            ])
            ->actions([
                Tables\Actions\Action::make('regenerate')
                    ->label('Regenerasi')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalHeading('Regenerasi Kunci API')
                    ->modalDescription('Kunci lama akan langsung kedaluwarsa. Sistem MPP / pemohon harus memperbarui token mereka dengan kunci baru. Lanjutkan?')
                    ->action(function (ApiClient $record) {
                        $secret = Str::random(40);
                        $fullApiKey = 'bkp_' . Str::random(8) . '_' . $secret;
                        $record->update([
                            'api_key_hash'   => Hash::make($fullApiKey),
                            'api_key_prefix' => substr($fullApiKey, 0, 12) . '...',
                        ]);

                        Notification::make()
                            ->title('Kunci API Baru Berhasil Dibuat!')
                            ->body("Silakan salin token baru ini sekarang:<br><br><code style='padding: 8px; background: #0f172a; color: #34d399; border-radius: 6px; display: block; font-family: monospace; font-size: 11px; word-break: break-all;'>{$fullApiKey}</code>")
                            ->warning()
                            ->persistent()
                            ->send();
                    }),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageApiClients::route('/'),
        ];
    }
}
