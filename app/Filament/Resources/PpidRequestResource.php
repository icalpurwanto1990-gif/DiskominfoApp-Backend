<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PpidRequestResource\Pages;
use App\Models\PpidRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PpidRequestResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = PpidRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationLabel = 'Permohonan Informasi';

    protected static ?string $modelLabel = 'Permohonan';

    protected static ?string $pluralModelLabel = 'Permohonan';

    protected static ?string $navigationGroup = 'Pelayanan';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Pemohon')
                    ->schema([
                        Forms\Components\TextInput::make('ticketNumber')
                            ->disabled()
                            ->label('Nomor Tiket'),
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->label('Nama Pemohon'),
                        Forms\Components\TextInput::make('nik')
                            ->required()
                            ->label('NIK'),
                        Forms\Components\TextInput::make('email')
                            ->required()
                            ->email()
                            ->label('Email'),
                        Forms\Components\TextInput::make('phone')
                            ->required()
                            ->label('Telepon'),
                        Forms\Components\Textarea::make('address')
                            ->required()
                            ->columnSpanFull()
                            ->label('Alamat Lengkap'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Rincian Permohonan')
                    ->schema([
                        Forms\Components\Textarea::make('details')
                            ->required()
                            ->columnSpanFull()
                            ->label('Rincian Informasi Yang Dibutuhkan'),
                        Forms\Components\Textarea::make('purpose')
                            ->required()
                            ->columnSpanFull()
                            ->label('Tujuan Penggunaan Informasi'),
                        Forms\Components\TextInput::make('ktpFile')
                            ->label('Link Berkas KTP Pendukung'),
                    ]),

                Forms\Components\Section::make('Tindak Lanjut & Tanggapan Admin')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->required()
                            ->options([
                                'PENDING' => 'PENDING',
                                'DIPROSES' => 'DIPROSES',
                                'SELESAI' => 'SELESAI (DISETUJUI)',
                                'DITOLAK' => 'DITOLAK',
                            ])
                            ->default('PENDING')
                            ->label('Status Pengajuan'),
                        Forms\Components\FileUpload::make('attachment')
                            ->disk('uploads')
                            ->directory('ppid-responses')
                            ->label('Lampiran Dokumen Jawaban (PDF)'),
                        Forms\Components\Textarea::make('response')
                            ->columnSpanFull()
                            ->label('Tanggapan / Jawaban Resmi PPID'),
                    ])
                    ->columns(2),
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
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->label('Pemohon'),
                Tables\Columns\TextColumn::make('nik')
                    ->searchable()
                    ->label('NIK'),
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
            'index' => Pages\ManagePpidRequests::route('/'),
        ];
    }
}
