<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MenuResource\Pages;
use App\Models\Menu;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MenuResource extends Resource
{
    protected static ?string $model = Menu::class;

    protected static ?string $navigationIcon = 'heroicon-o-bars-3';

    protected static ?string $navigationLabel = 'Manajemen Menu';

    protected static ?string $modelLabel = 'Menu Navigasi';

    protected static ?string $pluralModelLabel = 'Menu Navigasi';

    protected static ?string $navigationGroup = 'Pengaturan Portal';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('label')
                    ->required()
                    ->maxLength(255)
                    ->label('Label Menu')
                    ->placeholder('Contoh: Profil, Layanan, Kontak'),

                Forms\Components\TextInput::make('url')
                    ->maxLength(255)
                    ->label('Link / URL')
                    ->placeholder('Contoh: /profil, /gis, https://google.com (opsional untuk menu induk)'),

                Forms\Components\Select::make('parent_id')
                    ->relationship('parent', 'label', fn ($query) => $query->whereNull('parent_id'))
                    ->label('Induk Menu (Parent)')
                    ->placeholder('Pilih jika ini adalah submenu (dropdown)')
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('target')
                    ->options([
                        '_self' => 'Halaman yang Sama (_self)',
                        '_blank' => 'Tab Baru (_blank)',
                    ])
                    ->default('_self')
                    ->required()
                    ->label('Target Link'),

                Forms\Components\TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->label('Urutan Tampil (Sort Order)'),

                Forms\Components\Toggle::make('is_active')
                    ->required()
                    ->default(true)
                    ->label('Aktif / Tampilkan'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('label')
                    ->searchable()
                    ->sortable()
                    ->label('Label Menu'),

                Tables\Columns\TextColumn::make('url')
                    ->searchable()
                    ->label('Link / URL')
                    ->default('-'),

                Tables\Columns\TextColumn::make('parent.label')
                    ->label('Induk Menu')
                    ->sortable()
                    ->default('Menu Utama (Top Level)'),

                Tables\Columns\TextColumn::make('target')
                    ->label('Target')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        '_blank' => 'warning',
                        default => 'gray',
                    }),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Status'),

                Tables\Columns\TextColumn::make('sort_order')
                    ->numeric()
                    ->sortable()
                    ->label('Urutan'),
            ])
            ->defaultSort('sort_order', 'asc')
            ->filters([
                Tables\Filters\SelectFilter::make('parent_id')
                    ->relationship('parent', 'label')
                    ->label('Filter Induk Menu'),
            ])
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
            'index' => Pages\ManageMenus::route('/'),
        ];
    }
}
