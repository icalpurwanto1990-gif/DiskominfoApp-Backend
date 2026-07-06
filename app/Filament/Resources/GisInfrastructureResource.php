<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GisInfrastructureResource\Pages;
use App\Models\GisInfrastructure;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class GisInfrastructureResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = GisInfrastructure::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationLabel = 'Peta GIS Sebaran';

    protected static ?string $modelLabel = 'Titik Koordinat';

    protected static ?string $pluralModelLabel = 'Titik Koordinat';

    protected static ?string $navigationGroup = 'Portal Data';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->label('Nama Menara / Lokasi'),
                Forms\Components\Select::make('type')
                    ->required()
                    ->options([
                        'BTS_TOWER' => 'BTS Menara Seluler (Tower)',
                        'VSAT' => 'VSAT Jaringan Satelit',
                        'FIBER_OPTIK' => 'Fiber Optik (Kabel Tanah)',
                        'BLANKSPOT' => 'Blankspot Area (No Signal)',
                    ])
                    ->label('Tipe Infrastruktur'),
                Forms\Components\TextInput::make('latitude')
                    ->required()
                    ->numeric()
                    ->label('Garis Lintang (Latitude)'),
                Forms\Components\TextInput::make('longitude')
                    ->required()
                    ->numeric()
                    ->label('Garis Bujur (Longitude)'),
                Forms\Components\TextInput::make('status')
                    ->required()
                    ->maxLength(255)
                    ->default('AKTIF')
                    ->label('Status Operasional'),
                Forms\Components\KeyValue::make('details')
                    ->columnSpanFull()
                    ->label('Detail Informasi / Spesifikasi'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Lokasi'),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color('info')
                    ->label('Tipe'),
                Tables\Columns\TextColumn::make('latitude')
                    ->label('Latitude'),
                Tables\Columns\TextColumn::make('longitude')
                    ->label('Longitude'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'AKTIF', 'NORMAL' => 'success',
                        'RUSAK', 'BERMASALAH' => 'danger',
                        default => 'gray',
                    })
                    ->label('Status'),
            ])
            ->defaultSort('name', 'asc')
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
            'index' => Pages\ManageGisInfrastructures::route('/'),
        ];
    }
}
