<?php

namespace App\Http\Controllers;

use App\Models\PpidRequest;
use App\Models\ServiceRequest;
use App\Models\TteRequest;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        // Fetch user's submitted service tickets
        $serviceRequests = ServiceRequest::where('applicantEmail', $user->email)
            ->orderBy('createdAt', 'desc')
            ->get();

        // Fetch user's submitted PPID tickets
        $ppidRequests = PpidRequest::where('email', $user->email)
            ->orderBy('createdAt', 'desc')
            ->get();

        // Fetch user's submitted TTE requests
        $tteRequests = TteRequest::where('user_id', $user->id)
            ->orWhere('nip', $user->nip)
            ->orderBy('createdAt', 'desc')
            ->get();

        $serviceTicketNumbers = $serviceRequests->pluck('ticketNumber')->toArray();
        $ppidTicketNumbers = $ppidRequests->pluck('ticketNumber')->toArray();
        $tteIds = $tteRequests->pluck('id')->toArray();

        $auditLogs = AuditLog::where(function($query) use ($serviceTicketNumbers, $ppidTicketNumbers, $tteIds) {
            $hasCondition = false;
            if (!empty($serviceTicketNumbers)) {
                $query->where(function($q) use ($serviceTicketNumbers) {
                    foreach ($serviceTicketNumbers as $num) {
                        $q->orWhere('details', 'like', "%#{$num}%");
                    }
                });
                $hasCondition = true;
            }
            if (!empty($ppidTicketNumbers)) {
                if ($hasCondition) {
                    $query->orWhere(function($q) use ($ppidTicketNumbers) {
                        foreach ($ppidTicketNumbers as $num) {
                            $q->orWhere('details', 'like', "%#{$num}%");
                        }
                    });
                } else {
                    $query->where(function($q) use ($ppidTicketNumbers) {
                        foreach ($ppidTicketNumbers as $num) {
                            $q->orWhere('details', 'like', "%#{$num}%");
                        }
                    });
                    $hasCondition = true;
                }
            }
            if (!empty($tteIds)) {
                if ($hasCondition) {
                    $query->orWhere(function($q) use ($tteIds) {
                        foreach ($tteIds as $id) {
                            $q->orWhere('details', 'like', "%#{$id}%");
                        }
                    });
                } else {
                    $query->where(function($q) use ($tteIds) {
                        foreach ($tteIds as $id) {
                            $q->orWhere('details', 'like', "%#{$id}%");
                        }
                    });
                    $hasCondition = true;
                }
            }
            if (!$hasCondition) {
                $query->whereRaw('1 = 0');
            }
        })
        ->orderBy('createdAt', 'desc')
        ->get();

        return Inertia::render('User/Dashboard', [
            'serviceRequests' => $serviceRequests,
            'ppidRequests' => $ppidRequests,
            'tteRequests' => $tteRequests,
            'auditLogs' => $auditLogs,
        ]);
    }

    public function getRequests()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $serviceRequests = ServiceRequest::where('applicantEmail', $user->email)
            ->orderBy('createdAt', 'desc')
            ->get();

        $ppidRequests = PpidRequest::where('email', $user->email)
            ->orderBy('createdAt', 'desc')
            ->get();

        $tteRequests = TteRequest::where('user_id', $user->id)
            ->orWhere('nip', $user->nip)
            ->orderBy('createdAt', 'desc')
            ->get();

        $serviceTicketNumbers = $serviceRequests->pluck('ticketNumber')->toArray();
        $ppidTicketNumbers = $ppidRequests->pluck('ticketNumber')->toArray();
        $tteIds = $tteRequests->pluck('id')->toArray();

        $auditLogs = AuditLog::where(function($query) use ($serviceTicketNumbers, $ppidTicketNumbers, $tteIds) {
            $hasCondition = false;
            if (!empty($serviceTicketNumbers)) {
                $query->where(function($q) use ($serviceTicketNumbers) {
                    foreach ($serviceTicketNumbers as $num) {
                        $q->orWhere('details', 'like', "%#{$num}%");
                    }
                });
                $hasCondition = true;
            }
            if (!empty($ppidTicketNumbers)) {
                if ($hasCondition) {
                    $query->orWhere(function($q) use ($ppidTicketNumbers) {
                        foreach ($ppidTicketNumbers as $num) {
                            $q->orWhere('details', 'like', "%#{$num}%");
                        }
                    });
                } else {
                    $query->where(function($q) use ($ppidTicketNumbers) {
                        foreach ($ppidTicketNumbers as $num) {
                            $q->orWhere('details', 'like', "%#{$num}%");
                        }
                    });
                    $hasCondition = true;
                }
            }
            if (!empty($tteIds)) {
                if ($hasCondition) {
                    $query->orWhere(function($q) use ($tteIds) {
                        foreach ($tteIds as $id) {
                            $q->orWhere('details', 'like', "%#{$id}%");
                        }
                    });
                } else {
                    $query->where(function($q) use ($tteIds) {
                        foreach ($tteIds as $id) {
                            $q->orWhere('details', 'like', "%#{$id}%");
                        }
                    });
                    $hasCondition = true;
                }
            }
            if (!$hasCondition) {
                $query->whereRaw('1 = 0');
            }
        })
        ->orderBy('createdAt', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'serviceRequests' => $serviceRequests,
            'ppidRequests' => $ppidRequests,
            'tteRequests' => $tteRequests,
            'auditLogs' => $auditLogs,
        ]);
    }

    public function storeTteRequest(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|max:50',
            'nik' => 'required|string|max:50',
            'jabatan' => 'required|string|max:255',
            'instansi' => 'required|string|max:255',
            'dokumen_rekomendasi' => 'nullable|string',
            'dokumen_ktp' => 'nullable|string',
            'submit_now' => 'boolean',
        ]);

        $status = $request->boolean('submit_now') ? 'PENDING' : 'DRAFT';

        $tteRequest = TteRequest::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'nama' => $validated['nama'],
            'nip' => $validated['nip'],
            'nik' => $validated['nik'],
            'jabatan' => $validated['jabatan'],
            'instansi' => $validated['instansi'],
            'dokumen_rekomendasi' => $validated['dokumen_rekomendasi'],
            'dokumen_ktp' => $validated['dokumen_ktp'],
            'status' => $status,
        ]);

        // State Transition Event
        $tteRequest->triggerStatusTransition($status, 'USER');

        return response()->json([
            'success' => true,
            'message' => $status === 'PENDING' ? 'Permohonan TTE ASN berhasil dikirim!' : 'Draf permohonan berhasil disimpan.',
            'tteRequest' => $tteRequest
        ]);
    }

    public function updateTteRequest(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'id' => 'required|uuid',
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|max:50',
            'nik' => 'required|string|max:50',
            'jabatan' => 'required|string|max:255',
            'instansi' => 'required|string|max:255',
            'dokumen_rekomendasi' => 'nullable|string',
            'dokumen_ktp' => 'nullable|string',
            'submit_now' => 'boolean',
        ]);

        $tteRequest = TteRequest::findOrFail($validated['id']);

        // Check if user owns it
        if ($tteRequest->user_id !== $user->id) {
            return response()->json(['success' => false, 'error' => 'Forbidden'], 403);
        }

        // Only allow edits if status is DRAFT or REVISI
        if ($tteRequest->status !== 'DRAFT' && $tteRequest->status !== 'REVISI') {
            return response()->json(['success' => false, 'error' => 'Tiket sedang diproses dan tidak bisa diubah.'], 422);
        }

        $newStatus = $tteRequest->status;
        if ($request->boolean('submit_now')) {
            $newStatus = 'PENDING';
        }

        $tteRequest->update([
            'nama' => $validated['nama'],
            'nip' => $validated['nip'],
            'nik' => $validated['nik'],
            'jabatan' => $validated['jabatan'],
            'instansi' => $validated['instansi'],
            'dokumen_rekomendasi' => $validated['dokumen_rekomendasi'],
            'dokumen_ktp' => $validated['dokumen_ktp'],
        ]);

        if ($newStatus !== $tteRequest->getOriginal('status')) {
            $tteRequest->triggerStatusTransition($newStatus, 'USER');
        }

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'PENDING' ? 'Permohonan TTE ASN berhasil diajukan ulang!' : 'Perubahan draf berhasil disimpan.',
            'tteRequest' => $tteRequest
        ]);
    }
}
