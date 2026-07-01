<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function reply(Request $request)
    {
        $message = $request->input('message', '');
        $query = strtolower($message);

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
