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
        Schema::create('TteRequest', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('user_id')->nullable();
            $table->string('nama');
            $table->string('nip');
            $table->string('nik');
            $table->string('jabatan');
            $table->string('instansi');
            $table->string('dokumen_rekomendasi')->nullable();
            $table->string('dokumen_ktp')->nullable();
            $table->string('status')->default('DRAFT');
            $table->text('catatan_admin')->nullable();

            // PostgreSQL compatibility: createdAt & updatedAt
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();

            // Foreign key relation
            $table->foreign('user_id')->references('id')->on('User')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('TteRequest');
    }
};
