<?php

namespace App\Http\Controllers;

use App\Models\AppStatistic;
use App\Models\DigitalService;
use App\Models\PpidRequest;
use App\Models\ServiceRequest;
use App\Models\TteRequest;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LayananController extends Controller
{
    public function index()
    {
        return Inertia::render('Layanan');
    }

    public function apiIndex()
    {
        try {
            $services = DigitalService::where('active', true)->orderBy('createdAt', 'asc')->get();

            return response()->json($services);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function storePengajuan(Request $request)
    {
        try {
            $validated = $request->validate([
                'serviceType' => 'required|string',
                'applicantName' => 'required|string',
                'applicantEmail' => 'required|email',
                'applicantPhone' => 'required|string',
                'instansi' => 'required|string',
                'details' => 'nullable|array',
            ]);

            $ticketNumber = 'SRV-2026-'.rand(1000, 9999);

            $newRequest = ServiceRequest::create([
                'id' => (string) Str::uuid(),
                'serviceType' => $validated['serviceType'],
                'ticketNumber' => $ticketNumber,
                'applicantName' => $validated['applicantName'],
                'applicantEmail' => $validated['applicantEmail'],
                'applicantPhone' => $validated['applicantPhone'],
                'instansi' => $validated['instansi'],
                'details' => $validated['details'] ?? [],
                'status' => 'PENDING',
            ]);

            // Increment service requests counter in app statistic
            try {
                $stat = AppStatistic::where('key', 'TOTAL_SERVICES_REQUESTED')->first();
                if ($stat) {
                    $stat->increment('value');
                } else {
                    AppStatistic::create([
                        'id' => (string) Str::uuid(),
                        'key' => 'TOTAL_SERVICES_REQUESTED',
                        'value' => 1,
                    ]);
                }
            } catch (\Exception $e) {
                // Skip if not exist or error
            // Dispatch Filament Database Notification ke lonceng Admin
            try {
                $admins = User::all();
                Notification::make()
                    ->title('Tiket Layanan Baru!')
                    ->body("Pemohon {$newRequest->applicantName} ({$newRequest->instansi}) mengajukan {$newRequest->serviceType} [#{$newRequest->ticketNumber}]")
                    ->icon('heroicon-o-ticket')
                    ->warning()
                    ->actions([
                        \Filament\Notifications\Actions\Action::make('view')
                            ->label('Buka Tiket')
                            ->url('/admin/service-requests'),
                    ])
                    ->sendToDatabase($admins);
            } catch (\Exception $e) {
                // Ignore if database notification table does not exist yet
            }

            return response()->json([
                'success' => true,
                'ticketNumber' => $newRequest->ticketNumber,
                'id' => $newRequest->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function apiPengajuanIndex(Request $request)
    {
        $ticketNumber = $request->query('ticketNumber', '');

        try {
            if ($ticketNumber) {
                $upperTicket = strtoupper(trim($ticketNumber));

                // 1. Check if the input is a NIP (18 digits)
                if (strlen($upperTicket) === 18 && is_numeric($upperTicket)) {
                    $tte = TteRequest::where('nip', $upperTicket)->first();
                    if ($tte) {
                        return response()->json(['success' => true, 'type' => 'TTE', 'data' => $tte]);
                    }
                }

                // 2. Check standard ticket prefixes
                if (str_starts_with($upperTicket, 'SRV-')) {
                    $req = ServiceRequest::where('ticketNumber', $upperTicket)->first();
                    if ($req) {
                        return response()->json(['success' => true, 'type' => 'SERVICE', 'data' => $req]);
                    }
                } elseif (str_starts_with($upperTicket, 'PPID-')) {
                    $req = PpidRequest::where('ticketNumber', $upperTicket)->first();
                    if ($req) {
                        return response()->json(['success' => true, 'type' => 'PPID', 'data' => $req]);
                    }
                } else {
                    // Fallback global search (by NIP, Ticket, or ID)
                    $srvReq = ServiceRequest::where('ticketNumber', $upperTicket)->first();
                    if ($srvReq) {
                        return response()->json(['success' => true, 'type' => 'SERVICE', 'data' => $srvReq]);
                    }

                    $ppidReq = PpidRequest::where('ticketNumber', $upperTicket)->first();
                    if ($ppidReq) {
                        return response()->json(['success' => true, 'type' => 'PPID', 'data' => $ppidReq]);
                    }

                    $tteQuery = TteRequest::where('nip', $upperTicket);
                    if (\Illuminate\Support\Str::isUuid($upperTicket)) {
                        $tteQuery->orWhere('id', $upperTicket);
                    }
                    $tteReq = $tteQuery->first();

                    if ($tteReq) {
                        return response()->json(['success' => true, 'type' => 'TTE', 'data' => $tteReq]);
                    }
                }

                return response()->json(['success' => false, 'error' => 'Data permohonan atau tiket tidak ditemukan'], 404);
            }

            $requests = ServiceRequest::orderBy('createdAt', 'desc')->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
