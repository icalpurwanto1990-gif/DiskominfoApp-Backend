<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:User,email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'nip' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
        ]);

        $token = Str::random(60);

        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'USER',
            'nip' => $validated['nip'] ?? null,
            'jabatan' => $validated['jabatan'] ?? null,
            'instansi' => $validated['instansi'] ?? null,
            'verification_token' => $token,
        ]);

        try {
            Mail::send([], [], function ($message) use ($user, $validated) {
                $message->to($validated['email'])
                    ->subject('Verifikasi Email - Portal Diskominfo Bangkep')
                    ->html('
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <h2 style="color: #059669; font-weight: 800; font-size: 24px; margin: 0;">Portal Diskominfo Bangkep</h2>
                            </div>
                            <p style="color: #334155; font-size: 16px; line-height: 1.6;">Halo ' . htmlspecialchars($user->name) . ',</p>
                            <p style="color: #334155; font-size: 16px; line-height: 1.6;">Akun Anda telah berhasil dibuat. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda:</p>
                            <div style="margin: 32px 0; text-align: center;">
                                <a href="' . route('auth.verify', ['token' => $user->verification_token]) . '" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; letter-spacing: 0.5px; text-transform: uppercase;">Aktifkan Akun Saya</a>
                            </div>
                            <p style="color: #64748b; font-size: 13px; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
                                Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin tautan berikut ke browser Anda:<br>
                                <a href="' . route('auth.verify', ['token' => $user->verification_token]) . '" style="color: #3b82f6; word-break: break-all;">' . route('auth.verify', ['token' => $user->verification_token]) . '</a>
                            </p>
                            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">&copy; ' . date('Y') . ' Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan</p>
                        </div>
                    ');
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Mail send failed: ' . $e->getMessage());
        }

        $responseData = [
            'success' => true,
            'message' => 'Pendaftaran berhasil. Silakan cek kotak masuk email Anda (termasuk folder spam) untuk melakukan verifikasi akun.',
        ];

        if (config('app.env') === 'local') {
            $responseData['verification_link'] = route('auth.verify', ['token' => $token]);
        }

        return response()->json($responseData);
    }

    public function verifyEmail($token)
    {
        $user = User::where('verification_token', $token)->first();

        if (! $user) {
            return redirect()->route('login', ['error' => 'invalid_token']);
        }

        $user->email_verified_at = now();
        $user->verification_token = null;
        $user->save();

        return redirect()->route('login', ['verified' => '1']);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if ($user && Hash::check($credentials['password'], $user->password)) {
            // Check if email is verified
            if (is_null($user->email_verified_at)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda belum aktif. Silakan verifikasi email Anda terlebih dahulu.',
                ], 422);
            }

            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'USER',
                    'nip' => $user->nip,
                    'jabatan' => $user->jabatan,
                    'instansi' => $user->instansi,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Email atau password salah.',
        ], 422);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }
}
