<?php

namespace Database\Seeders;

use App\Models\SurveyCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SurveyCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Layanan Informasi',
            'Layanan PPID',
            'Aksesibilitas Website',
            'Pengajuan TTE',
            'Aduan Jaringan',
        ];

        foreach ($categories as $name) {
            SurveyCategory::updateOrCreate(
                ['name' => $name],
                [
                    'id' => (string) Str::uuid(),
                    'active' => true,
                ]
            );
        }
    }
}
