<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Notification Gateway
    |--------------------------------------------------------------------------
    | Driver: 'fonnte' | 'webhook' | 'null'
    | - fonnte  : Gunakan API Fonnte (fonnte.com) — provider WA Gateway Indonesia
    | - webhook : Kirim ke HTTP endpoint custom (n8n, Make.com, dll)
    | - null    : Nonaktifkan notifikasi WhatsApp
    */
    'whatsapp' => [
        'driver'        => env('WHATSAPP_DRIVER', 'null'),
        'fonnte_token'  => env('WHATSAPP_FONNTE_TOKEN'),
        'webhook_url'   => env('WHATSAPP_WEBHOOK_URL'),
        'webhook_token' => env('WHATSAPP_WEBHOOK_TOKEN'),
    ],

];

