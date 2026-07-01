<?php

namespace App\Filament\Resources;

use App\Models\Staff;
use App\Filament\Resources\StaffResource\Pages;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class StaffResource extends Resource
{
    protected static ?string $model = Staff::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Daftar Pegawai (BKN)';
    protected static ?string $modelLabel = 'Pegawai';
    protected static ?string $pluralModelLabel = 'Pegawai';
    protected static ?string $navigationGroup = 'Kepegawaian';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('gelarDepan')
                    ->maxLength(50)
                    ->label('Gelar Depan (e.g. Drs., Ir., H.)'),
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->label('Nama Lengkap (Tanpa Gelar)'),
                Forms\Components\TextInput::make('gelarBelakang')
                    ->maxLength(50)
                    ->label('Gelar Belakang (e.g. S.Kom, M.Si, M.AP)'),
                Forms\Components\TextInput::make('nip')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true)
                    ->label('NIP Pegawai'),
                Forms\Components\TextInput::make('position')
                    ->required()
                    ->maxLength(255)
                    ->label('Jabatan'),
                Forms\Components\Select::make('category')
                    ->required()
                    ->options([
                        'Pimpinan' => 'Pimpinan / Kepala Dinas',
                        'Sekretariat' => 'Sekretariat',
                        'Aptika' => 'Aptika (Aplikasi & Informatika)',
                        'IKP' => 'IKP (Informasi & Komunikasi Publik)',
                        'Persandian' => 'Persandian & Statistik',
                    ])
                    ->label('Kategori Bidang / Unit'),
                Forms\Components\FileUpload::make('image')
                    ->disk('uploads')
                    ->directory('staff')
                    ->image()
                    ->label('Foto Profil')
                    ->imageCropAspectRatio('1:1'),
                Forms\Components\TextInput::make('orderIndex')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->label('Urutan Tampilan'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->disk('uploads')
                    ->label('Foto')
                    ->circular(),
                Tables\Columns\TextColumn::make('full_name')
                    ->label('Nama Lengkap & Gelar')
                    ->state(function (Staff $record): string {
                        $front = $record->gelarDepan ? $record->gelarDepan . ' ' : '';
                        $back = $record->gelarBelakang ? ', ' . $record->gelarBelakang : '';
                        return "{$front}{$record->name}{$back}";
                    })
                    ->searchable(['name', 'gelarDepan', 'gelarBelakang']),
                Tables\Columns\TextColumn::make('nip')
                    ->label('NIP')
                    ->searchable(),
                Tables\Columns\TextColumn::make('position')
                    ->label('Jabatan')
                    ->searchable(),
                Tables\Columns\TextColumn::make('category')
                    ->label('Kategori')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Pimpinan' => 'danger',
                        'Sekretariat' => 'warning',
                        'Aptika' => 'success',
                        'IKP' => 'info',
                        'Persandian' => 'gray',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('orderIndex')
                    ->label('Urutan')
                    ->numeric()
                    ->sortable(),
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
            'index' => Pages\ManageStaff::route('/'),
        ];
    }
}
