<?php

namespace App\Services;

class Google2FAService
{
    /**
     * Generate a new 16-character base32 secret.
     */
    public function generateSecret(): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        for ($i = 0; $i < 16; $i++) {
            $secret .= $chars[random_int(0, 31)];
        }
        return $secret;
    }

    /**
     * Get the QR Code URL using a free QR code API.
     */
    public function getQRUrl(string $email, string $secret): string
    {
        $label = rawurlencode('Diskominfo Bangkep: ' . $email);
        $issuer = rawurlencode('Diskominfo Bangkep');
        $otpauth = "otpauth://totp/{$label}?secret={$secret}&issuer={$issuer}";
        return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($otpauth);
    }

    /**
     * Verify a 6-digit TOTP code.
     */
    public function verify(string $secret, string $code, int $discrepancy = 1): bool
    {
        if (strlen($code) !== 6 || !is_numeric($code)) {
            return false;
        }

        $currentTimeSlice = floor(time() / 30);

        for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
            $calculatedCode = $this->calculateCode($secret, $currentTimeSlice + $i);
            if (hash_equals($calculatedCode, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate TOTP code for a specific time slice.
     */
    private function calculateCode(string $secret, int $timeSlice): string
    {
        $secretKey = $this->base32Decode($secret);

        // Pack time slice into binary string
        $time = pack('N*', 0) . pack('N*', $timeSlice);

        // Calculate HMAC-SHA1
        $hmac = hash_hmac('sha1', $time, $secretKey, true);

        // Extract 4 bytes
        $offset = ord(substr($hmac, -1)) & 0x0F;
        $hashpart = substr($hmac, $offset, 4);

        // Convert to integer
        $value = unpack('N', $hashpart);
        $value = $value[1];
        $value = $value & 0x7FFFFFFF;

        // Modulo 10^6
        $modulo = 10 ** 6;
        $code = $value % $modulo;

        // Zero-pad
        return str_pad((string) $code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Base32 decoding helper.
     */
    private function base32Decode(string $base32): string
    {
        $base32 = strtoupper($base32);
        if (!preg_match('/^[A-Z2-7]+$/', $base32)) {
            return '';
        }

        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $map = array_flip(str_split($chars));

        $binary = '';
        foreach (str_split($base32) as $char) {
            if (!isset($map[$char])) {
                continue;
            }
            $binary .= str_pad(decbin($map[$char]), 5, '0', STR_PAD_LEFT);
        }

        $bytes = '';
        foreach (str_split($binary, 8) as $binChunk) {
            if (strlen($binChunk) < 8) {
                break;
            }
            $bytes .= chr(bindec($binChunk));
        }

        return $bytes;
    }
}
