import React, { useState, useEffect, useRef } from "react";
import { Link, Head } from "@inertiajs/react";
import {
  ArrowRight, ShieldCheck, Database, Mail, Server, Video,
  Link as LinkIcon, Globe, Network, FileText, Map, Megaphone,
  CheckCircle, TrendingUp, Users, Cpu, BarChart3, ExternalLink,
  Quote, Search, AlertCircle, XCircle, Info
} from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import HeroSlider from "../Components/HeroSlider";
import SurveyWidget from "../Components/SurveyWidget";
import SurveyModal from "../Components/SurveyModal";
import ScrollReveal from "../Components/ScrollReveal";

const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
};

const iconMap = {
  ShieldCheck, Database, Mail, Server, Video,
  Link: LinkIcon, LinkIcon, Globe, Network, FileText, Map,
  TrendingUp, Users, Cpu, BarChart3,
};

// --- Color token → Tailwind class mapping ---
const colorTokenMap = {
  emerald: {
    border: "border-emerald-200/60 dark:border-emerald-900/40",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    border: "border-blue-200/60 dark:border-blue-900/40",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
  },
  purple: {
    border: "border-purple-200/60 dark:border-purple-900/40",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    icon: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
  },
  amber: {
    border: "border-amber-200/60 dark:border-amber-900/40",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
  },
  red: {
    border: "border-red-200/60 dark:border-red-900/40",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
  },
  indigo: {
    border: "border-indigo-200/60 dark:border-indigo-900/40",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
  },
  teal: {
    border: "border-teal-200/60 dark:border-teal-900/40",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    icon: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400",
  },
  rose: {
    border: "border-rose-200/60 dark:border-rose-900/40",
    bg: "bg-rose-100 dark:bg-rose-900/30",
    icon: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
  },
};

const getColorToken = (colorKey) =>
  colorTokenMap[colorKey] || colorTokenMap.emerald;

const getIcon = (iconName) => iconMap[iconName] || Globe;

const isCustomIcon = (iconName) =>
  iconName && (iconName.includes("/") || iconName.includes("."));

const getCustomIconUrl = (iconPath) => {
  if (!iconPath) return "";
  if (iconPath.startsWith("http") || iconPath.startsWith("/")) return iconPath;
  return `/uploads/${iconPath}`;
};

// --- Count-Up Hook (numeric values only) ---
const useCountUp = (rawValue, duration = 1800) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  // Extract numeric part from free-form string, e.g. "85.2" or "45"
  const numericTarget = parseFloat(String(rawValue).replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(numericTarget) && numericTarget >= 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || !isNumeric) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.max(1, Math.ceil(numericTarget / (duration / 16)));
        const timer = setInterval(() => {
          start += step;
          if (start >= numericTarget) { setCount(numericTarget); clearInterval(timer); }
          else { setCount(start); }
        }, 16);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [numericTarget, duration, isNumeric]);

  // Format with locale for large numbers
  const formatted = isNumeric
    ? (numericTarget % 1 !== 0
        ? count.toFixed(1)                                       // decimal
        : new Intl.NumberFormat("id-ID").format(Math.round(count))) // integer
    : String(rawValue); // non-numeric: show as-is

  return { ref, formatted, isNumeric };
};

// --- Stat Card ---
// Accepts server-driven data: { label, value, suffix, desc, icon (string), color (token string) }
const StatCard = ({ label, value, suffix, desc, icon: iconName, color: colorKey }) => {
  const Icon = iconMap[iconName] || BarChart3;
  const color = getColorToken(colorKey);
  const { ref, formatted, isNumeric } = useCountUp(value);

  return (
    <div ref={ref} className={`relative p-6 bg-white dark:bg-slate-900 border ${color.border} rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${color.bg} rounded-bl-[60px] opacity-30 transition-opacity group-hover:opacity-50`} />
      <div className={`p-2.5 ${color.icon} w-fit rounded-xl relative z-10`}>
        <Icon size={18} className="stroke-[2]" />
      </div>
      <div className="flex flex-col gap-0.5 relative z-10">
        <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
          {isNumeric ? formatted : value}{suffix || ""}
        </span>
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 mt-1">{label}</span>
        <span className="text-[10px] text-slate-400 font-medium">{desc}</span>
      </div>
    </div>
  );
};

