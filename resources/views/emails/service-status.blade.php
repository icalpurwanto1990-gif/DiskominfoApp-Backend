<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $headlineMessage }} — Diskominfo Bangkep</title>
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
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        /* Header */
        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 28px 32px;
            text-align: center;
        }
        .header-logo {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            width: 64px;
            height: 64px;
            line-height: 64px;
            font-size: 28px;
            margin-bottom: 12px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            color: rgba(255,255,255,0.85);
            font-size: 13px;
            margin-top: 4px;
        }
        /* Status Badge */
        .status-banner {
            padding: 20px 32px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 24px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #ffffff;
            background-color: {{ $statusColor }};
        }
        .status-icon {
            font-size: 40px;
            display: block;
            margin-bottom: 12px;
        }
        .status-headline {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
        }
        /* Body */
        .body {
            padding: 28px 32px;
        }
        .salutation {
            font-size: 15px;
            color: #334155;
            margin-bottom: 16px;
        }
        .message-body {
            font-size: 15px;
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.7;
        }
        /* Ticket Detail Box */
        .ticket-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid {{ $statusColor }};
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .ticket-box h3 {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
            margin-bottom: 14px;
        }
        .ticket-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        .ticket-row:last-child {
            border-bottom: none;
        }
        .ticket-row .label {
            color: #64748b;
            font-weight: 500;
            min-width: 130px;
        }
        .ticket-row .value {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
        }
        .ticket-row .value.status-value {
            color: {{ $statusColor }};
        }
        /* CTA */
        .cta-section {
            text-align: center;
            margin-bottom: 24px;
        }
        .cta-button {
            display: inline-block;
            background: #059669;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
        }
        /* Footer */
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 20px 32px;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.8;
        }
        .footer strong {
            color: #64748b;
        }
        .footer a {
            color: #059669;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
        }
        .disclaimer {
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="wrapper">

        {{-- Header --}}
        <div class="header">
            <div class="header-logo">🏛️</div>
            <h1>DISKOMINFO BANGKEP</h1>
            <p>Dinas Komunikasi dan Informatika — Kabupaten Banggai Kepulauan</p>
        </div>

        {{-- Status Banner --}}
        <div class="status-banner">
            <span class="status-icon">{{ $statusIcon }}</span>
            <div class="status-headline">{{ $headlineMessage }}</div>
            <span class="status-badge">{{ $statusLabel }}</span>
        </div>

        {{-- Body --}}
        <div class="body">
            <p class="salutation">
                Yth. <strong>{{ $serviceRequest->applicantName }}</strong>,
            </p>

            <p class="message-body">
                {!! $bodyMessage !!}
            </p>

            {{-- Ticket Detail Box --}}
            <div class="ticket-box">
                <h3>📋 Detail Tiket Pengajuan</h3>

                <div class="ticket-row">
                    <span class="label">Nomor Tiket</span>
                    <span class="value">#{{ $serviceRequest->ticketNumber }}</span>
                </div>
                <div class="ticket-row">
                    <span class="label">Jenis Layanan</span>
                    <span class="value">{{ $serviceRequest->serviceType }}</span>
                </div>
                <div class="ticket-row">
                    <span class="label">Nama Pemohon</span>
                    <span class="value">{{ $serviceRequest->applicantName }}</span>
                </div>
                <div class="ticket-row">
                    <span class="label">Instansi / OPD</span>
                    <span class="value">{{ $serviceRequest->instansi }}</span>
                </div>
                <div class="ticket-row">
                    <span class="label">Email</span>
                    <span class="value">{{ $serviceRequest->applicantEmail }}</span>
                </div>
                <div class="ticket-row">
                    <span class="label">Status Terkini</span>
                    <span class="value status-value">{{ $statusIcon }} {{ $statusLabel }}</span>
                </div>
            </div>

            {{-- CTA --}}
            <div class="cta-section">
                <a href="{{ config('app.url') }}/layanan" class="cta-button">
                    Kunjungi Portal Layanan Diskominfo
                </a>
            </div>

            <div class="divider"></div>

            <p class="disclaimer">
                Jika Anda memiliki pertanyaan terkait pengajuan ini, silakan hubungi
                kami melalui kontak yang tersedia di portal kami.<br>
                Mohon tidak membalas email ini secara langsung.
            </p>
        </div>

        {{-- Footer --}}
        <div class="footer">
            <p>
                <strong>Dinas Komunikasi dan Informatika</strong><br>
                Kabupaten Banggai Kepulauan, Sulawesi Tengah<br>
                🌐 <a href="https://diskominfo.banggaikep.go.id">diskominfo.banggaikep.go.id</a><br>
                📧 <a href="mailto:diskominfo@banggaikep.go.id">diskominfo@banggaikep.go.id</a>
            </p>
            <br>
            <p>
                Email ini dikirim otomatis oleh sistem. Harap tidak membalas email ini.<br>
                © {{ date('Y') }} Diskominfo Bangkep. Seluruh hak cipta dilindungi.
            </p>
        </div>

    </div>
</body>
</html>
