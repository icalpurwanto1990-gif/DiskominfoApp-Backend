<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartnerLinkResource\Pages;
use App\Models\PartnerLink;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PartnerLinkResource extends Resource
{
    protected static ?string $model = PartnerLink::class;

    protected static ?string $navigationIcon = 'heroicon-o-link';

    protected static ?string $navigationLabel = 'Link Mitra';

    protected static ?string $modelLabel = 'Link Mitra';

    protected static ?string $pluralModelLabel = 'Link Mitra';

    protected static ?string $navigationGroup = 'Konten Portal';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Mitra')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->label('Nama Lengkap Mitra'),
                        Forms\Components\TextInput::make('short')
                            ->required()
                            ->maxLength(255)
                            ->label('Nama Singkat (Abbrev)'),
                        Forms\Components\TextInput::make('url')
                            ->required()
                            ->url()
                            ->maxLength(255)
                            ->label('URL Link Website'),
                        Forms\Components\TextInput::make('desc')
                            ->maxLength(255)
                            ->label('Deskripsi Singkat'),
                        Forms\Components\ColorPicker::make('color')
                            ->default('#1e40af')
                            ->label('Warna Aksen (HEX)'),
                        Forms\Components\FileUpload::make('logo')
                            ->disk('uploads')
                            ->directory('partners')
                            ->image()
                            ->label('File Logo Mitra'),
                        Forms\Components\Toggle::make('active')
                            ->required()
                            ->default(true)
                            ->label('Status Aktif'),
                        Forms\Components\TextInput::make('orderIndex')
                            ->required()
                            ->numeric()
                            ->default(0)
                            ->label('Urutan Tampil (Order Index)'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('logo')
                    ->disk('uploads')
                    ->label('Logo')
                    ->circular()
                    ->width(40)
                    ->height(40),
                Tables\Columns\TextColumn::make('short')
                    ->searchable()
                    ->sortable()
                    ->label('Abbrev'),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Mitra'),
                Tables\Columns\TextColumn::make('url')
                    ->label('Website URL')
                    ->limit(30),
                Tables\Columns\ToggleColumn::make('active')
                    ->label('Aktif'),
                Tables\Columns\TextColumn::make('orderIndex')
                    ->numeric()
                    ->sortable()
                    ->label('Urutan'),
            ])
            ->defaultSort('orderIndex', 'asc')
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
            'index' => Pages\ManagePartnerLinks::route('/'),
        ];
    }
}
