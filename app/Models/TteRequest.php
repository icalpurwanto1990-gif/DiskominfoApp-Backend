<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TteRequest extends Model
{
    use HasUuids;

    protected $table = 'TteRequest';

    protected $keyType = 'string';

    public $incrementing = false;

    // PostgreSQL timestamps compatibility mapping
    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'id',
        'user_id',
        'nama',
        'nip',
        'nik',
        'jabatan',
        'instansi',
        'dokumen_rekomendasi',
        'dokumen_ktp',
        'status',
        'catatan_admin',
    ];

    /**
     * Get the user that created this request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Trigger status transition, log audit, and generate notification payload.
     */
    public function triggerStatusTransition(string $newStatus, string $actor, ?string $catatanRevisi = null): array
    {
        $this->status = $newStatus;
        if ($newStatus === 'REVISI') {
            $this->catatan_admin = $catatanRevisi;
        }
        $this->save();

        // 1. Build notification message text
        $messageText = '';
        $target = 'user';

        switch ($newStatus) {
            case 'PENDING':
                $messageText = ($actor === 'USER' && $this->catatan_admin)
                    ? "🔄 {$this->nama} telah memperbaiki berkas yang direvisi. Mohon diperiksa kembali dengan catatan sebelumnya: {$this->catatan_admin}."
                    : 'Berkas Anda telah diterima dan sedang diperiksa oleh Admin.';
                $target = 'both';
                break;
            case 'REVISI':
                $messageText = "⚠️ Berkas TTE Anda dikembalikan oleh Admin untuk diperbaiki.\n\nAlasan/Catatan: {$catatanRevisi}\n\nSilakan klik link berikut untuk memperbaiki dokumen Anda tanpa perlu mengisi dari awal: http://localhost:8000/user/tte/edit/{$this->id}";
                $target = 'user';
                break;
            case 'DIPROSES':
                $messageText = 'Selamat, berkas Anda valid! Data Anda sedang diteruskan ke BSrE untuk penerbitan TTE. Mohon cek email resmi Anda secara berkala untuk aktivasi.';
                $target = 'user';
                break;
            case 'SELESAI':
                $messageText = '✅ Selamat! Sertifikat TTE Anda telah berhasil diterbitkan oleh BSrE dan sudah aktif.';
                $target = 'user';
                break;
        }

        // 2. Generate JSON Output format
        $jsonPayload = [
            'ticket_id' => $this->id,
            'current_status' => $newStatus,
            'actor' => $actor,
            'action_taken' => "Mengubah status tiket menjadi {$newStatus}",
            'catatan_revisi' => $catatanRevisi ?: $this->catatan_admin,
            'notification_target' => $target,
            'message_text' => $messageText,
        ];

        // 3. Save to AuditLog
        try {
            $adminName = ($actor === 'ADMIN') ? (auth()->user()->name ?? 'System Admin') : $this->nama;
            $adminRole = ($actor === 'ADMIN') ? (auth()->user()->role ?? 'ADMIN') : 'USER';
            AuditLog::create([
                'id' => (string) Str::uuid(),
                'userId' => ($actor === 'ADMIN') ? auth()->id() : $this->user_id,
                'action' => 'UPDATE_STATUS',
                'details' => "[TTE_REQUEST] Tiket TTE #{$this->id} status diubah ke {$newStatus} oleh {$actor}. Info: ".($catatanRevisi ?: 'Tanpa catatan')." (Aktor: {$adminName}, Role: {$adminRole})",
                'ipAddress' => request()->ip() ?: '127.0.0.1',
                'createdAt' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mencatat log audit TTE: '.$e->getMessage());
        }

        // 4. Log payload for n8n/webhook simulation
        Log::info('TTE_AGENT_WEBHOOK_EVENT: '.json_encode($jsonPayload));

        return $jsonPayload;
    }
}
