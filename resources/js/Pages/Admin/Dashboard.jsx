import React, { useEffect, useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { 
  FileText, FileSpreadsheet, MapPin, Shield, Users, 
  ArrowUpRight, AlertCircle, CheckCircle2, Clock, Activity,
  Trash2, Edit, Plus
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalDatasets: 0,
    totalGis: 0,
    pendingPpid: 0,
    pendingService: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/audit-logs?limit=10")
        ]);
        const statsData = await statsRes.json();
        const logsData  = await logsRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (logsData.success)  setRecentActivities(logsData.logs || []);
      } catch (e) {
        console.error("Gagal memuat data dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Custom Chart Data: TTE ASN Monthly
  const tteMonthlyData = [
    { label: "Jan", value: 24 },
    { label: "Feb", value: 30 },
    { label: "Mar", value: 45 },
    { label: "Apr", value: 18 },
    { label: "Mei", value: 50 },
    { label: "Jun", value: 29 },
    { label: "Jul", value: 40 },
    { label: "Ags", value: 35 },
    { label: "Sep", value: 58 },
    { label: "Okt", value: 15 },
    { label: "Nov", value: 22 },
    { label: "Des", value: 11 }
  ];

  const maxChartVal = Math.max(...tteMonthlyData.map(d => d.value));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-6 w-full animate-pulse">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Title & Welcome */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Dashboard Overview
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Statistik ringkas dan laporan aktivitas sistem informasi daerah
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* News Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Berita</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalNews}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase mt-1">Dipublikasikan</span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <FileText size={24} />
          </div>
        </div>

        {/* Datasets Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dataset Open Data</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalDatasets}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase mt-1">Dataset Sektoral</span>
          </div>
          <div className="p-4 bg-teal-500/10 text-teal-600 rounded-2xl">
            <FileSpreadsheet size={24} />
          </div>
        </div>

        {/* GIS Map Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sebaran GIS</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalGis}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase mt-1">Titik Koordinat</span>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
            <MapPin size={24} />
          </div>
        </div>

        {/* Users Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalUsers}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase mt-1">Terdaftar</span>
          </div>
          <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: TTE Chart (SVG based) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Penerbitan TTE ASN (Bulanan)</h3>
              <span className="text-[10px] font-semibold text-slate-500">Statistik sertifikat tanda tangan elektronik disetujui</span>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-350">
              Tahun 2025
            </span>
          </div>

          {/* SVG Custom Chart */}
          <div className="w-full h-56 flex flex-col gap-2 justify-end">
            <div className="flex-grow flex items-end gap-3.5 md:gap-5 px-2 relative">
              {/* Grid Lines */}
              <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="w-full border-b border-slate-100 dark:border-slate-800/80"></div>
                <div className="w-full border-b border-slate-100 dark:border-slate-800/80"></div>
                <div className="w-full border-b border-slate-100 dark:border-slate-800/80"></div>
                <div className="w-full border-b border-slate-100 dark:border-slate-800/80"></div>
              </div>

              {tteMonthlyData.map((d, index) => {
                const pct = (d.value / maxChartVal) * 90; // scale to 90% max height
                return (
                  <div key={index} className="flex-grow flex flex-col items-center gap-2 group relative z-10">
                    {/* Tooltip */}
                    <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-md z-20">
                      {d.value} TTE
                    </span>
                    {/* Bar */}
                    <div 
                      style={{ height: `${Math.max(pct, 5)}%` }} 
                      className="w-full max-w-[20px] bg-emerald-600 hover:bg-emerald-500 rounded-t-lg transition-all cursor-pointer relative"
                    ></div>
                    {/* Label */}
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Urgent Action Tickets Panel */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Tiket Perlu Diproses</h3>
            <span className="text-[10px] font-semibold text-slate-500">Daftar pengajuan masuk membutuhkan respon admin</span>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* PPID Ticket Stats Widget */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                  <AlertCircle size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Permohonan PPID</span>
                  <span className="text-[9px] text-slate-500">Status pending tersisa</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-sm">
                {stats.pendingPpid}
              </span>
            </div>

            {/* Service Ticket Stats Widget */}
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                  <Shield size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Tiket Layanan Digital</span>
                  <span className="text-[9px] text-slate-500">Status pending tersisa</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm">
                {stats.pendingService}
              </span>
            </div>

            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Semua status diperbarui secara berkala</span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom: Recent Audit Activities */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Log Aktivitas Terbaru</h3>
            <span className="text-[10px] font-semibold text-slate-500">Tindakan administratif real-time tercatat sistem</span>
          </div>
          <a href="/admin/audit-log" className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider hover:underline">
            Lihat Semua →
          </a>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-semibold">
            <Activity size={32} className="mx-auto mb-2 opacity-30" />
            Belum ada aktivitas tercatat. Mulai lakukan aksi CRUD di panel admin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Modul</th>
                  <th className="pb-3">Aksi</th>
                  <th className="pb-3">Deskripsi</th>
                  <th className="pb-3">Admin</th>
                  <th className="pb-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map(log => {
                  const moduleColor = {
                    BERITA: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-300",
                    BANNER: "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-blue-300",
                    PPID:   "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300",
                    LAYANAN:"bg-purple-100 text-purple-800 dark:bg-purple-900/35 dark:text-purple-300",
                    USER:   "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/35 dark:text-indigo-300",
                    GIS:    "bg-teal-100 text-teal-800 dark:bg-teal-900/35 dark:text-teal-300",
                    SURVEY: "bg-rose-100 text-rose-800 dark:bg-rose-900/35 dark:text-rose-300",
                  }[log.module] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

                  const actionIcon = log.action === "DELETE" ? <Trash2 size={10} /> : log.action === "CREATE" ? <Plus size={10} /> : <Edit size={10} />;
                  const actionColor = log.action === "DELETE" ? "text-red-500" : log.action === "CREATE" ? "text-emerald-500" : "text-blue-500";

                  const timeAgo = (dateStr) => {
                    if (!dateStr) return "-";
                    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
                    if (diff < 60) return `${diff} dtk lalu`;
                    if (diff < 3600) return `${Math.floor(diff/60)} mnt lalu`;
                    if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
                    return `${Math.floor(diff/86400)} hari lalu`;
                  };

                  return (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${moduleColor}`}>
                          {log.module}
                        </span>
                      </td>
                      <td className={`py-3.5 font-bold flex items-center gap-1.5 ${actionColor}`}>
                        {actionIcon} {log.action}
                      </td>
                      <td className="py-3.5 text-slate-700 dark:text-slate-300 font-semibold max-w-[200px] truncate">{log.description}</td>
                      <td className="py-3.5 text-slate-500 font-semibold">{log.adminName}</td>
                      <td className="py-3.5 text-slate-400 font-semibold text-right">{timeAgo(log.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}
