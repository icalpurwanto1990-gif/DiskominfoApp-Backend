<?php

namespace App\Services;

use App\Models\ServiceRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Converter;
use PhpOffice\PhpWord\Style\Font;

class WordDocumentService
{
    /**
     * Jenis dokumen yang didukung.
     */
    const TYPE_SURAT_PERMOHONAN = 'surat-permohonan';
    const TYPE_BUKTI_SELESAI    = 'bukti-selesai';

    /**
     * Generate dokumen Word dari ServiceRequest dan kembalikan path file sementara.
     *
     * @param  ServiceRequest  $record  Data pengajuan layanan
     * @param  string          $type    Jenis dokumen (surat-permohonan | bukti-selesai)
     * @return string          Path absolut ke file .docx sementara
     */
    public function generate(ServiceRequest $record, string $type): string
    {
        $templatePath = $this->resolveTemplatePath($type);

        // Jika template custom tersedia, gunakan TemplateProcessor
        if (file_exists($templatePath)) {
            return $this->generateFromTemplate($record, $type, $templatePath);
        }

        // Fallback: generate dokumen dari scratch menggunakan PhpWord
        return $this->generateFallback($record, $type);
    }

    /**
     * Cari path template .docx yang sesuai.
     * Urutan prioritas: storage/word-templates/{type}.docx → default tidak ada
     */
    private function resolveTemplatePath(string $type): string
    {
        return storage_path("word-templates/{$type}.docx");
    }

    /**
     * Generate dokumen menggunakan template .docx dengan TemplateProcessor.
     * Ganti semua placeholder ${...} dengan data ServiceRequest.
     */
    private function generateFromTemplate(ServiceRequest $record, string $type, string $templatePath): string
    {
        // Fix XML pecahan sebelum diproses — mengatasi masalah Word memecah
        // placeholder seperti ${nama_pemohon} menjadi beberapa XML run
        $fixedTemplatePath = $this->fixBrokenPlaceholders($templatePath, $record, $type);

        $processor = new TemplateProcessor($fixedTemplatePath);

        // Hapus file sementara fix jika beda dari original
        if ($fixedTemplatePath !== $templatePath && file_exists($fixedTemplatePath)) {
            register_shutdown_function(fn() => @unlink($fixedTemplatePath));
        }

        // Isi semua nilai placeholder
        $placeholders = $this->buildPlaceholderMap($record);

        foreach ($placeholders as $key => $value) {
            try {
                $processor->setValue($key, htmlspecialchars($value ?? '', ENT_XML1, 'UTF-8'));
            } catch (\Exception $e) {
                // Placeholder tidak ada di template — skip saja
                Log::debug("Placeholder [{$key}] tidak ditemukan di template {$type}.");
            }
        }

        // Simpan ke file sementara
        $tmpPath = $this->buildTempPath($record, $type);
        $processor->saveAs($tmpPath);

        return $tmpPath;
    }

    /**
     * Perbaiki placeholder yang terpecah oleh Word's XML formatting.
     *
     * Masalah: Word sering memecah teks seperti "${nama_pemohon}" menjadi
     * beberapa <w:r><w:t> XML run yang terpisah, sehingga PhpWord tidak bisa
     * menemukan pattern-nya.
     *
     * Solusi: Buka file ZIP .docx, baca word/document.xml, gabungkan semua
     * run yang terpecah di dalam satu paragraf yang mengandung "${", lalu
     * simpan kembali ke file sementara.
     *
     * @return string Path ke template yang sudah diperbaiki (atau original jika tidak berubah)
     */
    private function fixBrokenPlaceholders(string $templatePath, ServiceRequest $record, string $type): string
    {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($templatePath) !== true) {
                return $templatePath; // Gagal buka — gunakan original
            }

            $documentXml = $zip->getFromName('word/document.xml');
            $zip->close();

            if ($documentXml === false) {
                return $templatePath;
            }

            // Gabungkan XML run yang terpecah dalam satu paragraf
            // Pattern: cari <w:r>...<w:t>...</w:t></w:r> yang berdekatan
            // dan gabungkan jika paragraf mengandung "${" dan "}"
            $fixed = $this->mergeFragmentedRuns($documentXml);

            // Jika tidak ada perubahan, gunakan template original
            if ($fixed === $documentXml) {
                return $templatePath;
            }

