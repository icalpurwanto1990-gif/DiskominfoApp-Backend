import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { User, Mail, Lock, UserPlus, ChevronLeft, AlertCircle, Building2, Briefcase, Award, CheckCircle } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [nip, setNip] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [instansi, setInstansi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successLink, setSuccessLink] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          nip: nip || null,
          jabatan: jabatan || null,
          instansi: instansi || null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegisteredEmail(email);
        setSuccessLink(data.verification_link || "");
        setIsRegistered(true);
      } else {
        const errMsg = data.errors 
          ? Object.values(data.errors).flat().join(" ") 
          : (data.message || "Gagal melakukan registrasi. Silakan periksa kembali data Anda.");
        setError(errMsg);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      loading && setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg bg-slate-950/60 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 my-8">
        
        {/* Back Link */}
        <Link href="/auth/login" className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider mb-6 transition-colors">
          <ChevronLeft size={12} />
          <span>Kembali ke Halaman Masuk</span>
        </Link>

        {/* Success View */}
        {isRegistered ? (
          <div className="flex flex-col items-center text-center gap-6 py-4">
            <div className="p-4 bg-emerald-600/15 text-emerald-500 rounded-full border border-emerald-500/10 animate-bounce">
              <CheckCircle size={44} className="stroke-[2]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">
                Registrasi Berhasil!
              </h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Verifikasi Email Diperlukan
              </span>
            </div>
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed max-w-sm">
              <p className="font-extrabold text-slate-200 mb-2 uppercase tracking-wider text-[10px]">Pemberitahuan:</p>
              Akun Anda telah berhasil dibuat. Silakan periksa kotak masuk email Anda **({registeredEmail})** (termasuk folder spam/promosi) untuk melakukan verifikasi dan mengaktifkan akun Anda.
            </div>
            
            {successLink ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <a
                  href={successLink}
                  className="w-full px-6 py-3.5 bg-emerald-650 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Aktifkan Akun (Bypass Verifikasi)</span>
                </a>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Development Environment Utility
                </span>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="w-full px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Kembali ke Halaman Login</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Branding header */}
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <div className="p-3 bg-emerald-600/15 text-emerald-500 rounded-2xl border border-emerald-500/10">
                <UserPlus size={28} className="stroke-[2.5]" />
              </div>
              <h1 className="text-xl font-extrabold uppercase tracking-wider text-white mt-2 leading-none">
                BUAT AKUN BARU
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Portal Pelayanan Diskominfo
              </span>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-6 p-4 bg-red-950/30 border border-red-500/35 rounded-2xl flex gap-3 text-red-300 items-start">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none">Registrasi Gagal</span>
                  <p className="text-[11px] font-semibold leading-relaxed mt-1 text-red-200/80">{error}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Nama Lengkap</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Nama Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="pass" className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
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
                  <label htmlFor="passConf" className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      id="passConf"
                      type="password"
                      required
                      placeholder="Ulangi password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/60 my-2 pt-4">
                <span className="text-[9px] text-slate-450 uppercase tracking-wider font-extrabold block mb-3">Detail Profil Instansi (Opsional)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nip" className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">NIP</label>
                    <div className="relative">
                      <Award size={14} className="absolute left-3 top-3 text-slate-550" />
                      <input
                        id="nip"
                        type="text"
                        placeholder="NIP Pegawai"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="jabatan" className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Jabatan</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-3 text-slate-550" />
                      <input
                        id="jabatan"
                        type="text"
                        placeholder="Jabatan"
                        value={jabatan}
                        onChange={(e) => setJabatan(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="instansi" className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">OPD / Instansi</label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-3 text-slate-550" />
                      <input
                        id="instansi"
                        type="text"
                        placeholder="Nama Instansi"
                        value={instansi}
                        onChange={(e) => setInstansi(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                  </div>
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
                  <>
                    <UserPlus size={14} />
                    <span>Daftar Akun Baru</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Sudah memiliki akun? <Link href="/auth/login" className="text-emerald-500 hover:underline">Masuk Di Sini</Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
