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
        if (!Schema::hasTable('module_permissions')) {
            Schema::create('module_permissions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('module_name');
                $table->string('resource_class')->unique();
                $table->json('allowed_roles');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_permissions');
    }
};
