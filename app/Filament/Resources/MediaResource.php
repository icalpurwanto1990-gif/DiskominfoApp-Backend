<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MediaResource\Pages;
use App\Models\Media;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MediaResource extends Resource
{
    protected static ?string $model = Media::class;

    protected static ?string $navigationIcon = 'heroicon-o-film';

    protected static ?string $navigationLabel = 'Galeri & Media Center';

    protected static ?string $modelLabel = 'Media';

    protected static ?string $pluralModelLabel = 'Media';

    protected static ?string $navigationGroup = 'Konten Portal';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->label('Judul Media'),
                Forms\Components\Select::make('type')
                    ->required()
                    ->options([
                        'FOTO' => 'Galeri Foto',
                        'VIDEO' => 'Galeri Video (Link YouTube)',
                        'INFOGRAFIS' => 'Infografis Layanan',
                    ])
                    ->live()
                    ->label('Tipe Media'),
                Forms\Components\TextInput::make('url')
                    ->required()
                    ->maxLength(255)
                    ->url()
                    ->label('Link YouTube Video')
                    ->placeholder('https://www.youtube.com/watch?v=...')
                    ->visible(fn (Forms\Get $get) => $get('type') === 'VIDEO'),
                Forms\Components\FileUpload::make('url')
                    ->disk('uploads')
                    ->directory('media')
                    ->image()
                    ->required()
                    ->label('File Gambar')
                    ->visible(fn (Forms\Get $get) => in_array($get('type'), ['FOTO', 'INFOGRAFIS'])),
                Forms\Components\TextInput::make('meta')
                    ->required()
                    ->maxLength(255)
                    ->label('Metadata')
                    ->placeholder(fn (Forms\Get $get) => match ($get('type')) {
                        'VIDEO' => 'e.g. Durasi: 05:12',
                        'INFOGRAFIS' => 'e.g. Ukuran: 1.2 MB',
                        default => 'e.g. Tanggal: 25 Juni 2026',
                    })
                    ->helperText(fn (Forms\Get $get) => match ($get('type')) {
                        'VIDEO' => 'Masukkan durasi video (contoh: 04:30)',
                        'INFOGRAFIS' => 'Masukkan ukuran berkas (contoh: 1.5 MB)',
                        default => 'Masukkan tanggal kegiatan atau deskripsi singkat',
                    }),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->wrap()
                    ->label('Judul'),
                Tables\Columns\TextColumn::make('type')
                    ->label('Tipe')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'FOTO' => 'success',
                        'VIDEO' => 'danger',
                        'INFOGRAFIS' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('url')
                    ->label('Link / Path')
                    ->limit(30)
                    ->searchable(),
                Tables\Columns\TextColumn::make('meta')
                    ->label('Keterangan / Meta')
                    ->searchable(),
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
            'index' => Pages\ManageMedia::route('/'),
        ];
    }
}
