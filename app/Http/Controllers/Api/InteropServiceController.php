<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DigitalService;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InteropServiceController extends Controller
{
    /**
     * Get list of available Diskominfo services for MPP integration.
     */
    public function index(): JsonResponse
    {
        try {
            $services = DigitalService::where('active', true)->get();

            // Default fallback if database empty
            if ($services->isEmpty()) {
                $services = collect([
                    [
                        'id'          => 'tte-el',
                        'slug'        => 'tte-elektronik',
                        'title'       => 'Penerbitan Tanda Tangan Elektronik (TTE BSrE/BSSN)',
                        'description' => 'Layanan fasilitasi sertifikat elektronik pejabat ASN lingkup Pemkab Banggai Kepulauan.',
                        'active'      => true,
                    ],
                    [
                        'id'          => 'subdomain-web',
                        'slug'        => 'subdomain-hosting',
                        'title'       => 'Permohonan Subdomain & Hosting OPD (.banggaikep.go.id)',
                        'description' => 'Fasilitasi domain resmi instansi pemerintah daerah dan server hosting aplikasi.',
                        'active'      => true,
                    ],
                    [
                        'id'          => 'email-dinas',
                        'slug'        => 'email-resmi-pemerintah',
                        'title'       => 'Akun Email Resmi Pemerintah (@banggaikep.go.id)',
                        'description' => 'Penerbitan akun pos elektronik kedinasan untuk pejabat dan unit kerja OPD.',
                        'active'      => true,
                    ],
                    [
                        'id'          => 'jaringan-internet',
                        'slug'        => 'infrastruktur-jaringan',
                        'title'       => 'Akses Jaringan & Troubleshooting Internet Pemda',
                        'description' => 'Dukungan instalasi dan penanganan gangguan fiber optik / internet kantor dinas.',
                        'active'      => true,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Katalog layanan Diskominfo berhasil dimuat.',
                'data'    => $services,
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
     * Submit a service request from MPP counter or external portal.
     */
    public function apply(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'serviceType'    => 'required|string|max:100',
                'applicantName'  => 'required|string|max:255',
                'applicantEmail' => 'required|email|max:255',
                'applicantPhone' => 'required|string|max:50',
                'instansi'       => 'required|string|max:255',
                'details'        => 'nullable|array',
                'notes'          => 'nullable|string|max:1000',
            ]);

            $client = $request->attributes->get('api_client');
            $sourceName = $client ? $client->name : 'Mal Pelayanan Publik (MPP)';

            // Generate unique ticket number
            $ticketNumber = 'MPP-' . strtoupper(Str::random(4)) . '-' . date('ymd');

            $details = $validated['details'] ?? [];
            $details['source_integration'] = $sourceName;
            $details['ip_submission'] = $request->ip();

            $serviceRequest = ServiceRequest::create([
                'id'             => (string) Str::uuid(),
                'serviceType'    => $validated['serviceType'],
                'ticketNumber'   => $ticketNumber,
                'applicantName'  => $validated['applicantName'],
                'applicantEmail' => $validated['applicantEmail'],
                'applicantPhone' => $validated['applicantPhone'],
                'instansi'       => $validated['instansi'],
                'details'        => $details,
                'status'         => 'PENDING',
                'notes'          => trim(($validated['notes'] ?? '') . " [Diajukan via Integrasi {$sourceName}]"),
            ]);

            return response()->json([
                'success' => true,
                'code'    => 201,
                'message' => 'Permohonan layanan Diskominfo berhasil diajukan.',
                'data'    => [
                    'ticketNumber'   => $serviceRequest->ticketNumber,
                    'serviceType'    => $serviceRequest->serviceType,
                    'applicantName'  => $serviceRequest->applicantName,
                    'status'         => $serviceRequest->status,
                    'created_at'     => now()->toIso8601String(),
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
                'error'   => 'Gagal memproses permohonan layanan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check status of a service request by ticket number or phone.
     */
    public function status(Request $request, string $query): JsonResponse
    {
        try {
            $ticket = ServiceRequest::where('ticketNumber', $query)
                ->orWhere('id', $query)
                ->first();

            if (! $ticket) {
                return response()->json([
                    'success' => false,
                    'code'    => 404,
                    'error'   => 'Nomor tiket permohonan tidak ditemukan.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'data'    => [
                    'ticketNumber'   => $ticket->ticketNumber,
                    'serviceType'    => $ticket->serviceType,
                    'applicantName'  => $ticket->applicantName,
                    'instansi'       => $ticket->instansi,
                    'status'         => $ticket->status,
                    'notes'          => $ticket->notes,
                    'submitted_at'   => $ticket->createdAt ? $ticket->createdAt->toIso8601String() : null,
                    'updated_at'     => $ticket->updatedAt ? $ticket->updatedAt->toIso8601String() : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'code'    => 500,
                'error'   => 'Gagal memeriksa status: ' . $e->getMessage(),
            ], 500);
        }
    }
}
