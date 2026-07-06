<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ModulePermissionResource\Pages;
use App\Models\ModulePermission;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ModulePermissionResource extends Resource
{
    protected static ?string $model = ModulePermission::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $navigationLabel = 'Hak Akses Modul';

    protected static ?string $modelLabel = 'Hak Akses Modul';

    protected static ?string $pluralModelLabel = 'Hak Akses Modul';

    protected static ?string $navigationGroup = 'Sistem';

    public static function canViewAny(): bool
    {
        return auth()->user()?->role === 'SUPERADMIN';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('module_name')
                    ->disabled()
                    ->required()
                    ->maxLength(255)
                    ->label('Nama Modul'),
                Forms\Components\TextInput::make('resource_class')
                    ->disabled()
                    ->required()
                    ->maxLength(255)
                    ->label('Resource Class / ID Modul'),
                Forms\Components\CheckboxList::make('allowed_roles')
                    ->options([
                        'SUPERADMIN' => 'Super Administrator (SUPERADMIN)',
                        'ADMIN' => 'Administrator (ADMIN)',
                        'USER' => 'Pemohon / User (USER)',
                    ])
                    ->required()
                    ->label('Peran (Role) yang Diizinkan Mengakses'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('module_name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Modul/Menu'),
                Tables\Columns\TextColumn::make('resource_class')
                    ->searchable()
                    ->label('Resource Class')
                    ->color('gray')
                    ->size('xs'),
                Tables\Columns\TextColumn::make('allowed_roles')
                    ->badge()
                    ->color('info')
                    ->label('Peran yang Diizinkan'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                // Disable bulk actions to prevent accidental deletion
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageModulePermissions::route('/'),
        ];
    }
}
