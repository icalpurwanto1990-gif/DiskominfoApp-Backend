<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Diskominfo Banggai Kepulauan | Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan') }}</title>

        <!-- Favicon & App Icons -->
        <!-- Cara ganti: replace file di public/images/ dengan nama yang sama, lalu hard-refresh browser (Ctrl+Shift+R) -->
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
        <link rel="shortcut icon" href="/images/favicon.png">

        <!-- Primary SEO Meta Tags -->
        <meta name="title" content="Diskominfo Banggai Kepulauan | Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan">
        <meta name="description" content="Portal Resmi Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan — Layanan Publik Digital, PPID, Satu Data Daerah, dan Smart Government SPBE Bangkep.">
        <meta name="keywords" content="Diskominfo Banggai Kepulauan, Dinas Komunikasi dan Informatika Banggai Kepulauan, Diskominfo Bangkep, SPBE Banggai Kepulauan, PPID Bangkep, Satu Data Banggai Kepulauan, Pemkab Banggai Kepulauan">
        <meta name="author" content="Diskominfo Kabupaten Banggai Kepulauan">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Diskominfo Kabupaten Banggai Kepulauan">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="Diskominfo Banggai Kepulauan | Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan">
        <meta property="og:description" content="Portal Resmi Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan — Layanan Digital, PPID, Satu Data, dan Smart Government SPBE.">
        <meta property="og:image" content="{{ asset('images/favicon.png') }}">
        <meta property="og:locale" content="id_ID">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="Diskominfo Banggai Kepulauan | Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan">
        <meta name="twitter:description" content="Portal Resmi Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan — Layanan Digital, PPID, Satu Data, dan Smart Government SPBE.">
        <meta name="twitter:image" content="{{ asset('images/favicon.png') }}">

        <!-- Google Site Verification (Opsional via .env GOOGLE_SITE_VERIFICATION) -->
        @if(env('GOOGLE_SITE_VERIFICATION'))
        <meta name="google-site-verification" content="{{ env('GOOGLE_SITE_VERIFICATION') }}">
        @endif

        <meta name="theme-color" content="#059669">

        <!-- Google Fonts: Inter -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

        <!-- Scripts & Styles -->
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead

        <style>
            *, *::before, *::after { box-sizing: border-box; }
            body {
                font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            /* Scroll-reveal animation */
            .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
            .reveal.visible { opacity: 1; transform: translateY(0); }
            .reveal-left { opacity: 0; transform: translateX(-28px); transition: opacity 0.6s ease, transform 0.6s ease; }
            .reveal-left.visible { opacity: 1; transform: translateX(0); }
            /* Count-up animation support */
            @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            .shimmer-bg {
                background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.08) 50%, transparent 75%);
                background-size: 200% 100%;
                animation: shimmer 2s infinite;
            }
            /* Custom scrollbar */
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 3px; }
        </style>
    </head>
    <body class="antialiased bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 transition-colors duration-200">
        @inertia
    </body>
</html>
