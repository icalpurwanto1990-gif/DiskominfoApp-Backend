<?php

namespace App\Filament\Resources;

use App\Models\TteRequest;
use App\Filament\Resources\TteRequestResource\Pages;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Actions\Action;
use Filament\Notifications\Notification;

class TteRequestResource extends Resource
{
    protected static ?string $model = TteRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-pencil-square';
    protected static ?string $navigationLabel = 'Permohonan TTE ASN';
    protected static ?string $modelLabel = 'Tiket TTE';
    protected static ?string $pluralModelLabel = 'Permohonan TTE';
    protected static ?string $navigationGroup = 'Pelayanan';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi ASN Pemohon')
                    ->schema([
                        Forms\Components\TextInput::make('nama')
                            ->disabled()
                            ->label('Nama Lengkap'),
                        Forms\Components\TextInput::make('nip')
                            ->disabled()
                            ->label('NIP'),
                        Forms\Components\TextInput::make('nik')
                            ->disabled()
                            ->label('NIK'),
                        Forms\Components\TextInput::make('jabatan')
                            ->disabled()
                            ->label('Jabatan'),
                        Forms\Components\TextInput::make('instansi')
                            ->disabled()
                            ->label('Instansi / OPD'),
                    ])->columns(2),
                Forms\Components\Section::make('Berkas Persyaratan')
                    ->schema([
                        Forms\Components\TextInput::make('dokumen_rekomendasi')
                            ->disabled()
                            ->label('Link/Path Surat Rekomendasi'),
                        Forms\Components\TextInput::make('dokumen_ktp')
                            ->disabled()
                            ->label('Link/Path Scan KTP'),
                    ])->columns(2),
                Forms\Components\Section::make('Status & Catatan')
                    ->schema([
                        Forms\Components\TextInput::make('status')
                            ->disabled()
                            ->label('Status Saat Ini'),
                        Forms\Components\Textarea::make('catatan_admin')
                            ->disabled()
                            ->label('Catatan Alasan Revisi')
                            ->rows(3),
                    ])->columns(1)
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime('d M Y H:i')
                    ->sortable()
                    ->label('Tanggal Pengajuan'),
                Tables\Columns\TextColumn::make('nama')
                    ->searchable()
                    ->label('Nama ASN'),
                Tables\Columns\TextColumn::make('nip')
                    ->searchable()
                    ->label('NIP'),
                Tables\Columns\TextColumn::make('instansi')
                    ->searchable()
                    ->label('Instansi / OPD'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'gray' => 'DRAFT',
                        'warning' => 'PENDING',
                        'danger' => 'REVISI',
                        'info' => 'DIPROSES',
                        'success' => 'SELESAI',
                    ])
                    ->label('Status'),
            ])
            ->defaultSort('createdAt', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),
                
                // 1. Approve Action (PENDING -> DIPROSES)
                Action::make('approve')
                    ->label('Setujui & Kirim ke BSrE')
                    ->icon('heroicon-m-check-circle')
                    ->color('success')
                    ->visible(fn (TteRequest $record): bool => $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->action(function (TteRequest $record) {
                        $payload = $record->triggerStatusTransition('DIPROSES', 'ADMIN');
                        
                        Notification::make()
                            ->title('Permohonan Disetujui')
                            ->body('Data ASN sedang diteruskan ke BSrE untuk penerbitan TTE.')
                            ->success()
                            ->send();
                    }),

                // 2. Return Action (PENDING -> REVISI)
                Action::make('revisi')
                    ->label('Kembalikan/Revisi')
                    ->icon('heroicon-m-arrow-path')
                    ->color('danger')
                    ->visible(fn (TteRequest $record): bool => $record->status === 'PENDING')
                    ->form([
                        Forms\Components\Textarea::make('catatan_revisi')
                            ->label('Alasan Pengembalian / Revisi Berkas')
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (TteRequest $record, array $data) {
                        $payload = $record->triggerStatusTransition('REVISI', 'ADMIN', $data['catatan_revisi']);
                        
                        Notification::make()
                            ->title('Berkas Dikembalikan')
                            ->body('Pemberitahuan revisi telah dikirimkan ke ASN.')
                            ->danger()
                            ->send();
                    }),

                // 3. Complete Action (DIPROSES -> SELESAI)
                Action::make('complete')
                    ->label('Tandai Selesai')
                    ->icon('heroicon-m-check-badge')
                    ->color('primary')
                    ->visible(fn (TteRequest $record): bool => $record->status === 'DIPROSES')
                    ->requiresConfirmation()
                    ->action(function (TteRequest $record) {
                        $payload = $record->triggerStatusTransition('SELESAI', 'ADMIN');
                        
                        Notification::make()
                            ->title('TTE Terbit & Selesai')
                            ->body('Sertifikat TTE ASN telah berhasil diterbitkan.')
                            ->success()
                            ->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageTteRequests::route('/'),
        ];
    }
}
