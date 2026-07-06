<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PpidObjectionResource\Pages;
use App\Models\PpidObjection;
use App\Models\PpidRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PpidObjectionResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = PpidObjection::class;

    protected static ?string $navigationIcon = 'heroicon-o-exclamation-triangle';

    protected static ?string $navigationLabel = 'Keberatan PPID';

    protected static ?string $modelLabel = 'Keberatan';

    protected static ?string $pluralModelLabel = 'Keberatan';

    protected static ?string $navigationGroup = 'Pelayanan';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('requestId')
                    ->required()
                    ->options(PpidRequest::all()->pluck('ticketNumber', 'id'))
                    ->searchable()
                    ->label('Nomor Tiket Permohonan Asal'),
                Forms\Components\Textarea::make('reason')
                    ->required()
                    ->columnSpanFull()
                    ->label('Alasan Pengajuan Keberatan'),
                Forms\Components\TextInput::make('ktpFile')
                    ->label('Link Berkas Surat Keberatan Pendukung'),
                Forms\Components\Select::make('status')
                    ->required()
                    ->options([
                        'PENDING' => 'PENDING',
                        'DIPROSES' => 'DIPROSES',
                        'SELESAI' => 'SELESAI (TERSELESAIKAN)',
                        'DITOLAK' => 'DITOLAK',
                    ])
                    ->default('PENDING')
                    ->label('Status Keberatan'),
                Forms\Components\Textarea::make('response')
                    ->columnSpanFull()
                    ->label('Catatan Tanggapan Penyelesaian Sengketa'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('request.ticketNumber')
                    ->searchable()
                    ->label('Tiket Asal'),
                Tables\Columns\TextColumn::make('request.name')
                    ->searchable()
                    ->label('Nama Pengaju'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'PENDING' => 'warning',
                        'DIPROSES' => 'info',
                        'SELESAI' => 'success',
                        'DITOLAK' => 'danger',
                        default => 'gray',
                    })
                    ->label('Status'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Tanggal Masuk'),
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
            'index' => Pages\ManagePpidObjections::route('/'),
        ];
    }
}
