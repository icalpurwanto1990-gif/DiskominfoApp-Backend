<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SurveyWidgetSetting extends Model
{
    use HasUuids;

    protected $table = 'survey_widget_settings';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'subtitle',
        'qr_image',
        'qr_caption',
        'qr_link',
        'show_qr',
        'divider_text',
        'thank_you_title',
        'thank_you_message',
        'is_active',
    ];

    protected $casts = [
        'show_qr' => 'boolean',
        'is_active' => 'boolean',
    ];

    public static function getActiveSettings(): self
    {
        $setting = static::first();
        if (! $setting) {
            $setting = static::create([
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
            ]);
        }

        return $setting;
    }
}
