<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('VisitorLog')) {
            Schema::create('VisitorLog', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->string('device')->default('Desktop');
                $table->string('browser')->default('Other');
                $table->string('platform')->default('Other');
                $table->timestamp('visited_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('VisitorLog');
    }
};
