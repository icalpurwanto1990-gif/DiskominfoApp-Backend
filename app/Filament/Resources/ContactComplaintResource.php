<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactComplaintResource\Pages;
use App\Models\ContactComplaint;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContactComplaintResource extends Resource
{
    use \App\Traits\HasDynamicPermission;
    protected static ?string $model = ContactComplaint::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationLabel = 'Pengaduan Masyarakat';

    protected static ?string $modelLabel = 'Pengaduan';

    protected static ?string $pluralModelLabel = 'Pengaduan';

    protected static ?string $navigationGroup = 'Layanan Publik';

    public static function getNavigationBadge(): ?string
    {
        try {
            $count = static::getModel()::where('status', 'PENDING')->count();
            return $count > 0 ? (string) $count : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Jumlah pengaduan / pesan baru yang belum ditanggapi';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Pelapor & Aduan')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->disabled()
                            ->label('Nama Lengkap'),
                        Forms\Components\TextInput::make('phone')
                            ->disabled()
                            ->label('No. Telepon / WA'),
                        Forms\Components\TextInput::make('email')
                            ->disabled()
                            ->label('Alamat Email'),
                        Forms\Components\TextInput::make('subject')
                            ->disabled()
                            ->label('Topik Pengaduan'),
                        Forms\Components\Textarea::make('message')
                            ->disabled()
                            ->columnSpanFull()
                            ->label('Uraian Masalah / Saran'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Tanggapan & Status Verifikasi')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->options([
                                'PENDING' => 'PENDING',
                                'DIPROSES' => 'DIPROSES',
                                'SELESAI' => 'SELESAI',
                            ])
                            ->required()
                            ->default('PENDING')
                            ->label('Status Laporan'),
                        Forms\Components\Textarea::make('response')
                            ->columnSpanFull()
                            ->label('Catatan Tanggapan / Tindak Lanjut')
                            ->placeholder('Tuliskan respon resmi atau langkah tindak lanjut yang telah dilakukan...'),
                    ])
                    ->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Nama Pelapor'),
                Tables\Columns\TextColumn::make('phone')
                    ->label('Telepon'),
                Tables\Columns\TextColumn::make('subject')
                    ->searchable()
                    ->label('Topik'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'SELESAI' => 'success',
                        'DIPROSES' => 'warning',
                        'PENDING' => 'danger',
                        default => 'gray',
                    })
                    ->label('Status'),
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime()
                    ->sortable()
                    ->label('Masuk Pada'),
            ])
            ->defaultSort('createdAt', 'desc')
            ->actions([
                Tables\Actions\EditAction::make()
                    ->label('Detail & Tindak Lanjut'),
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
            'index' => Pages\ManageContactComplaints::route('/'),
        ];
    }
}
