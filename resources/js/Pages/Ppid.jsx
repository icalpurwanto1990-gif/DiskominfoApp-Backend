import React, { useState, useEffect } from "react";
import { FileText, Send, CheckCircle2, FolderOpen, ArrowDownToLine, Scale, ShieldCheck } from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

export const Ppid = () => {
  const [activeTab, setActiveTab] = useState("daftar");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states - Request
  const [reqForm, setReqForm] = useState({
    name: "",
    nik: "",
    email: "",
    phone: "",
    address: "",
    details: "",
    purpose: "",
    ktpFile: "",
  });

  // Form states - Objection
  const [objForm, setObjForm] = useState({
    ticketNumber: "",
    reason: "",
    ktpFile: "",
  });

  // File upload states
  const [uploadingReqKtp, setUploadingReqKtp] = useState(false);
  const [reqKtpName, setReqKtpName] = useState("");
  const [uploadingObjKtp, setUploadingObjKtp] = useState(false);
  const [objKtpName, setObjKtpName] = useState("");

  const handleReqKtpUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReqKtp(true);
    setReqKtpName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReqForm(prev => ({ ...prev, ktpFile: data.url }));
      } else {
        alert("Gagal mengunggah file: " + (data.error || "Server error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat mengunggah file.");
    } finally {
      setUploadingReqKtp(false);
    }
  };

  const handleObjKtpUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingObjKtp(true);
    setObjKtpName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setObjForm(prev => ({ ...prev, ktpFile: data.url }));
      } else {
        alert("Gagal mengunggah file: " + (data.error || "Server error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat mengunggah file.");
    } finally {
      setUploadingObjKtp(false);
    }
  };

  const [ppidDocuments, setPpidDocuments] = useState([
    { title: "Daftar Informasi Publik (DIP) Diskominfo 2025", type: "DIP", size: "1.8 MB", date: "15 Jan 2025", fileUrl: "#" },
    { title: "Laporan Keuangan Audit BPK Diskominfo 2025", type: "Laporan Keuangan", size: "3.4 MB", date: "22 Feb 2026", fileUrl: "#" },
    { title: "Renstra PPID Utama Pemerintah Daerah 2024-2029", type: "Renstra", size: "2.1 MB", date: "10 Mar 2024", fileUrl: "#" },
    { title: "Laporan Pelayanan Informasi Publik Semester II 2025", type: "Laporan Kinerja", size: "1.5 MB", date: "05 Jan 2026", fileUrl: "#" },
  ]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/dokumen");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((doc) => ({
              title: doc.title,
              type: doc.category,
              size: doc.fileSize || "1.5 MB",
              date: doc.createdAt ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(doc.createdAt)) : "Baru",
              fileUrl: doc.fileUrl
            }));
            setPpidDocuments(mapped);
          }
        }
      } catch (err) {
        console.error("Gagal memuat dokumen PPID dari database:", err);
      }
    };
    fetchDocuments();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    if (!reqForm.ktpFile) {
      alert("Harap unggah KTP pendukung Anda terlebih dahulu!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ppid/permohonan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(reqForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Permohonan Berhasil Dikirim! Nomor Tiket Anda: ${data.ticketNumber}. Mohon simpan nomor tiket ini untuk melacak status permohonan Anda.`);
        setReqForm({
          name: "",
          nik: "",
          email: "",
          phone: "",
          address: "",
          details: "",
          purpose: "",
          ktpFile: "",
        });
        setReqKtpName("");
      } else {
        alert(data.error || "Gagal mengirim permohonan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleObjectionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    if (!objForm.ktpFile) {
      alert("Harap unggah KTP identitas Anda terlebih dahulu!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ppid/keberatan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(objForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Pengajuan Keberatan Berhasil Dikirim! Kami akan memverifikasi permohonan keberatan tiket ${objForm.ticketNumber} Anda dalam kurun waktu maksimal 7 hari kerja.`);
        setObjForm({
          ticketNumber: "",
          reason: "",
          ktpFile: "",
        });
        setObjKtpName("");
      } else {
        alert(data.error || "Gagal mengirim keberatan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Premium Page Hero */}
      <PageHero
        label="PPID ONLINE"
        title={<>Pejabat Pengelola <span className="text-amber-400">Informasi & Dokumentasi</span></>}
        subtitle="Pelayanan permohonan informasi publik daerah secara transparan & akuntabel sesuai UU No. 14 Tahun 2008"
        icon={FolderOpen}
        gradient="from-amber-950 via-slate-900 to-slate-950"
        accentColor="text-amber-400"
        blobColor="bg-amber-500"
        breadcrumbs={[{ label: "PPID" }]}
        stats={[
          { label: "Dokumen Publik", value: ppidDocuments.length, icon: FileText },
          { label: "Layanan Online", value: "3 Jenis", icon: ShieldCheck },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">

        {/* Tabs Menu */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: "daftar", label: "Daftar Informasi Publik", icon: FolderOpen },
            { id: "mohon", label: "Permohonan Informasi Online", icon: FileText },
            { id: "keberatan", label: "Pengajuan Keberatan", icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSuccessMsg(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex gap-3 text-xs leading-relaxed text-emerald-950 dark:text-emerald-300 font-semibold">
            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Content */}
        <div className="w-full">
          
          {/* TAB 1: DAFTAR DOKUMEN */}
          {activeTab === "daftar" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="grid grid-cols-1 gap-4">
                {ppidDocuments.map((doc, idx) => (
                  <div key={idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{doc.title}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Format: PDF • Kategori: {doc.type} • Rilis: {doc.date}
                      </span>
                    </div>
                    {doc.fileUrl && doc.fileUrl !== "#" ? (
                      <a
                        href={doc.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                      >
                        <ArrowDownToLine size={14} />
                        <span>Download ({doc.size})</span>
                      </a>
                    ) : (
                      <button className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600/40 text-white/50 cursor-not-allowed font-bold rounded-xl text-xs transition" title="Link unduhan belum tersedia">
                        <ArrowDownToLine size={14} />
                        <span>Download ({doc.size})</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FORM PERMOHONAN */}
          {activeTab === "mohon" && (
            <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm animate-fadeIn">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-6">Formulir Permohonan Informasi Publik</h3>
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="mohon-name" className="text-slate-700 dark:text-slate-300">Nama Lengkap Pemohon</label>
                    <input
                      id="mohon-name"
                      type="text"
                      required
                      value={reqForm.name}
                      onChange={(e) => setReqForm({ ...reqForm, name: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="mohon-nik" className="text-slate-700 dark:text-slate-300">NIK (Sesuai KTP)</label>
                    <input
                      id="mohon-nik"
                      type="text"
                      required
                      value={reqForm.nik}
                      onChange={(e) => setReqForm({ ...reqForm, nik: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="mohon-email" className="text-slate-700 dark:text-slate-300">Email Aktif</label>
                    <input
                      id="mohon-email"
                      type="email"
                      required
                      value={reqForm.email}
                      onChange={(e) => setReqForm({ ...reqForm, email: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="mohon-phone" className="text-slate-700 dark:text-slate-300">Nomor Telepon/WA</label>
                    <input
                      id="mohon-phone"
                      type="tel"
                      required
                      value={reqForm.phone}
                      onChange={(e) => setReqForm({ ...reqForm, phone: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="mohon-address" className="text-slate-700 dark:text-slate-300">Alamat Lengkap</label>
                  <input
                    id="mohon-address"
                    type="text"
                    required
                    value={reqForm.address}
                    onChange={(e) => setReqForm({ ...reqForm, address: e.target.value })}
                    className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="mohon-details" className="text-slate-700 dark:text-slate-300">Rincian Informasi yang Dibutuhkan</label>
                  <textarea
                    id="mohon-details"
                    required
                    rows={4}
                    value={reqForm.details}
                    onChange={(e) => setReqForm({ ...reqForm, details: e.target.value })}
                    placeholder="Deskripsikan secara jelas data/dokumen yang Anda minta..."
                    className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="mohon-purpose" className="text-slate-700 dark:text-slate-300">Tujuan Penggunaan Informasi</label>
                  <input
                    id="mohon-purpose"
                    type="text"
                    required
                    value={reqForm.purpose}
                    onChange={(e) => setReqForm({ ...reqForm, purpose: e.target.value })}
                    placeholder="Misal: Keperluan Penelitian, Kajian Publik, dll"
                    className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 dark:text-slate-300">Unggah KTP Pendukung</label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck size={16} className={reqForm.ktpFile ? "text-emerald-500" : "text-slate-400"} />
                        <span className="text-[10px] truncate max-w-[250px]">
                          {uploadingReqKtp 
                            ? `Mengunggah: ${reqKtpName}...` 
                            : reqForm.ktpFile 
                              ? `Terunggah: ${reqKtpName || reqForm.ktpFile.split('/').pop()}` 
                              : "Pilih file KTP (Format: JPG, PNG, PDF)"
                          }
                        </span>
                      </div>
                      {reqForm.ktpFile && (
                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                          Berhasil
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      required
                      accept="image/*,application/pdf"
                      onChange={handleReqKtpUpload}
                      className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 file:cursor-pointer hover:file:bg-emerald-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40"
                >
                  <Send size={14} />
                  <span>Kirim Permohonan</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PENGAJUAN KEBERATAN */}
          {activeTab === "keberatan" && (
            <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm animate-fadeIn">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-6">Formulir Pengajuan Keberatan Pelayanan Informasi</h3>
              <form onSubmit={handleObjectionSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-2">
                  <label htmlFor="obj-ticket" className="text-slate-700 dark:text-slate-300">Nomor Tiket Permohonan Informasi</label>
                  <input
                    id="obj-ticket"
                    type="text"
                    required
                    placeholder="Contoh: PPID-2026-XXXX"
                    value={objForm.ticketNumber}
                    onChange={(e) => setObjForm({ ...objForm, ticketNumber: e.target.value })}
                    className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="obj-reason" className="text-slate-700 dark:text-slate-300">Alasan Pengajuan Keberatan</label>
                  <textarea
                    id="obj-reason"
                    required
                    rows={4}
                    value={objForm.reason}
                    onChange={(e) => setObjForm({ ...objForm, reason: e.target.value })}
                    placeholder="Jelaskan alasan keberatan Anda (Misal: Informasi ditolak, tanggapan melebihi batas waktu, biaya tidak wajar, dll)..."
                    className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 dark:text-slate-300">Unggah KTP Identitas</label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck size={16} className={objForm.ktpFile ? "text-emerald-500" : "text-slate-400"} />
                        <span className="text-[10px] truncate max-w-[250px]">
                          {uploadingObjKtp 
                            ? `Mengunggah: ${objKtpName}...` 
                            : objForm.ktpFile 
                              ? `Terunggah: ${objKtpName || objForm.ktpFile.split('/').pop()}` 
                              : "Pilih file KTP (Format: JPG, PNG, PDF)"
                          }
                        </span>
                      </div>
                      {objForm.ktpFile && (
                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                          Berhasil
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      required
                      accept="image/*,application/pdf"
                      onChange={handleObjKtpUpload}
                      className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 file:cursor-pointer hover:file:bg-emerald-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40"
                >
                  <Send size={14} />
                  <span>Kirim Keberatan</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </MainLayout>
  );
};

export default Ppid;
