<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GisInfrastructure;
use Illuminate\Support\Str;

class GisInfrastructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $points = [
            [
                'name' => 'BTS Telkomsel Salakan Pusat',
                'type' => 'BTS_TOWER',
                'latitude' => -1.3350,
                'longitude' => 123.1200,
                'status' => 'AKTIF',
                'details' => [
                    'Tinggi Menara' => '42 Meter',
                    'Provider Utama' => 'Telkomsel (4G LTE)',
                    'Kondisi Fisik' => 'Sangat Baik',
                    'Alamat' => 'Bukit Halimun, Salakan'
                ]
            ],
            [
                'name' => 'VSAT BAKTI Kantor Bupati Bangkep',
                'type' => 'VSAT',
                'latitude' => -1.3310,
                'longitude' => 123.1150,
                'status' => 'AKTIF',
                'details' => [
                    'Penyedia' => 'BAKTI Kominfo',
                    'Bandwidth' => '20 Mbps (Satelit)',
                    'Pengguna' => 'Publik / OPD Bangkep'
                ]
            ],
            [
                'name' => 'Blankspot Area Desa Tataba',
                'type' => 'BLANKSPOT',
                'latitude' => -1.4500,
                'longitude' => 123.2500,
                'status' => 'PERLU_TOWER',
                'details' => [
                    'Estimasi Penduduk' => '1.200 Jiwa',
                    'Rekomendasi Teknis' => 'Usulan Pembangunan Tower Seluler Baru',
                    'Status Usulan' => 'Dalam Pengkajian Kemenkominfo'
                ]
            ],
            [
                'name' => 'BTS Indosat Tinangkung Utara',
                'type' => 'BTS_TOWER',
                'latitude' => -1.2500,
                'longitude' => 123.1500,
                'status' => 'AKTIF',
                'details' => [
                    'Tinggi Menara' => '36 Meter',
                    'Provider Utama' => 'Indosat Ooredoo (4G)',
                    'Kondisi Fisik' => 'Normal'
                ]
            ],
            [
                'name' => 'VSAT BAKTI Puskesmas Buko',
                'type' => 'VSAT',
                'latitude' => -1.4800,
                'longitude' => 122.9500,
                'status' => 'AKTIF',
                'details' => [
                    'Penyedia' => 'BAKTI Kominfo',
                    'Fasilitas' => 'Layanan Kesehatan Puskesmas',
                    'Bandwidth' => '10 Mbps'
                ]
            ]
        ];

        foreach ($points as $point) {
            GisInfrastructure::updateOrCreate(
                ['name' => $point['name']],
                [
                    'id' => (string) Str::uuid(),
                    'type' => $point['type'],
                    'latitude' => $point['latitude'],
                    'longitude' => $point['longitude'],
                    'status' => $point['status'],
                    'details' => $point['details'],
                    'createdAt' => now(),
                    'updatedAt' => now(),
                ]
            );
        }
    }
}
