<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('popup_modal_settings')) {
            Schema::create('popup_modal_settings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->boolean('is_active')->default(true);
                $table->string('content_type')->default('IMAGE'); // IMAGE, SURVEY, ANNOUNCEMENT
                $table->string('title')->nullable()->default('Pengumuman Penting');
                $table->string('image_url')->nullable();
                $table->text('caption')->nullable();
                $table->string('link_url')->nullable();
                $table->string('button_text')->nullable()->default('Lihat Selengkapnya');
                $table->boolean('show_once_per_session')->default(false);
                $table->unsignedInteger('delay_seconds')->default(2);
                $table->timestamps();
            });

            // Insert initial default setting
            DB::table('popup_modal_settings')->insert([
                'id'                    => (string) Str::uuid(),
                'is_active'             => false, // Default false until admin uploads an image/activates it
                'content_type'          => 'IMAGE',
                'title'                 => 'Pengumuman Resmi Diskominfo',
                'image_url'             => null,
                'caption'               => 'Informasi dan pemberitahuan resmi dari Pemerintah Kabupaten Banggai Kepulauan.',
                'link_url'              => null,
                'button_text'           => 'Buka Informasi',
                'show_once_per_session' => false,
                'delay_seconds'         => 2,
                'created_at'            => now(),
                'updated_at'            => now(),
            ]);

            if (Schema::hasTable('module_permissions')) {
                $exists = DB::table('module_permissions')
                    ->where('resource_class', 'App\\Filament\\Pages\\ManagePopupModalSettings')
                    ->first();

                if (!$exists) {
                    DB::table('module_permissions')->insert([
                        'id'             => (string) Str::uuid(),
                        'module_name'    => 'Popup Pengumuman',
                        'resource_class' => 'App\\Filament\\Pages\\ManagePopupModalSettings',
                        'allowed_roles'  => json_encode(['SUPERADMIN', 'ADMIN']),
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('popup_modal_settings');
    }
};
