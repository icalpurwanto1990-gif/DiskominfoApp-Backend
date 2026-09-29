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
        // 1. API Clients (Untuk MPP, OPD, dan sistem eksternal)
        if (!Schema::hasTable('api_clients')) {
            Schema::create('api_clients', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('client_id')->unique();
                $table->string('api_key_hash');
                $table->string('api_key_prefix');
                $table->json('allowed_scopes')->nullable();
                $table->text('ip_whitelist')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 2. SPLP Configurations (Koneksi ke Gateway SPLP Pusat)
        if (!Schema::hasTable('splp_configs')) {
            Schema::create('splp_configs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('service_name');
                $table->string('base_url');
                $table->string('client_id')->nullable();
                $table->text('client_secret')->nullable();
                $table->string('service_code')->nullable();
                $table->string('auth_type')->default('API_KEY');
                $table->json('headers')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_sync_at')->nullable();
                $table->string('last_status')->nullable();
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 3. Interoperability Logs (Audit Trail Transaksi Masuk & Keluar)
        if (!Schema::hasTable('interop_logs')) {
            Schema::create('interop_logs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('direction'); // INBOUND_MPP, OUTBOUND_SPLP
                $table->string('client_name')->nullable();
                $table->string('endpoint');
                $table->string('method', 10);
                $table->integer('status_code');
                $table->string('ip_address', 45)->nullable();
                $table->float('response_time_ms')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamp('createdAt')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interop_logs');
        Schema::dropIfExists('splp_configs');
        Schema::dropIfExists('api_clients');
    }
};
