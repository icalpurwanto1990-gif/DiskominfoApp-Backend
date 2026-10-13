import React, { useState, useEffect, useMemo } from "react";
import { Link, Head } from "@inertiajs/react";
import {
  ShieldCheck,
  Shield,
  Database,
  Mail,
  Server,
  Video,
  Link as LinkIcon,
  Globe,
  Network,
  Send,
  CheckCircle2,
  Cpu,
  FileText,
  File,
  Lock,
  Wifi,
  Monitor,
  HardDrive,
  Layers,
  Users,
  Phone,
  Wrench,
  Layout,
  ExternalLink,
  Search,
  X,
  LogIn,
  UserPlus,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";

export const Layanan = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [pendingService, setPendingService] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Session State
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Common Fields
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [instansi, setInstansi] = useState("");

  // Dynamic JSON details depending on selected service
  const [details, setDetails] = useState({});
  const [uploadingFields, setUploadingFields] = useState({});

  const currentService = services.find((s) => s.slug === selectedService);
  const formSchema = currentService?.form_schema || currentService?.formSchema || [];

  // Sanitasi & Keamanan URL Dokumen SOP
  const getSopUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    const trimmed = path.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
      return trimmed;
    }
    return `/uploads/${trimmed}`;
  };

  // Mitigasi Keamanan Siber: Validasi ketat pembukaan URL eksternal (mencegah XSS javascript: dsb)
  const handleExternalClick = (url) => {
    if (!url || typeof url !== "string") return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        alert("Protokol URL eksternal tidak diizinkan demi keamanan.");
      }
    } catch (e) {
      alert("Tautan eksternal tidak valid.");
    }
  };

  useEffect(() => {
    setDetails({});
    setUploadingFields({});
  }, [selectedService]);

  // Listener keyboard ESC untuk menutup modal autentikasi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showAuthModal) {
        setShowAuthModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAuthModal]);

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;

    // Validasi ukuran file di sisi client (maksimal 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran berkas terlalu besar. Maksimum ukuran berkas adalah 10 MB.");
      return;
    }

    setUploadingFields((prev) => ({ ...prev, [fieldName]: true }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDetails((prev) => ({ ...prev, [fieldName]: data.url }));
        } else {
          alert(data.error || "Gagal mengunggah file.");
        }
      } else {
        alert("Gagal mengunggah file ke server.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan saat mengunggah.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const iconMap = {
    Globe,
    Shield,
    ShieldCheck,
    Video,
    Database,
    FileText,
    File,
    Mail,
    Email: Mail,
    Network,
    Server,
    Wifi,
    HardDrive,
    Monitor,
    Layers,
    Users,
    Phone,
    Wrench,
    Layout,
    Link: LinkIcon,
    LinkIcon: LinkIcon,
    ExternalLink: LinkIcon,
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || Globe;
  };

  const isCustomIcon = (iconName) => {
    return iconName && (iconName.includes("/") || iconName.includes("."));
  };

  const getCustomIconUrl = (iconPath) => {
    if (!iconPath) return "";
    if (iconPath.startsWith("http") || iconPath.startsWith("/")) {
      return iconPath;
    }
    return `/uploads/${iconPath}`;
  };

  // Fetch session and services
  useEffect(() => {
    setIsMounted(true);
    const sessionStr = localStorage.getItem("userSession");
    const adminSessionStr = localStorage.getItem("adminSession");
    if (sessionStr) {
      try {
        const parsedUser = JSON.parse(sessionStr);
        setUser(parsedUser);
        setApplicantName(parsedUser.name || "");
        setApplicantEmail(parsedUser.email || "");
        setApplicantPhone(parsedUser.phone || "");
        setInstansi(parsedUser.instansi || "");
      } catch (err) {
        console.error("Failed to parse user session:", err);
      }
    } else if (adminSessionStr) {
      try {
        const parsedAdmin = JSON.parse(adminSessionStr);
        setUser({ ...parsedAdmin, role: parsedAdmin.role || "SUPERADMIN" });
        setApplicantName(parsedAdmin.name || "Administrator");
        setApplicantEmail(parsedAdmin.email || "admin@banggaikep.go.id");
        setApplicantPhone(parsedAdmin.phone || "-");
        setInstansi(parsedAdmin.instansi || "Dinas Komunikasi dan Informatika");
      } catch (err) {
        console.error("Failed to parse admin session:", err);
      }
    }

    const fetchServices = async () => {
      try {
        const res = await fetch("/api/layanan");
        if (res.ok) {
          const data = await res.json();
          setServices(Array.isArray(data) ? data : []);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Gagal memuat layanan:", err);
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  // Periksa parameter URL ?type=...
  useEffect(() => {
    if (services.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type");
    if (type && services.some((s) => s.slug === type)) {
      const matched = services.find((s) => s.slug === type);
      if (user) {
        setSelectedService(type);
      } else {
        // Jika pengunjung belum login, arahkan konteks ke modal autentikasi
        setPendingService(matched);
        setShowAuthModal(true);
      }
    }
  }, [services, user]);

  // Handler Klik Kartu Layanan di Katalog Publik
  const handleServiceClick = (srv) => {
    const isExternal = srv.slug && (srv.slug.startsWith("http://") || srv.slug.startsWith("https://"));
    if (isExternal) {
      handleExternalClick(srv.slug);
      return;
    }

    if (user) {
      // Pengguna sudah terautentikasi -> Langsung tampilkan form pengajuan
      setSelectedService(srv.slug);
      setSuccessTicket(null);
      window.scrollTo({ top: 380, behavior: "smooth" });
    } else {
      // Pengguna belum login -> Buka dialog instruksi login terproteksi
      setPendingService(srv);
      setShowAuthModal(true);
    }
  };

  // Kategori unik untuk filter chips
  const categories = useMemo(() => {
    const cats = new Set(["Semua"]);
    services.forEach((s) => {
      if (s.category && typeof s.category === "string" && s.category.trim() !== "") {
        cats.add(s.category.trim());
      }
    });
    return Array.from(cats);
  }, [services]);

  // Filter layanan berdasarkan pencarian dan kategori
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (srv.title && srv.title.toLowerCase().includes(q)) ||
        (srv.description && srv.description.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "Semua" ||
        (srv.category && srv.category.trim() === selectedCategory);

      return matchesSearch && matchesCat;
    });
  }, [services, searchQuery, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifikasi keamanan ganda di client
    if (!user) {
      alert("Anda wajib masuk terlebih dahulu untuk mengirim pengajuan layanan.");
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setSuccessTicket(null);

    const payload = {
      serviceType: selectedService?.toUpperCase(),
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      applicantPhone: applicantPhone.trim(),
      instansi: instansi.trim(),
      details,
    };

    try {
      const res = await fetch("/api/layanan/pengajuan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessTicket(data.ticketNumber);
        setDetails({});
        window.scrollTo({ top: 400, behavior: "smooth" });
      } else {
        alert(data.error || "Gagal mengirim pengajuan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="p-16 text-center font-bold text-xs text-slate-500 uppercase tracking-widest animate-pulse">
          Memuat Portal Layanan Digital...
        </div>
      </MainLayout>
    );
  }

  const officialUrl = "https://diskominfo.banggaikep.go.id/layanan";

  return (
    <MainLayout>
      <Head>
        <title>Katalog Layanan Digital SPBE | Diskominfo Banggai Kepulauan</title>
        <meta name="description" content="Katalog resmi pelayanan mandiri urusan persandian TTE, infrastruktur TIK, & sistem informatika daerah Diskominfo Kabupaten Banggai Kepulauan." />
        <meta name="keywords" content="Katalog Layanan Digital Banggai Kepulauan, Pengajuan TTE Bangkep, Domain Desa Bangkep, Hosting Pemda Banggai Kepulauan, Diskominfo Bangkep" />
        <link rel="canonical" href={officialUrl} />
        <meta property="og:title" content="Katalog Layanan Digital SPBE | Diskominfo Banggai Kepulauan" />
        <meta property="og:description" content="Katalog pelayanan mandiri urusan persandian, infrastruktur TIK, & sistem informatika pemerintah daerah Kabupaten Banggai Kepulauan." />
        <meta property="og:url" content={officialUrl} />
        <meta property="og:type" content="website" />
      </Head>

      {/* Premium Page Hero */}
      <PageHero
        label="PORTAL PELAYANAN DIGITAL HUB"
        title={<>Katalog & Pengajuan <span className="text-indigo-400">Layanan Digital</span></>}
        subtitle="Pelayanan mandiri urusan persandian, infrastruktur TIK, & sistem informatika pemerintah daerah Kabupaten Banggai Kepulauan"
        icon={Cpu}
        gradient="from-indigo-950 via-slate-900 to-slate-950"
        accentColor="text-indigo-400"
        blobColor="bg-indigo-500"
        breadcrumbs={[{ label: "Layanan" }]}
        stats={[
          { label: "Katalog Layanan", value: services.length || "...", icon: Server },
          { label: "Status Akses", value: user ? `Masuk: ${user.name?.split(" ")[0]}` : "Akses Publik", icon: ShieldCheck },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">

        {/* Notifikasi Pengajuan Sukses */}
        {successTicket && (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl flex gap-3 text-xs leading-relaxed text-slate-900 dark:text-slate-100 font-semibold shadow-md animate-fadeIn">
            <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-extrabold uppercase text-sm text-emerald-600 dark:text-emerald-400">
                Pengajuan Berhasil Dikirim!
              </span>
              <span>
                Nomor Tiket Layanan Anda: <strong className="text-slate-950 dark:text-white px-2 py-0.5 bg-emerald-500/10 rounded font-mono text-sm">{successTicket}</strong>. Permohonan Anda telah terdaftar dan sedang ditelaah oleh tim verifikator Diskominfo. Mohon simpan nomor tiket ini untuk melacak perkembangan status.
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            B. TAMPILAN FORMULIR PENGAJUAN (Hanya Aktif Jika Layanan Dipilih)
            ========================================================================= */}
        {selectedService && (
          <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 rounded-3xl shadow-xl animate-fadeIn">

            {/* Guard Proteksi: Jika Belum Login Tapi Berada di Mode Form */}
            {!user ? (
              <div className="flex flex-col items-center text-center gap-5 py-8">
                <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20">
                  <Lock size={36} className="stroke-[2.5]" />
                </div>
                <div className="flex flex-col gap-1.5 max-w-md">
                  <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900 dark:text-white">
                    Autentikasi Diperlukan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Untuk melengkapi dan mengirim formulir pengajuan <strong>{currentService?.title}</strong>, Anda wajib masuk terlebih dahulu dengan akun terverifikasi.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center mt-2">
                  <Link
                    href={`/auth/login?redirect=${encodeURIComponent(`/layanan?type=${selectedService}`)}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    <LogIn size={14} />
                    <span>Masuk Sekarang</span>
                  </Link>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="px-5 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-2xl border min-w-[52px] min-h-[52px] flex items-center justify-center shadow-sm ${currentService?.color || 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}`}>
                      {isCustomIcon(currentService?.icon) ? (
                        <img src={getCustomIconUrl(currentService.icon)} alt={currentService.title} className="w-10 h-10 object-contain drop-shadow-sm" />
                      ) : (
                        (() => {
                          const FormIcon = getIcon(currentService?.icon);
                          return <FormIcon size={28} className="stroke-[2.2]" />;
                        })()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Formulir Permohonan
                      </span>
                      <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white leading-tight">
                        {currentService?.title || "Pengajuan Layanan"}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setSuccessTicket(null);
                    }}
                    className="text-[10px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold uppercase tracking-wider transition focus:outline-none"
                  >
                    Kembali ke Katalog
                  </button>
                </div>

                {currentService?.sop_file && (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                          Dokumen Petunjuk Pengisian / SOP
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          Pelajari SOP & panduan resmi sebelum melengkapi pengajuan ini
                        </span>
                      </div>
                    </div>
                    <a
                      href={getSopUrl(currentService.sop_file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition shadow-sm flex-shrink-0 self-stretch sm:self-auto justify-center"
                    >
                      <span>Buka Dokumen SOP</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 dark:text-slate-300">Nama Lengkap Pemohon</label>
                      <input
                        type="text"
                        required
                        maxLength={255}
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 dark:text-slate-300">Instansi / OPD Kerja</label>
                      <input
                        type="text"
                        required
                        maxLength={255}
                        value={instansi}
                        onChange={(e) => setInstansi(e.target.value)}
                        placeholder="Contoh: Bappeda, Dinas Kesehatan, dll"
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 dark:text-slate-300">Email Kerja (Dinas/Pribadi)</label>
                      <input
                        type="email"
                        required
                        maxLength={255}
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 dark:text-slate-300">No. Telepon / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        maxLength={50}
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  {formSchema && formSchema.length > 0 ? (
                    <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                      {formSchema.map((field) => {
                        const fieldName = field.name;
                        const isRequired = !!field.required;
                        const placeholder = field.placeholder || "";
                        const label = field.label;
                        const type = field.type || "text";

                        return (
                          <div key={fieldName} className="flex flex-col gap-2">
                            <label className="text-slate-700 dark:text-slate-300">
                              {label} {isRequired && <span className="text-red-500">*</span>}
                            </label>

                            {type === "textarea" ? (
                              <textarea
                                required={isRequired}
                                rows={3}
                                maxLength={2000}
                                value={details[fieldName] || ""}
                                onChange={(e) => setDetails({ ...details, [fieldName]: e.target.value })}
                                placeholder={placeholder}
                                className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium resize-none"
                              />
                            ) : type === "select" ? (
                              <select
                                required={isRequired}
                                value={details[fieldName] || ""}
                                onChange={(e) => setDetails({ ...details, [fieldName]: e.target.value })}
                                className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium"
                              >
                                <option value="">-- Pilih {label} --</option>
                                {(field.options || "").split(",").map((opt) => {
                                  const trimmedOpt = opt.trim();
                                  return (
                                    <option key={trimmedOpt} value={trimmedOpt}>
                                      {trimmedOpt}
                                    </option>
                                  );
                                })}
                              </select>
                            ) : type === "file" ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="file"
                                  required={isRequired && !details[fieldName]}
                                  onChange={(e) => handleFileUpload(fieldName, e.target.files[0])}
                                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-slate-800 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer bg-slate-100 dark:bg-slate-800 rounded-xl pr-3 focus:outline-none py-1.5"
                                />
                                {uploadingFields[fieldName] && (
                                  <span className="text-[10px] text-amber-500 font-semibold animate-pulse mt-1">Mengunggah berkas...</span>
                                )}
                                {details[fieldName] && !uploadingFields[fieldName] && (
                                  <div className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                                    <span>Berhasil diunggah:</span>
                                    <a
                                      href={details[fieldName]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline hover:text-emerald-600 truncate max-w-xs"
                                    >
                                      {details[fieldName].split("/").pop()}
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <input
                                type={type}
                                required={isRequired}
                                maxLength={255}
                                value={details[fieldName] || ""}
                                onChange={(e) => setDetails({ ...details, [fieldName]: e.target.value })}
                                placeholder={placeholder}
                                className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                      <label className="text-slate-700 dark:text-slate-300">Uraian / Deskripsi Pengajuan Keperluan</label>
                      <textarea
                        required
                        rows={3}
                        maxLength={2000}
                        value={details.purposeDescription || ""}
                        onChange={(e) => setDetails({ ...details, purposeDescription: e.target.value })}
                        placeholder="Jelaskan secara rinci detail permohonan Anda..."
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-medium resize-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || Object.values(uploadingFields).some(Boolean)}
                    className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40 shadow-md active:scale-95"
                  >
                    <Send size={14} />
                    <span>{loading ? "Mengirim Permohonan..." : "Kirim Permohonan Sekarang"}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            C. KATALOG UTAMA (TERBUKA UNTUK PUBLIK / SEMUA PENGUNJUNG)
            ========================================================================= */}
        <div className="flex flex-col gap-6">

          {/* Baris Kontrol: Pencarian & Filter Kategori */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari layanan, kata kunci, TTE, email, domain..."
                className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Chips Kategori */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Kartu Layanan */}
          {services.length === 0 ? (
            <div className="p-16 text-center font-bold text-xs text-slate-500 uppercase tracking-widest animate-pulse">
              Memuat Data Katalog Layanan...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center gap-3">
              <Search className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-500">
                Tidak ada layanan yang sesuai dengan pencarian "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Semua");
                }}
                className="text-[11px] text-indigo-500 hover:underline font-bold"
              >
                Reset Filter Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map((srv) => {
                const customIcon = isCustomIcon(srv.icon);
                const Icon = !customIcon ? getIcon(srv.icon) : null;
                const isExternal = srv.slug && (srv.slug.startsWith("http://") || srv.slug.startsWith("https://"));
                const isCurrentActive = selectedService === srv.slug;

                return (
                  <div
                    key={srv.slug}
                    className={`group bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden ${isCurrentActive
                      ? "border-indigo-500 ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/50"
                      }`}
                  >
                    {/* Top Row: Icon + Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`p-3 md:p-3.5 rounded-2xl border min-w-[64px] min-h-[64px] flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm ${srv.color || 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {customIcon ? (
                          <img src={getCustomIconUrl(srv.icon)} alt={srv.title} className="w-14 h-14 md:w-16 md:h-16 max-w-[64px] max-h-[64px] object-contain drop-shadow-sm" />
                        ) : (
                          <Icon size={34} className="stroke-[2.2]" />
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {isExternal ? (
                          <span className="text-[9px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                            <span>Eksternal</span>
                            <ExternalLink size={9} />
                          </span>
                        ) : (
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                            Layanan Mandiri
                          </span>
                        )}

                        {srv.sop_file && (
                          <a
                            href={getSopUrl(srv.sop_file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold transition"
                            title="Unduh / Lihat SOP Layanan"
                          >
                            <FileText size={9} />
                            <span>SOP</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col gap-1.5 flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-indigo-500 transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                        {srv.description}
                      </p>
                    </div>

                    {/* Action Button: Mengarahkan Login jika Belum Login */}
                    <button
                      type="button"
                      onClick={() => handleServiceClick(srv)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${isExternal
                        ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        : user
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500"
                        }`}
                    >
                      {isExternal ? (
                        <>
                          <span>Buka Layanan</span>
                          <ExternalLink size={13} />
                        </>
                      ) : user ? (
                        <>
                          <span>Ajukan Sekarang</span>
                          <ArrowRight size={13} />
                        </>
                      ) : (
                        <>
                          <Lock size={12} className="text-amber-500" />
                          <span>Masuk untuk Akses</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
          D. MODAL DIALOG PROTEKSI LOGIN (Tampil Ketika Pengunjung Tamu Mengklik Layanan)
          ========================================================================= */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col gap-6 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            {/* Header Modal */}
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-2xl flex-shrink-0">
                <ShieldCheck size={32} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">
                  Proteksi Akses Layanan
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                  Login Terlebih Dahulu
                </h3>
              </div>
            </div>

            {/* Kartu Cuplikan Layanan yang Dipilih */}
            {pendingService && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 rounded-2xl flex items-center gap-3.5">
                <div className={`p-2.5 rounded-2xl border min-w-[48px] min-h-[48px] flex items-center justify-center flex-shrink-0 shadow-sm ${pendingService.color || 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}`}>
                  {isCustomIcon(pendingService.icon) ? (
                    <img src={getCustomIconUrl(pendingService.icon)} alt={pendingService.title} className="w-10 h-10 object-contain drop-shadow-sm" />
                  ) : (
                    (() => {
                      const ModalIcon = getIcon(pendingService.icon);
                      return <ModalIcon size={24} className="stroke-[2.2]" />;
                    })()
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {pendingService.title}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {pendingService.description}
                  </span>
                </div>
              </div>
            )}

            {/* Keterangan Edukasi Keamanan Siber */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Untuk mengajukan permohonan layanan digital pemerintah Kabupaten Banggai Kepulauan, pemohon wajib masuk menggunakan akun yang telah terverifikasi demi menjamin keabsahan data, keamanan siber, dan pelacakan status tiket secara akuntabel.
            </p>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={
                  pendingService
                    ? `/auth/login?redirect=${encodeURIComponent(`/layanan?type=${pendingService.slug}`)}`
                    : "/auth/login?redirect=/layanan"
                }
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 text-center"
              >
                <LogIn size={14} />
                <span>Masuk Sekarang</span>
              </Link>

              <Link
                href={
                  pendingService
                    ? `/auth/register?redirect=${encodeURIComponent(`/layanan?type=${pendingService.slug}`)}`
                    : "/auth/register"
                }
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all text-center"
              >
                <UserPlus size={14} />
                <span>Daftar Akun Baru</span>
              </Link>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold uppercase tracking-wider hover:underline"
              >
                Tetap Lihat Katalog Layanan
              </button>
            </div>

          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default Layanan;
