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

        if ($apiKey) {
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

PROFIL DINAS:
- Nama Instansi: Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan
- Kepala Dinas: " . $sambutanNama . "
- Visi Kabupaten: " . $visi . "
- Misi Diskominfo: " . $misi . "
- Alamat Kantor: Kompleks Perkantoran Bukit Halimun, Salakan, Kecamatan Tinangkung, Sulawesi Tengah
- Kontak: Email diskominfo@banggaikep.go.id atau WhatsApp Humas +62 822-9642-1245

DAFTAR LAYANAN DIGITAL AKTIF:
" . ($services ?: '- Belum ada layanan digital terdaftar.') . "

5 BERITA TERBARU:
" . ($latestNews ?: '- Belum ada berita diterbitkan.') . "

ATURAN MENJAWAB:
1. Jawablah secara singkat, jelas, padat, dan tidak bertele-tele.
2. Selalu arahkan pengguna ke menu navigasi atas yang sesuai jika mereka menanyakan tentang pengajuan layanan (misal: menu 'Layanan Digital' untuk pengajuan TTE/Zoom, atau menu 'PPID' untuk permohonan informasi publik).
3. Jika ditanya tentang sesuatu di luar konteks dinas, tolak dengan sopan dan arahkan mereka untuk menghubungi WhatsApp Humas Diskominfo.";

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
                        'maxOutputTokens' => 500,
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
                    $reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    if (!empty($reply)) {
                        return response()->json([
                            'reply' => trim($reply),
                        ]);
                    }
                }
            } catch (\Exception $e) {
                // If API fails, log the exception and fallback to rule-based matching
                \Log::error('Gemini API Error: ' . $e->getMessage());
            }
        }

        // --- FALLBACK (Rule-Based Keyword Matching) ---
        $reply = '';

        if (str_contains($query, 'tte') || str_contains($query, 'sertifikat elektronik') || str_contains($query, 'tanda tangan')) {
            $reply = "Untuk pengajuan Tanda Tangan Elektronik (TTE) bagi ASN Kabupaten Banggai Kepulauan, silakan masuk ke menu 'Layanan Digital' di bagian navigasi atas, pilih 'Sertifikat Elektronik (TTE)', isi formulir berupa nama, NIP, Jabatan, OPD, serta lampirkan surat rekomendasi instansi Anda.";
        } elseif (str_contains($query, 'ppid') || str_contains($query, 'informasi publik') || str_contains($query, 'mohon informasi')) {
            $reply = "Permohonan informasi publik secara online dapat diajukan melalui menu 'PPID' di atas, lalu pilih tab 'Permohonan Informasi Online'. Anda diwajibkan mengisi NIK, rincian data yang diminta, tujuan penggunaan, dan mengunggah salinan KTP pendukung.";
        } elseif (str_contains($query, 'zoom') || str_contains($query, 'vicon') || str_contains($query, 'video conference')) {
            $reply = "Layanan peminjaman/permintaan Link Zoom Meeting dinas dan penjadwalan Video Conference untuk OPD dapat diajukan melalui menu 'Layanan Digital' > pilih 'Permintaan Link Zoom' atau 'Video Conference Dinas'. Silakan isi topik rapat, tanggal, waktu mulai/selesai, serta perkiraan jumlah peserta.";
        } elseif (str_contains($query, 'jaringan') || str_contains($query, 'internet') || str_contains($query, 'wifi') || str_contains($query, 'blankspot')) {
            $reply = "Jika terdapat gangguan jaringan internet/intranet di kantor OPD Anda, silakan ajukan tiket keluhan lewat menu 'Layanan Digital' > 'Aduan Gangguan Jaringan' dengan menyertakan detail lokasi ruang kantor dan deskripsi masalah. Untuk peta blankspot pedesaan, Anda juga dapat meninjau peta sebarannya di menu 'Peta GIS'.";
        } elseif (str_contains($query, 'lokasi') || str_contains($query, 'alamat') || str_contains($query, 'kantor') || str_contains($query, 'telepon')) {
            $reply = 'Kantor Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan berlokasi di Kompleks Perkantoran Bukit Halimun, Salakan, Kecamatan Tinangkung, Sulawesi Tengah. Hubungi kami via email diskominfo@banggaikep.go.id atau WhatsApp Humas +62 822-9642-1245.';
        } elseif (str_contains($query, 'satu data') || str_contains($query, 'dataset') || str_contains($query, 'open data')) {
            $reply = "Portal Satu Data Daerah menyediakan akses data sektoral terbuka. Silakan buka menu 'Satu Data' di atas untuk mencari katalog dataset publik, melakukan intip data secara interaktif, dan mengunduh berkas mentah berformat CSV atau JSON API.";
        } else {
            $reply = "Terima kasih atas pertanyaan Anda tentang '".$message."'. Sebagai asisten cerdas Diskominfo Kabupaten Banggai Kepulauan, saya menyarankan Anda membuka menu 'Layanan Digital' untuk pengajuan TTE/Zoom/Domain, menu 'PPID' untuk permohonan berkas publik, atau menghubungi Contact Center kami di WhatsApp +62 822-9642-1245 jika membutuhkan bantuan mendesak.";
        }

        return response()->json([
            'reply' => $reply,
        ]);
    }
}
