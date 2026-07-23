<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Keamanan 2FA - Diskominfo Banggai Kepulauan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;750;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Ambient glowing backgrounds -->
    <div class="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

    <div class="w-full max-w-md bg-slate-950/60 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10">
        <!-- Branding header -->
        <div class="flex flex-col items-center text-center gap-2 mb-8">
            <div class="p-3.5 bg-emerald-600/15 text-emerald-500 rounded-2xl border border-emerald-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2c.57.14.98.66.98 1.25Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <h1 class="text-lg font-black uppercase tracking-wider text-white mt-3 leading-none">
                Verifikasi 2FA Admin
            </h1>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Dinas Komunikasi & Informatika
            </span>
        </div>

        <div class="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-slate-350 text-xs leading-relaxed text-center">
            Akun Anda terproteksi Otentikasi Dua Faktor. Masukkan 6-digit kode verifikasi dari aplikasi **Google Authenticator** Anda untuk melanjutkan.
        </div>

        @if($errors->has('code'))
            <div class="mb-6 p-4 bg-red-950/30 border border-red-500/35 rounded-2xl flex gap-3 text-red-350 items-start text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle flex-shrink-0 mt-0.5 text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16"/></svg>
                <div class="flex flex-col gap-0.5">
                    <span class="font-extrabold uppercase tracking-wider text-[10px] text-red-400">Verifikasi Gagal</span>
                    <p class="font-medium mt-0.5 leading-relaxed">{{ $errors->first('code') }}</p>
                </div>
            </div>
        @endif

        <form action="{{ route('admin.2fa.submit') }}" method="POST" class="flex flex-col gap-5 text-xs font-semibold text-slate-300">
            @csrf
            <div class="flex flex-col gap-2">
                <label for="code" class="text-slate-400 uppercase tracking-widest text-[9px] font-bold text-center">Kode Authenticator 6-Digit</label>
                <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxlength="6"
                    placeholder="000000"
                    pattern="[0-9]{6}"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    autofocus
                    class="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-center text-2xl font-bold text-white tracking-[0.4em] placeholder-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                />
            </div>

            <button
                type="submit"
                class="mt-2 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition active:scale-[0.98] shadow-lg shadow-emerald-950/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key-round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                <span>Verifikasi & Masuk</span>
            </button>
        </form>

        <form action="{{ route('api.logout') }}" method="POST" class="mt-4 text-center">
            @csrf
            <!-- Direct logout submit helper -->
            <button
                type="button"
                onclick="event.preventDefault(); fetch('{{ route('api.logout') }}', {method: 'POST', headers: {'X-CSRF-TOKEN': '{{ csrf_token() }}'}}).then(() => { localStorage.removeItem('adminSession'); localStorage.removeItem('userSession'); window.location.href = '/auth/login'; })"
                class="text-[10px] text-slate-500 hover:text-slate-350 uppercase tracking-widest font-extrabold transition-colors hover:underline"
            >
                Batal & Keluar
            </button>
        </form>
    </div>
</body>
</html>
