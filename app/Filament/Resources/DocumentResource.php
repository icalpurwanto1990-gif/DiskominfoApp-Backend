<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DocumentResource\Pages;
use App\Models\Document;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DocumentResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = Document::class;

    protected static ?string $navigationIcon = 'heroicon-o-folder-open';

    protected static ?string $navigationLabel = 'Dokumen Informasi Publik';

    protected static ?string $modelLabel = 'Dokumen';

    protected static ?string $pluralModelLabel = 'Dokumen';

    protected static ?string $navigationGroup = 'Layanan PPID';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->label('Nama/Judul Dokumen'),
                Forms\Components\Select::make('category')
                    ->required()
                    ->options([
                        'DIP' => 'DIP (Daftar Informasi Publik)',
                        'Laporan Keuangan' => 'Laporan Keuangan',
                        'Renstra' => 'Renstra (Rencana Strategis)',
                        'Regulasi' => 'Regulasi Daerah / Perda',
                    ])
                    ->label('Kategori Dokumen'),
                Forms\Components\FileUpload::make('fileUrl')
                    ->disk('uploads')
                    ->directory('documents')
                    ->required()
                    ->label('Unggah File Dokumen (PDF)'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->wrap()
                    ->label('Nama Dokumen'),
                Tables\Columns\TextColumn::make('category')
                    ->badge()
                    ->color('success')
                    ->label('Kategori'),
                Tables\Columns\TextColumn::make('fileUrl')
                    ->limit(30)
                    ->label('Link Berkas'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Tanggal Unggah'),
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
            'index' => Pages\ManageDocuments::route('/'),
        ];
    }
}