export const Home = ({ dbStats, sliderImages, dbServices, welcomeSpeech, latestNewsItems, latestAnnouncements }) => {
  const [trackQuery, setTrackQuery] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSurveyOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setIsTracking(true);
    setTrackError("");
    setTrackResult(null);
    try {
      const res = await fetch(`/api/layanan/pengajuan?ticketNumber=${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackResult(data);
      } else {
        setTrackError(data.error || "Data permohonan atau tiket tidak ditemukan.");
      }
    } catch (err) {
      setTrackError("Terjadi gangguan koneksi. Silakan coba lagi.");
    } finally {
      setIsTracking(false);
    }
  };

  // Build dynamic stats from server-driven dbStats (already filtered & ordered by admin)
  const stats = Array.isArray(dbStats) ? dbStats : [];

  // Build hero stats from the first 3 published statistics
  const heroStats = stats.slice(0, 3).map((s) => ({
    label: s.label,
    value: `${s.value}${s.suffix || ""}`,
  }));

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <MainLayout>
      <Head>
        <title>Beranda - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan</title>
        <meta name="description" content="Portal Resmi Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan — Layanan Digital, PPID, Satu Data, dan Smart Government SPBE." />
        <meta name="keywords" content="Diskominfo, Banggai Kepulauan, SPBE, Layanan Digital, PPID, Satu Data, Portal Resmi" />
        <link rel="canonical" href={pageUrl || "http://localhost:3001/"} />
        <meta property="og:title" content="Beranda - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan" />
        <meta property="og:description" content="Portal Resmi Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan — Layanan Digital, PPID, Satu Data, dan Smart Government SPBE." />
        <meta property="og:url" content={pageUrl || "http://localhost:3001/"} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GovernmentOrganization",
            "name": "Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan",
            "url": siteOrigin || "http://localhost:3001",
            "logo": `${siteOrigin || "http://localhost:3001"}/images/favicon.png`,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+62-811-XXXX-XXXX",
              "contactType": "Customer Service"
            }
          })}
        </script>
      </Head>
      <div className="w-full flex flex-col items-center">
        {/* 1. Hero Banner Slider */}
        <HeroSlider initialImages={sliderImages} heroStats={heroStats} welcomeSpeech={welcomeSpeech} />

        {/* 2. Sambutan Kepala Dinas */}
        <section className="w-full max-w-7xl px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border-b border-slate-200/70 dark:border-slate-800/70">
          <ScrollReveal direction="left" className="lg:col-span-4 flex flex-col items-center">
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute inset-0 -m-3 rounded-[28px] border-2 border-dashed border-emerald-300/40 dark:border-emerald-700/40 rounded-3xl" />
              <div className="relative w-52 h-68 bg-gradient-to-br from-emerald-950 to-slate-900 rounded-[24px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 flex items-center justify-center"
                   style={{ height: "17rem" }}>
                {welcomeSpeech?.foto ? (
                  <img src={welcomeSpeech.foto} alt="Kepala Dinas" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.25),transparent)]">
                    <div className="w-16 h-16 rounded-full bg-emerald-700/40 border-2 border-emerald-500/50 mb-3 flex items-center justify-center">
                      <Users size={28} className="text-emerald-300" />
                    </div>
                    <span className="font-black text-xs text-white uppercase tracking-wider">KADIS KOMINFO</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Kab. Banggai Kepulauan</span>
                  </div>
                )}
              </div>
              {/* Green accent dot */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                <CheckCircle size={14} className="text-white" />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500 to-transparent" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sambutan Pimpinan</span>
              <div className="h-px flex-1 bg-gradient-to-l from-emerald-500 to-transparent" />
            </div>
            <h2 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
              Sambutan<br /><span className="text-emerald-600 dark:text-emerald-400">Kepala Dinas</span>
            </h2>
            <div className="relative">
              <Quote size={40} className="absolute -top-2 -left-2 text-emerald-100 dark:text-emerald-900/50" />
              <p className="relative text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed italic pl-6 border-l-2 border-emerald-200 dark:border-emerald-800">
                {welcomeSpeech?.teks || "Selamat datang di Portal Diskominfo Kabupaten Banggai Kepulauan. Kami berkomitmen untuk memberikan pelayanan digital terbaik bagi masyarakat."}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow">
                {welcomeSpeech?.nama?.charAt(0) || "K"}
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 dark:text-white block">{welcomeSpeech?.nama || "Kepala Dinas"}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{welcomeSpeech?.jabatan || "Dinas Komunikasi dan Informatika"}</span>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 3. Statistik Real-Time */}
        <section className="w-full max-w-7xl px-4 md:px-8 py-20 flex flex-col gap-10 border-b border-slate-200/70 dark:border-slate-800/70">
          <ScrollReveal className="text-center flex flex-col gap-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Capaian Kinerja</span>
            <h2 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
              Statistik <span className="text-emerald-600 dark:text-emerald-400">Real-Time Kinerja</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Transparansi penyelenggaraan pemerintahan berbasis data aktual</p>
          </ScrollReveal>
          {stats.length > 0 ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${
              stats.length <= 2 ? 'lg:grid-cols-2' :
              stats.length === 3 ? 'lg:grid-cols-3' :
              'lg:grid-cols-4'
            } gap-6`}>
              {stats.map((stat, idx) => (
                <ScrollReveal key={stat.id || idx} delay={idx * 80}>
                  <StatCard
                    label={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    desc={stat.desc}
                    icon={stat.icon}
                    color={stat.color}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-slate-400 font-medium">
              Belum ada data statistik yang dipublikasikan.
            </div>
          )}
        </section>

        {/* 4. Layanan Digital Gateway */}
        <section className="w-full max-w-7xl px-4 md:px-8 py-20 flex flex-col gap-10 border-b border-slate-200/70 dark:border-slate-800/70">
          <ScrollReveal className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Portal Layanan</span>
              <h2 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
                Layanan <span className="text-emerald-600 dark:text-emerald-400">Digital Hub</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Akses pengajuan cepat layanan Dinas untuk ASN & OPD</p>
            </div>
            <Link
              href="/layanan"
              className="group flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 transition"
            >
              <span>Lihat Semua Layanan</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {dbServices && dbServices.length > 0 ? (
              dbServices.map((srv, idx) => {
                const customIcon = isCustomIcon(srv.icon);
                const Icon = !customIcon ? getIcon(srv.icon) : null;
                const isExternal = srv.slug && (srv.slug.startsWith("http://") || srv.slug.startsWith("https://"));
                const colorClass = srv.color || "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

                return (
                  <ScrollReveal key={srv.id} delay={idx * 50}>
                    <div className="h-full p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                      {/* Icon + Badge row */}
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl border ${colorClass} transition-all duration-300 group-hover:scale-110`}>
                          {customIcon ? (
                            <img src={getCustomIconUrl(srv.icon)} alt={srv.title} className="w-5 h-5 object-contain" />
                          ) : (
                            <Icon size={20} className="stroke-[2]" />
                          )}
                        </div>
                        {isExternal && (
                          <span className="text-[9px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-700/40 font-bold uppercase tracking-wider flex items-center gap-1">
                            <ExternalLink size={8} />
                            Eksternal
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-1.5 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{srv.title}</h3>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium line-clamp-3">{srv.description}</p>
                      </div>

                      {/* Action Link */}
                      {isExternal ? (
                        <a
                          href={srv.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 uppercase tracking-wider transition group/link"
                        >
                          <span>Buka Layanan</span>
                          <ExternalLink size={11} className="group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      ) : (
                        <Link
                          href={`/layanan?type=${srv.slug}`}
                          className="mt-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 uppercase tracking-wider transition group/link"
                        >
                          <span>Ajukan Permohonan</span>
                          <ArrowRight size={11} className="group-hover/link:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10 text-sm text-slate-400 font-medium">
                Belum ada layanan digital aktif di database.
              </div>
            )}
          </div>
        </section>

        {/* 4.5. Pelacakan Tiket & Permohonan */}
        <section className="w-full bg-slate-50 dark:bg-slate-950 border-y border-slate-200/50 dark:border-slate-800/40 py-16">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-8">
            <ScrollReveal className="text-center flex flex-col gap-2 max-w-2xl mx-auto">
              <span className="text-[10px] font-bold text-[#0a549e] dark:text-sky-400 uppercase tracking-widest">Sistem Pelacakan Mandiri</span>
              <h2 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
                Lacak Status <span className="text-[#0a549e] dark:text-sky-400">Permohonan Anda</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Pantau proses verifikasi dokumen secara real-time. Masukkan Nomor Tiket (contoh: <span className="font-bold text-slate-700 dark:text-slate-350">SRV-2026-XXXX</span> / <span className="font-bold text-slate-700 dark:text-slate-350">PPID-XXXX</span>) atau NIP PNS Anda (untuk layanan TTE).
              </p>
            </ScrollReveal>

            {/* Input Search Form */}
            <ScrollReveal delay={100} className="w-full max-w-xl mx-auto">
              <form onSubmit={handleTrackSubmit} className="flex gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md focus-within:ring-2 focus-within:ring-[#0a549e]/40 dark:focus-within:ring-sky-500/40 transition duration-300">
                <div className="relative flex-grow flex items-center pl-3">
                  <Search size={16} className="text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="Masukkan Nomor Tiket / NIP..."
                    className="w-full bg-transparent border-0 p-2 text-xs md:text-sm font-semibold focus:ring-0 focus:outline-none dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTracking}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#0a549e] to-sky-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition duration-350 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isTracking ? "Mencari..." : "Lacak Status"}
                </button>
              </form>
            </ScrollReveal>

            {/* Error Message */}
            {trackError && (
              <ScrollReveal delay={50} className="w-full max-w-md mx-auto p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-2xl flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-xs text-red-800 dark:text-red-400">Pencarian Gagal</span>
                  <p className="text-[10px] text-red-600 dark:text-red-400/90 font-medium leading-relaxed">{trackError}</p>
                </div>
              </ScrollReveal>
            )}

            {/* Tracking Result Card */}
            {trackResult && (
              <ScrollReveal delay={150} className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden p-6 flex flex-col gap-6">
                
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-[#0a549e] dark:text-sky-400 rounded-2xl">
                      <FileText size={20} />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {trackResult.type === 'TTE' ? 'Layanan Kepegawaian (TTE)' : 'Layanan Publik OPD / PPID'}
                      </span>
                      <span className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                        {trackResult.data.ticketNumber || `TTE NIP: ${trackResult.data.nip}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <span className="text-[9px] text-slate-400 font-semibold">Tanggal Pengajuan</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                      {new Date(trackResult.data.createdAt || trackResult.data.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Pemohon</span>
                    <span className="text-slate-900 dark:text-white">{trackResult.data.nama || trackResult.data.applicantName}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Instansi / OPD</span>
                    <span className="text-slate-900 dark:text-white">{trackResult.data.instansi}</span>
                  </div>
                  {trackResult.type !== 'TTE' && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Jenis Layanan</span>
                      <span className="text-slate-900 dark:text-white uppercase">{trackResult.data.serviceType || 'Informasi Publik (PPID)'}</span>
                    </div>
                  )}
                  {trackResult.type === 'TTE' && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Jabatan</span>
                      <span className="text-slate-900 dark:text-white">{trackResult.data.jabatan}</span>
                    </div>
                  )}
                </div>

                {/* Timeline / Progress Flow */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Riwayat Status Permohonan</span>
                  
                  {/* Status Timeline */}
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                    
                    {/* Stage 1: PENDING / DRAFT */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        1
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">Pengajuan Diterima</span>
                        <span className="text-[9px] text-slate-400 mt-1">Berkas berhasil di-upload</span>
                      </div>
                    </div>

                    <div className="hidden md:block h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />

                    {/* Stage 2: DIPROSES */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                        ['DIPROSES', 'SELESAI'].includes(trackResult.data.status)
                          ? "bg-blue-500 text-white animate-pulse"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}>
                        2
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className={`font-extrabold text-xs ${
                          ['DIPROSES', 'SELESAI'].includes(trackResult.data.status) ? "text-slate-900 dark:text-white" : "text-slate-400"
                        }`}>Verifikasi & Proses</span>
                        <span className="text-[9px] text-slate-400 mt-1">Sedang diperiksa admin</span>
                      </div>
                    </div>

                    <div className="hidden md:block h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />

                    {/* Stage 3: SELESAI / REVISI / DITOLAK */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                        trackResult.data.status === 'SELESAI'
                          ? "bg-emerald-600 text-white"
                          : trackResult.data.status === 'PERBAIKAN'
                            ? "bg-amber-500 text-white animate-bounce"
                            : ['REVISI', 'DITOLAK'].includes(trackResult.data.status)
                              ? "bg-red-500 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {trackResult.data.status === 'SELESAI' ? "✓" : trackResult.data.status === 'PERBAIKAN' ? "🔄" : ['REVISI', 'DITOLAK'].includes(trackResult.data.status) ? "✕" : "3"}
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className={`font-extrabold text-xs ${
                          trackResult.data.status === 'SELESAI'
                            ? "text-emerald-600 dark:text-emerald-400"
                            : trackResult.data.status === 'PERBAIKAN'
                              ? "text-amber-500"
                              : ['REVISI', 'DITOLAK'].includes(trackResult.data.status)
                                ? "text-red-500"
                                : "text-slate-400"
                        }`}>
                          {trackResult.data.status === 'SELESAI' ? 'Selesai / Terbit' : trackResult.data.status === 'PERBAIKAN' ? 'Dikembalikan (Perbaikan)' : ['REVISI', 'DITOLAK'].includes(trackResult.data.status) ? 'Ditolak' : 'Keputusan Akhir'}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1">Status final tiket</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Admin Notes (If status is DITOLAK / REVISI) */}
                {['REVISI', 'DITOLAK'].includes(trackResult.data.status) && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Info size={12} />
                      Catatan Penolakan / Tindak Lanjut Revisi Admin
                    </span>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-semibold">
                      "{trackResult.data.catatan_admin || trackResult.data.notes || 'Mohon melengkapi kembali berkas administrasi Anda.'}"
                    </p>
                  </div>
                )}

                {/* Selesai details */}
                {trackResult.data.status === 'SELESAI' && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle size={12} />
                      Permohonan Selesai Diproses
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      Sertifikat TTE atau hasil layanan publik Anda telah berhasil diterbitkan/disetujui. Silakan cek email resmi atau berkas dokumen yang Anda cantumkan.
                    </p>
                  </div>
                )}
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* 5. Berita Terbaru & Pengumuman */}
        <section className="w-full max-w-7xl px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-slate-200/70 dark:border-slate-800/70">

          {/* News Section */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <ScrollReveal className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Publikasi</span>
                <h2 className="font-black text-xl md:text-2xl text-slate-900 dark:text-white mt-1">
                  Berita <span className="text-emerald-600 dark:text-emerald-400">Terbaru</span>
                </h2>
              </div>
              <Link
                href="/berita"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 transition"
              >
                <span>Semua Berita</span>
                <ArrowRight size={14} />
              </Link>
            </ScrollReveal>

            <div className="flex flex-col gap-5">
              {latestNewsItems && latestNewsItems.length > 0 ? (
                latestNewsItems.map((news, idx) => (
                  <ScrollReveal key={news.id} delay={idx * 80}>
                    <Link href={`/berita/${news.slug}`} className="group block">
                      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md hover:border-emerald-300/50 dark:hover:border-emerald-700/50 transition-all duration-300">
                        <div className="w-full md:w-44 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden">
                          {news.image ? (
                            <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText size={28} className="text-slate-300 dark:text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-between py-0.5 gap-2">
                          <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg w-fit uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                              {news.category?.name || "Kabar Pers"}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-snug line-clamp-2">
                              {news.title}
                            </h3>
                            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                              {stripHtml(news.content)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{news.createdAt ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(news.createdAt)) : "-"}</span>
                            <span>·</span>
                            <span>{news.views || 0} Dilihat</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-400 font-medium">Belum ada berita terbit.</div>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ScrollReveal>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Resmi</span>
                  <h2 className="font-black text-xl md:text-2xl text-slate-900 dark:text-white mt-1">
                    Pengumuman
                  </h2>
                </div>
                <Link
                  href="/berita?kategori=pengumuman"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 transition"
                >
                  <span>Semua</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollReveal>

            <div className="flex flex-col gap-4">
              {latestAnnouncements && latestAnnouncements.length > 0 ? (
                latestAnnouncements.map((ann, idx) => (
                  <ScrollReveal key={ann.id} delay={idx * 80}>
                    <Link href={`/berita/${ann.slug}`} className="group block">
                      <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex gap-4 shadow-sm hover:shadow-md hover:border-emerald-400/60 dark:hover:border-emerald-600/60 transition-all duration-300">
                        <div className="p-3 bg-white dark:bg-slate-900 text-emerald-600 rounded-xl h-fit shadow-sm border border-emerald-100 dark:border-emerald-900 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Megaphone size={16} />
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2">
                            {ann.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {stripHtml(ann.content)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                              {ann.createdAt
                                ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(ann.createdAt))
                                : "-"}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600 text-[9px]">·</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
                              Baca
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))
              ) : (
                <ScrollReveal delay={100}>
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl h-fit flex-shrink-0">
                      <Megaphone size={16} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Belum Ada Pengumuman Baru</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
                        Periksa kembali halaman berita secara berkala untuk update terbaru.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>

        {/* 7. Survey Kepuasan */}
        <section className="w-full max-w-7xl px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <ScrollReveal direction="left" className="lg:col-span-7 flex flex-col gap-5">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Partisipasi Publik</span>
            <h2 className="font-black text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
              Survey Kepuasan <span className="text-emerald-600 dark:text-emerald-400">Real-Time</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Hasil umpan balik Anda langsung dikompilasi ke dalam dashboard Smart Government sebagai basis peningkatan kinerja layanan publik SPBE yang prima.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              {[
                "Memenuhi Standar WCAG 2.2 AA",
                "Log Audit Aktivitas Terlacak Aman",
                "Data Agregat Transparan ke Publik",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="lg:col-span-5 w-full">
            <SurveyWidget />
          </ScrollReveal>
        </section>

        {/* Dynamic Satisfaction Survey Popup */}
        <SurveyModal isOpen={isSurveyOpen} onClose={() => setIsSurveyOpen(false)} />
      </div>
    </MainLayout>
  );
};

export default Home;
