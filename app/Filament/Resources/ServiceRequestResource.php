<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceRequestResource\Pages;
use App\Models\ServiceRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Support\HtmlString;

class ServiceRequestResource extends Resource
{
    protected static ?string $model = ServiceRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';

    protected static ?string $navigationLabel = 'Tiket Pengajuan OPD';

    protected static ?string $modelLabel = 'Tiket';

    protected static ?string $pluralModelLabel = 'Tiket';

    protected static ?string $navigationGroup = 'Pelayanan';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Instansi Pemohon')
                    ->schema([
                        Forms\Components\TextInput::make('ticketNumber')
                            ->disabled()
                            ->label('Nomor Tiket'),
                        Forms\Components\TextInput::make('serviceType')
                            ->disabled()
                            ->label('Jenis Layanan'),
                        Forms\Components\TextInput::make('applicantName')
                            ->required()
                            ->label('Nama Pegawai'),
                        Forms\Components\TextInput::make('applicantEmail')
                            ->required()
                            ->email()
                            ->label('Email'),
                        Forms\Components\TextInput::make('applicantPhone')
                            ->required()
                            ->label('Telepon'),
                        Forms\Components\TextInput::make('instansi')
                            ->required()
                            ->label('Instansi / OPD'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Rincian Form Pengajuan (JSON Data)')
                    ->schema([
                        Forms\Components\KeyValue::make('details')
                            ->columnSpanFull()
                            ->label('Rincian Data Formulir'),
                        Forms\Components\Placeholder::make('dynamic_details_links')
                            ->label('Unduh Berkas Pendukung (Jika Ada)')
                            ->content(function ($record) {
                                if (! $record || empty($record->details)) {
                                    return 'Tidak ada berkas pendukung.';
                                }
                                $links = [];
                                foreach ($record->details as $key => $value) {
                                    if (is_string($value) && (str_starts_with($value, '/uploads/') || str_starts_with($value, 'http'))) {
                                        $fileName = basename($value);
                                        $links[] = "<a href='{$value}' target='_blank' style='color: #10b981; font-weight: bold; text-decoration: underline;' class='font-medium'>🔗 Unduh {$key} ({$fileName})</a>";
                                    }
                                }
                                if (empty($links)) {
                                    return 'Tidak ada berkas pendukung.';
                                }

                                return new HtmlString(implode('<br>', $links));
                            })
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Proses & Penyelesaian Tiket')
                    ->schema([
                        Forms\Components\TextInput::make('status')
                            ->disabled()
                            ->label('Status Pengajuan'),
                        Forms\Components\Textarea::make('notes')
                            ->columnSpanFull()
                            ->label('Catatan Tanggapan Verifikator Diskominfo'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('ticketNumber')
                    ->searchable()
                    ->sortable()
                    ->label('No. Tiket'),
                Tables\Columns\TextColumn::make('serviceType')
                    ->badge()
                    ->color('info')
                    ->label('Jenis Layanan'),
                Tables\Columns\TextColumn::make('applicantName')
                    ->searchable()
                    ->label('Pemohon'),
                Tables\Columns\TextColumn::make('instansi')
                    ->searchable()
                    ->label('Instansi'),
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
                    ->dateTime('d M Y H:i')
                    ->sortable()
                    ->label('Tanggal Masuk'),
            ])
            ->defaultSort('createdAt', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),

                // 1. Approve Action (PENDING -> DIPROSES)
                Action::make('approve')
                    ->label('Setujui & Proses')
                    ->icon('heroicon-m-check-circle')
                    ->color('success')
                    ->visible(fn (ServiceRequest $record): bool => $record->status === 'PENDING')
                    ->form([
                        Forms\Components\Textarea::make('catatan_proses')
                            ->label('Catatan / Tanggapan Tambahan (Opsional)')
                            ->placeholder('Contoh: Tim sedang menyiapkan berkas...')
                            ->rows(3),
                    ])
                    ->action(function (ServiceRequest $record, array $data) {
                        $record->triggerStatusTransition('DIPROSES', 'ADMIN', $data['catatan_proses'] ?? null);

                        Notification::make()
                            ->title('Pengajuan Disetujui')
                            ->body('Status tiket #'.$record->ticketNumber.' kini DIPROSES.')
                            ->success()
                            ->send();
                    }),

                // 2. Reject Action (PENDING -> DITOLAK)
                Action::make('reject')
                    ->label('Tolak Pengajuan')
                    ->icon('heroicon-m-x-circle')
                    ->color('danger')
                    ->visible(fn (ServiceRequest $record): bool => $record->status === 'PENDING')
                    ->form([
                        Forms\Components\Textarea::make('catatan_penolakan')
                            ->label('Alasan Penolakan Layanan')
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (ServiceRequest $record, array $data) {
                        $record->triggerStatusTransition('DITOLAK', 'ADMIN', $data['catatan_penolakan']);

                        Notification::make()
                            ->title('Pengajuan Ditolak')
                            ->body('Pemberitahuan penolakan tiket #'.$record->ticketNumber.' telah dikirim.')
                            ->danger()
                            ->send();
                    }),

                // 3. Complete Action (DIPROSES -> SELESAI)
                Action::make('complete')
                    ->label('Tandai Selesai')
                    ->icon('heroicon-m-check-badge')
                    ->color('primary')
                    ->visible(fn (ServiceRequest $record): bool => $record->status === 'DIPROSES')
                    ->form([
                        Forms\Components\Textarea::make('catatan_penyelesaian')
                            ->label('Catatan / Tanggapan Penyelesaian (Opsional)')
                            ->placeholder('Contoh: Layanan telah aktif / berkas dapat diambil...')
                            ->rows(3),
                    ])
                    ->action(function (ServiceRequest $record, array $data) {
                        $record->triggerStatusTransition('SELESAI', 'ADMIN', $data['catatan_penyelesaian'] ?? null);

                        Notification::make()
                            ->title('Layanan Selesai')
                            ->body('Tiket #'.$record->ticketNumber.' telah ditandai SELESAI.')
                            ->success()
                            ->send();
                    }),

                // 4. Update Response Action (Allow updating notes anytime)
                Action::make('update_response')
                    ->label('Beri Tanggapan')
                    ->icon('heroicon-m-chat-bubble-bottom-center-text')
                    ->color('info')
                    ->form([
                        Forms\Components\Textarea::make('notes')
                            ->label('Tanggapan / Catatan Verifikator')
                            ->default(fn (ServiceRequest $record) => $record->notes)
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (ServiceRequest $record, array $data) {
                        $record->notes = $data['notes'];
                        $record->save();

                        Notification::make()
                            ->title('Tanggapan Diperbarui')
                            ->body('Catatan tanggapan untuk tiket #'.$record->ticketNumber.' berhasil disimpan.')
                            ->success()
                            ->send();
                    }),

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
            'index' => Pages\ManageServiceRequests::route('/'),
        ];
    }
}
