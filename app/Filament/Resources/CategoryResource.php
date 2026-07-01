<?php

namespace App\Filament\Resources;

use App\Models\Category;
use App\Filament\Resources\CategoryResource\Pages;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';
    protected static ?string $navigationLabel = 'Kategori Berita';
    protected static ?string $modelLabel = 'Kategori';
    protected static ?string $pluralModelLabel = 'Kategori';
    protected static ?string $navigationGroup = 'Konten Portal';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Kategori')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->label('Nama Kategori')
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (string $operation, $state, Forms\Set $set) => 
                                $operation === 'create' ? $set('slug', Str::slug($state)) : null),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->label('Slug URL'),
                        Forms\Components\Toggle::make('isMenu')
                            ->required()
                            ->default(false)
                            ->label('Tampilkan di Menu Utama'),
                        Forms\Components\TextInput::make('orderIndex')
                            ->required()
                            ->numeric()
                            ->default(0)
                            ->label('Urutan Tampil (Order Index)'),
                    ])
                    ->columns(2)
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Kategori'),
                Tables\Columns\TextColumn::make('slug')
                    ->label('Slug URL'),
                Tables\Columns\IconColumn::make('isMenu')
                    ->boolean()
                    ->label('Menu Utama'),
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
            'index' => Pages\ManageCategories::route('/'),
        ];
    }
}
