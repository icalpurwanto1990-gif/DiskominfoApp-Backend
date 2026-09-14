<?php

namespace App\Http\Controllers;

use App\Models\ContactComplaint;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KontakController extends Controller
{
    public function index()
    {
        return Inertia::render('Kontak');
    }

    public function store(Request $request)
    {
        // 1. HONEYPOT CHECK: If invisible bot trap is filled, silently discard without saving
        if ($request->filled('fax_number') || $request->filled('website_hp')) {
            Log::warning('Honeypot bot caught on contact form', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'trap_value' => $request->input('fax_number') ?: $request->input('website_hp'),
            ]);

            // Return fake success to prevent bot from retrying with modified payload
            return response()->json([
                'success' => true,
                'message' => 'Laporan pengaduan Anda berhasil dikirim!',
            ]);
        }

        // 2. TIME-TRAP CHECK: Form submission in under 3 seconds indicates automated script
        $formTime = $request->input('form_time');
        if ($formTime) {
            $elapsedSeconds = (time() * 1000 - (int) $formTime) / 1000;
            if ($elapsedSeconds > 0 && $elapsedSeconds < 2.5) {
                Log::warning('Time-trap triggered (submitted too fast)', [
                    'ip' => $request->ip(),
                    'elapsed_seconds' => $elapsedSeconds,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Pengiriman terlalu cepat terdeteksi. Silakan coba kembali.',
                ], 422);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:3000',
        ]);

        // 3. SPAM & GAMBLING KEYWORDS / EXCESSIVE URLS FILTER
        $contentToCheck = strtolower($validated['subject'] . ' ' . $validated['message']);
        $spamKeywords = [
            'slot', 'gacor', 'judi', 'poker', 'togel', 'pragmatic', 'maxwin',
            'casino', 'sbobet', 'agen bola', 'viagra', 'cialis', 'crypto profit',
            't.me/', 'whatsapp bot', 'sex', 'bokep', 'porn'
        ];

        foreach ($spamKeywords as $keyword) {
            if (str_contains($contentToCheck, $keyword)) {
                Log::warning('Spam keyword blocked in contact form', [
                    'ip' => $request->ip(),
                    'keyword' => $keyword,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Pesan Anda mengandung kata atau tautan yang dilarang oleh filter keamanan.',
                ], 422);
            }
        }

        // Check for excessive URLs (typical bot behavior)
        if (substr_count($contentToCheck, 'http://') + substr_count($contentToCheck, 'https://') > 2) {
            return response()->json([
                'success' => false,
                'message' => 'Pesan Anda terdeteksi mengandung terlalu banyak tautan eksternal.',
            ], 422);
        }

        // Sanitize text inputs
        $cleanName = strip_tags($validated['name']);
        $cleanSubject = strip_tags($validated['subject']);
        $cleanMessage = strip_tags($validated['message']);

        $complaint = ContactComplaint::create([
            'id' => (string) Str::uuid(),
            'name' => $cleanName,
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'subject' => $cleanSubject,
            'message' => $cleanMessage,
            'status' => 'PENDING',
            'createdAt' => now(),
        ]);

        // Dispatch Filament Database Notification ke lonceng Admin
        try {
            $admins = User::all();
            Notification::make()
                ->title('Pengaduan / Pesan Baru!')
                ->body("Pesan dari {$complaint->name}: \"{$complaint->subject}\"")
                ->icon('heroicon-o-chat-bubble-left-right')
                ->danger()
                ->actions([
                    \Filament\Notifications\Actions\Action::make('view')
                        ->label('Lihat Pengaduan')
                        ->url('/admin/contact-complaints'),
                ])
                ->sendToDatabase($admins);
        } catch (\Exception $e) {
            // Ignore if notifications table not migrated
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan pengaduan Anda berhasil dikirim!',
            'data' => $complaint,
        ]);
    }
}
