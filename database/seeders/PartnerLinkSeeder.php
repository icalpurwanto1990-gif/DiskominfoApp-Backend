<?php

namespace Database\Seeders;

use App\Models\PartnerLink;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PartnerLinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partners = [
            [
                'name' => 'Kementerian Kominfo',
                'short' => 'Komdigi',
                'url' => 'https://www.kominfo.go.id',
                'color' => '#1e40af',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Kementerian_Komunikasi_dan_Informatika_RI.svg/120px-Kementerian_Komunikasi_dan_Informatika_RI.svg.png',
                'desc' => 'Kementerian Komunikasi & Digital RI',
                'orderIndex' => 1,
            ],
            [
                'name' => 'BSSN',
                'short' => 'BSSN',
                'url' => 'https://www.bssn.go.id',
                'color' => '#166534',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Logo_Badan_Siber_dan_Sandi_Negara.svg/120px-Logo_Badan_Siber_dan_Sandi_Negara.svg.png',
                'desc' => 'Badan Siber & Sandi Negara',
                'orderIndex' => 2,
            ],
            [
                'name' => 'Bappenas',
                'short' => 'Bappenas',
                'url' => 'https://www.bappenas.go.id',
                'color' => '#7c3aed',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bappenas_Logo.svg/120px-Bappenas_Logo.svg.png',
                'desc' => 'Kementerian PPN / Bappenas RI',
                'orderIndex' => 3,
            ],
            [
                'name' => 'PDIP Sulawesi Tengah',
                'short' => 'Prov. Sulteng',
                'url' => 'https://sultengprov.go.id',
                'color' => '#0e7490',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Coat_arms_Central_Sulawesi.svg/120px-Coat_arms_Central_Sulawesi.svg.png',
                'desc' => 'Pemerintah Provinsi Sulawesi Tengah',
                'orderIndex' => 4,
            ],
            [
                'name' => 'Kemenpan RB',
                'short' => 'Kemenpan RB',
                'url' => 'https://www.menpan.go.id',
                'color' => '#b45309',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Logo_Kemenpan_RB_RI.svg/120px-Logo_Kemenpan_RB_RI.svg.png',
                'desc' => 'Kemen. Pendayagunaan Aparatur Negara',
                'orderIndex' => 5,
            ],
            [
                'name' => 'SP4N LAPOR!',
                'short' => 'SP4N Lapor',
                'url' => 'https://www.lapor.go.id',
                'color' => '#be123c',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/SP4N-Lapor_logo.png/120px-SP4N-Lapor_logo.png',
                'desc' => 'Layanan Aspirasi & Pengaduan Online',
                'orderIndex' => 6,
            ],
            [
                'name' => 'Kementerian Dalam Negeri',
                'short' => 'Kemendagri',
                'url' => 'https://www.kemendagri.go.id',
                'color' => '#0f766e',
                'logo' => 'https://th.bing.com/th/id/ODF.qIdEFZvKP8_x4brJobTNow?w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2',
                'desc' => 'Kementerian Dalam Negeri RI',
                'orderIndex' => 7,
            ],
            [
                'name' => 'BPKP',
                'short' => 'BPKP',
                'url' => 'https://www.bpkp.go.id',
                'color' => '#1d4ed8',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/BPKP-Logo.svg/120px-BPKP-Logo.svg.png',
                'desc' => 'Badan Pengawasan Keuangan & Pembangunan',
                'orderIndex' => 8,
            ],
        ];

        foreach ($partners as $partner) {
            PartnerLink::updateOrCreate(
                ['url' => $partner['url']],
                [
                    'id' => (string) Str::uuid(),
                    'name' => $partner['name'],
                    'short' => $partner['short'],
                    'color' => $partner['color'],
                    'logo' => $partner['logo'],
                    'desc' => $partner['desc'],
                    'active' => true,
                    'orderIndex' => $partner['orderIndex'],
                ]
            );
        }
    }
}
