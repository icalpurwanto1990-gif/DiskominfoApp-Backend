import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { 
  Landmark, User, Shield, FileText, Clock, CheckCircle2, 
  AlertCircle, LogOut, PlusCircle, ArrowLeft, RefreshCw,
  FolderOpen, Key, Upload, Trash2, Edit2, CheckSquare
} from "lucide-react";

export default function UserDashboard({ serviceRequests: initialSrv, ppidRequests: initialPpid, tteRequests: initialTte, auditLogs: initialLogs }) {
  const [srvRequests, setSrvRequests] = useState(initialSrv || []);
  const [ppidRequests, setPpidRequests] = useState(initialPpid || []);
  const [tteRequests, setTteRequests] = useState(initialTte || []);
  const [auditLogs, setAuditLogs] = useState(initialLogs || []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("services"); // "services" | "ppid" | "tte" | "logs"

  // TTE Form Modal States
  const [tteModalOpen, setTteModalOpen] = useState(false);
  const [editingTte, setEditingTte] = useState(null);
  const [tteNama, setTteNama] = useState("");
  const [tteNip, setTteNip] = useState("");
  const [tteNik, setTteNik] = useState("");
  const [tteJabatan, setTteJabatan] = useState("");
  const [tteInstansi, setTteInstansi] = useState("");
  const [tteRekomendasi, setTteRekomendasi] = useState("");
  const [tteKtp, setTteKtp] = useState("");
  
  const [uploadingRekomendasi, setUploadingRekomendasi] = useState(false);
  const [uploadingKtp, setUploadingKtp] = useState(false);
  const [submittingTte, setSubmittingTte] = useState(false);

  useEffect(() => {
    const userSessionStr = localStorage.getItem("userSession");
    if (userSessionStr) {
      try {
        const parsed = JSON.parse(userSessionStr);
        setUser(parsed);
        // Pre-fill form fields
        setTteNama(parsed.name || "");
        setTteNip(parsed.nip || "");
        setTteJabatan(parsed.jabatan || "");
        setTteInstansi(parsed.instansi || "");
      } catch (e) {
        console.error("Failed to parse user session:", e);
      }
    } else {
      alert("Akses ditolak. Silakan login terlebih dahulu.");
      window.location.href = "/auth/login";
    }
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/user/requests");
      const data = await res.json();
      if (data.success) {
        setSrvRequests(data.serviceRequests);
        setPpidRequests(data.ppidRequests);
        setTteRequests(data.tteRequests || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari portal pemohon?")) return;
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        localStorage.removeItem("userSession");
        localStorage.removeItem("adminSession");
        alert("Logout berhasil.");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Gagal logout:", err);
      localStorage.removeItem("userSession");
      window.location.href = "/";
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (field === "rekomendasi") setUploadingRekomendasi(true);
    if (field === "ktp") setUploadingKtp(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (field === "rekomendasi") setTteRekomendasi(data.url);
        if (field === "ktp") setTteKtp(data.url);
        alert("Berkas berhasil diunggah.");
      } else {
        alert("Gagal mengunggah berkas.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi saat mengunggah.");
    } finally {
      if (field === "rekomendasi") setUploadingRekomendasi(false);
      if (field === "ktp") setUploadingKtp(false);
    }
  };

  const openAddTteModal = () => {
    setEditingTte(null);
    setTteNik("");
    setTteRekomendasi("");
    setTteKtp("");
    if (user) {
      setTteNama(user.name || "");
      setTteNip(user.nip || "");
      setTteJabatan(user.jabatan || "");
      setTteInstansi(user.instansi || "");
    }
    setTteModalOpen(true);
  };

  const openEditTteModal = (tte) => {
    setEditingTte(tte);
    setTteNama(tte.nama);
    setTteNip(tte.nip);
    setTteNik(tte.nik);
    setTteJabatan(tte.jabatan);
    setTteInstansi(tte.instansi);
    setTteRekomendasi(tte.dokumen_rekomendasi || "");
    setTteKtp(tte.dokumen_ktp || "");
    setTteModalOpen(true);
  };

  const handleTteSubmit = async (e, submitNow = false) => {
    e.preventDefault();
    if (!tteNama || !tteNip || !tteNik || !tteJabatan || !tteInstansi) {
      alert("Semua data identitas ASN wajib diisi.");
      return;
    }

    setSubmittingTte(true);

    const payload = {
      id: editingTte ? editingTte.id : null,
      nama: tteNama,
      nip: tteNip,
      nik: tteNik,
      jabatan: tteJabatan,
      instansi: tteInstansi,
      dokumen_rekomendasi: tteRekomendasi,
      dokumen_ktp: tteKtp,
      submit_now: submitNow
    };

    const endpoint = editingTte ? "/api/user/tte/update" : "/api/user/tte";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setTteModalOpen(false);
        handleRefresh();
      } else {
        alert(data.error || "Gagal menyimpan permohonan TTE.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSubmittingTte(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-bold text-xs tracking-wider text-emerald-600 uppercase">
        Memverifikasi Akun...
      </div>
    );
  }

  const allRequestsCount = srvRequests.length + ppidRequests.length + tteRequests.length;
  const pendingCount = 
    srvRequests.filter(r => r.status === "PENDING").length + 
    ppidRequests.filter(r => r.status === "PENDING").length +
    tteRequests.filter(r => r.status === "PENDING").length;
  const processedCount = 
    srvRequests.filter(r => r.status === "DIPROSES").length + 
    ppidRequests.filter(r => r.status === "DIPROSES").length +
    tteRequests.filter(r => r.status === "DIPROSES").length;
  const successCount = 
    srvRequests.filter(r => r.status === "SELESAI").length + 
    ppidRequests.filter(r => r.status === "SELESAI").length +
    tteRequests.filter(r => r.status === "SELESAI").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Upper gov bar */}
      <div className="w-full bg-slate-150 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-1.5 px-4 md:px-8 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <div className="w-4 h-2.5 bg-red-600 border border-slate-300 dark:border-slate-700 flex-shrink-0" />
        <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">INDONESIA DIGITAL GOVERNMENT</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span>Portal Layanan Pemohon</span>
      </div>

      {/* Main navigation row */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-4 md:px-8 sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-sm flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="p-2.5 bg-emerald-600/10 text-emerald-600 rounded-xl">
            <Landmark size={22} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white uppercase leading-none">DISKOMINFO</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold uppercase mt-0.5">Portal Pemohon</span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 text-xs font-bold uppercase rounded-xl transition-all shadow-sm shadow-red-500/5"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main body */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {/* Back link & Welcome speech */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link href="/" className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider mb-2 transition-colors">
              <ArrowLeft size={12} />
              <span>Kembali ke Web Depan</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Dashboard Pemohon
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Selamat datang, {user.name} • {user.instansi || "Masyarakat Umum"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={openAddTteModal}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/10"
            >
              <Key size={14} />
              <span>Ajukan TTE ASN</span>
            </button>
            <Link 
              href="/layanan" 
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <PlusCircle size={14} />
              <span>Layanan Lain</span>
            </Link>
          </div>
        </div>

        {/* User profile details grid */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <User size={30} className="stroke-[2]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">{user.name}</span>
              <span className="text-xs text-slate-400 font-semibold mt-1">{user.email}</span>
              {user.nip && <span className="text-[10px] text-slate-450 font-bold uppercase mt-1">NIP: {user.nip}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-850 pt-4 md:pt-0 md:pl-8 text-xs font-semibold">
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold uppercase text-[9px]">Instansi</span>
              <strong className="text-slate-800 dark:text-white mt-0.5">{user.instansi || "-"}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold uppercase text-[9px]">Jabatan</span>
              <strong className="text-slate-800 dark:text-white mt-0.5">{user.jabatan || "-"}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold uppercase text-[9px]">Akses Modul</span>
              <strong className="text-emerald-600 dark:text-emerald-400 uppercase text-[10px] font-bold mt-0.5">Aktif</strong>
            </div>
          </div>
        </div>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Semua Tiket</span>
              <span className="text-2xl font-extrabold">{allRequestsCount}</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
              <FileText size={18} />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Pending</span>
              <span className="text-2xl font-extrabold text-amber-500">{pendingCount}</span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Diproses</span>
              <span className="text-2xl font-extrabold text-blue-500">{processedCount}</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <Shield size={18} />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Selesai</span>
              <span className="text-2xl font-extrabold text-emerald-500">{successCount}</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("services")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none ${
              activeTab === "services"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <FolderOpen size={14} />
            <span>Layanan Digital ({srvRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("ppid")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none ${
              activeTab === "ppid"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <FileText size={14} />
            <span>Informasi PPID ({ppidRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("tte")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none ${
              activeTab === "tte"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <Key size={14} />
            <span>Sertifikat TTE ASN ({tteRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none ${
              activeTab === "logs"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <Clock size={14} />
            <span>Log & Aktivitas ({auditLogs.length})</span>
          </button>
        </div>

        {/* Requests List grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
          
          {/* TAB 1: Services */}
          {activeTab === "services" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">Tiket Pengajuan Layanan Digital</h3>
                <span className="text-[10px] text-slate-400">Pengajuan integrasi aplikasi OPD, hosting, aduan jaringan, dll</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {srvRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 italic text-xs font-semibold col-span-2">
                    Belum ada pengajuan layanan digital terkirim.
                  </div>
                ) : (
                  srvRequests.map(req => (
                    <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col gap-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 dark:text-white">{req.ticketNumber}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                          req.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                          req.status === "DIPROSES" ? "bg-blue-500/10 text-blue-600" :
                          req.status === "SELESAI" ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-red-500/10 text-red-600"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl font-bold">
                        <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">Tipe Layanan: {req.serviceType}</span>
                        {req.details ? Object.entries(req.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-[10px] gap-2 border-b border-slate-50 dark:border-slate-850 last:border-b-0 pb-1">
                            <span className="text-slate-400">{k}</span>
                            <span className="truncate max-w-[200px]">{String(v)}</span>
                          </div>
                        )) : null}
                      </div>
                      {req.notes && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-2 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-bold text-[9px] uppercase tracking-wider leading-none">Respon Admin</span>
                            <p className="text-[10px] font-semibold mt-1">{req.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PPID */}
          {activeTab === "ppid" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">Permohonan Keterbukaan Informasi PPID</h3>
                <span className="text-[10px] text-slate-400">Arsip pengajuan akses informasi publik daerah</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ppidRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 italic text-xs font-semibold col-span-2">
                    Belum ada permohonan PPID terkirim.
                  </div>
                ) : (
                  ppidRequests.map(req => (
                    <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col gap-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 dark:text-white">{req.ticketNumber}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                          req.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                          req.status === "DIPROSES" ? "bg-blue-500/10 text-blue-600" :
                          req.status === "SELESAI" ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-red-500/10 text-red-600"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 font-semibold leading-relaxed p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400">
                        <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">Informasi yang Diminta</span>
                        <p className="font-bold text-slate-850 dark:text-white leading-relaxed">{req.details}</p>
                      </div>
                      {req.response && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-2 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-bold text-[9px] uppercase tracking-wider leading-none">Jawaban PPID</span>
                            <p className="text-[10px] font-semibold mt-1">{req.response}</p>
                            {req.attachment && (
                              <a href={req.attachment} target="_blank" rel="noreferrer" className="mt-2 text-emerald-650 dark:text-emerald-400 font-bold underline text-[9px] uppercase tracking-wider inline-block">
                                Unduh Lampiran Respon
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TTE ASN */}
          {activeTab === "tte" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield size={16} className="text-emerald-500" />
                    Sertifikasi Tanda Tangan Elektronik (TTE) ASN
                  </h3>
                  <span className="text-[10px] text-slate-400">Kelola dan pantau status permohonan sertifikat digital TTE BSrE Anda</span>
                </div>
                <button
                  onClick={openAddTteModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/10 self-start md:self-center"
                >
                  <PlusCircle size={13} />
                  <span>Ajukan Permohonan</span>
                </button>
              </div>

              {tteRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-xs font-semibold">
                  Belum ada permohonan TTE ASN dikirim.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tteRequests.map(req => (
                    <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col gap-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[9px] uppercase text-slate-450 tracking-wider">Tiket TTE #{req.id.substring(0, 8)}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                          req.status === "DRAFT" ? "bg-slate-500/10 text-slate-500" :
                          req.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                          req.status === "REVISI" ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                          req.status === "DIPROSES" ? "bg-blue-500/10 text-blue-600" :
                          "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {req.status === "PENDING" ? "⏳ PENDING" :
                           req.status === "REVISI" ? "⚠️ REVISI" :
                           req.status === "DIPROSES" ? "🔄 DIPROSES" :
                           req.status === "SELESAI" ? "✅ SELESAI" : "📂 DRAFT"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Nama ASN</span>
                          <span className="font-bold text-slate-900 dark:text-white">{req.nama}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">NIP / NIK</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-350">{req.nip} / {req.nik}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-50 dark:border-slate-850 pt-2">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Jabatan & Instansi</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{req.jabatan} - {req.instansi}</span>
                        </div>
                        {req.dokumen_rekomendasi && (
                          <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-50 dark:border-slate-850 pt-2">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Berkas Diunggah</span>
                            <div className="flex gap-4 mt-1 font-semibold text-[10px]">
                              <a href={req.dokumen_rekomendasi} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Surat Rekomendasi</a>
                              {req.dokumen_ktp && <a href={req.dokumen_ktp} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Scan KTP</a>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Catatan Admin / Alasan Revisi */}
                      {req.status === "REVISI" && req.catatan_admin && (
                        <div className="p-3.5 bg-red-500/5 border border-red-500/15 text-red-700 dark:text-red-400 rounded-xl flex flex-col gap-1.5">
                          <span className="font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle size={12} />
                            Catatan Perbaikan Admin:
                          </span>
                          <p className="font-semibold text-[10px] leading-relaxed">{req.catatan_admin}</p>
                          <button
                            onClick={() => openEditTteModal(req)}
                            className="mt-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-650 hover:bg-red-750 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all self-end shadow-sm"
                          >
                            <Edit2 size={10} />
                            <span>Perbaiki Berkas</span>
                          </button>
                        </div>
                      )}

                      {/* Draft Options */}
                      {req.status === "DRAFT" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditTteModal(req)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-350 focus:outline-none"
                          >
                            <Edit2 size={11} />
                            <span>Edit Draf</span>
                          </button>
                          <button
                            onClick={(e) => {
                              setEditingTte(req);
                              setTteNama(req.nama);
                              setTteNip(req.nip);
                              setTteNik(req.nik);
                              setTteJabatan(req.jabatan);
                              setTteInstansi(req.instansi);
                              setTteRekomendasi(req.dokumen_rekomendasi || "");
                              setTteKtp(req.dokumen_ktp || "");
                              handleTteSubmit(e, true);
                            }}
                            className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-sm shadow-emerald-500/10 focus:outline-none"
                          >
                            <CheckSquare size={11} />
                            <span>Ajukan Sekarang</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Audit Logs */}
          {activeTab === "logs" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={16} className="text-[#0a549e] dark:text-sky-400" />
                  Log Aktivitas & Riwayat Pelayanan
                </h3>
                <span className="text-[10px] text-slate-400">Riwayat status permohonan dan catatan verifikasi admin secara transparan</span>
              </div>

              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-xs font-semibold">
                  Belum ada log aktivitas/riwayat pelayanan untuk tiket Anda.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col gap-6 my-2">
                  {auditLogs.map((log) => {
                    const isSuccess = log.details?.includes("SELESAI") || false;
                    const isDanger = log.details?.includes("DITOLAK") || log.details?.includes("REVISI") || false;
                    const isProcess = log.details?.includes("DIPROSES") || false;

                    return (
                      <div key={log.id} className="relative flex flex-col gap-1.5 text-xs font-semibold">
                        {/* Timeline Circle Bullet */}
                        <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                          isSuccess ? "bg-emerald-500 text-white" :
                          isDanger ? "bg-red-500 text-white" :
                          isProcess ? "bg-blue-500 text-white" :
                          "bg-slate-400 text-white"
                        }`}>
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>

                        {/* Log card */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-850 pb-1.5">
                            <span className="uppercase tracking-wider">Aksi: {log.action}</span>
                            <span>
                              {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>

                          <p className="font-extrabold text-slate-850 dark:text-slate-250 leading-relaxed text-xs">
                            {log.details}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold text-slate-450 uppercase pt-1 mt-1 border-t border-slate-100 dark:border-slate-850">
                            <span>IP Address: {log.ipAddress || "Localhost"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* TTE Form Submission Modal */}
      {tteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setTteModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <ArrowLeft size={16} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="text-blue-500" size={16} />
              {editingTte ? "Edit Permohonan TTE ASN" : "Pengajuan Sertifikat TTE Baru"}
            </h3>

            {editingTte && editingTte.status === "REVISI" && editingTte.catatan_admin && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-650 dark:text-red-400 text-[11px] font-semibold">
                <strong>⚠️ Catatan Revisi Sebelumnya:</strong> {editingTte.catatan_admin}
              </div>
            )}

            <form onSubmit={(e) => handleTteSubmit(e, false)} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap ASN (Sesuai SK)</label>
                  <input
                    type="text"
                    required
                    value={tteNama}
                    onChange={(e) => setTteNama(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">NIP (18 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={tteNip}
                    onChange={(e) => setTteNip(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">NIK KTP (16 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={tteNik}
                    onChange={(e) => setTteNik(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Jabatan ASN</label>
                  <input
                    type="text"
                    required
                    value={tteJabatan}
                    onChange={(e) => setTteJabatan(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Instansi / OPD</label>
                  <input
                    type="text"
                    required
                    value={tteInstansi}
                    onChange={(e) => setTteInstansi(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <label className="text-[10px] uppercase font-bold text-slate-400">Surat Rekomendasi Instansi (PDF)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, "rekomendasi")}
                    disabled={uploadingRekomendasi}
                    className="file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                  />
                  <input
                    type="text"
                    placeholder="URL Berkas..."
                    value={tteRekomendasi}
                    onChange={(e) => setTteRekomendasi(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white w-28"
                  />
                </div>
                {uploadingRekomendasi && <span className="text-[9px] text-blue-500">Mengunggah...</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Scan KTP ASN (PDF/Image)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => handleFileUpload(e, "ktp")}
                    disabled={uploadingKtp}
                    className="file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                  />
                  <input
                    type="text"
                    placeholder="URL Berkas..."
                    value={tteKtp}
                    onChange={(e) => setTteKtp(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white w-28"
                  />
                </div>
                {uploadingKtp && <span className="text-[9px] text-blue-500">Mengunggah...</span>}
              </div>

              <div className="flex justify-end gap-2.5 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="submit"
                  disabled={submittingTte || uploadingRekomendasi || uploadingKtp}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none"
                >
                  Simpan Draf
                </button>
                <button
                  type="button"
                  onClick={(e) => handleTteSubmit(e, true)}
                  disabled={submittingTte || uploadingRekomendasi || uploadingKtp}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/10 flex items-center gap-1.5 focus:outline-none"
                >
                  <CheckSquare size={13} />
                  <span>Kirim Permohonan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

