<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Extends the AppStatistic table from a simple key-value store into a
     * fully customizable statistics system managed by administrators.
     */
    public function up(): void
    {
        // -------------------------------------------------------
        // 1. Create the table fresh if it doesn't exist yet
        // -------------------------------------------------------
        if (! Schema::hasTable('AppStatistic')) {
            Schema::create('AppStatistic', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('key')->unique();
                $table->string('value')->default('0');
                $table->string('label')->default('');
                $table->string('suffix')->nullable();
                $table->string('desc')->nullable();
                $table->string('icon')->default('BarChart3');
                $table->string('color')->default('emerald');
                $table->boolean('is_published')->default(true);
                $table->integer('order_index')->default(0);
                $table->timestamp('updatedAt')->nullable();
            });

            // Seed default data
            $this->seedDefaults();
            return;
        }

        // -------------------------------------------------------
        // 2. Add new columns to existing table (idempotent)
        // -------------------------------------------------------
        Schema::table('AppStatistic', function (Blueprint $table) {
            // Change value to string to allow free-form values
            if (Schema::hasColumn('AppStatistic', 'value')) {
                $table->string('value')->default('0')->change();
            }
            if (! Schema::hasColumn('AppStatistic', 'label')) {
                $table->string('label')->default('');
            }
            if (! Schema::hasColumn('AppStatistic', 'suffix')) {
                $table->string('suffix')->nullable();
            }
            if (! Schema::hasColumn('AppStatistic', 'desc')) {
                $table->string('desc')->nullable();
            }
            if (! Schema::hasColumn('AppStatistic', 'icon')) {
                $table->string('icon')->default('BarChart3');
            }
            if (! Schema::hasColumn('AppStatistic', 'color')) {
                $table->string('color')->default('emerald');
            }
            if (! Schema::hasColumn('AppStatistic', 'is_published')) {
                $table->boolean('is_published')->default(true);
            }
            if (! Schema::hasColumn('AppStatistic', 'order_index')) {
                $table->integer('order_index')->default(0);
            }
        });

        // -------------------------------------------------------
        // 3. Back-fill labels for existing rows
        // -------------------------------------------------------
        $this->backfillExistingRows();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('AppStatistic', function (Blueprint $table) {
            $table->dropColumn(['label', 'suffix', 'desc', 'icon', 'color', 'is_published', 'order_index']);
        });
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    private function backfillExistingRows(): void
    {
        $map = [
            'TOTAL_VISITORS' => [
                'label'       => 'Pengunjung Website',
                'suffix'      => '+',
                'desc'        => 'Kunjungan tahun ini',
                'icon'        => 'TrendingUp',
                'color'       => 'emerald',
                'order_index' => 1,
            ],
            'TOTAL_TTE_ISSUED' => [
                'label'       => 'Sertifikat TTE Terbit',
                'suffix'      => null,
                'desc'        => 'Aparatur Sipil Negara',
                'icon'        => 'ShieldCheck',
                'color'       => 'blue',
                'order_index' => 2,
            ],
            'OPD_WEBSITE_COUNT' => [
                'label'       => 'Website OPD Aktif',
                'suffix'      => null,
                'desc'        => 'Portal Dinas / Kecamatan',
                'icon'        => 'Users',
                'color'       => 'purple',
                'order_index' => 3,
            ],
            'APP_OPD_COUNT' => [
                'label'       => 'Aplikasi Daerah',
                'suffix'      => null,
                'desc'        => 'Sistem Digital Terintegrasi',
                'icon'        => 'Cpu',
                'color'       => 'amber',
                'order_index' => 4,
            ],
        ];

        foreach ($map as $key => $data) {
            DB::table('AppStatistic')
                ->where('key', $key)
                ->update(array_merge($data, ['is_published' => true]));
        }
    }

    private function seedDefaults(): void
    {
        $defaults = [
            [
                'id'          => \Illuminate\Support\Str::uuid(),
                'key'         => 'TOTAL_VISITORS',
                'value'       => '14258',
                'label'       => 'Pengunjung Website',
                'suffix'      => '+',
                'desc'        => 'Kunjungan tahun ini',
                'icon'        => 'TrendingUp',
                'color'       => 'emerald',
                'is_published'=> true,
                'order_index' => 1,
                'updatedAt'   => now(),
            ],
            [
                'id'          => \Illuminate\Support\Str::uuid(),
                'key'         => 'TOTAL_TTE_ISSUED',
                'value'       => '377',
                'label'       => 'Sertifikat TTE Terbit',
                'suffix'      => null,
                'desc'        => 'Aparatur Sipil Negara',
                'icon'        => 'ShieldCheck',
                'color'       => 'blue',
                'is_published'=> true,
                'order_index' => 2,
                'updatedAt'   => now(),
            ],
            [
                'id'          => \Illuminate\Support\Str::uuid(),
                'key'         => 'OPD_WEBSITE_COUNT',
                'value'       => '28',
                'label'       => 'Website OPD Aktif',
                'suffix'      => null,
                'desc'        => 'Portal Dinas / Kecamatan',
                'icon'        => 'Users',
                'color'       => 'purple',
                'is_published'=> true,
                'order_index' => 3,
                'updatedAt'   => now(),
            ],
            [
                'id'          => \Illuminate\Support\Str::uuid(),
                'key'         => 'APP_OPD_COUNT',
                'value'       => '45',
                'label'       => 'Aplikasi Daerah',
                'suffix'      => null,
                'desc'        => 'Sistem Digital Terintegrasi',
                'icon'        => 'Cpu',
                'color'       => 'amber',
                'is_published'=> true,
                'order_index' => 4,
                'updatedAt'   => now(),
            ],
        ];

        DB::table('AppStatistic')->insert($defaults);
    }
};
