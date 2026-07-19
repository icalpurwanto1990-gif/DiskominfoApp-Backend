<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\ProfileContent;
use App\Models\DigitalService;
use App\Models\Post;

class AiChatController extends Controller
{
    public function reply(Request $request)
    {
        $message = $request->input('message', '');
        $query = strtolower($message);

        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            return response()->json([
                'reply' => 'DEBUG ERROR: GEMINI_API_KEY is null or empty in config("services.gemini.key"). Please check your VPS .env and run config:clear.',
            ]);
        }

        try {
            // Fetch dynamic database content for RAG context
            $profile = ProfileContent::all()->pluck('value', 'key')->toArray();
            
            $services = DigitalService::where('active', true)
                ->select('title', 'description')
                ->get()
                ->map(function($s) {
                    return "- " . $s->title . ": " . $s->description;
                })
                ->implode("\n");

            $latestNews = Post::orderBy('createdAt', 'desc')
                ->limit(5)
                ->select('title')
                ->get()
                ->map(function($p) {
                    return "- " . $p->title;
                })
                ->implode("\n");

            $sambutanNama = $profile['sambutan_nama'] ?? 'Kepala Dinas';
            $visi = $profile['visi_kabupaten'] ?? 'Menjadikan Kabupaten Banggai Kepulauan yang Maju, Mandiri, dan Sejahtera';
            $misi = $profile['misi_diskominfo'] ?? 'Mewujudkan tata kelola pemerintahan yang bersih dan berbasis teknologi informasi.';

            // Build System Instruction
            $systemInstruction = "Anda adalah Asisten AI resmi Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Banggai Kepulauan, Sulawesi Tengah.
Tugas Anda adalah membantu menjawab pertanyaan warga mengenai profil dinas, berita terbaru, dan cara mengakses layanan digital di portal ini dengan ramah, sopan, singkat, dan profesional dalam Bahasa Indonesia.

ATURAN LOGIN & PENDAFTARAN AKUN:
1. Untuk mengajukan LAYANAN INTERNAL (seperti pengajuan Sertifikat Elektronik TTE, pengajuan link Zoom/Vicon, pengajuan subdomain, aduan gangguan jaringan), pengguna WAJIB mendaftar akun terlebih dahulu di halaman Daftar (/auth/register) dan melakukan Login di halaman Masuk (/auth/login). Setelah login, pengajuan dilakukan melalui Dashboard Pengguna.
2. Untuk LAYANAN EKSTERNAL (layanan OPD luar/subdomain eksternal), pengguna bisa langsung mengakses tautan layanan tersebut tanpa perlu mendaftar/login di portal ini.
3. Untuk membaca informasi umum, profil dinas, berita terbaru, agenda pimpinan, Satu Data (Katalog Dataset), dan dokumen PPID, publik BEBAS mengakses langsung tanpa perlu daftar atau login.

PROFIL DINAS:
- Nama Instansi: Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan
- Kepala Dinas: " . $sambutanNama . "
- Visi Kabupaten: " . $visi . "
- Misi Diskominfo: " . $misi . "
- Alamat Kantor: Kompleks Perkantoran Bukit Trikora, Salakan, Kecamatan Tinangkung, Sulawesi Tengah
- Kontak: Email diskominfo@banggaikep.go.id atau WhatsApp Humas +62 822-9642-1245

DAFTAR LAYANAN DIGITAL AKTIF:
" . ($services ?: '- Belum ada layanan digital terdaftar.') . "

5 BERITA TERBARU:
" . ($latestNews ?: '- Belum ada berita diterbitkan.') . "

ATURAN MENJAWAB (PENTING):
1. JANGAN menampilkan analisis aturan, catatan evaluasi diri, proses berpikir, atau teks meta seperti 'Refining against constraints', 'Constraints met', atau sejenisnya. Anda harus LANGSUNG memberikan jawaban akhir.
2. Jawablah secara singkat, jelas, padat, dan tidak bertele-tele.
3. Selalu arahkan pengguna ke menu navigasi atas yang sesuai jika mereka menanyakan tentang pengajuan layanan (misal: menu 'Layanan Digital' untuk pengajuan TTE/Zoom, atau menu 'PPID' untuk permohonan informasi publik).
4. Jika ditanya tentang sesuatu di luar konteks dinas, tolak dengan sopan dan arahkan mereka untuk menghubungi WhatsApp Humas Diskominfo.";

            // Request payload following Google Gemini API spec
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $message]
                        ]
                    ]
                ],
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $systemInstruction]
                    ]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 1000,
                    'temperature' => 0.5,
                ]
            ];

            // Send request to Gemini API (gemini-3.5-flash)
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" . $apiKey, $payload);

            if ($response->successful()) {
                $result = $response->json();
                $parts = $result['candidates'][0]['content']['parts'] ?? [];
                $reply = '';
                foreach ($parts as $part) {
                    if (isset($part['text'])) {
                        $reply .= $part['text'];
                    }
                }
                if (!empty($reply)) {
                    return response()->json([
                        'reply' => trim($reply),
                    ]);
                }
            } else {
                return response()->json([
                    'reply' => 'DEBUG HTTP ERROR: Gemini API responded with status ' . $response->status() . '. Response: ' . json_encode($response->json()),
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Gemini API Error: ' . $e->getMessage());
            return response()->json([
                'reply' => 'DEBUG EXCEPTION: ' . $e->getMessage() . ' in ' . $e->getFile() . ' line ' . $e->getLine(),
            ]);
        }
    }
}
