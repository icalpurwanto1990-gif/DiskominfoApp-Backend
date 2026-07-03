import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { Lock, ChevronLeft, AlertCircle, CheckCircle, LockKeyhole } from "lucide-react";

export default function ResetPassword({ token }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Automatically retrieve the email from query parameters
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
      } else {
        const errMsg = data.errors 
          ? Object.values(data.errors).flat().join(" ") 
          : (data.message || "Gagal mengatur ulang kata sandi.");
        setError(errMsg);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-950/60 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10">
        
        {/* Back Link */}
        <Link href="/auth/login" className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider mb-8 transition-colors">
          <ChevronLeft size={12} />
          <span>Kembali ke Halaman Masuk</span>
        </Link>

        {/* Branding header */}
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="p-3 bg-emerald-600/15 text-emerald-500 rounded-2xl border border-emerald-500/10">
            <LockKeyhole size={28} className="stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-extrabold uppercase tracking-wider text-white mt-2 leading-none">
            Sandi Baru
          </h1>
          <span className="text-[10px] text-slate-450 font-semibold text-center mt-1 leading-relaxed max-w-xs">
            Buat kata sandi baru untuk mengamankan akun Anda.
          </span>
        </div>

        {/* Success Notification */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-500/35 rounded-2xl flex gap-3 text-emerald-300 items-start">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none text-emerald-400">Sandi Diperbarui</span>
              <p className="text-[11px] font-semibold leading-relaxed mt-1 text-emerald-200/80">{successMsg}</p>
              <Link href="/auth/login" className="mt-4 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] uppercase font-bold text-center tracking-wider transition-all">
                Masuk Sekarang
              </Link>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500/35 rounded-2xl flex gap-3 text-red-300 items-start">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none">Pembaruan Gagal</span>
              <p className="text-[11px] font-semibold leading-relaxed mt-1 text-red-200/80">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!successMsg && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-300">
            {/* Read-Only email preview */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Email Penerima</label>
              <div className="px-4 py-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl text-slate-400 text-xs">
                {email || "Sedang memuat..."}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="pass" className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="pass"
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="passConf" className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="passConf"
                  type="password"
                  required
                  placeholder="Ulangi password baru"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white rounded-2xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Perbarui Kata Sandi</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
