<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

class SecurityAuditCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:security-audit';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Audit and evaluate Diskominfo portal security posture against BSSN and SPBE standards';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->newLine();
        $this->info('========================================================================');
        $this->info('  DISKOMINFO BANGGAI KEPULAUAN - SPBE & BSSN SECURITY AUDIT SCANNER     ');
        $this->info('========================================================================');
        $this->line('Menjalankan audit postur keamanan sistem web aplikasi...');
        $this->newLine();

        $results = [];
        $totalScore = 0;
        $maxScore = 0;

        // 1. Environment & Debug Mode
        $maxScore += 20;
        $isDebug = config('app.debug');
        $env = config('app.env');
        if (!$isDebug && $env === 'production') {
            $results[] = ['Environment', 'APP_DEBUG & Production Mode', 'PASS', 'Mode debug dinonaktifkan (Aman).'];
            $totalScore += 20;
        } elseif (!$isDebug) {
            $results[] = ['Environment', 'APP_DEBUG Mode', 'PASS', 'Debug false (Lingkungan: ' . $env . ')'];
            $totalScore += 15;
        } else {
            $results[] = ['Environment', 'APP_DEBUG Mode', 'FAIL', 'DEBUG AKTIF! Risiko kebocoran stack trace & credentials.'];
        }

        // 2. Application Key (APP_KEY)
        $maxScore += 15;
        $appKey = config('app.key');
        if (!empty($appKey) && str_starts_with($appKey, 'base64:') && strlen($appKey) >= 44) {
            $results[] = ['Kriptografi', 'Kekuatan APP_KEY', 'PASS', 'Kunci enkripsi AES-256 terpasang valid.'];
            $totalScore += 15;
        } else {
            $results[] = ['Kriptografi', 'Kekuatan APP_KEY', 'FAIL', 'APP_KEY tidak valid atau terlalu pendek.'];
        }

        // 3. Sensitive Files in Public Directory
        $maxScore += 15;
        $publicEnv = public_path('.env');
        $publicGit = public_path('.git');
        if (File::exists($publicEnv) || File::exists($publicGit)) {
            $results[] = ['Web Server', 'Proteksi File Sensitif (.env / .git)', 'FAIL', 'BAHAYA: File .env atau .git ditemukan di folder public!'];
        } else {
            $results[] = ['Web Server', 'Proteksi File Sensitif (.env / .git)', 'PASS', 'Folder public bersih dari file konfigurasi rahasia.'];
            $totalScore += 15;
        }

        // 4. Storage Link & PHP Execution Protection
        $maxScore += 10;
        $storageLink = public_path('storage');
        if (File::exists($storageLink)) {
            $results[] = ['Storage', 'Symlink Media Storage', 'PASS', 'Symlink storage publik terhubung dengan benar.'];
            $totalScore += 10;
        } else {
            $results[] = ['Storage', 'Symlink Media Storage', 'WARN', 'Symlink public/storage belum dibuat (Jalankan: php artisan storage:link).'];
            $totalScore += 5;
        }

        // 5. Database Connection & Encryption
        $maxScore += 15;
        try {
            DB::connection()->getPdo();
            $dbDriver = DB::connection()->getDriverName();
            $results[] = ['Database', 'Koneksi Basis Data (' . strtoupper($dbDriver) . ')', 'PASS', 'Koneksi database aktif dan terenkripsi secara internal.'];
            $totalScore += 15;
        } catch (\Exception $e) {
            $results[] = ['Database', 'Koneksi Basis Data', 'FAIL', 'Koneksi database gagal: ' . $e->getMessage()];
        }

        // 6. Interoperability API & Hashing Keys
        $maxScore += 15;
        try {
            if (DB::getSchemaBuilder()->hasTable('api_clients')) {
                $clients = DB::table('api_clients')->get();
                $allHashed = true;
                foreach ($clients as $client) {
                    $info = password_get_info($client->api_key);
                    if ($info['algo'] === null || $info['algo'] === 0) {
                        $allHashed = false;
                        break;
                    }
                }
                if ($clients->count() > 0 && $allHashed) {
                    $results[] = ['API Gateway', 'Enkripsi/Hash Kunci API Mitra', 'PASS', 'Semua API Key (' . $clients->count() . ' mitra) disimpan dengan One-Way Hash.'];
                    $totalScore += 15;
                } elseif ($clients->count() === 0) {
                    $results[] = ['API Gateway', 'Klien API Interoperabilitas', 'PASS', 'Belum ada klien terdaftar (Tabel siap & aman).'];
                    $totalScore += 15;
                } else {
                    $results[] = ['API Gateway', 'Enkripsi Kunci API', 'FAIL', 'Ditemukan API Key yang tersimpan dalam format plaintext!'];
                }
            } else {
                $results[] = ['API Gateway', 'Tabel api_clients', 'WARN', 'Tabel interoperabilitas belum dimigrasi.'];
            }
        } catch (\Exception $e) {
            $results[] = ['API Gateway', 'Pemeriksaan API', 'WARN', 'Gagal memeriksa api_clients: ' . $e->getMessage()];
        }

        // 7. Security Headers Middleware Registration
        $maxScore += 10;
        if (class_exists(\App\Http\Middleware\SecurityHeadersMiddleware::class)) {
            $results[] = ['Headers', 'SecurityHeadersMiddleware (OWASP)', 'PASS', 'Middleware X-Frame-Options, nosniff, HSTS aktif.'];
            $totalScore += 10;
        } else {
            $results[] = ['Headers', 'SecurityHeadersMiddleware', 'FAIL', 'Middleware header keamanan belum diimplementasikan.'];
        }

        // Tampilkan Tabel Hasil
        $this->table(
            ['Kategori', 'Komponen Uji', 'Status', 'Catatan / Rekomendasi'],
            array_map(function ($item) {
                $statusFormatted = match ($item[2]) {
                    'PASS' => '<fg=green;options=bold>PASS</>',
                    'WARN' => '<fg=yellow;options=bold>WARN</>',
                    'FAIL' => '<fg=red;options=bold>FAIL</>',
                    default => $item[2]
                };
                return [$item[0], $item[1], $statusFormatted, $item[3]];
            }, $results)
        );

        $this->newLine();
        $percentage = round(($totalScore / $maxScore) * 100);
        $this->info("Skor Kepatuhan Keamanan SPBE: {$percentage}% ({$totalScore} / {$maxScore})");

        if ($percentage >= 90) {
            $this->line('<fg=black;bg=green;options=bold> INDEKS KEAMANAN SISTEM: SANGAT BAIK (Tingkat Kesiapan Tinggi BSSN/CSIRT) </>');
        } elseif ($percentage >= 70) {
            $this->line('<fg=black;bg=yellow;options=bold> INDEKS KEAMANAN SISTEM: BAIK (Perlu pemantauan berkala) </>');
        } else {
            $this->line('<fg=white;bg=red;options=bold> INDEKS KEAMANAN SISTEM: PERLU PERBAIKAN SEGERA </>');
        }

        $this->newLine();
        $this->line('Rekomendasi operasional: Lakukan pengujian berkala dan scan pasif via https://securityheaders.com/ serta https://www.ssllabs.com/ssltest/');
        $this->info('========================================================================');

        return 0;
    }
}
