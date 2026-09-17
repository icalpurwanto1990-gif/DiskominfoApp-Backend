<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('module_permissions')) {
            $modules = [
                [
                    'name' => 'Hasil & Respon Survey',
                    'class' => 'App\\Filament\\Resources\\SurveyResponseResource',
                    'roles' => json_encode(['SUPERADMIN', 'ADMIN']),
                ],
                [
                    'name' => 'Pengaturan Survey Widget',
                    'class' => 'App\\Filament\\Pages\\ManageSurveyWidgetSettings',
                    'roles' => json_encode(['SUPERADMIN', 'ADMIN']),
                ],
            ];

            foreach ($modules as $mod) {
                $existing = DB::table('module_permissions')
                    ->where('resource_class', $mod['class'])
                    ->first();

                if ($existing) {
                    DB::table('module_permissions')
                        ->where('resource_class', $mod['class'])
                        ->update([
                            'module_name' => $mod['name'],
                            'allowed_roles' => $mod['roles'],
                            'updated_at' => now(),
                        ]);
                } else {
                    DB::table('module_permissions')->insert([
                        'id' => (string) Str::uuid(),
                        'module_name' => $mod['name'],
                        'resource_class' => $mod['class'],
                        'allowed_roles' => $mod['roles'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('module_permissions')) {
            DB::table('module_permissions')
                ->whereIn('resource_class', [
                    'App\\Filament\\Resources\\SurveyResponseResource',
                    'App\\Filament\\Pages\\ManageSurveyWidgetSettings',
                ])
                ->delete();
        }
    }
};
