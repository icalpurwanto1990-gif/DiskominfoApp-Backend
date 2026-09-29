<?php

namespace Database\Seeders;

use App\Models\ApiClient;
use App\Models\SplpConfig;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InteroperabilitySeeder extends Seeder
{
    /**
     * Seed initial API Client for MPP and SPLP template.
     */
    public function run(): void
    {
        // 1. Initial API Key for MPP Banggai Kepulauan
        $defaultMppKey = 'bkp_mpp_banggaikep_2026_secretkey';
        ApiClient::updateOrCreate(
            ['client_id' => 'mpp_banggaikep_01'],
            [
                'id'             => 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                'name'           => 'Aplikasi Mal Pelayanan Publik (MPP) Kab. Banggai Kepulauan',
                'api_key_hash'   => Hash::make($defaultMppKey),
                'api_key_prefix' => 'bkp_mpp_ban...',
                'allowed_scopes' => [
                    'agenda:read',
                    'agenda:write',
                    'service:read',
                    'service:apply',
                ],
                'ip_whitelist'   => null,
                'is_active'      => true,
            ]
        );

        // 2. Initial Gateway SPLP Pusat Config Template
        SplpConfig::updateOrCreate(
            ['service_name' => 'Gateway SPLP Kemenkominfo RI (Produksi)'],
            [
                'id'           => 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                'base_url'     => 'https://splp.layanan.go.id/api/v1',
                'client_id'    => 'KAB_BANGGAI_KEPULAUAN',
                'client_secret'=> 'SPLP_SECRET_SAMPLE_KEY',
                'service_code' => 'SPLP-PUSAT-001',
                'auth_type'    => 'API_KEY',
                'headers'      => [
                    'X-Instansi-Code' => '7207',
                ],
                'is_active'    => true,
                'last_status'  => 'CONFIGURED',
            ]
        );
    }
}