            // Simpan ke file sementara yang sudah diperbaiki
            $fixedPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'fixed_' . basename($templatePath);
            copy($templatePath, $fixedPath);

            $zipWrite = new \ZipArchive();
            if ($zipWrite->open($fixedPath) === true) {
                $zipWrite->addFromString('word/document.xml', $fixed);
                $zipWrite->close();
            }

            return $fixedPath;

        } catch (\Exception $e) {
            Log::warning("fixBrokenPlaceholders gagal: " . $e->getMessage() . ". Menggunakan template original.");
            return $templatePath;
        }
    }

    /**
     * Gabungkan XML run yang terpecah dalam paragraf Word.
     * Ini menggabungkan konten <w:t> yang berdekatan dalam satu <w:r>
     * untuk paragraf yang mengandung placeholder ${...}.
     */
    private function mergeFragmentedRuns(string $xml): string
    {
        // Regex untuk menemukan paragraf <w:p>...</w:p> yang mengandung "${"
        return preg_replace_callback(
            '/<w:p[ >].*?<\/w:p>/s',
            function (array $match) {
                $paragraph = $match[0];

                // Hanya proses paragraf yang berisi karakter placeholder
                if (!str_contains($paragraph, '$') && !str_contains($paragraph, '{')) {
                    return $paragraph;
                }

                // Ekstrak semua teks dari semua run dalam paragraf
                preg_match_all('/<w:t[^>]*>(.*?)<\/w:t>/s', $paragraph, $texts);
                $fullText = implode('', $texts[1] ?? []);

                // Jika tidak ada placeholder setelah digabung, kembalikan asli
                if (!preg_match('/\$\{[a-zA-Z0-9_]+\}/', $fullText)) {
                    return $paragraph;
                }

                // Ada placeholder — gabungkan semua run menjadi satu run bersih
                // Ambil format dari run pertama (font, size, dll)
                preg_match('/<w:r[ >](.*?)<w:t/s', $paragraph, $firstRunProps);
                $rPr = '';
                if (!empty($firstRunProps[1])) {
                    preg_match('/<w:rPr>(.*?)<\/w:rPr>/s', $firstRunProps[1], $rPrMatch);
                    if (!empty($rPrMatch[0])) {
                        $rPr = $rPrMatch[0];
                    }
                }

                // Ganti semua run dengan satu run yang berisi teks gabungan
                $mergedRun = '<w:r>' . $rPr . '<w:t xml:space="preserve">'
                    . htmlspecialchars($fullText, ENT_XML1, 'UTF-8')
                    . '</w:t></w:r>';

                // Ganti semua run dalam paragraf dengan run gabungan
                $paragraph = preg_replace(
                    '/<w:r[ >].*?<\/w:r>/s',
                    '',
                    $paragraph,
                    -1,
                    $count
                );

                // Sisipkan run gabungan sebelum </w:p>
                $paragraph = str_replace('</w:p>', $mergedRun . '</w:p>', $paragraph);

                return $paragraph;
            },
            $xml
        );
    }

    /**
     * Fallback: generate dokumen dari scratch menggunakan PhpWord (tanpa template).
     * Digunakan jika template belum diupload Admin.
     */
    private function generateFallback(ServiceRequest $record, string $type): string
    {
        $phpWord = new PhpWord();
        $phpWord->setDefaultFontName('Times New Roman');
        $phpWord->setDefaultFontSize(12);

        $section = $phpWord->addSection([
            'marginTop'    => Converter::cmToTwip(3),
            'marginBottom' => Converter::cmToTwip(2.5),
            'marginLeft'   => Converter::cmToTwip(3),
            'marginRight'  => Converter::cmToTwip(2),
        ]);

        $boldStyle  = ['bold' => true];
        $centerPara = ['alignment' => 'center'];
        $data       = $this->buildPlaceholderMap($record);

        if ($type === self::TYPE_SURAT_PERMOHONAN) {
            $this->buildSuratPermohonan($section, $data, $boldStyle, $centerPara);
        } else {
            $this->buildBuktiSelesai($section, $data, $boldStyle, $centerPara);
        }

        $tmpPath = $this->buildTempPath($record, $type);
        $phpWord->save($tmpPath);

        return $tmpPath;
    }

    /**
     * Build Surat Permohonan dari scratch.
     */
    private function buildSuratPermohonan($section, array $data, array $bold, array $center): void
    {
        // KOP
        $section->addText('PEMERINTAH KABUPATEN BANGGAI KEPULAUAN', ['bold' => true, 'size' => 14], $center);
        $section->addText('DINAS KOMUNIKASI DAN INFORMATIKA', ['bold' => true, 'size' => 14], $center);
        $section->addText('Jl. Bukit Trikora Kompleks Perkantoran, Salakan, Kab. Banggai Kepulauan', ['size' => 10], $center);
        $section->addText('Telp. (0462) 00000 | diskominfo@banggaikep.go.id', ['size' => 10], $center);
        $section->addLine(['weight' => 3, 'color' => '000000']);
        $section->addLine(['weight' => 1, 'color' => '000000']);
        $section->addTextBreak(1);

        // Judul
        $section->addText('SURAT PERMOHONAN LAYANAN', ['bold' => true, 'size' => 13, 'underline' => 'single'], $center);
        $section->addText('Nomor: ' . $data['nomor_tiket'], ['size' => 11], $center);
        $section->addTextBreak(1);

        // Tabel Data Pemohon
        $table = $section->addTable(['borderSize' => 0, 'cellMargin' => 80]);

        $fields = [
            ['Jenis Layanan', $data['jenis_layanan']],
            ['Nama Pemohon', $data['nama_pemohon']],
            ['Instansi / OPD', $data['instansi']],
            ['Email', $data['email_pemohon']],
            ['Telepon', $data['telepon_pemohon']],
            ['Tanggal Pengajuan', $data['tanggal_pengajuan']],
            ['Status', $data['status']],
        ];

        // Tambahkan detail dinamis dari form pemohon
        foreach ($data as $key => $value) {
            if (str_starts_with($key, 'detail_') && !empty($value)) {
                $label = ucwords(str_replace(['detail_', '_'], ['', ' '], $key));
                $fields[] = [$label, $value];
            }
        }

        foreach ($fields as [$label, $value]) {
            $row = $table->addRow();
            $row->addCell(3000)->addText($label, ['bold' => true]);
            $row->addCell(500)->addText(':');
            $row->addCell(7000)->addText($value ?? '-');
        }

        $section->addTextBreak(2);

        // Body surat
        $section->addText(
            'Dengan hormat, kami dari ' . ($data['instansi'] ?: 'instansi kami') .
            ' mengajukan permohonan layanan sebagaimana tersebut di atas kepada ' .
            'Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan.',
            ['size' => 12]
        );
        $section->addTextBreak(1);
        $section->addText('Demikian surat permohonan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.', ['size' => 12]);
        $section->addTextBreak(2);

        // Tanda tangan pemohon
        $ttdTable = $section->addTable(['borderSize' => 0]);
        $ttdRow = $ttdTable->addRow();
        $ttdRow->addCell(7000)->addText('');
        $rightCell = $ttdRow->addCell(3000);
        $rightCell->addText('Salakan, ' . $data['tanggal_pengajuan'], [], $center);
        $rightCell->addText('Pemohon,', [], $center);
        $rightCell->addTextBreak(3);
        $rightCell->addText($data['nama_pemohon'], $bold, $center);
    }

    /**
     * Build Bukti Selesai dari scratch.
     */
    private function buildBuktiSelesai($section, array $data, array $bold, array $center): void
    {
        // KOP
        $section->addText('PEMERINTAH KABUPATEN BANGGAI KEPULAUAN', ['bold' => true, 'size' => 14], $center);
        $section->addText('DINAS KOMUNIKASI DAN INFORMATIKA', ['bold' => true, 'size' => 14], $center);
        $section->addText('Jl. Bukit Trikora Kompleks Perkantoran, Salakan, Kab. Banggai Kepulauan', ['size' => 10], $center);
        $section->addLine(['weight' => 3, 'color' => '000000']);
        $section->addLine(['weight' => 1, 'color' => '000000']);
        $section->addTextBreak(1);

        // Judul
        $section->addText('BUKTI PENYELESAIAN LAYANAN', ['bold' => true, 'size' => 13, 'underline' => 'single'], $center);
        $section->addText('Nomor: ' . $data['nomor_tiket'], ['size' => 11], $center);
        $section->addTextBreak(1);

        // Tabel
        $table = $section->addTable(['borderSize' => 0, 'cellMargin' => 80]);
        $fields = [
            ['Nomor Tiket',       $data['nomor_tiket']],
            ['Jenis Layanan',     $data['jenis_layanan']],
            ['Nama Pemohon',      $data['nama_pemohon']],
            ['Instansi / OPD',    $data['instansi']],
            ['Tanggal Pengajuan', $data['tanggal_pengajuan']],
            ['Tanggal Selesai',   $data['tanggal_selesai']],
            ['Status',            'SELESAI'],
            ['Petugas',           $data['nama_petugas']],
            ['Catatan',           $data['catatan_admin'] ?: '-'],
        ];

        foreach ($fields as [$label, $value]) {
            $row = $table->addRow();
            $row->addCell(3000)->addText($label, ['bold' => true]);
            $row->addCell(500)->addText(':');
            $row->addCell(7000)->addText($value ?? '-');
        }

        $section->addTextBreak(2);
        $section->addText(
            'Dengan ini dinyatakan bahwa permohonan layanan tersebut di atas telah ' .
            'SELESAI diproses oleh Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan.',
            ['size' => 12]
        );
        $section->addTextBreak(2);

        // Tanda tangan Admin
        $ttdTable = $section->addTable(['borderSize' => 0]);
        $ttdRow = $ttdTable->addRow();
        $ttdRow->addCell(7000)->addText('');
        $rightCell = $ttdRow->addCell(3000);
        $rightCell->addText('Salakan, ' . $data['tanggal_selesai'], [], $center);
        $rightCell->addText('Petugas Verifikator,', [], $center);
        $rightCell->addTextBreak(3);
        $rightCell->addText($data['nama_petugas'], $bold, $center);
        $rightCell->addText('Diskominfo Bangkep', [], $center);
    }

    /**
     * Build map placeholder dari data ServiceRequest.
     * Key = nama placeholder (tanpa ${}), Value = nilai string.
     */
    public function buildPlaceholderMap(ServiceRequest $record): array
    {
        $handledBy = $record->handledBy?->name ?? auth()->user()?->name ?? 'Petugas Diskominfo';
        $createdAt = optional($record->createdAt)->format('d F Y') ?? now()->format('d F Y');
        $doneAt    = optional($record->updatedAt)->format('d F Y') ?? now()->format('d F Y');

        $base = [
            'nomor_tiket'       => $record->ticketNumber ?? '-',
            'jenis_layanan'     => $record->serviceType ?? '-',
            'nama_pemohon'      => $record->applicantName ?? '-',
            'email_pemohon'     => $record->applicantEmail ?? '-',
            'telepon_pemohon'   => $record->applicantPhone ?? '-',
            'instansi'          => $record->instansi ?? '-',
            'status'            => $record->status ?? '-',
            'catatan_admin'     => $record->notes ?? '',
            'tanggal_pengajuan' => $createdAt,
            'tanggal_selesai'   => $doneAt,
            'nama_petugas'      => $handledBy,
            'tahun'             => now()->year,
            'tanggal_hari_ini'  => now()->format('d F Y'),
        ];

        // Tambahkan field dari details JSON sebagai placeholder dinamis
        // Contoh: details['jenis_perangkat'] → placeholder 'detail_jenis_perangkat'
        $details = $record->details ?? [];
        foreach ($details as $key => $value) {
            $safeKey = 'detail_' . preg_replace('/[^a-z0-9_]/', '_', strtolower((string) $key));
            $base[$safeKey] = is_array($value) ? implode(', ', $value) : (string) $value;
        }

        return $base;
    }

    /**
     * Buat path file .docx sementara di storage/app/temp/
     */
    private function buildTempPath(ServiceRequest $record, string $type): string
    {
        $dir = storage_path('app/temp');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = match ($type) {
            self::TYPE_SURAT_PERMOHONAN => "SuratPermohonan-{$record->ticketNumber}.docx",
            self::TYPE_BUKTI_SELESAI    => "BuktiSelesai-{$record->ticketNumber}.docx",
            default                     => "Dokumen-{$record->ticketNumber}.docx",
        };

        return $dir . DIRECTORY_SEPARATOR . $filename;
    }
}
