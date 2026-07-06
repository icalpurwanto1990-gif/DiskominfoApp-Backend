<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed kategori default terlebih dahulu
        $this->call([
            CategorySeeder::class,
            MenuSeeder::class,
            PartnerLinkSeeder::class,
            SocialMediaSeeder::class,
            GisInfrastructureSeeder::class,
            ModulePermissionSeeder::class,
            SurveyCategorySeeder::class,
        ]);

        User::updateOrCreate(
            ['email' => 'admin@banggaikep.go.id'],
            [
                'name' => 'Administrator Diskominfo',
                'password' => Hash::make('adminpassword2026'),
                'role' => 'SUPERADMIN',
                'nip' => '198504122010011002',
                'jabatan' => 'Pranata Komputer Madya',
                'instansi' => 'Dinas Komunikasi dan Informatika',
            ]
        );

        User::updateOrCreate(
            ['email' => 'budi@banggaikep.go.id'],
            [
                'name' => 'Budi Setiawan',
                'password' => Hash::make('password'),
                'role' => 'USER',
                'nip' => '199208152018021001',
                'jabatan' => 'Staf Bidang Aptika',
                'instansi' => 'Dinas Komunikasi dan Informatika',
            ]
        );
    }
}
