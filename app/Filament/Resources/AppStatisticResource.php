<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AppStatisticResource\Pages;
use App\Models\AppStatistic;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AppStatisticResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = AppStatistic::class;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?string $navigationLabel = 'Statistik Landing Page';

    protected static ?string $modelLabel = 'Statistik';

    protected static ?string $pluralModelLabel = 'Statistik Realtime';

    protected static ?string $navigationGroup = 'Statistik & Kinerja';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Data Indeks & Statistik')
                    ->description('Kelola data indikator, indeks keterbukaan, maupun capaian kinerja yang dipublikasikan ke publik.')
                    ->schema([
                        Forms\Components\TextInput::make('label')
                            ->required()
                            ->maxLength(100)
                            ->label('Judul / Nama Indeks')
                            ->placeholder('e.g., Index Keterbukaan Informasi Publik (KIP)')
                            ->helperText('Nama/Judul utama yang tampil pada kartu statistik di web client.')
                            ->columnSpan(2),

                        Forms\Components\TextInput::make('key')
                            ->required()
                            ->maxLength(100)
                            ->label('Kunci Database (Key)')
                            ->placeholder('e.g., INDEX_KIP_2025')
                            ->helperText('Kunci unik sistem. Gunakan huruf kapital, angka, dan underscore.')
                            ->columnSpan(1),

                        Forms\Components\TextInput::make('value')
                            ->required()
                            ->maxLength(50)
                            ->label('Nilai Statistik (Value)')
                            ->placeholder('e.g., 85.20 atau 377 atau A')
                            ->helperText('Nilai capaian (bisa berupa angka, desimal, huruf, atau kategori).')
                            ->columnSpan(1),

                        Forms\Components\TextInput::make('suffix')
                            ->maxLength(20)
                            ->label('Satuan / Suffix')
                            ->placeholder('e.g., % atau + atau /100')
                            ->helperText('Satuan yang menempel setelah nilai.')
                            ->columnSpan(1),

                        Forms\Components\TextInput::make('desc')
                            ->maxLength(200)
                            ->label('Keterangan / Deskripsi Singkat')
                            ->placeholder('e.g., Penilaian KIP Tahun 2025 / Kunjungan tahun ini')
                            ->helperText('Keterangan kecil di bawah judul kartu pada web client.')
                            ->columnSpan(2),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Tampilan & Status Publikasi')
                    ->description('Atur estetika visual kartu dan visibilitas di halaman depan.')
                    ->schema([
                        Forms\Components\Select::make('icon')
                            ->label('Ikon Kartu')
                            ->options([
                                'BarChart3' => '📊 BarChart3 (Grafik Batang)',
                                'TrendingUp' => '📈 TrendingUp (Tren Meningkat)',
                                'ShieldCheck' => '🛡️ ShieldCheck (Keamanan / TTE)',
                                'Users' => '👥 Users (Pengguna / Masyarakat)',
                                'Cpu' => '💻 Cpu (Aplikasi / Sistem)',
                                'Database' => '🗄️ Database (Basis Data)',
                                'Globe' => '🌐 Globe (Website / Portal)',
                                'Server' => '🖥️ Server (Infrastruktur)',
                                'FileText' => '📄 FileText (Dokumen / Regulasi)',
                                'Map' => '🗺️ Map (Peta / GIS)',
                                'Award' => '🏆 Award (Penghargaan / Indeks)',
                                'Target' => '🎯 Target (Capaian / Sasaran)',
                                'Activity' => '⚡ Activity (Aktivitas / Realtime)',
                                'Zap' => '⚡ Zap (Kecepatan / Respons)',
                                'Star' => '⭐ Star (Bintang / Mutu)',
                                'BookOpen' => '📖 BookOpen (Pedoman)',
                                'CheckSquare' => '✅ CheckSquare (Verifikasi)',
                            ])
                            ->default('BarChart3')
                            ->searchable()
                            ->helperText('Ikon Lucide yang akan dirender di web client.'),

                        Forms\Components\Select::make('color')
                            ->label('Warna Tema')
                            ->options([
                                'emerald' => '🟢 Emerald (Hijau)',
                                'blue' => '🔵 Blue (Biru)',
                                'purple' => '🟣 Purple (Ungu)',
                                'amber' => '🟡 Amber (Kuning / Emas)',
                                'red' => '🔴 Red (Merah)',
                                'indigo' => '🟣 Indigo (Nila)',
                                'teal' => '🟢 Teal (Biru Kehijauan)',
                                'rose' => '🌸 Rose (Merah Muda)',
                            ])
                            ->default('emerald')
                            ->helperText('Palette warna border, badge, dan highlight kartu.'),

                        Forms\Components\TextInput::make('order_index')
                            ->numeric()
                            ->default(0)
                            ->label('Urutan Tampilan')
                            ->helperText('Angka lebih kecil tampil lebih awal di halaman beranda.')
                            ->required(),

                        Forms\Components\Toggle::make('is_published')
                            ->label('Publikasikan ke Halaman Utama')
                            ->helperText('Aktifkan agar data indeks ini tampil langsung pada web client.')
                            ->default(true)
                            ->inline(false),
                    ])
                    ->columns(4),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_index')
                    ->sortable()
                    ->label('Urutan')
                    ->alignCenter()
                    ->width('60px'),

                Tables\Columns\TextColumn::make('label')
                    ->label('Judul & Keterangan')
                    ->description(fn (AppStatistic $record): ?string => $record->desc)
                    ->searchable()
                    ->sortable()
                    ->wrap()
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('key')
                    ->badge()
                    ->color('gray')
                    ->searchable()
                    ->label('Kunci (Key)'),

                Tables\Columns\TextColumn::make('value')
                    ->label('Nilai Publikasi')
                    ->formatStateUsing(fn ($state, AppStatistic $record): string => "{$state}" . ($record->suffix ? " {$record->suffix}" : ''))
                    ->sortable()
                    ->weight('bold')
                    ->color('primary'),

                Tables\Columns\TextColumn::make('icon')
                    ->badge()
                    ->color('info')
                    ->label('Ikon'),

                Tables\Columns\TextColumn::make('color')
                    ->badge()
                    ->colors([
                        'success' => 'emerald',
                        'info' => 'blue',
                        'warning' => 'amber',
                        'danger' => 'red',
                        'primary' => fn ($state) => in_array($state, ['purple', 'indigo', 'teal', 'rose']),
                    ])
                    ->label('Warna'),

                Tables\Columns\ToggleColumn::make('is_published')
                    ->label('Status Publish')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('updatedAt')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->label('Diperbarui'),
            ])
            ->defaultSort('order_index', 'asc')
            ->actions([
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
            'index' => Pages\ManageAppStatistics::route('/'),
        ];
    }
}

