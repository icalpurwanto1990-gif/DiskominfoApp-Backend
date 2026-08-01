<?php

namespace App\Mail;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ServiceStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public ServiceRequest $serviceRequest;
    public string $newStatus;
    public string $statusLabel;
    public string $statusColor;
    public string $statusIcon;
    public string $headlineMessage;
    public string $bodyMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(ServiceRequest $serviceRequest, string $newStatus)
    {
        $this->serviceRequest = $serviceRequest;
        $this->newStatus      = $newStatus;

        // Resolve display properties per status
        $this->resolveStatusDisplay($newStatus);
    }

    /**
     * Set human-readable labels, colors, and messages based on status.
     */
    private function resolveStatusDisplay(string $status): void
    {
        $ticketNumber = $this->serviceRequest->ticketNumber;
        $catatan      = $this->serviceRequest->notes;

        switch ($status) {
            case 'DIPROSES':
                $this->statusLabel    = 'SEDANG DIPROSES';
                $this->statusColor    = '#d97706'; // amber
                $this->statusIcon     = '⚙️';
                $this->headlineMessage = 'Pengajuan Anda Telah Disetujui & Sedang Diproses';
                $this->bodyMessage    = "Pengajuan layanan Anda dengan nomor tiket <strong>#{$ticketNumber}</strong> telah diverifikasi dan diterima oleh Tim IT Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan."
                    . ($catatan ? "<br><br><strong>Catatan dari Admin:</strong><br>{$catatan}" : '');
                break;

            case 'SELESAI':
                $this->statusLabel    = 'SELESAI';
                $this->statusColor    = '#059669'; // emerald
                $this->statusIcon     = '✅';
                $this->headlineMessage = 'Layanan Anda Telah Selesai Diproses';
                $this->bodyMessage    = "Selamat! Pengajuan layanan Anda dengan nomor tiket <strong>#{$ticketNumber}</strong> telah selesai diproses oleh Tim IT Diskominfo Bangkep."
                    . ($catatan ? "<br><br><strong>Catatan Penyelesaian:</strong><br>{$catatan}" : '');
                break;

            case 'DITOLAK':
                $this->statusLabel    = 'DITOLAK';
                $this->statusColor    = '#dc2626'; // red
                $this->statusIcon     = '⚠️';
                $this->headlineMessage = 'Pengajuan Anda Tidak Dapat Diproses';
                $this->bodyMessage    = "Kami mohon maaf, pengajuan layanan Anda dengan nomor tiket <strong>#{$ticketNumber}</strong> tidak dapat diproses pada saat ini."
                    . ($catatan ? "<br><br><strong>Alasan Penolakan:</strong><br>{$catatan}" : '<br><br>Silakan hubungi kami untuk informasi lebih lanjut.');
                break;

            case 'PERBAIKAN':
                $this->statusLabel    = 'MEMERLUKAN PERBAIKAN';
                $this->statusColor    = '#f59e0b'; // amber
                $this->statusIcon     = '🔄';
                $this->headlineMessage = 'Pengajuan Anda Dikembalikan untuk Perbaikan';
                $this->bodyMessage    = "Pengajuan layanan Anda dengan nomor tiket <strong>#{$ticketNumber}</strong> dikembalikan oleh Verifikator Admin untuk perbaikan berkas/data.<br><br>Silakan perbaiki usulan Anda melalui portal layanan."
                    . ($catatan ? "<br><br><strong>Instruksi Perbaikan dari Admin:</strong><br>{$catatan}" : '');
                break;

            default:
                $this->statusLabel    = $status;
                $this->statusColor    = '#6b7280';
                $this->statusIcon     = 'ℹ️';
                $this->headlineMessage = "Status Tiket #{$ticketNumber} Diperbarui";
                $this->bodyMessage    = "Status pengajuan layanan Anda telah diperbarui menjadi <strong>{$status}</strong>.";
                break;
        }
    }

    /**
     * Get the message envelope (subject line).
     */
    public function envelope(): Envelope
    {
        $subject = match ($this->newStatus) {
            'DIPROSES'  => "[Diskominfo Bangkep] Pengajuan #{$this->serviceRequest->ticketNumber} — Sedang Diproses ⚙️",
            'SELESAI'   => "[Diskominfo Bangkep] Pengajuan #{$this->serviceRequest->ticketNumber} — Selesai ✅",
            'DITOLAK'   => "[Diskominfo Bangkep] Pengajuan #{$this->serviceRequest->ticketNumber} — Tidak Dapat Diproses ⚠️",
            'PERBAIKAN' => "[Diskominfo Bangkep] Pengajuan #{$this->serviceRequest->ticketNumber} — Memerlukan Perbaikan 🔄",
            default     => "[Diskominfo Bangkep] Update Status Tiket #{$this->serviceRequest->ticketNumber}",
        };

        return new Envelope(subject: $subject);
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.service-status',
        );
    }
}
