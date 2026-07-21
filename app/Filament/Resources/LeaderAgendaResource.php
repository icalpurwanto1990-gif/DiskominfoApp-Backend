<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LeaderAgendaResource\Pages;
use App\Models\LeaderAgenda;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class LeaderAgendaResource extends Resource
{
    use \App\Traits\HasDynamicPermission;

    protected static ?string $model = LeaderAgenda::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar';

    protected static ?string $navigationLabel = 'Agenda Pimpinan';

    protected static ?string $modelLabel = 'Agenda';

    protected static ?string $pluralModelLabel = 'Agenda';

    protected static ?string $navigationGroup = 'Layanan Publik';

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        $user = auth()->user();

        // OPD users can only see their own requests
        if ($user && $user->role === 'OPD') {
            return $query->where('user_id', $user->id);
        }

        return $query;
    }

    public static function form(Form $form): Form
    {
        $user = auth()->user();
        $isOPD = $user && $user->role === 'OPD';

        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Kegiatan (Diisi oleh OPD / Protokol)')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->label('Uraian Kegiatan / Acara'),
                        Forms\Components\DatePicker::make('date')
                            ->required()
                            ->label('Tanggal Pelaksanaan'),
                        Forms\Components\TextInput::make('time')
                            ->required()
                            ->placeholder('Contoh: 08.00 WITA')
                            ->maxLength(255)
                            ->label('Waktu / Jam'),
                        Forms\Components\TextInput::make('location')
                            ->required()
                            ->maxLength(255)
                            ->label('Tempat / Lokasi'),
                        Forms\Components\TextInput::make('organizer')
                            ->required()
                            ->maxLength(255)
                            ->default(fn () => auth()->user()?->instansi)
                            ->label('Pelaksana / Instansi Pemohon'),
                        Forms\Components\FileUpload::make('letter_file')
                            ->disk('uploads')
                            ->directory('agenda-letters')
                            ->acceptedFileTypes(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'])
                            ->required()
                            ->openable()
                            ->downloadable()
                            ->label('Surat Permohonan Resmi (PDF / Gambar)'),
                    ])->columns(2),

                Forms\Components\Section::make('Disusun oleh Protokol')
                    ->schema([
                        Forms\Components\Select::make('leader_name')
                            ->options([
                                'Bupati Banggai Kepulauan' => 'Bupati Banggai Kepulauan',
                                'Wakil Bupati Banggai Kepulauan' => 'Wakil Bupati Banggai Kepulauan',
                                'Pj. Bupati Banggai Kepulauan' => 'Pj. Bupati Banggai Kepulauan',
                                'Sekretaris Daerah' => 'Sekretaris Daerah',
                            ])
                            ->required(fn () => auth()->user()?->role === 'PROTOKOL' || auth()->user()?->role === 'SUPERADMIN')
                            ->disabled($isOPD)
                            ->label('Pimpinan yang Dihadirkan'),
                        Forms\Components\Textarea::make('notes')
                            ->rows(3)
                            ->disabled($isOPD)
                            ->placeholder('Contoh: Memberikan sambutan sekaligus membuka kegiatan')
                            ->label('Keterangan / Agenda Kegiatan'),
                    ])->columns(1)
                    ->visible(fn ($record) => !$isOPD || ($record && $record->leader_name !== null)),

                Forms\Components\Section::make('Dokumentasi Hasil Kegiatan (Diisi oleh Protokol / Google Drive)')
                    ->schema([
                        Forms\Components\TextInput::make('photo_url')
                            ->url()
                            ->disabled($isOPD)
                            ->placeholder('Contoh: https://drive.google.com/drive/folders/xxxx')
                            ->label('Link Foto Kegiatan (Google Drive)'),
                        Forms\Components\TextInput::make('speech_doc_url')
                            ->url()
                            ->disabled($isOPD)
                            ->placeholder('Contoh: https://drive.google.com/file/d/xxxx/view')
                            ->label('Link Dokumen Sambutan (Google Drive)'),
                    ])->columns(2)
                    ->visible(fn () => !$isOPD || auth()->user()?->role === 'SUPERADMIN' || auth()->user()?->role === 'ADMIN'),
            ]);
    }

    public static function table(Table $table): Table
    {
        $user = auth()->user();

        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->wrap()
                    ->label('Uraian Kegiatan'),
                Tables\Columns\TextColumn::make('date')
                    ->date('l, d F Y')
                    ->sortable()
                    ->label('Tanggal'),
                Tables\Columns\TextColumn::make('time')
                    ->label('Jam'),
                Tables\Columns\TextColumn::make('location')
                    ->searchable()
                    ->label('Tempat'),
                Tables\Columns\TextColumn::make('organizer')
                    ->label('Pelaksana'),
                Tables\Columns\TextColumn::make('letter_file')
                    ->label('Surat Permohonan')
                    ->formatStateUsing(fn () => 'Lihat Surat')
                    ->url(fn ($record) => $record && $record->letter_file ? '/uploads/' . $record->letter_file : null, true)
                    ->color('primary')
                    ->default('-'),
                Tables\Columns\TextColumn::make('leader_name')
                    ->default('-')
                    ->label('Pimpinan'),
                Tables\Columns\TextColumn::make('photo_url')
                    ->label('Foto Kegiatan')
                    ->formatStateUsing(fn () => 'Lihat Foto')
                    ->url(fn ($record) => $record?->photo_url, true)
                    ->color('primary')
                    ->default('-'),
                Tables\Columns\TextColumn::make('speech_doc_url')
                    ->label('Dokumen Sambutan')
                    ->formatStateUsing(fn () => 'Lihat Sambutan')
                    ->url(fn ($record) => $record?->speech_doc_url, true)
                    ->color('primary')
                    ->default('-'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'gray' => 'PENDING',
                        'warning' => 'PROTOKOL_APPROVED',
                        'success' => 'PUBLISHED',
                        'danger' => 'REJECTED',
                    ])
                    ->label('Status'),
            ])
            ->defaultSort('date', 'asc')
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->visible(fn ($record) => $user && ($user->role === 'SUPERADMIN' || $user->role === 'ADMIN' || $user->role === 'PROTOKOL' || ($user->role === 'OPD' && $record->status === 'PENDING'))),

                // Action khusus Protokol untuk mengisi link Foto Kegiatan & Dokumen Sambutan
                Action::make('update_documentation')
                    ->label('Input Dokumentasi')
                    ->icon('heroicon-m-camera')
                    ->color('info')
                    ->visible(fn ($record) => $user && ($user->role === 'PROTOKOL' || $user->role === 'SUPERADMIN' || $user->role === 'ADMIN') && $record && in_array($record->status, ['PROTOKOL_APPROVED', 'PUBLISHED']))
                    ->form([
                        Forms\Components\TextInput::make('photo_url')
                            ->url()
                            ->placeholder('Contoh: https://drive.google.com/drive/folders/xxxx')
                            ->label('Link Foto Kegiatan (Google Drive)'),
                        Forms\Components\TextInput::make('speech_doc_url')
                            ->url()
                            ->placeholder('Contoh: https://drive.google.com/file/d/xxxx/view')
                            ->label('Link Dokumen Sambutan (Google Drive)'),
                    ])
                    ->fillForm(fn ($record): array => [
                        'photo_url' => $record->photo_url,
                        'speech_doc_url' => $record->speech_doc_url,
                    ])
                    ->action(function (LeaderAgenda $record, array $data) {
                        $record->update([
                            'photo_url' => $data['photo_url'],
                            'speech_doc_url' => $data['speech_doc_url'],
                        ]);

                        Notification::make()
                            ->title('Dokumentasi Disimpan')
                            ->body('Link foto kegiatan dan dokumen sambutan berhasil diperbarui.')
                            ->success()
                            ->send();
                    }),

                // Protokol approve action (PENDING -> PROTOKOL_APPROVED)
                Action::make('approve_protocol')
                    ->label('Kirim ke Diskominfo')
                    ->icon('heroicon-m-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $user && $user->role === 'PROTOKOL' && $record && $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Select::make('leader_name')
                            ->options([
                                'Bupati Banggai Kepulauan' => 'Bupati Banggai Kepulauan',
                                'Wakil Bupati Banggai Kepulauan' => 'Wakil Bupati Banggai Kepulauan',
                                'Pj. Bupati Banggai Kepulauan' => 'Pj. Bupati Banggai Kepulauan',
                                'Sekretaris Daerah' => 'Sekretaris Daerah',
                            ])
                            ->required()
                            ->label('Pimpinan yang Hadir'),
                        Forms\Components\Textarea::make('notes')
                            ->rows(3)
                            ->label('Keterangan / Acara'),
                    ])
                    ->action(function (LeaderAgenda $record, array $data) {
                        $record->update([
                            'leader_name' => $data['leader_name'],
                            'notes' => $data['notes'],
                            'status' => 'PROTOKOL_APPROVED',
                        ]);

                        Notification::make()
                            ->title('Agenda Diteruskan')
                            ->body('Agenda berhasil diteruskan ke Diskominfo untuk dipublikasikan.')
                            ->success()
                            ->send();
                    }),

                // Diskominfo publish action (PROTOKOL_APPROVED -> PUBLISHED)
                Action::make('publish')
                    ->label('Verifikasi & Publish')
                    ->icon('heroicon-m-globe-alt')
                    ->color('success')
                    ->visible(fn ($record) => $user && ($user->role === 'SUPERADMIN' || $user->role === 'ADMIN') && $record && $record->status === 'PROTOKOL_APPROVED')
                    ->requiresConfirmation()
                    ->action(function (LeaderAgenda $record) {
                        $record->update(['status' => 'PUBLISHED']);

                        Notification::make()
                            ->title('Agenda Diterbitkan')
                            ->body('Agenda pimpinan telah resmi dipublikasikan di halaman depan.')
                            ->success()
                            ->send();
                    }),

                // Reschedule action (PROTOKOL_APPROVED/PUBLISHED -> Updates details)
                Action::make('reschedule')
                    ->label('Reschedule')
                    ->icon('heroicon-m-calendar-days')
                    ->color('warning')
                    ->visible(fn ($record) => $user && ($user->role === 'PROTOKOL' || $user->role === 'SUPERADMIN' || $user->role === 'ADMIN') && $record && in_array($record->status, ['PROTOKOL_APPROVED', 'PUBLISHED']))
                    ->form([
                        Forms\Components\DatePicker::make('date')
                            ->required()
                            ->label('Tanggal Baru'),
                        Forms\Components\TextInput::make('time')
                            ->required()
                            ->label('Waktu / Jam Baru'),
                        Forms\Components\TextInput::make('location')
                            ->required()
                            ->label('Tempat / Lokasi Baru'),
                        Forms\Components\Textarea::make('notes')
                            ->rows(3)
                            ->label('Keterangan / Alasan Reschedule (Opsional)'),
                    ])
                    ->fillForm(fn ($record): array => [
                        'date' => $record->date,
                        'time' => $record->time,
                        'location' => $record->location,
                        'notes' => $record->notes,
                    ])
                    ->action(function (LeaderAgenda $record, array $data) {
                        $record->update([
                            'date' => $data['date'],
                            'time' => $data['time'],
                            'location' => $data['location'],
                            'notes' => $data['notes'],
                        ]);

                        Notification::make()
                            ->title('Jadwal Berhasil Diatur Ulang')
                            ->body('Agenda pimpinan telah berhasil di-reschedule.')
                            ->success()
                            ->send();
                    }),

                // Reject action (PENDING/PROTOKOL_APPROVED -> REJECTED)
                Action::make('reject')
                    ->label('Tolak')
                    ->icon('heroicon-m-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $user && ($user->role === 'SUPERADMIN' || $user->role === 'ADMIN' || $user->role === 'PROTOKOL') && $record && in_array($record->status, ['PENDING', 'PROTOKOL_APPROVED']))
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Alasan Penolakan')
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (LeaderAgenda $record, array $data) {
                        $record->update([
                            'status' => 'REJECTED',
                            'rejection_reason' => $data['rejection_reason'],
                        ]);

                        Notification::make()
                            ->title('Agenda Ditolak')
                            ->body('Permohonan agenda telah ditolak.')
                            ->danger()
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
            'index' => Pages\ManageLeaderAgendas::route('/'),
        ];
    }
}
