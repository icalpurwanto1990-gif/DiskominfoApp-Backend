<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Beranda
        Menu::create([
            'label' => 'Beranda',
            'url' => '/',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 2. Profil (dengan Submenu)
        $profil = Menu::create([
            'label' => 'Profil',
            'url' => '/profil',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Sejarah Dinas',
            'url' => '/profil#sejarah',
            'parent_id' => $profil->id,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Visi & Misi',
            'url' => '/profil#visi-misi',
            'parent_id' => $profil->id,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Struktur Organisasi',
            'url' => '/profil#struktur',
            'parent_id' => $profil->id,
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // 3. Berita
        Menu::create([
            'label' => 'Berita',
            'url' => '/berita',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // 4. PPID (dengan Submenu)
        $ppid = Menu::create([
            'label' => 'PPID',
            'url' => '/ppid',
            'sort_order' => 4,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Profil & Layanan PPID',
            'url' => '/ppid',
            'parent_id' => $ppid->id,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Informasi Secara Berkala',
            'url' => '/ppid/berkala',
            'parent_id' => $ppid->id,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Informasi Serta Merta',
            'url' => '/ppid/serta-merta',
            'parent_id' => $ppid->id,
            'sort_order' => 3,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Informasi Tersedia Setiap Saat',
            'url' => '/ppid/setiap-saat',
            'parent_id' => $ppid->id,
            'sort_order' => 4,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'Daftar Informasi Publik',
            'url' => '/ppid/daftar-informasi-publik',
            'parent_id' => $ppid->id,
            'sort_order' => 5,
            'is_active' => true,
        ]);

        Menu::create([
            'label' => 'SOP Pelayanan PPID',
            'url' => '/ppid/sop-pelayanan',
            'parent_id' => $ppid->id,
            'sort_order' => 6,
            'is_active' => true,
        ]);

        // 5. Layanan
        Menu::create([
            'label' => 'Layanan',
            'url' => '/layanan',
            'sort_order' => 5,
            'is_active' => true,
        ]);

        // 6. Smart Gov
        Menu::create([
            'label' => 'Smart Gov',
            'url' => '/dashboard',
            'sort_order' => 6,
            'is_active' => true,
        ]);

        // 7. Satu Data
        Menu::create([
            'label' => 'Satu Data',
            'url' => '/satu-data',
            'sort_order' => 7,
            'is_active' => true,
        ]);

        // 7.5. Agenda Pimpinan
        Menu::create([
            'label' => 'Agenda Pimpinan',
            'url' => '/agenda',
            'sort_order' => 8,
            'is_active' => true,
        ]);

        // 8. Peta GIS
        Menu::create([
            'label' => 'Peta GIS',
            'url' => '/gis',
            'sort_order' => 9,
            'is_active' => true,
        ]);

        // 9. Media
        Menu::create([
            'label' => 'Media',
            'url' => '/media',
            'sort_order' => 10,
            'is_active' => true,
        ]);

        // 10. Kontak
        Menu::create([
            'label' => 'Kontak',
            'url' => '/kontak',
            'sort_order' => 11,
            'is_active' => true,
        ]);
    }
}
