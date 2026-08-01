<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Services\WordDocumentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class DocumentDownloadController extends Controller
{
    public function __construct(protected WordDocumentService $wordService) {}

    /**
     * Download Surat Permohonan untuk ServiceRequest tertentu.
     * Dapat diakses oleh Admin yang sedang login (middleware: auth).
     *
     * GET /admin/service-requests/{id}/download-surat
     */
    public function downloadSurat(string $id): Response|\Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $record = ServiceRequest::findOrFail($id);

        try {
            $filePath = $this->wordService->generate($record, WordDocumentService::TYPE_SURAT_PERMOHONAN);
            $filename = "SuratPermohonan-{$record->ticketNumber}.docx";

            return response()->download($filePath, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error("Gagal generate Surat Permohonan untuk tiket #{$record->ticketNumber}: " . $e->getMessage());
            abort(500, 'Gagal membuat dokumen. Silakan hubungi administrator.');
        }
    }

    /**
     * Download Bukti Penyelesaian untuk ServiceRequest yang sudah SELESAI.
     * Dapat diakses oleh Admin yang sedang login (middleware: auth).
     *
     * GET /admin/service-requests/{id}/download-bukti
     */
    public function downloadBukti(string $id): Response|\Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $record = ServiceRequest::findOrFail($id);

        if ($record->status !== 'SELESAI') {
            abort(403, 'Bukti penyelesaian hanya tersedia untuk tiket dengan status SELESAI.');
        }

        try {
            $filePath = $this->wordService->generate($record, WordDocumentService::TYPE_BUKTI_SELESAI);
            $filename = "BuktiSelesai-{$record->ticketNumber}.docx";

            return response()->download($filePath, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error("Gagal generate Bukti Selesai untuk tiket #{$record->ticketNumber}: " . $e->getMessage());
            abort(500, 'Gagal membuat dokumen. Silakan hubungi administrator.');
        }
    }
}
