<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('AuditLog')) {
            return; // Tabel sudah ada, skip migration
        }

        Schema::create('AuditLog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId')->nullable();
            $table->string('adminName')->default('System');
            $table->string('adminRole')->default('ADMIN');
            $table->string('action');        // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW
            $table->string('module')->nullable();        // BERITA, BANNER, PPID, LAYANAN, USER, GIS, SATU_DATA, SURVEY, PROFIL, MEDIA
            $table->text('description')->nullable();
            $table->text('details')->nullable();
            $table->string('ipAddress')->nullable();
            $table->timestamp('createdAt')->useCurrent();

            $table->foreign('userId')->references('id')->on('User')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('AuditLog');
    }
};
