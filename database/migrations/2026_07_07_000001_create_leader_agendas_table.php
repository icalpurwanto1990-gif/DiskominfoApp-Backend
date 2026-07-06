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
        if (!Schema::hasTable('leader_agendas')) {
            Schema::create('leader_agendas', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('user_id')->constrained('User')->cascadeOnDelete();
                $table->string('title');
                $table->date('date');
                $table->string('time');
                $table->string('location');
                $table->string('organizer');
                $table->string('letter_file');
                $table->string('notes')->nullable();
                $table->string('leader_name')->nullable();
                $table->string('status')->default('PENDING'); // PENDING, PROTOKOL_APPROVED, PUBLISHED, REJECTED
                $table->text('rejection_reason')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leader_agendas');
    }
};
