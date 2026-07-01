<?php

namespace App\Filament\Resources;

use App\Models\AuditLog;
use App\Filament\Resources\AuditLogResource\Pages;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AuditLogResource extends Resource
{
    protected static ?string $model = AuditLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationLabel = 'Log Audit Sistem';
    protected static ?string $modelLabel = 'Log Audit';
    protected static ?string $pluralModelLabel = 'Log Audit';
    protected static ?string $navigationGroup = 'Sistem & Keamanan';
    protected static ?int $navigationSort = 99;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('createdAt')
                    ->dateTime('d M Y H:i:s')
                    ->sortable()
                    ->label('Waktu Aktivitas'),
                Tables\Columns\TextColumn::make('adminName')
                    ->searchable()
                    ->label('Nama Pelaku'),
                Tables\Columns\TextColumn::make('adminRole')
                    ->badge()
                    ->colors([
                        'danger' => 'SUPERADMIN',
                        'warning' => 'ADMIN',
                    ])
                    ->label('Role/Peran'),
                Tables\Columns\TextColumn::make('action')
                    ->badge()
                    ->colors([
                        'success' => 'CREATE',
                        'info' => 'UPDATE',
                        'danger' => 'DELETE',
                    ])
                    ->label('Aksi'),
                Tables\Columns\TextColumn::make('module')
                    ->searchable()
                    ->label('Modul'),
                Tables\Columns\TextColumn::make('description')
                    ->searchable()
                    ->wrap()
                    ->label('Keterangan Aktivitas'),
                Tables\Columns\TextColumn::make('ipAddress')
                    ->label('Alamat IP'),
            ])
            ->defaultSort('createdAt', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageAuditLogs::route('/'),
        ];
    }
}
