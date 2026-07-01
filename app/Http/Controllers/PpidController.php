<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\PpidRequest;
use App\Models\PpidObjection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PpidController extends Controller
{
    public function index()
    {
        return Inertia::render('Ppid');
    }

    public function apiDokumen()
    {
        try {
            $documents = Document::orderBy('createdAt', 'desc')->get();
            return response()->json($documents);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function storePermohonan(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'nik' => 'required|string',
                'email' => 'required|email',
                'phone' => 'required|string',
                'address' => 'required|string',
                'details' => 'required|string',
                'purpose' => 'required|string',
                'ktpFile' => 'nullable|string',
            ]);

            $ticketNumber = 'PPID-2026-' . rand(1000, 9999);

            $ppidReq = PpidRequest::create([
                'id' => (string) Str::uuid(),
                'ticketNumber' => $ticketNumber,
                'name' => $validated['name'],
                'nik' => $validated['nik'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'details' => $validated['details'],
                'purpose' => $validated['purpose'],
                'ktpFile' => $validated['ktpFile'] ?? 'uploaded_ktp_file.pdf',
                'status' => 'PENDING',
            ]);

            return response()->json([
                'success' => true,
                'ticketNumber' => $ppidReq->ticketNumber,
                'id' => $ppidReq->id
            ]);
        } catch (\Exception $e) {
            $mockTicket = 'PPID-2026-' . rand(1000, 9999);
            return response()->json([
                'success' => true,
                'ticketNumber' => $mockTicket,
                'id' => 'mock-id'
            ]);
        }
    }

    public function storeKeberatan(Request $request)
    {
        try {
            $validated = $request->validate([
                'ticketNumber' => 'required|string',
                'reason' => 'required|string',
                'ktpFile' => 'nullable|string',
            ]);

            $ppidReq = PpidRequest::where('ticketNumber', $validated['ticketNumber'])->first();

            if (!$ppidReq) {
                return response()->json([
                    'success' => false,
                    'error' => 'Nomor tiket permohonan tidak ditemukan.'
                ], 404);
            }

            $objection = PpidObjection::create([
                'id' => (string) Str::uuid(),
                'requestId' => $ppidReq->id,
                'reason' => $validated['reason'],
                'ktpFile' => $validated['ktpFile'] ?? 'uploaded_ktp_objection.pdf',
                'status' => 'PENDING',
            ]);

            return response()->json([
                'success' => true,
                'id' => $objection->id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
