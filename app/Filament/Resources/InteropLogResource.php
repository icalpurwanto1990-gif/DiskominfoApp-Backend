<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InteropLogResource\Pages;
use App\Models\InteropLog;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InteropLogResource extends Resource
{
    protected static ?string $model = InteropLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationLabel = 'Log Interoperabilitas (Audit Trail)';

    protected static ?string $modelLabel = 'Log Transaksi';

    protected static ?string $pluralModelLabel = 'Log Transaksi Interoperabilitas';

    protected static ?string $navigationGroup = 'Integrasi & SPBE';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime('d M Y, H:i:s')
                    ->sortable()
                    ->label('Waktu'),

                Tables\Columns\TextColumn::make('direction')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'INBOUND_MPP'   => 'success',
                        'OUTBOUND_SPLP' => 'info',
                        default         => 'gray',
                    })
                    ->label('Arah Data'),

                Tables\Columns\TextColumn::make('client_name')
                    ->label('Mitra / Layanan')
                    ->placeholder('Anonim')
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('method')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'GET'  => 'gray',
                        'POST' => 'warning',
                        default=> 'gray',
                    })
                    ->label('Method'),

                Tables\Columns\TextColumn::make('endpoint')
                    ->limit(40)
                    ->fontFamily('mono')
                    ->label('Endpoint / URL'),

                Tables\Columns\TextColumn::make('status_code')
                    ->badge()
                    ->color(fn (int $state): string => $state < 400 ? 'success' : 'danger')
                    ->label('Status'),

                Tables\Columns\TextColumn::make('response_time_ms')
                    ->formatStateUsing(fn ($state) => $state ? "{$state} ms" : '-')
                    ->label('Latensi'),

                Tables\Columns\TextColumn::make('ip_address')
                    ->fontFamily('mono')
                    ->label('IP Pengakses'),
            ])
            ->defaultSort('createdAt', 'desc')
            ->actions([
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
            'index' => Pages\ManageInteropLogs::route('/'),
        ];
    }
}
