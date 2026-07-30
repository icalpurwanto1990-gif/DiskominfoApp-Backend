<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * WhatsApp Notification Service
 *
 * Mendukung dua provider WA Gateway yang umum digunakan:
 * 1. Fonnte (fonnte.com) - provider WA Indonesia populer
 * 2. Custom HTTP Webhook (format umum / n8n)
 *
 * Konfigurasi via .env:
 *   WHATSAPP_DRIVER=fonnte        # fonnte | webhook | null
 *   WHATSAPP_FONNTE_TOKEN=xxx     # API token dari dashboard fonnte.com
 *   WHATSAPP_WEBHOOK_URL=https://  # URL endpoint webhook Anda
 *   WHATSAPP_WEBHOOK_TOKEN=xxx    # Bearer token webhook (jika diperlukan)
 */
class WhatsAppNotificationService
{
    protected string $driver;

    public function __construct()
    {
        $this->driver = config('services.whatsapp.driver', 'null');
    }

    /**
     * Kirim pesan WhatsApp ke nomor tujuan.
     *
     * @param  string  $phoneNumber  Nomor HP pemohon (format: 08xxx atau 628xxx)
     * @param  string  $message      Pesan teks yang akan dikirim
     * @return bool    True jika berhasil dikirim, false jika gagal atau driver null
     */
    public function send(string $phoneNumber, string $message): bool
    {
        if ($this->driver === 'null' || empty($phoneNumber)) {
            Log::info("WhatsApp notification skipped (driver: {$this->driver}, phone: {$phoneNumber})");
            return false;
        }

        // Normalize phone number to 62xxx format
        $normalizedPhone = $this->normalizePhone($phoneNumber);

        try {
            return match ($this->driver) {
                'fonnte'  => $this->sendViaFonnte($normalizedPhone, $message),
                'webhook' => $this->sendViaWebhook($normalizedPhone, $message),
                default   => false,
            };
        } catch (\Exception $e) {
            Log::error("WhatsApp send error [{$this->driver}] to {$normalizedPhone}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim via Fonnte API (fonnte.com)
     * Dokumentasi: https://fonnte.com/docs
     */
    private function sendViaFonnte(string $phone, string $message): bool
    {
        $token = config('services.whatsapp.fonnte_token');

        if (empty($token)) {
            Log::warning('WhatsApp Fonnte: WHATSAPP_FONNTE_TOKEN tidak dikonfigurasi.');
            return false;
        }

        $response = Http::withHeaders([
            'Authorization' => $token,
        ])->post('https://api.fonnte.com/send', [
            'target'  => $phone,
            'message' => $message,
        ]);

        if ($response->successful() && ($response->json('status') === true || $response->json('status') === 'true')) {
            Log::info("WhatsApp Fonnte: Pesan berhasil dikirim ke {$phone}");
            return true;
        }

        Log::error("WhatsApp Fonnte error: " . $response->body());
        return false;
    }

    /**
     * Kirim via HTTP Webhook (custom endpoint / n8n / Make.com)
     * Mengirim JSON payload ke URL yang dikonfigurasi.
     */
    private function sendViaWebhook(string $phone, string $message): bool
    {
        $webhookUrl = config('services.whatsapp.webhook_url');
        $token      = config('services.whatsapp.webhook_token');

        if (empty($webhookUrl)) {
            Log::warning('WhatsApp Webhook: WHATSAPP_WEBHOOK_URL tidak dikonfigurasi.');
            return false;
        }

        $request = Http::asJson();

        if (!empty($token)) {
            $request = $request->withToken($token);
        }

        $response = $request->post($webhookUrl, [
            'phone'   => $phone,
            'message' => $message,
        ]);

        if ($response->successful()) {
            Log::info("WhatsApp Webhook: Pesan berhasil dikirim ke {$phone}");
            return true;
        }

        Log::error("WhatsApp Webhook error: " . $response->body());
        return false;
    }

    /**
     * Normalisasi nomor HP ke format internasional 62xxx.
     * Contoh: 08123456789 → 628123456789
     */
    private function normalizePhone(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/\D/', '', $phone);

        if (str_starts_with($phone, '0')) {
            // 08xxx → 628xxx
            return '62' . substr($phone, 1);
        }

        if (str_starts_with($phone, '8')) {
            // 8xxx → 628xxx (already without leading 0)
            return '62' . $phone;
        }

        // Already in 62xxx or +62xxx format
        return ltrim($phone, '+');
    }
}
