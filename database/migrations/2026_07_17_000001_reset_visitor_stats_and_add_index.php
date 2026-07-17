<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Kosongkan tabel VisitorLog
        DB::table('VisitorLog')->truncate();

        // 2. Set ulang nilai TOTAL_VISITORS ke 0 di tabel AppStatistic
        DB::table('AppStatistic')->updateOrInsert(
            ['key' => 'TOTAL_VISITORS'],
            ['value' => 0, 'updatedAt' => now()]
        );

        // 3. Tambahkan indeks pada kolom visited_at secara native
        if (Schema::hasTable('VisitorLog')) {
            Schema::table('VisitorLog', function (Blueprint $table) {
                $table->index('visited_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('VisitorLog')) {
            Schema::table('VisitorLog', function (Blueprint $table) {
                $table->dropIndex(['visited_at']);
            });
        }
    }
};
