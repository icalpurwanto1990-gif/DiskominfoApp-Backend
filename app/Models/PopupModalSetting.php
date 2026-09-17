<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PopupModalSetting extends Model
{
    use HasUuids;

    protected $table = 'popup_modal_settings';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'is_active',
        'content_type',
        'title',
        'image_url',
        'caption',
        'link_url',
        'button_text',
        'show_once_per_session',
        'delay_seconds',
    ];

    protected $casts = [
        'is_active'             => 'boolean',
        'show_once_per_session' => 'boolean',
        'delay_seconds'         => 'integer',
    ];

    public static function getActiveSetting(): self
    {
        $setting = static::first();
        if (! $setting) {
            $setting = static::create([
                'is_active'             => false,
                'content_type'          => 'IMAGE',
                'title'                 => 'Pengumuman Resmi Diskominfo',
                'image_url'             => null,
                'caption'               => null,
                'link_url'              => null,
                'button_text'           => 'Lihat Selengkapnya',
                'show_once_per_session' => false,
                'delay_seconds'         => 2,
            ]);
        }

        return $setting;
    }
}
