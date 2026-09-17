<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SurveyResponseResource\Pages;
use App\Models\SurveyResponse;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SurveyResponseResource extends Resource
{
    use \App\Traits\HasDynamicPermission;

    protected static ?string $model = SurveyResponse::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationLabel = 'Hasil & Respon Survey';

    protected static ?string $modelLabel = 'Respon Survey';

    protected static ?string $pluralModelLabel = 'Hasil & Respon Survey';

    protected static ?string $navigationGroup = 'Layanan Publik';

    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        $role = strtoupper((string) ($user->role ?? ''));
        return in_array($role, ['SUPERADMIN', 'ADMIN']) || empty($role);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('rating')
                    ->label('Rating Nilai (1 - 5)')
                    ->numeric()
                    ->disabled(),
                Forms\Components\TextInput::make('category')
                    ->label('Kategori Pelayanan')
                    ->disabled(),
                Forms\Components\Textarea::make('comment')
                    ->label('Komentar / Saran Masyarakat')
                    ->columnSpanFull()
                    ->disabled(),
                Forms\Components\DateTimePicker::make('createdAt')
                    ->label('Waktu Respon Dikirim')
                    ->disabled(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('createdAt', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('rating')
                    ->label('Rating')
                    ->sortable()
                    ->formatStateUsing(fn (int $state): string => str_repeat('⭐', $state) . " ({$state}/5)")
                    ->badge()
                    ->color(fn (int $state): string => match (true) {
                        $state >= 4 => 'success',
                        $state === 3 => 'warning',
                        default => 'danger',
                    }),
                Tables\Columns\TextColumn::make('category')
                    ->label('Kategori Layanan')
                    ->searchable()
                    ->sortable()
                    ->badge(),
                Tables\Columns\TextColumn::make('comment')
                    ->label('Kritik & Saran')
                    ->searchable()
                    ->limit(60)
                    ->tooltip(fn (?string $state): ?string => $state)
                    ->placeholder('(Tidak ada catatan)'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->label('Tanggal & Waktu')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('rating')
                    ->label('Filter Rating')
                    ->options([
                        5 => '⭐⭐⭐⭐⭐ (5 Bintang)',
                        4 => '⭐⭐⭐⭐ (4 Bintang)',
                        3 => '⭐⭐⭐ (3 Bintang)',
                        2 => '⭐⭐ (2 Bintang)',
                        1 => '⭐ (1 Bintang)',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
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
            'index' => Pages\ManageSurveyResponses::route('/'),
        ];
    }
}
