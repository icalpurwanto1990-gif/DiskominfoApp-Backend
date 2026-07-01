<?php

namespace Database\Seeders;

use App\Models\SocialMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SocialMediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $socials = [
            [
                'platform' => 'Facebook',
                'url' => 'https://facebook.com',
                'orderIndex' => 1,
            ],
            [
                'platform' => 'Instagram',
                'url' => 'https://instagram.com',
                'orderIndex' => 2,
            ],
            [
                'platform' => 'YouTube',
                'url' => 'https://youtube.com',
                'orderIndex' => 3,
            ],
        ];

        foreach ($socials as $social) {
            SocialMedia::updateOrCreate(
                ['platform' => $social['platform']],
                [
                    'id' => (string) Str::uuid(),
                    'url' => $social['url'],
                    'active' => true,
                    'orderIndex' => $social['orderIndex'],
                ]
            );
        }
    }
}
