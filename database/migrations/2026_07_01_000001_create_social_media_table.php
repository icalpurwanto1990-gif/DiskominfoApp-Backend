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
        Schema::create('SocialMedia', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('platform');
            $table->string('url');
            $table->boolean('active')->default(true);
            $table->integer('orderIndex')->default(0);
            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('SocialMedia');
    }
};
