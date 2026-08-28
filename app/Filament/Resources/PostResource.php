<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostResource\Pages;
use App\Models\Post;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class PostResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = Post::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationLabel = 'Berita & Pengumuman';

    protected static ?string $modelLabel = 'Berita';

    protected static ?string $pluralModelLabel = 'Berita';

    protected static ?string $navigationGroup = 'Konten Portal';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Konten Berita')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->label('Judul Berita')
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (string $operation, $state, Forms\Set $set) => $operation === 'create' ? $set('slug', Str::slug($state)) : null),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->label('Slug URL'),
                        Forms\Components\Select::make('categoryId')
                            ->relationship('category', 'name')
                            ->required()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255)
                                    ->label('Nama Kategori')
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(fn ($state, Forms\Set $set) => $set('slug', Str::slug($state))),
                                Forms\Components\TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique('Category', 'slug')
                                    ->label('Slug URL'),
                                Forms\Components\Toggle::make('isMenu')
                                    ->required()
                                    ->default(false)
                                    ->label('Tampilkan di Menu Utama'),
                                Forms\Components\TextInput::make('orderIndex')
                                    ->required()
                                    ->numeric()
                                    ->default(0)
                                    ->label('Urutan Tampil'),
                            ])
                            ->label('Kategori'),
                        Forms\Components\FileUpload::make('image')
                            ->disk('uploads')
                            ->directory('posts')
                            ->image()
                            ->maxSize(10240)
                            ->label('Gambar Utama Berita'),
                        Forms\Components\RichEditor::make('content')
                            ->required()
                            ->fileAttachmentsDisk('uploads')
                            ->fileAttachmentsDirectory('posts/attachments')
                            ->fileAttachmentsVisibility('public')
                            ->columnSpanFull()
                            ->label('Isi Berita')
                            ->helperText('Gunakan toolbar untuk format teks, menyisipkan gambar, tabel, atau tautan.'),
                        Forms\Components\Toggle::make('published')
                            ->required()
                            ->default(false)
                            ->label('Terbitkan Berita'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('SEO Metadata (Opsional)')
                    ->schema([
                        Forms\Components\TextInput::make('seoTitle')
                            ->maxLength(255)
                            ->label('Judul SEO'),
                        Forms\Components\TextInput::make('seoKeywords')
                            ->maxLength(255)
                            ->label('Kata Kunci SEO (Dipisahkan koma)'),
                        Forms\Components\Textarea::make('seoDesc')
                            ->maxLength(65535)
                            ->columnSpanFull()
                            ->label('Deskripsi SEO'),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->disk('uploads')
                    ->label('Gambar')
                    ->square(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->wrap()
                    ->label('Judul'),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Kategori')
                    ->badge()
                    ->color('success'),
                Tables\Columns\IconColumn::make('published')
                    ->boolean()
                    ->label('Terbit'),
                Tables\Columns\TextColumn::make('views')
                    ->numeric()
                    ->sortable()
                    ->label('Dilihat'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Tanggal Dibuat'),
            ])
            ->defaultSort('createdAt', 'desc')
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }

    public static function mutateFormDataBeforeFill(array $data): array
    {
        // Strip any /uploads/ prefix so Filament FileUpload disk('uploads')
        // can locate the file at the correct path without double-prefixing.
        if (isset($data['image']) && is_string($data['image'])) {
            $data['image'] = ltrim(str_replace('/uploads/', '', $data['image']), '/');
        }

        return $data;
    }
}

