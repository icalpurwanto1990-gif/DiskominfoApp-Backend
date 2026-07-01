<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Seed kategori default agar query di HomeController dapat menemukan
     * kategori "Pengumuman" dengan slug yang konsisten.
     */
    public function run(): void
    {
        $defaultCategories = [
            [
                'name'       => 'Pengumuman',
                'slug'       => 'pengumuman',
                'isMenu'     => true,
                'orderIndex' => 1,
            ],
            [
                'name'       => 'Berita',
                'slug'       => 'berita',
                'isMenu'     => true,
                'orderIndex' => 2,
            ],
            [
                'name'       => 'Artikel',
                'slug'       => 'artikel',
                'isMenu'     => true,
                'orderIndex' => 3,
            ],
            [
                'name'       => 'Siaran Pers',
                'slug'       => 'siaran-pers',
                'isMenu'     => false,
                'orderIndex' => 4,
            ],
        ];

        foreach ($defaultCategories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                [
                    'name'       => $cat['name'],
                    'isMenu'     => $cat['isMenu'],
                    'orderIndex' => $cat['orderIndex'],
                ]
            );
        }
    }
}
