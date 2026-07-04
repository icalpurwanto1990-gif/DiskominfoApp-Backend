<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TteRequestResource\Pages;
use App\Models\TteRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;

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
                Forms\Components\Section::make('Status & Catatan')
                    ->schema([
                        Forms\Components\TextInput::make('status')
                            ->disabled()
                            ->label('Status Saat Ini'),
                        Forms\Components\Textarea::make('catatan_admin')
                            ->disabled()
                            ->label('Catatan Alasan Revisi')
                            ->rows(3),
                    ])->columns(1),
            ]);
    }

    /**
     * Infolist digunakan oleh ViewAction.
     * Menampilkan berkas dokumen sebagai tombol link yang bisa dibuka di tab baru.
     */
    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Informasi ASN Pemohon')
                    ->schema([
                        Infolists\Components\TextEntry::make('nama')
                            ->label('Nama Lengkap')
                            ->weight('bold'),
                        Infolists\Components\TextEntry::make('nip')
                            ->label('NIP'),
                        Infolists\Components\TextEntry::make('nik')
                            ->label('NIK'),
                        Infolists\Components\TextEntry::make('jabatan')
                            ->label('Jabatan'),
                        Infolists\Components\TextEntry::make('instansi')
                            ->label('Instansi / OPD'),
                        Infolists\Components\TextEntry::make('status')
                            ->label('Status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'PENDING'  => 'warning',
                                'DIPROSES' => 'info',
                                'SELESAI'  => 'success',
                                'REVISI'   => 'danger',
                                default    => 'gray',
                            }),
                    ])->columns(2),

                Infolists\Components\Section::make('Berkas Persyaratan')
                    ->description('Klik tombol di bawah untuk membuka atau mengunduh file dokumen.')
                    ->schema([
                        // Surat Rekomendasi
                        Infolists\Components\TextEntry::make('dokumen_rekomendasi')
                            ->label('Surat Rekomendasi')
                            ->formatStateUsing(function (?string $state): string {
                                if (! $state) return '—';
                                $url  = str_starts_with($state, 'http') ? $state
                                      : (str_starts_with($state, '/') ? $state : '/uploads/' . $state);
                                $name = basename($state);
                                return "<a href=\"{$url}\" target=\"_blank\" rel=\"noopener noreferrer\"
                                    style=\"display:inline-flex;align-items:center;gap:6px;padding:8px 16px;
                                            background:#059669;color:white;border-radius:8px;font-weight:600;
                                            font-size:13px;text-decoration:none;\">
                                    <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24'
                                         fill='none' stroke='currentColor' stroke-width='2'
                                         stroke-linecap='round' stroke-linejoin='round'>
                                        <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/>
                                        <polyline points='15 3 21 3 21 9'/>
                                        <line x1='10' y1='14' x2='21' y2='3'/>
                                    </svg>
                                    Buka: {$name}
                                </a>";
                            })
                            ->html(),

                        // Scan KTP
                        Infolists\Components\TextEntry::make('dokumen_ktp')
                            ->label('Scan KTP')
                            ->formatStateUsing(function (?string $state): string {
                                if (! $state) return '—';
                                $url  = str_starts_with($state, 'http') ? $state
                                      : (str_starts_with($state, '/') ? $state : '/uploads/' . $state);
                                $name = basename($state);
                                return "<a href=\"{$url}\" target=\"_blank\" rel=\"noopener noreferrer\"
                                    style=\"display:inline-flex;align-items:center;gap:6px;padding:8px 16px;
                                            background:#059669;color:white;border-radius:8px;font-weight:600;
                                            font-size:13px;text-decoration:none;\">
                                    <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24'
                                         fill='none' stroke='currentColor' stroke-width='2'
                                         stroke-linecap='round' stroke-linejoin='round'>
                                        <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/>
                                        <polyline points='15 3 21 3 21 9'/>
                                        <line x1='10' y1='14' x2='21' y2='3'/>
                                    </svg>
                                    Buka: {$name}
                                </a>";
                            })
                            ->html(),
                    ])->columns(2),

                Infolists\Components\Section::make('Catatan Admin')
                    ->schema([
                        Infolists\Components\TextEntry::make('catatan_admin')
                            ->label('Alasan Revisi / Catatan')
                            ->placeholder('Tidak ada catatan.')
                            ->columnSpanFull(),
                    ]),
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
                        'gray'    => 'DRAFT',
                        'warning' => 'PENDING',
                        'danger'  => 'REVISI',
                        'info'    => 'DIPROSES',
                        'success' => 'SELESAI',
                    ])
                    ->label('Status'),
            ])
            ->defaultSort('createdAt', 'desc')
            ->actions([
                // ViewAction kini menggunakan infolist() — berkas tampil sebagai tombol link berwarna
                Tables\Actions\ViewAction::make()
                    ->label('Lihat Detail'),

                // 1. Approve Action (PENDING -> DIPROSES)
                Action::make('approve')
                    ->label('Setujui & Kirim ke BSrE')
                    ->icon('heroicon-m-check-circle')
                    ->color('success')
                    ->visible(fn (TteRequest $record): bool => $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->action(function (TteRequest $record) {
                        $record->triggerStatusTransition('DIPROSES', 'ADMIN');

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
                        $record->triggerStatusTransition('REVISI', 'ADMIN', $data['catatan_revisi']);

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
                        $record->triggerStatusTransition('SELESAI', 'ADMIN');

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
