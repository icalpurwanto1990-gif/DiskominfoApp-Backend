<?php

namespace Database\Seeders;

use App\Models\ModulePermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ModulePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'name' => 'Statistik Aplikasi',
                'class' => 'App\Filament\Resources\AppStatisticResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Log Audit',
                'class' => 'App\Filament\Resources\AuditLogResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Banners/Sliders',
                'class' => 'App\Filament\Resources\BannerResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Kategori Berita',
                'class' => 'App\Filament\Resources\CategoryResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Aduan & Hubungi Kami',
                'class' => 'App\Filament\Resources\ContactComplaintResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Dataset Sektoral',
                'class' => 'App\Filament\Resources\DatasetResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Katalog Layanan',
                'class' => 'App\Filament\Resources\DigitalServiceResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Dokumen Publik PPID',
                'class' => 'App\Filament\Resources\DocumentResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Infrastruktur Peta GIS',
                'class' => 'App\Filament\Resources\GisInfrastructureResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Galeri Media',
                'class' => 'App\Filament\Resources\MediaResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Manajemen Menu Website',
                'class' => 'App\Filament\Resources\MenuResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Link Terkait/Mitra',
                'class' => 'App\Filament\Resources\PartnerLinkResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Berita & Pengumuman',
                'class' => 'App\Filament\Resources\PostResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Keberatan Informasi PPID',
                'class' => 'App\Filament\Resources\PpidObjectionResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Permohonan Informasi PPID',
                'class' => 'App\Filament\Resources\PpidRequestResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Pengajuan Layanan Digital',
                'class' => 'App\Filament\Resources\ServiceRequestResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Akun Media Sosial',
                'class' => 'App\Filament\Resources\SocialMediaResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Daftar Aparatur / Staff',
                'class' => 'App\Filament\Resources\StaffResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Pengajuan TTE',
                'class' => 'App\Filament\Resources\TteRequestResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Manajemen Akun Admin',
                'class' => 'App\Filament\Resources\UserResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Nilai Prestasi SPBE',
                'class' => 'App\Filament\Resources\SpbeAchievementResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Indikator Kinerja SPBE',
                'class' => 'App\Filament\Resources\SpbeIndicatorResource',
                'roles' => ['SUPERADMIN'],
            ],
            [
                'name' => 'Kategori Layanan Survey',
                'class' => 'App\Filament\Resources\SurveyCategoryResource',
                'roles' => ['SUPERADMIN', 'ADMIN'],
            ],
            [
                'name' => 'Agenda Pimpinan',
                'class' => 'App\Filament\Resources\LeaderAgendaResource',
                'roles' => ['SUPERADMIN', 'ADMIN', 'PROTOKOL', 'USER'],
            ],
        ];

        foreach ($modules as $mod) {
            ModulePermission::updateOrCreate(
                ['resource_class' => $mod['class']],
                [
                    'module_name' => $mod['name'],
                    'allowed_roles' => $mod['roles'],
                ]
            );
        }
    }
}
