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
        if (!Schema::hasTable('survey_widget_settings')) {
            Schema::create('survey_widget_settings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title')->default('Survey Kepuasan Masyarakat');
                $table->text('subtitle')->default('Bantu kami meningkatkan pelayanan publik dengan memberikan penilaian Anda.');
                $table->string('qr_image')->nullable()->default('/images/survey-qr.png');
                $table->text('qr_caption')->nullable()->default('📱 Scan QR untuk mengisi survey via ponsel');
                $table->string('qr_link')->nullable();
                $table->boolean('show_qr')->default(true);
                $table->string('divider_text')->default('atau isi di sini');
                $table->string('thank_you_title')->default('Terima Kasih!');
                $table->text('thank_you_message')->default('Umpan balik Anda telah kami terima. Data ini sangat berharga untuk meningkatkan kualitas pelayanan publik digital di Kabupaten Banggai Kepulauan.');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });

            // Insert initial default settings record
            DB::table('survey_widget_settings')->insert([
                'id' => (string) Illuminate\Support\Str::uuid(),
                'title' => 'Survey Kepuasan Masyarakat',
                'subtitle' => 'Bantu kami meningkatkan pelayanan publik dengan memberikan penilaian Anda.',
                'qr_image' => '/images/survey-qr.png',
                'qr_caption' => '📱 Scan QR untuk mengisi survey via ponsel',
                'qr_link' => null,
                'show_qr' => true,
                'divider_text' => 'atau isi di sini',
                'thank_you_title' => 'Terima Kasih!',
                'thank_you_message' => 'Umpan balik Anda telah kami terima. Data ini sangat berharga untuk meningkatkan kualitas pelayanan publik digital di Kabupaten Banggai Kepulauan.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_widget_settings');
    }
};
