<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DatasetResource\Pages;
use App\Models\Dataset;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class DatasetResource extends Resource
{
    protected static ?string $model = Dataset::class;

    protected static ?string $navigationIcon = 'heroicon-o-table-cells';

    protected static ?string $navigationLabel = 'Satu Data Sektoral';

    protected static ?string $modelLabel = 'Dataset';

    protected static ?string $pluralModelLabel = 'Dataset';

    protected static ?string $navigationGroup = 'Portal Data';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Utama Dataset')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->label('Judul Dataset')
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (string $operation, $state, Forms\Set $set) => $operation === 'create' ? $set('slug', Str::slug($state)) : null),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->label('Slug URL'),
                        Forms\Components\TextInput::make('category')
                            ->required()
                            ->maxLength(255)
                            ->label('Kategori Data'),
                        Forms\Components\FileUpload::make('fileUrl')
                            ->disk('uploads')
                            ->directory('datasets')
                            ->label('Unggah File Pendukung (CSV/XLSX)'),
                        Forms\Components\Textarea::make('description')
                            ->required()
                            ->columnSpanFull()
                            ->label('Deskripsi Sektoral'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Metadata Sektoral')
                    ->schema([
                        Forms\Components\KeyValue::make('metadata')
                            ->default([
                                'produsen' => 'Bidang Aptika Diskominfo',
                                'lisensi' => 'Creative Commons Attribution',
                                'updateCycle' => 'Tahunan',
                            ])
                            ->label('Metadata Berkas'),
                    ]),

                Forms\Components\Section::make('Editor Baris Tabel (JSON Grid)')
                    ->schema([
                        Forms\Components\Repeater::make('jsonData')
                            ->schema([
                                Forms\Components\TextInput::make('bulan')
                                    ->required()
                                    ->label('Bulan / Label'),
                                Forms\Components\TextInput::make('pengajuan')
                                    ->numeric()
                                    ->default(0)
                                    ->label('Pengajuan'),
                                Forms\Components\TextInput::make('disetujui')
                                    ->numeric()
                                    ->default(0)
                                    ->label('Disetujui'),
                            ])
                            ->columns(3)
                            ->defaultItems(0)
                            ->label('Data Bulanan'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->wrap()
                    ->label('Judul Dataset'),
                Tables\Columns\TextColumn::make('category')
                    ->badge()
                    ->label('Kategori'),
                Tables\Columns\TextColumn::make('downloads')
                    ->numeric()
                    ->label('Unduh'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Tanggal Dibuat'),
            ])
            ->defaultSort('createdAt', 'desc')
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
            'index' => Pages\ManageDatasets::route('/'),
        ];
    }
}
