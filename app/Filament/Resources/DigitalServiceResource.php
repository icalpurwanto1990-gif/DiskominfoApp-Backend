<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DigitalServiceResource\Pages;
use App\Models\DigitalService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class DigitalServiceResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = DigitalService::class;

    protected static ?string $navigationIcon = 'heroicon-o-cpu-chip';

    protected static ?string $navigationLabel = 'Katalog Layanan';

    protected static ?string $modelLabel = 'Layanan';

    protected static ?string $pluralModelLabel = 'Layanan';

    protected static ?string $navigationGroup = 'Layanan Digital';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->label('Nama Layanan')
                    ->live(onBlur: true)
                    ->afterStateUpdated(function (string $operation, $state, Set $set) {
                        if ($operation === 'create') {
                            $set('slug', Str::slug($state));
                        }
                    }),
                Forms\Components\TextInput::make('slug')
                    ->required()
                    ->maxLength(2000)
                    ->unique(ignoreRecord: true)
                    ->label('Slug URL / Link Layanan Eksternal')
                    ->helperText('Masukkan slug URL internal (misal: tte) ATAU tautan URL luar lengkap jika layanan ini dikelola eksternal (misal: https://www.lapor.go.id/instansi/pemkab-banggai)'),
                Forms\Components\Radio::make('icon_type')
                    ->options([
                        'preset' => 'Gunakan Icon Bawaan (Lucide)',
                        'custom' => 'Unggah Icon Kustom (Gambar/SVG)',
                    ])
                    ->default('preset')
                    ->label('Tipe Icon')
                    ->live()
                    ->afterStateHydrated(function ($state, $record, Set $set) {
                        if ($record && $record->icon) {
                            $presetIcons = [
                                'Globe', 'Shield', 'ShieldCheck', 'Video', 'Database',
                                'FileText', 'File', 'Mail', 'Server', 'Network',
                                'Wifi', 'Monitor', 'HardDrive', 'Layers', 'Users',
                                'Phone', 'Wrench', 'Layout',
                            ];
                            $isPreset = in_array($record->icon, $presetIcons);
                            if ($isPreset) {
                                $set('icon_type', 'preset');
                                $set('preset_icon', $record->icon);
                            } else {
                                $set('icon_type', 'custom');
                                $set('custom_icon_path', $record->icon);
                            }
                        }
                    }),
                Forms\Components\Select::make('preset_icon')
                    ->options([
                        'Globe'       => 'Globe (Umum / Jaringan)',
                        'Shield'      => 'Shield (Keamanan / TTE)',
                        'ShieldCheck' => 'ShieldCheck (Keamanan Terverifikasi)',
                        'Video'       => 'Video (Zoom / Video Conference)',
                        'Database'    => 'Database (Hosting / Cloud)',
                        'FileText'    => 'FileText (Persuratan / Dokumen)',
                        'File'        => 'File (Berkas Umum)',
                        'Mail'        => 'Mail (Email / Surat)',
                        'Server'      => 'Server (Server / Infrastruktur)',
                        'Network'     => 'Network (Jaringan Komputer)',
                        'Wifi'        => 'Wifi (Koneksi Nirkabel)',
                        'Monitor'     => 'Monitor (Aplikasi / Sistem)',
                        'HardDrive'   => 'HardDrive (Storage / Backup)',
                        'Layers'      => 'Layers (Layanan Terpadu)',
                        'Users'       => 'Users (SDM / Pengguna)',
                        'Phone'       => 'Phone (Kontak / Telepon)',
                        'Wrench'      => 'Wrench (Teknis / Perbaikan)',
                        'Layout'      => 'Layout (Portal / Website)',
                    ])
                    ->label('Pilih Icon Preset')
                    ->visible(function (Get $get) {
                        return $get('icon_type') === 'preset';
                    })
                    ->live(),
                Forms\Components\FileUpload::make('custom_icon_path')
                    ->image()
                    ->disk('uploads')
                    ->directory('services/icons')
                    ->label('Unggah Gambar Icon (SVG/PNG transparan)')
                    ->visible(function (Get $get) {
                        return $get('icon_type') === 'custom';
                    })
                    ->live(),
                Forms\Components\Select::make('color')
                    ->options([
                        'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' => 'Emerald (Hijau)',
                        'bg-blue-500/10 text-blue-600 border-blue-500/20' => 'Blue (Biru)',
                        'bg-amber-500/10 text-amber-600 border-amber-500/20' => 'Amber (Kuning)',
                        'bg-purple-500/10 text-purple-600 border-purple-500/20' => 'Purple (Ungu)',
                        'bg-rose-500/10 text-rose-600 border-rose-500/20' => 'Rose (Merah)',
                        'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-350' => 'Slate (Abu-abu / Default)',
                    ])
                    ->default('bg-emerald-500/10 text-emerald-600 border-emerald-500/20')
                    ->required()
                    ->label('Warna Aksen Kartu'),
                Forms\Components\Toggle::make('active')
                    ->required()
                    ->default(true)
                    ->label('Tampilkan Layanan di Web Depan'),
                Forms\Components\Textarea::make('description')
                    ->required()
                    ->columnSpanFull()
                    ->label('Deskripsi Layanan'),
                Forms\Components\FileUpload::make('sop_file')
                    ->disk('uploads')
                    ->directory('services/sops')
                    ->acceptedFileTypes(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
                    ->openable()
                    ->downloadable()
                    ->columnSpanFull()
                    ->label('Dokumen Petunjuk Pengisian / SOP (PDF / Gambar / Doc)')
                    ->helperText('Unggah berkas SOP atau Petunjuk Pengisian agar pemohon dapat membaca/mengunduh panduan layanan ini.'),
                Forms\Components\Repeater::make('form_schema')
                    ->label('Formulir Layanan (Dynamic Fields)')
                    ->helperText('Definisikan field formulir tambahan yang akan diisi oleh pemohon untuk layanan ini.')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->label('Key / Nama Field (huruf kecil & tanpa spasi)')
                            ->placeholder('contoh: nip, nomor_plat')
                            ->rules(['regex:/^[a-z0-9_]+$/'])
                            ->distinct()
                            ->columnSpan(2),
                        Forms\Components\TextInput::make('label')
                            ->required()
                            ->label('Label Input (ditampilkan di frontend)')
                            ->placeholder('contoh: NIP Pegawai')
                            ->columnSpan(3),
                        Forms\Components\Select::make('type')
                            ->required()
                            ->label('Tipe Input')
                            ->options([
                                'text' => 'Teks Singkat',
                                'textarea' => 'Teks Paragraf',
                                'number' => 'Angka',
                                'date' => 'Tanggal',
                                'time' => 'Waktu',
                                'email' => 'Email',
                                'select' => 'Pilihan (Dropdown)',
                                'file' => 'Unggah File (PDF/Gambar)',
                            ])
                            ->live()
                            ->columnSpan(3),
                        Forms\Components\Toggle::make('required')
                            ->label('Wajib Diisi')
                            ->default(false)
                            ->inline(false)
                            ->columnSpan(1),
                        Forms\Components\TextInput::make('placeholder')
                            ->label('Placeholder / Hint (Opsional)')
                            ->columnSpan(3),
                        Forms\Components\TextInput::make('options')
                            ->label('Pilihan Dropdown (Pisahkan dengan koma jika tipe Dropdown)')
                            ->placeholder('contoh: Pilihan A, Pilihan B')
                            ->visible(fn (Get $get) => $get('type') === 'select')
                            ->required(fn (Get $get) => $get('type') === 'select')
                            ->columnSpan(12),
                    ])
                    ->columns(12)
                    ->columnSpanFull()
                    ->default([]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Layanan'),
                Tables\Columns\TextColumn::make('icon')
                    ->label('Icon / Gambar')
                    ->formatStateUsing(function ($state) {
                        $presets = [
                            'Globe', 'Shield', 'ShieldCheck', 'Video', 'Database',
                            'FileText', 'File', 'Mail', 'Server', 'Network',
                            'Wifi', 'Monitor', 'HardDrive', 'Layers', 'Users',
                            'Phone', 'Wrench', 'Layout',
                        ];
                        return in_array($state, $presets) ? "Preset: {$state}" : 'Kustom (Gambar)';
                    })
                    ->badge()
                    ->color(function ($state) {
                        $presets = [
                            'Globe', 'Shield', 'ShieldCheck', 'Video', 'Database',
                            'FileText', 'File', 'Mail', 'Server', 'Network',
                            'Wifi', 'Monitor', 'HardDrive', 'Layers', 'Users',
                            'Phone', 'Wrench', 'Layout',
                        ];
                        return in_array($state, $presets) ? 'info' : 'success';
                    }),
                Tables\Columns\TextColumn::make('sop_file')
                    ->label('Petunjuk / SOP')
                    ->formatStateUsing(fn ($state) => $state ? 'Ada SOP' : 'Tanpa SOP')
                    ->badge()
                    ->color(fn ($state) => $state ? 'success' : 'gray')
                    ->url(fn ($record) => $record && $record->sop_file ? '/uploads/' . $record->sop_file : null, true)
                    ->default('-'),
                Tables\Columns\IconColumn::make('active')
                    ->boolean()
                    ->label('Aktif'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Tanggal Dibuat'),
            ])
            ->defaultSort('createdAt', 'desc')
            ->actions([
                Tables\Actions\EditAction::make()
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
            'index' => Pages\ManageDigitalServices::route('/'),
        ];
    }
}
