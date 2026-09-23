<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aktivasi Akun — Portal Diskominfo Bangkep</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f1f5f9;
            color: #1e293b;
            line-height: 1.6;
        }
        .wrapper {
            max-width: 600px;
            margin: 32px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        /* Header */
        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header-icon {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            width: 60px;
            height: 60px;
            line-height: 60px;
            font-size: 28px;
            margin-bottom: 12px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin: 0;
        }
        .header p {
            color: #d1fae5;
            font-size: 13px;
            margin-top: 6px;
            font-weight: 500;
        }
        /* Content Body */
        .body-content {
            padding: 32px 28px;
        }
        .greeting {
            font-size: 17px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .intro-text {
            font-size: 14px;
            color: #334155;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        /* User Summary Box */
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 28px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 6px 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #64748b;
            font-weight: 600;
        }
        .info-value {
            color: #0f172a;
            font-weight: 700;
            text-align: right;
        }
        /* CTA Button */
        .cta-container {
            text-align: center;
            margin: 32px 0;
        }
        .btn-verify {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.5px;
            display: inline-block;
            box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
            text-transform: uppercase;
        }
        /* Fallback Link */
        .fallback-box {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 20px 28px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
        }
        .fallback-box a {
            color: #0284c7;
            word-break: break-all;
            text-decoration: underline;
        }
        /* Footer */
        .footer {
            background: #0f172a;
            color: #94a3b8;
            padding: 24px;
            text-align: center;
            font-size: 11px;
            line-height: 1.6;
        }
        .footer p {
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- Header -->
        <div class="header">
            <div class="header-icon">🛡️</div>
            <h1>Portal Diskominfo Bangkep</h1>
            <p>Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan</p>
        </div>

        <!-- Body Content -->
        <div class="body-content">
            <p class="greeting">Halo, {{ $user->name }} 👋</p>
            <p class="intro-text">
                Terima kasih telah mendaftar di Portal Pelayanan Terpadu Diskominfo Kabupaten Banggai Kepulauan. Untuk memastikan keamanan dan mengaktifkan akun Anda, silakan lakukan verifikasi alamat email ini.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">Nama Lengkap</span>
                    <span class="info-value">{{ $user->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Alamat Email</span>
                    <span class="info-value">{{ $user->email }}</span>
                </div>
                @if($user->instansi)
                <div class="info-row">
                    <span class="info-label">Instansi / Unit Kerja</span>
                    <span class="info-value">{{ $user->instansi }}</span>
                </div>
                @endif
                @if($user->jabatan)
                <div class="info-row">
                    <span class="info-label">Jabatan</span>
                    <span class="info-value">{{ $user->jabatan }}</span>
                </div>
                @endif
            </div>

            <!-- CTA Button -->
            <div class="cta-container">
                <a href="{{ $verificationUrl }}" class="btn-verify" target="_blank">
                    Aktifkan Akun Saya
                </a>
            </div>

            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 16px;">
                Tautan konfirmasi ini berlaku secara unik untuk akun Anda.
            </p>
        </div>

        <!-- Fallback Link Section -->
        <div class="fallback-box">
            <p style="margin-bottom: 8px;"><strong>Tombol di atas tidak dapat diklik?</strong></p>
            <p>Salin dan tempelkan alamat URL berikut langsung ke peramban (browser) Anda:</p>
            <p style="margin-top: 6px;"><a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a></p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan</strong></p>
            <p>Jl. Bukit Halimun, Salakan, Banggai Kepulauan, Sulawesi Tengah</p>
            <p style="margin-top: 8px; color: #64748b;">
                Email ini dikirim secara otomatis oleh sistem. Jika Anda tidak pernah merasa mendaftar di portal ini, Anda dapat mengabaikan email ini dengan aman.
            </p>
            <p style="margin-top: 8px; color: #475569;">&copy; {{ date('Y') }} Pemerintah Kabupaten Banggai Kepulauan. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
