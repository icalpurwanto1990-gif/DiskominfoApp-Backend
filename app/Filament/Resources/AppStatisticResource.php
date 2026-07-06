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

    protected static ?string $pluralModelLabel = 'Statistik';

    protected static ?string $navigationGroup = 'Kinerja SPBE';

    public static function getFriendlyLabel(string $key): string
    {
        return match ($key) {
            'TOTAL_VISITORS' => 'Pengunjung Website (Kunjungan tahun ini)',
            'TOTAL_TTE_ISSUED' => 'Sertifikat TTE Terbit (Aparatur Sipil Negara)',
            'OPD_WEBSITE_COUNT' => 'Website OPD Aktif (Portal Dinas / Kecamatan)',
            'APP_OPD_COUNT' => 'Aplikasi Daerah (Sistem SPBE Terintegrasi)',
            'TOTAL_SERVICES_REQUESTED' => 'Total Pengajuan Layanan',
            default => $key,
        };
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Statistik')
                    ->schema([
                        Forms\Components\TextInput::make('key')
                            ->required()
                            ->maxLength(255)
                            ->disabled(fn (string $operation): bool => $operation === 'edit')
                            ->dehydrated(true)
                            ->placeholder('e.g., TOTAL_VISITORS')
                            ->helperText('Kunci unik data statistik yang dibaca oleh frontend Next.js. Contoh: TOTAL_VISITORS, TOTAL_TTE_ISSUED, OPD_WEBSITE_COUNT, APP_OPD_COUNT.')
                            ->label('Kunci Statistik (Key)'),
                        Forms\Components\TextInput::make('value')
                            ->required()
                            ->numeric()
                            ->helperText('Nilai integer saat ini untuk statistik terpilih.')
                            ->label('Nilai Statistik (Value)'),
                    ])
                    ->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')
                    ->formatStateUsing(fn (string $state): string => self::getFriendlyLabel($state))
                    ->searchable()
                    ->sortable()
                    ->wrap()
                    ->label('Nama Statistik'),
                Tables\Columns\TextColumn::make('key')
                    ->badge()
                    ->color('gray')
                    ->searchable()
                    ->label('Kunci Database (Key)'),
                Tables\Columns\TextColumn::make('value')
                    ->numeric()
                    ->sortable()
                    ->label('Nilai saat ini'),
                Tables\Columns\TextColumn::make('updatedAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Terakhir Diperbarui'),
            ])
            ->defaultSort('key', 'asc')
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
