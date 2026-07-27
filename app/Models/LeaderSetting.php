<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaderSetting extends Model
{
    use HasFactory;

    protected $table = 'leader_settings';

    protected $fillable = [
        'key',
        'value',
    ];

    public static function getDefaults(): array
    {
        return [
            'bupati_nama' => 'H. Ihsan Basir, SH., LL.M.',
            'bupati_jabatan' => 'Pj. Bupati Banggai Kepulauan',
            'bupati_foto' => '/uploads/settings/bupati.png',
            'bupati_aktif' => '1',
            'wakil_bupati_nama' => 'Wakil Bupati',
            'wakil_bupati_jabatan' => 'Wakil Bupati Banggai Kepulauan',
            'wakil_bupati_foto' => '/uploads/settings/wakil_bupati.png',
            'wakil_bupati_aktif' => '1',
            'bupati_wakil_foto' => '/uploads/settings/bupati-wakil.png',
        ];
    }

    public static function getValue(string $key, ?string $default = null): ?string
    {
        $defaults = static::getDefaults();
        $record = static::where('key', $key)->first();
        if ($record && $record->value !== null && $record->value !== '') {
            return $record->value;
        }
        return $default ?? ($defaults[$key] ?? null);
    }

    public static function getAllFormatted(): array
    {
        $defaults = static::getDefaults();
        $dbData = static::pluck('value', 'key')->toArray();
        $merged = array_merge($defaults, array_filter($dbData, fn($val) => $val !== null && $val !== ''));

        // Format photo paths if they are saved via Filament upload disk
        $formatPhoto = function ($path, $default) {
            if (!$path || trim($path) === '') return $default;
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }
            if (str_starts_with($path, '/uploads/') || str_starts_with($path, '/storage/')) {
                return $path;
            }
            if (str_starts_with($path, '/')) {
                return $path;
            }

            $cleanPath = ltrim($path, '/');
            if (file_exists(public_path('uploads/' . $cleanPath))) {
                return '/uploads/' . $cleanPath;
            }
            if (file_exists(storage_path('app/public/' . $cleanPath))) {
                return '/storage/' . $cleanPath;
            }

            return '/uploads/' . $cleanPath;
        };

        return [
            'bupati' => [
                'nama' => $merged['bupati_nama'] ?? $defaults['bupati_nama'],
                'jabatan' => $merged['bupati_jabatan'] ?? $defaults['bupati_jabatan'],
                'foto' => $formatPhoto($merged['bupati_foto'] ?? null, $defaults['bupati_foto']),
                'aktif' => ($merged['bupati_aktif'] ?? '1') === '1' || ($merged['bupati_aktif'] ?? '1') === true,
            ],
            'wakilBupati' => [
                'nama' => $merged['wakil_bupati_nama'] ?? $defaults['wakil_bupati_nama'],
                'jabatan' => $merged['wakil_bupati_jabatan'] ?? $defaults['wakil_bupati_jabatan'],
                'foto' => $formatPhoto($merged['wakil_bupati_foto'] ?? null, $defaults['wakil_bupati_foto']),
                'aktif' => ($merged['wakil_bupati_aktif'] ?? '1') === '1' || ($merged['wakil_bupati_aktif'] ?? '1') === true,
            ],
            'jointFoto' => $formatPhoto($merged['bupati_wakil_foto'] ?? null, $defaults['bupati_wakil_foto']),
        ];
    }
}
