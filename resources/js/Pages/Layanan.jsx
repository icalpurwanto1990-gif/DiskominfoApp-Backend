import React, { useState, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import { ShieldCheck, Shield, Database, Mail, Server, Video, Link as LinkIcon, Globe, Network, Send, CheckCircle2, Cpu, FileText, File, Lock, Wifi, Monitor, HardDrive, Layers, Users, Phone, Wrench, Layout, ExternalLink } from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

export const Layanan = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [successTicket, setSuccessTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

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

  const currentService = services.find((s) => s.slug === selectedService);
  const formSchema = currentService?.form_schema || currentService?.formSchema || [];

  const getSopUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
      return path;
    }
    return `/uploads/${path}`;
  };

  useEffect(() => {
    setDetails({});
    setUploadingFields({});
  }, [selectedService]);

  const [uploadingFields, setUploadingFields] = useState({});

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;

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
    // Preset icons yang tersedia di Filament admin
    Globe,
    Shield,
    ShieldCheck,
    Video,
    Database,
    FileText,
    File,
    // Alias tambahan untuk toleransi nama yang bervariasi
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
    // Link aliases
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

  useEffect(() => {
    if (services.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type");
    if (type && services.some((s) => s.slug === type)) {
      setSelectedService(type);
    }
  }, [services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessTicket(null);

    const payload = {
      serviceType: selectedService?.toUpperCase(),
      applicantName,
      applicantEmail,
      applicantPhone,
      instansi,
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
        // Do not clear fields entirely to keep user profile prefilled
        setDetails({});
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
        <div className="p-10 text-center font-bold text-xs text-slate-500 uppercase tracking-widest animate-pulse">
          Memuat Portal Layanan...
        </div>
      </MainLayout>
    );
  }

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <MainLayout>
      <Head>
        <title>Portal Layanan Digital - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan</title>
        <meta name="description" content="Pelayanan mandiri urusan persandian, infrastruktur TIK, & sistem informatika pemerintah daerah Kabupaten Banggai Kepulauan." />
        <meta name="keywords" content="Layanan Digital Banggai Kepulauan, Pengajuan TTE, Domain Desa, Hosting Pemda" />
        <link rel="canonical" href={pageUrl || "http://localhost:3001/layanan"} />
        <meta property="og:title" content="Portal Layanan Digital - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan" />
        <meta property="og:description" content="Pelayanan mandiri urusan persandian, infrastruktur TIK, & sistem informatika pemerintah daerah Kabupaten Banggai Kepulauan." />
        <meta property="og:url" content={pageUrl || "http://localhost:3001/layanan"} />
        <meta property="og:type" content="website" />
      </Head>
      {/* Premium Page Hero */}
      <PageHero
        label="PORTAL PELAYANAN DIGITAL HUB"
        title={<>Pengajuan <span className="text-indigo-400">Layanan Digital</span></>}
        subtitle="Pelayanan mandiri urusan persandian, infrastruktur TIK, & sistem informatika pemerintah daerah Kabupaten Banggai Kepulauan"
        icon={Cpu}
        gradient="from-indigo-950 via-slate-900 to-slate-950"
        accentColor="text-indigo-400"
        blobColor="bg-indigo-500"
        breadcrumbs={[{ label: "Layanan" }]}
        stats={[
          { label: "Jenis Layanan", value: services.length || "...", icon: Server },
          { label: "Login Diperlukan", value: user ? "Aktif" : "Belum Login", icon: ShieldCheck },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">

        {/* Auth Wall if not logged in */}
        {!user ? (
          <div className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col gap-6 items-center text-center animate-fadeIn my-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
              <ShieldCheck size={40} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-extrabold text-lg uppercase tracking-wider text-slate-900 dark:text-white">Akses Terproteksi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Untuk mengakses formulir pengajuan layanan digital pemerintah, Anda wajib masuk menggunakan akun pemohon yang telah terverifikasi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2 justify-center">
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
              >
                <span>Masuk Sekarang</span>
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                <span>Daftar Akun Baru</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-8">
            
            {successTicket && (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-3xl flex gap-3 text-xs leading-relaxed text-slate-900 dark:text-slate-350 font-semibold">
                <CheckCircle2 size={20} className="text-emerald-550 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold uppercase text-sm text-emerald-600 dark:text-emerald-450">Pengajuan Sukses!</span>
                  <span>Nomor Tiket Layanan Anda: <strong>{successTicket}</strong>. Permohonan Anda telah masuk ke sistem antrean verifikasi dan sedang ditelaah oleh administrator Diskominfo. Mohon simpan tiket ini.</span>
                </div>
              </div>
            )}

            {services.length === 0 ? (
              <div className="p-10 text-center font-bold text-xs text-slate-550 uppercase tracking-widest animate-pulse">
                Memuat Layanan Digital...
              </div>
            ) : !selectedService ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((srv) => {
                  const customIcon = isCustomIcon(srv.icon);
                  const Icon = !customIcon ? getIcon(srv.icon) : null;
                  const isExternal = srv.slug && (srv.slug.startsWith("http://") || srv.slug.startsWith("https://"));
                  return (
                    <button
                      key={srv.slug}
                      onClick={() => {
                        if (isExternal) {
                          window.open(srv.slug, "_blank", "noopener,noreferrer");
                        } else {
                          setSelectedService(srv.slug);
                        }
                      }}
                      className="p-6 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-left flex flex-col gap-4 hover:border-emerald-500/50 transition focus:outline-none focus:ring-2 focus:ring-emerald-550"
                    >
                      <div className={`p-3 rounded-xl border w-fit ${srv.color || 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-350'}`}>
                        {customIcon ? (
                          <img src={getCustomIconUrl(srv.icon)} alt={srv.title} className="w-5 h-5 object-contain" />
                        ) : (
                          <Icon size={20} className="stroke-[2.5]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{srv.title}</h3>
                          {isExternal && (
                            <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Eksternal</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-1">{srv.description}</p>
                        {srv.sop_file && (
                          <span className="mt-2 inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold w-fit">
                            <FileText size={10} />
                            <span>Ada SOP / Panduan</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Formulir: {services.find((s) => s.slug === selectedService)?.title}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setSuccessTicket(null);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-950 dark:hover:text-white font-bold uppercase tracking-wider focus:outline-none"
                  >
                    Kembali
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
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 dark:text-slate-300">Instansi / OPD Kerja</label>
                      <input
                        type="text"
                        required
                        value={instansi}
                        onChange={(e) => setInstansi(e.target.value)}
                        placeholder="Contoh: Bappeda, Dinas Kesehatan, dll"
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 dark:text-slate-300">Email Kerja (Dinas/Pribadi)</label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 dark:text-slate-300">No. Telepon / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 dark:text-white font-medium"
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
                                value={details[fieldName] || ""}
                                onChange={(e) => setDetails({ ...details, [fieldName]: e.target.value })}
                                placeholder={placeholder}
                                className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 dark:text-white font-medium resize-none"
                              />
                            ) : type === "select" ? (
                              <select
                                required={isRequired}
                                value={details[fieldName] || ""}
                                onChange={(e) => setDetails({ ...details, [fieldName]: e.target.value })}
                                className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-955 dark:text-white font-medium"
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
                                value={details[fieldName] || ""}
                                onChange={(e) => setDetails({ ...details, [fieldName]: e.target.value })}
                                placeholder={placeholder}
                                className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 dark:text-white font-medium"
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
                        value={details.purposeDescription || ""}
                        onChange={(e) => setDetails({ ...details, purposeDescription: e.target.value })}
                        placeholder="Jelaskan secara rinci detail permohonan Anda..."
                        className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 dark:text-white font-medium resize-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || Object.values(uploadingFields).some(Boolean)}
                    className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40"
                  >
                    <Send size={14} />
                    <span>Kirim Permohonan</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Layanan;
