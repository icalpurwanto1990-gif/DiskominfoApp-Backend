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
            Mail::send([], [], function ($message) use ($user, $token, $validated) {
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
                                <a href="' . route('auth.verify', ['token' => $token]) . '" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; letter-spacing: 0.5px; text-transform: uppercase;">Aktifkan Akun Saya</a>
                            </div>
                            <p style="color: #64748b; font-size: 13px; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
                                Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin tautan berikut ke browser Anda:<br>
                                <a href="' . route('auth.verify', ['token' => $token]) . '" style="color: #3b82f6; word-break: break-all;">' . route('auth.verify', ['token' => $token]) . '</a>
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

            // Check if 2FA is enabled
            if ($user->two_factor_enabled) {
                $request->session()->put('pending_2fa_user_id', $user->id);
                $request->session()->put('pending_2fa_remember', $request->boolean('remember'));

                return response()->json([
                    'success' => true,
                    'two_factor_required' => true,
                    'message' => 'Otentikasi Dua Faktor diperlukan. Silakan masukkan kode 6-digit dari aplikasi Authenticator Anda.',
                ]);
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
                    'two_factor_enabled' => $user->two_factor_enabled,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Email atau password salah.',
        ], 422);
    }

    public function verify2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $userId = $request->session()->get('pending_2fa_user_id');
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi login telah kedaluwarsa atau tidak valid.',
            ], 422);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 422);
        }

        $service = new \App\Services\Google2FAService();
        if ($service->verify($user->two_factor_secret, $request->code)) {
            $remember = $request->session()->remove('pending_2fa_remember') ?? false;
            $request->session()->forget('pending_2fa_user_id');

            Auth::login($user, $remember);
            $request->session()->regenerate();

            // Auto-verify Filament 2FA for this session
            $request->session()->put('filament_2fa_verified', true);

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
                    'two_factor_enabled' => $user->two_factor_enabled,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Kode Otentikasi Dua Faktor tidak valid.',
        ], 422);
    }

    public function setup2FA(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 401);
        }

        $service = new \App\Services\Google2FAService();
        $secret = $user->two_factor_secret ?: $service->generateSecret();

        if (!$user->two_factor_secret) {
            $user->update(['two_factor_secret' => $secret]);
        }

        $qrUrl = $service->getQRUrl($user->email, $secret);

        return response()->json([
            'success' => true,
            'secret' => $secret,
            'qr_code_url' => $qrUrl,
            'two_factor_enabled' => (bool)$user->two_factor_enabled,
        ]);
    }

    public function enable2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 401);
        }

        $service = new \App\Services\Google2FAService();
        if ($service->verify($user->two_factor_secret, $request->code)) {
            $user->update(['two_factor_enabled' => true]);

            // Set verified for the current session too
            $request->session()->put('filament_2fa_verified', true);

            return response()->json([
                'success' => true,
                'message' => 'Otentikasi Dua Faktor (2FA) berhasil diaktifkan.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Kode verifikasi salah. Gagal mengaktifkan 2FA.',
        ], 422);
    }

    public function disable2FA(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 401);
        }

        $user->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
        ]);

        $request->session()->forget('filament_2fa_verified');

        return response()->json([
            'success' => true,
            'message' => 'Otentikasi Dua Faktor (2FA) berhasil dinonaktifkan.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }

    public function showForgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function showResetPassword($token)
    {
        return Inertia::render('Auth/ResetPassword', ['token' => $token]);
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $token = Str::random(60);

            // Query Builder doesn't support updateOrCreate() — use delete + insert instead
            \DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            \DB::table('password_reset_tokens')->insert([
                'email'      => $request->email,
                'token'      => Hash::make($token),
                'created_at' => now(),
            ]);

            $resetUrl   = url('/auth/reset-password/' . $token . '?email=' . urlencode($user->email));
            $userName   = htmlspecialchars($user->name);
            $year       = date('Y');
            $htmlBody   = "
                <div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;\">
                    <div style=\"text-align: center; margin-bottom: 24px;\">
                        <h2 style=\"color: #059669; font-weight: 800; font-size: 24px; margin: 0;\">Portal Diskominfo Bangkep</h2>
                    </div>
                    <p style=\"color: #334155; font-size: 16px; line-height: 1.6;\">Halo {$userName},</p>
                    <p style=\"color: #334155; font-size: 16px; line-height: 1.6;\">Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
                    <div style=\"margin: 32px 0; text-align: center;\">
                        <a href=\"{$resetUrl}\" style=\"background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; letter-spacing: 0.5px; text-transform: uppercase;\">Atur Ulang Kata Sandi</a>
                    </div>
                    <p style=\"color: #64748b; font-size: 13px; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;\">
                        Jika tombol di atas tidak berfungsi, salin tautan ini ke browser Anda:<br>
                        <a href=\"{$resetUrl}\" style=\"color: #3b82f6; word-break: break-all;\">{$resetUrl}</a>
                    </p>
                    <p style=\"color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;\">&copy; {$year} Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan</p>
                </div>
            ";

            try {
                Mail::html($htmlBody, function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Atur Ulang Kata Sandi - Portal Diskominfo Bangkep');
                });
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Reset password mail failed: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Gagal mengirim email reset password: ' . $e->getMessage()], 500);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Tautan atur ulang kata sandi telah dikirim ke email Anda jika terdaftar.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = \DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json(['success' => false, 'message' => 'Token reset password tidak valid atau kedaluwarsa.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui. Silakan login kembali.',
        ]);
    }

    public function showAdmin2FA()
    {
        $user = auth()->user();
        if (!$user || !$user->two_factor_enabled) {
            return redirect('/admin');
        }

        if (session('filament_2fa_verified')) {
            return redirect('/admin');
        }

        return view('admin.verify-2fa');
    }

    public function submitAdmin2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = auth()->user();
        if (!$user || !$user->two_factor_enabled) {
            return redirect('/admin');
        }

        $service = new \App\Services\Google2FAService();
        if ($service->verify($user->two_factor_secret, $request->code)) {
            session(['filament_2fa_verified' => true]);
            return redirect('/admin');
        }

        return redirect()->route('admin.2fa.view')->withErrors(['code' => 'Kode Otentikasi Dua Faktor salah.']);
    }
}
