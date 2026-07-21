<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leader_agendas', function (Blueprint $table) {
            $table->text('photo_url')->nullable()->after('rejection_reason');
            $table->text('speech_doc_url')->nullable()->after('photo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leader_agendas', function (Blueprint $table) {
            $table->dropColumn(['photo_url', 'speech_doc_url']);
        });
    }
};
