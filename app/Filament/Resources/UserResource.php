<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Manajemen Akun';

    protected static ?string $modelLabel = 'Akun';

    protected static ?string $pluralModelLabel = 'Akun';

    protected static ?string $navigationGroup = 'Sistem';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->label('Nama Lengkap'),
                Forms\Components\TextInput::make('email')
                    ->required()
                    ->email()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true)
                    ->label('Alamat Email'),
                Forms\Components\TextInput::make('password')
                    ->password()
                    ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                    ->dehydrated(fn ($state) => filled($state))
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->maxLength(255)
                    ->label('Kata Sandi'),
                Forms\Components\Select::make('role')
                    ->required()
                    ->options([
                        'SUPERADMIN' => 'Super Administrator (SUPERADMIN)',
                        'ADMIN' => 'Administrator (ADMIN)',
                        'USER' => 'Pemohon (USER)',
                    ])
                    ->default('USER')
                    ->label('Peran Akses'),
                Forms\Components\TextInput::make('nip')
                    ->maxLength(255)
                    ->label('NIP (Opsional)'),
                Forms\Components\TextInput::make('jabatan')
                    ->maxLength(255)
                    ->label('Jabatan (Opsional)'),
                Forms\Components\TextInput::make('instansi')
                    ->maxLength(255)
                    ->label('Instansi / Dinas Terkait (Opsional)'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama'),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->label('Email'),
                Tables\Columns\TextColumn::make('role')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'SUPERADMIN' => 'danger',
                        'ADMIN' => 'warning',
                        'USER' => 'info',
                        default => 'gray',
                    })
                    ->label('Peran'),
                Tables\Columns\TextColumn::make('nip')
                    ->searchable()
                    ->label('NIP'),
                Tables\Columns\TextColumn::make('instansi')
                    ->searchable()
                    ->label('Instansi'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function (User $record) {
                        if (auth()->id() === $record->id) {
                            throw new \Exception('Anda tidak dapat menghapus akun Anda sendiri.');
                        }
                    }),
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
            'index' => Pages\ManageUsers::route('/'),
        ];
    }
}
