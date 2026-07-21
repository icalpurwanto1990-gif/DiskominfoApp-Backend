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
        Schema::table('DigitalService', function (Blueprint $table) {
            $table->text('sop_file')->nullable()->after('form_schema');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('DigitalService', function (Blueprint $table) {
            $table->dropColumn('sop_file');
        });
    }
};
