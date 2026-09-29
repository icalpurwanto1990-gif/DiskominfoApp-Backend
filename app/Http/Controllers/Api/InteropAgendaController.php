<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaderAgenda;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InteropAgendaController extends Controller
{
    /**
     * Get approved leader agendas for MPP integration and public displays.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LeaderAgenda::query();

            // Default only APPROVED agendas for display in MPP
            $status = $request->query('status', 'APPROVED');
            if ($status !== 'ALL') {
                $query->where('status', strtoupper($status));
            }

            // Date filtering
            if ($request->filled('date')) {
                $query->whereDate('date', $request->query('date'));
            } else {
                if ($request->filled('date_from')) {
                    $query->whereDate('date', '>=', $request->query('date_from'));
                }
                if ($request->filled('date_to')) {
                    $query->whereDate('date', '<=', $request->query('date_to'));
                }
            }

            // Filter by Leader Name
            if ($request->filled('leader')) {
                $query->where('leader_name', 'LIKE', '%' . $request->query('leader') . '%');
            }

            // Order by date and time
            $query->orderBy('date', 'asc')->orderBy('time', 'asc');

            $perPage = min((int) $request->query('per_page', 20), 100);
            $agendas = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Data agenda pimpinan berhasil dimuat.',
                'meta'    => [
                    'total'        => $agendas->total(),
                    'current_page' => $agendas->currentPage(),
                    'last_page'    => $agendas->lastPage(),
                    'per_page'     => $agendas->perPage(),
                    'timestamp'    => now()->toIso8601String(),
                ],
                'data' => $agendas->items(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'code'    => 500,
                'error'   => 'Terjadi kesalahan sistem: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific agenda detail by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $agenda = LeaderAgenda::find($id);

            if (! $agenda) {
                return response()->json([
                    'success' => false,
                    'code'    => 404,
                    'error'   => 'Agenda pimpinan tidak ditemukan.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'data'    => $agenda,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'code'    => 500,
                'error'   => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit an agenda / audiensi request from MPP counter or external app.
     */
    public function storeRequest(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title'          => 'required|string|max:255',
                'date'           => 'required|date_format:Y-m-d',
                'time'           => 'required|string|max:50',
                'location'       => 'required|string|max:255',
                'organizer'      => 'required|string|max:255',
                'leader_name'    => 'required|string|max:255',
                'notes'          => 'nullable|string|max:1000',
                'contact_person' => 'nullable|string|max:100',
                'contact_phone'  => 'nullable|string|max:50',
            ]);

            $client = $request->attributes->get('api_client');
            $sourceName = $client ? $client->name : 'MPP Terpadu';

            $notes = trim(($validated['notes'] ?? '') . " [Diajukan via Integrasi {$sourceName}]");

            $agenda = LeaderAgenda::create([
                'id'          => (string) Str::uuid(),
                'title'       => $validated['title'],
                'date'        => $validated['date'],
                'time'        => $validated['time'],
                'location'    => $validated['location'],
                'organizer'   => $validated['organizer'] . ($validated['contact_person'] ? " (PIC: {$validated['contact_person']} - {$validated['contact_phone']})" : ''),
                'leader_name' => $validated['leader_name'],
                'notes'       => $notes,
                'status'      => 'PENDING',
            ]);

            return response()->json([
                'success' => true,
                'code'    => 201,
                'message' => 'Pengajuan agenda pimpinan dari MPP berhasil diterima dan menunggu verifikasi bagian Protokol/Diskominfo.',
                'data'    => [
                    'agenda_id'    => $agenda->id,
                    'title'        => $agenda->title,
                    'leader_name'  => $agenda->leader_name,
                    'status'       => $agenda->status,
                    'submitted_at' => now()->toIso8601String(),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'code'    => 422,
                'error'   => 'Validasi gagal: ' . implode(', ', \Illuminate\Support\Arr::flatten($e->errors())),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'code'    => 500,
                'error'   => 'Gagal menyimpan pengajuan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
