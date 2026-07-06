<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SurveyCategoryResource\Pages;
use App\Models\SurveyCategory;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SurveyCategoryResource extends Resource
{
    use \App\Traits\HasDynamicPermission;

    protected static ?string $model = SurveyCategory::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-bottom-center-text';

    protected static ?string $navigationLabel = 'Kategori Survey';

    protected static ?string $modelLabel = 'Kategori Survey';

    protected static ?string $pluralModelLabel = 'Kategori Survey';

    protected static ?string $navigationGroup = 'Layanan Publik';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255)
                    ->label('Nama Kategori / Layanan'),
                Forms\Components\Toggle::make('active')
                    ->default(true)
                    ->label('Aktif / Tampilkan di Form'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Kategori / Layanan'),
                Tables\Columns\IconColumn::make('active')
                    ->boolean()
                    ->label('Aktif'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Dibuat Pada')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
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
            'index' => Pages\ManageSurveyCategories::route('/'),
        ];
    }
}
