<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendTestMail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {email? : Alamat email tujuan untuk pengujian}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim email uji coba untuk memverifikasi koneksi dan konfigurasi Mailer/SMTP';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('====================================================');
        $this->info('   PORTAL DISKOMINFO BANGKEP - DIAGNOSTIK MAILER    ');
        $this->info('====================================================');

        $defaultMailer = config('mail.default');
        $smtpConfig    = config('mail.mailers.smtp', []);
        $fromAddress   = config('mail.from.address');
        $fromName      = config('mail.from.name');

        $this->table(
            ['Parameter', 'Nilai Saat Ini'],
            [
                ['Default Mailer', $defaultMailer],
                ['SMTP Host', $smtpConfig['host'] ?? '-'],
                ['SMTP Port', $smtpConfig['port'] ?? '-'],
                ['SMTP Scheme', $smtpConfig['scheme'] ?? '(auto / default)'],
                ['SMTP Username', $smtpConfig['username'] ?? '-'],
                ['From Address', $fromAddress ?? '-'],
                ['From Name', $fromName ?? '-'],
                ['Queue Connection', config('queue.default')],
            ]
        );

        $targetEmail = $this->argument('email');
        if (! $targetEmail) {
            $targetEmail = $this->ask('Masukkan alamat email tujuan pengujian', $fromAddress ?: 'admin@banggaikep.go.id');
        }

        if (! filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            $this->error("Format email [{$targetEmail}] tidak valid!");
            return Command::FAILURE;
        }

        $this->newLine();
        $this->comment("Mengirim email uji coba ke [{$targetEmail}] menggunakan driver [{$defaultMailer}]...");

        try {
            $startTime = microtime(true);

            Mail::raw(
                "Halo,\n\nIni adalah email uji coba dari Portal Diskominfo Bangkep.\n\nWaktu Kirim: " . date('Y-m-d H:i:s') . "\nMailer Driver: {$defaultMailer}\nHost: " . ($smtpConfig['host'] ?? 'local') . "\n\nJika Anda membaca pesan ini, konfigurasi mailer sistem Anda telah berfungsi dengan BAIK dan BENAR.\n\nSalam,\nTim Pengembang Diskominfo Bangkep",
                function ($message) use ($targetEmail, $fromAddress, $fromName) {
                    $message->to($targetEmail)
                        ->subject('[UJI COBA] Diagnostik Mailer Portal Diskominfo Bangkep - ' . date('d M Y H:i'));

                    if ($fromAddress) {
                        $message->from($fromAddress, $fromName);
                    }
                }
            );

            $duration = round(microtime(true) - $startTime, 2);

            $this->newLine();
            $this->info("✅ SUKSES! Email uji coba berhasil dikirim dalam {$duration} detik.");

            if ($defaultMailer === 'log') {
                $this->warn("Catatan: Mailer saat ini disetel ke 'log'. Email tidak dikirim ke internet, melainkan dicatat di berkas: storage/logs/laravel.log");
            } else {
                $this->info("Silakan periksa kotak masuk (atau folder SPAM) dari {$targetEmail}.");
            }

            return Command::SUCCESS;
        } catch (Throwable $e) {
            $this->newLine();
            $this->error("❌ GAGAL! Terjadi kesalahan saat pengiriman email:");
            $this->line("Tipe Error: " . get_class($e));
            $this->line("Pesan: " . $e->getMessage());

            $this->newLine();
            $this->warn("Panduan Pemecahan Masalah (Troubleshooting Tips):");
            $this->line("1. Jika pesan error 'UnsupportedSchemeException': pastikan MAIL_SCHEME di .env dikosongkan atau disetel ke 'smtp' / 'smtps'.");
            $this->line("2. Jika pesan error 'Connection refused' atau 'Connection timed out': periksa apakah port {$smtpConfig['port']} diblokir firewall/hosting, atau ubah antara 587 (STARTTLS) vs 465 (SSL).");
            $this->line("3. Jika pesan error 'Authentication failed' (535): periksa kembali kesesuaian MAIL_USERNAME dan MAIL_PASSWORD di file .env.");
            $this->line("4. Untuk pengujian lokal tanpa internet: ubah MAIL_MAILER=log di file .env.");

            return Command::FAILURE;
        }
    }
}
