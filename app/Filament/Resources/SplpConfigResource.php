<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SplpConfigResource\Pages;
use App\Models\SplpConfig;
use App\Services\SplpClientService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SplpConfigResource extends Resource
{
    use \App\Traits\HasDynamicPermission;

    protected static ?string $model = SplpConfig::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrows-right-left';

    protected static ?string $navigationLabel = 'Integrasi SPLP Pusat';

    protected static ?string $modelLabel = 'Konfigurasi SPLP';

    protected static ?string $pluralModelLabel = 'Koneksi SPLP Pusat';

    protected static ?string $navigationGroup = 'Integrasi & SPBE';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Parameter Gateway SPLP Pemerintah Pusat')
                    ->description('Konfigurasi kredensial resmi Sistem Penghubung Layanan Pemerintah (SPLP) dari Kementerian/Pusat')
                    ->schema([
                        Forms\Components\TextInput::make('service_name')
                            ->required()
                            ->maxLength(255)
                            ->label('Nama Layanan / Instansi Pusat')
                            ->placeholder('contoh: Gateway SPLP Kemenkominfo RI'),

                        Forms\Components\TextInput::make('base_url')
                            ->required()
                            ->url()
                            ->maxLength(255)
                            ->label('URL Gateway SPLP')
                            ->placeholder('https://splp.layanan.go.id/api/v1')
                            ->helperText('Alamat basis gateway resmi SPLP nasional atau instansi pusat.'),

                        Forms\Components\TextInput::make('service_code')
                            ->maxLength(100)
                            ->label('Kode Layanan / Service ID')
                            ->placeholder('contoh: SPLP-KOMINFO-001'),

                        Forms\Components\Select::make('auth_type')
                            ->required()
                            ->label('Metode Autentikasi')
                            ->options([
                                'API_KEY'      => 'API Key (Header X-API-KEY)',
                                'BEARER_TOKEN' => 'Bearer Token (Header Authorization: Bearer)',
                                'BASIC'        => 'HTTP Basic Auth',
                                'OAUTH2'       => 'OAuth2 Client Credentials',
                            ])
                            ->default('API_KEY'),

                        Forms\Components\TextInput::make('client_id')
                            ->maxLength(255)
                            ->label('Client ID / Username')
                            ->placeholder('ID resmi yang diterbitkan admin SPLP nasional'),

                        Forms\Components\TextInput::make('client_secret')
                            ->password()
                            ->revealable()
                            ->maxLength(1000)
                            ->label('Client Secret / Token Rahasia')
                            ->placeholder('Kunci rahasia / API token')
                            ->helperText('Tersimpan dengan enkripsi standar keamanan informasi.'),

                        Forms\Components\Toggle::make('is_active')
                            ->label('Aktifkan Koneksi Ini')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('service_name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->label('Layanan Pusat'),

                Tables\Columns\TextColumn::make('base_url')
                    ->limit(35)
                    ->label('Gateway URL')
                    ->fontFamily('mono')
                    ->color('gray'),

                Tables\Columns\TextColumn::make('auth_type')
                    ->badge()
                    ->color('info')
                    ->label('Metode'),

                Tables\Columns\TextColumn::make('last_status')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'ONLINE' => 'success',
                        'ERROR'  => 'danger',
                        default  => 'warning',
                    })
                    ->label('Status Koneksi')
                    ->placeholder('Belum Ditest'),

                Tables\Columns\TextColumn::make('last_sync_at')
                    ->dateTime('d M Y, H:i')
                    ->label('Terakhir Ditest')
                    ->placeholder('-'),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Aktif'),
            ])
            ->actions([
                Tables\Actions\Action::make('testConnection')
                    ->label('Test Koneksi')
                    ->icon('heroicon-o-bolt')
                    ->color('info')
                    ->action(function (SplpConfig $record) {
                        $splpService = app(SplpClientService::class);
                        $result = $splpService->testConnection($record);

                        if ($result['success']) {
                            Notification::make()
                                ->title('Koneksi SPLP Berhasil!')
                                ->body("{$result['message']} (Latensi: {$result['latency_ms']} ms)")
                                ->success()
                                ->send();
                        } else {
                            Notification::make()
                                ->title('Koneksi SPLP Gagal / Tertolak')
                                ->body("{$result['message']}")
                                ->danger()
                                ->send();
                        }
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
            'index' => Pages\ManageSplpConfigs::route('/'),
        ];
    }
}
