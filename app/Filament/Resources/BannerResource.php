<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BannerResource\Pages;
use App\Models\Banner;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BannerResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = Banner::class;

    protected static ?string $navigationIcon = 'heroicon-o-presentation-chart-bar';

    protected static ?string $navigationLabel = 'Banner (Slider Hero)';

    protected static ?string $modelLabel = 'Banner';

    protected static ?string $pluralModelLabel = 'Banner';

    protected static ?string $navigationGroup = 'Konten Portal';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->label('Judul Banner'),
                Forms\Components\Textarea::make('description')
                    ->maxLength(65535)
                    ->columnSpanFull()
                    ->label('Deskripsi/Subjudul'),
                Forms\Components\FileUpload::make('imageUrl')
                    ->disk('uploads')
                    ->directory('banners')
                    ->image()
                    ->required()
                    ->label('File Gambar Banner')
                    ->imageCropAspectRatio('16:9'),
                Forms\Components\TextInput::make('linkUrl')
                    ->maxLength(255)
                    ->label('Link Tombol CTA (Optional)'),
                Forms\Components\Toggle::make('active')
                    ->required()
                    ->default(true)
                    ->label('Aktif / Tampilkan'),
                Forms\Components\TextInput::make('orderIndex')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->label('Indeks Urutan'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('imageUrl')
                    ->disk('uploads')
                    ->label('Gambar')
                    ->square()
                    ->getStateUsing(fn ($record) => $record->getRawImagePath()),
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->wrap()
                    ->label('Judul'),
                Tables\Columns\IconColumn::make('active')
                    ->boolean()
                    ->label('Status'),
                Tables\Columns\TextColumn::make('orderIndex')
                    ->numeric()
                    ->sortable()
                    ->label('Urutan'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Tanggal Dibuat')
                    ->toggleable(isToggledHiddenByDefault: true),
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
            'index' => Pages\ManageBanners::route('/'),
        ];
    }

    public static function mutateFormDataBeforeFill(array $data): array
    {
        // Strip any /uploads/ prefix so Filament FileUpload disk('uploads')
        // can locate the file at the correct path without double-prefixing.
        if (isset($data['imageUrl']) && is_string($data['imageUrl'])) {
            $data['imageUrl'] = ltrim(str_replace('/uploads/', '', $data['imageUrl']), '/');
        }
        return $data;
    }
}
