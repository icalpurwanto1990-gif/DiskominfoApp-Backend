<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SocialMediaResource\Pages;
use App\Models\SocialMedia;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SocialMediaResource extends Resource
{
    protected static ?string $model = SocialMedia::class;

    protected static ?string $navigationIcon = 'heroicon-o-share';

    protected static ?string $navigationLabel = 'Media Sosial';

    protected static ?string $modelLabel = 'Media Sosial';

    protected static ?string $pluralModelLabel = 'Media Sosial';

    protected static ?string $navigationGroup = 'Konten Portal';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Media Sosial')
                    ->schema([
                        Forms\Components\Select::make('platform')
                            ->required()
                            ->options([
                                'Facebook' => 'Facebook',
                                'Instagram' => 'Instagram',
                                'YouTube' => 'YouTube',
                                'Twitter/X' => 'Twitter/X',
                                'TikTok' => 'TikTok',
                                'LinkedIn' => 'LinkedIn',
                            ])
                            ->label('Platform Media Sosial'),
                        Forms\Components\TextInput::make('url')
                            ->required()
                            ->url()
                            ->maxLength(255)
                            ->label('URL Link Profil'),
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
                Tables\Columns\TextColumn::make('platform')
                    ->searchable()
                    ->sortable()
                    ->label('Platform'),
                Tables\Columns\TextColumn::make('url')
                    ->label('URL Link')
                    ->limit(50),
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
            'index' => Pages\ManageSocialMedia::route('/'),
        ];
    }
}
