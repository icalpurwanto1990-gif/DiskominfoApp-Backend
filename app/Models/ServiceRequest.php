<?php

namespace App\Models;

use App\Mail\ServiceStatusMail;
use App\Services\WhatsAppNotificationService;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ServiceRequest extends Model
{
    use HasUuids;

    protected $table = 'ServiceRequest';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'serviceType',
        'ticketNumber',
        'applicantName',
        'applicantEmail',
        'applicantPhone',
        'instansi',
        'details',
        'status',
        'notes',
        'handledById',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    public function handledBy()
    {
        return $this->belongsTo(User::class, 'handledById', 'id');
    }

    /**
     * Trigger status transition, log audit, and generate notification payload.
     */
    public function triggerStatusTransition(string $newStatus, string $actor, ?string $catatan = null): array
    {
        $this->status = $newStatus;
        if ($catatan) {
            $this->notes = $catatan;
        }
        $this->save();

        // 1. Build notification message text
        $messageText = '';
        $target = 'user';

        switch ($newStatus) {
            case 'PENDING':
                $messageText = "Tiket pengajuan layanan Anda (#{$this->ticketNumber}) telah diterima dan dalam antrian verifikasi.";
                $target = 'both';
                break;
            case 'DITOLAK':
                $messageText = "⚠️ Tiket pengajuan layanan Anda (#{$this->ticketNumber}) ditolak oleh Admin.\n\nAlasan: ".($catatan ?: $this->notes);
                $target = 'user';
                break;
            case 'PERBAIKAN':
                $messageText = "🔄 Tiket pengajuan layanan Anda (#{$this->ticketNumber}) dikembalikan oleh Admin untuk perbaikan.\n\nCatatan Perbaikan: ".($catatan ?: $this->notes);
                $target = 'user';
                break;
            case 'DIPROSES':
                $messageText = "Tiket pengajuan layanan Anda (#{$this->ticketNumber}) telah disetujui dan sedang diproses oleh Tim IT Diskominfo.".($catatan ? "\n\nCatatan: {$catatan}" : '');
                $target = 'user';
                break;
            case 'SELESAI':
                $messageText = "✅ Selamat! Pengajuan layanan Anda (#{$this->ticketNumber}) telah selesai diproses.".($catatan ? "\n\nCatatan Tanggapan: {$catatan}" : '');
                $target = 'user';
                break;
        }

        // 2. Generate JSON Output format
        $jsonPayload = [
            'ticket_id' => $this->id,
            'ticket_number' => $this->ticketNumber,
            'current_status' => $newStatus,
            'actor' => $actor,
            'action_taken' => "Mengubah status tiket menjadi {$newStatus}",
            'notes' => $catatan ?: $this->notes,
            'notification_target' => $target,
            'message_text' => $messageText,
        ];

        // 3. Save to AuditLog
        try {
            $adminName = ($actor === 'ADMIN') ? (auth()->user()->name ?? 'System Admin') : $this->applicantName;
            $adminRole = ($actor === 'ADMIN') ? (auth()->user()->role ?? 'ADMIN') : 'USER';
            AuditLog::create([
                'id' => (string) Str::uuid(),
                'userId' => ($actor === 'ADMIN') ? auth()->id() : null,
                'action' => 'UPDATE_STATUS',
                'details' => "[SERVICE_REQUEST] Tiket Layanan #{$this->ticketNumber} status diubah ke {$newStatus} oleh {$actor}. Catatan: ".($catatan ?: 'Tanpa catatan')." (Aktor: {$adminName}, Role: {$adminRole})",
                'ipAddress' => request()->ip() ?: '127.0.0.1',
                'createdAt' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mencatat log audit Layanan: '.$e->getMessage());
        }

        // 4. Log payload for n8n/webhook simulation
        Log::info('SERVICE_AGENT_WEBHOOK_EVENT: '.json_encode($jsonPayload));

        // 5. Kirim notifikasi Email ke pemohon (fail-safe)
        if ($this->applicantEmail && in_array($newStatus, ['DIPROSES', 'SELESAI', 'DITOLAK', 'PERBAIKAN'])) {
            try {
                Mail::to($this->applicantEmail)
                    ->send(new ServiceStatusMail($this, $newStatus));
                Log::info("Email notifikasi [{$newStatus}] berhasil dikirim ke {$this->applicantEmail} untuk tiket #{$this->ticketNumber}");
            } catch (\Exception $e) {
                Log::error("Gagal mengirim email notifikasi untuk tiket #{$this->ticketNumber}: " . $e->getMessage());
            }
        }

        // 6. Kirim notifikasi WhatsApp ke pemohon (fail-safe)
        if ($this->applicantPhone && in_array($newStatus, ['DIPROSES', 'SELESAI', 'DITOLAK', 'PERBAIKAN'])) {
            try {
                /** @var WhatsAppNotificationService $waService */
                $waService = app(WhatsAppNotificationService::class);
                $waService->send($this->applicantPhone, $messageText);
            } catch (\Exception $e) {
                Log::error("Gagal mengirim WhatsApp notifikasi untuk tiket #{$this->ticketNumber}: " . $e->getMessage());
            }
        }

        return $jsonPayload;
    }
}
