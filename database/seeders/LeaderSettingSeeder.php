<?php

namespace Database\Seeders;

use App\Models\LeaderSetting;
use Illuminate\Database\Seeder;

class LeaderSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = LeaderSetting::getDefaults();

        foreach ($defaults as $key => $value) {
            LeaderSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
