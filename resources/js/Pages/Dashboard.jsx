import React, { useEffect, useState } from "react";
import { BarChart, DonutChart } from "../Components/StatsCharts";
import { 
  ShieldCheck, Users, Landmark, MonitorSmartphone, ArrowUpRight,
  Mail, Database, Globe, Network, Server, Video, CheckCircle2, Calendar, FileText
} from "lucide-react";
import MainLayout from "../Layouts/MainLayout";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    TOTAL_VISITORS: 14258,
    TOTAL_TTE_ISSUED: 377,
    APP_OPD_COUNT: 45,
    OPD_WEBSITE_COUNT: 28,
    TOTAL_SERVICES_REQUESTED: 684,
  });

  const [tteMonthlyData, setTteMonthlyData] = useState([
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
    { label: "Des", value: 11 },
  ]);

  const [ticketBreakdown, setTicketBreakdown] = useState([
    { label: "Selesai", value: 0, color: "#10B981" },
    { label: "Diproses", value: 0, color: "#F59E0B" },
    { label: "Pending", value: 0, color: "#3B82F6" },
    { label: "Ditolak", value: 0, color: "#EF4444" },
  ]);

  const [completedServices, setCompletedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const serviceTypeLabels = {
    TTE: "Sertifikat Elektronik (TTE)",
    DATA: "Permintaan Data Daerah",
    ZOOM: "Permintaan Link Zoom",
    EMAIL: "Email Instansi ASN",
    DOMAIN: "Pengajuan Subdomain",
    JARINGAN: "Aduan Gangguan Jaringan",
    HOSTING: "Hosting Website OPD",
    VICON: "Video Conference Dinas",
    "PENGADUAN-INSIDEN-SIBER": "Pengaduan Insiden Siber",
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case "TTE":
      case "PENGADUAN-INSIDEN-SIBER":
        return ShieldCheck;
      case "DATA":
        return Database;
      case "ZOOM":
      case "VICON":
        return Video;
      case "EMAIL":
        return Mail;
      case "DOMAIN":
        return Globe;
      case "JARINGAN":
        return Network;
      case "HOSTING":
        return Server;
      default:
        return FileText;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.stats) setStats(data.stats);
            if (data.tteMonthlyData) setTteMonthlyData(data.tteMonthlyData);
            if (data.ticketBreakdown) setTicketBreakdown(data.ticketBreakdown);
            if (data.completedServices) setCompletedServices(data.completedServices);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">
        
        {/* Banner / Title */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">SMART GOVERNMENT ANALYTICS</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Dashboard Kinerja SPBE
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Analitik real-time sistem pemerintahan berbasis elektronik Kabupaten Banggai Kepulauan
          </p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: "Kunjungan Portal", value: stats.TOTAL_VISITORS, desc: "Tahun berjalan", icon: Users, color: "text-blue-500 bg-blue-500/10" },
            { label: "Sertifikat TTE", value: stats.TOTAL_TTE_ISSUED, desc: "ASN terdaftar TTE", icon: ShieldCheck, color: "text-teal-500 bg-teal-500/10" },
            { label: "Sistem Aplikasi", value: stats.APP_OPD_COUNT, desc: "Layanan aplikasi OPD", icon: MonitorSmartphone, color: "text-indigo-500 bg-indigo-500/10" },
            { label: "Website OPD", value: stats.OPD_WEBSITE_COUNT, desc: "Aktif di subdomain", icon: Landmark, color: "text-amber-500 bg-amber-500/10" },
            { label: "Total Tiket Layanan", value: stats.TOTAL_SERVICES_REQUESTED, desc: "Pengajuan masuk", icon: ArrowUpRight, color: "text-emerald-500 bg-emerald-500/10" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-3 shadow-sm">
                <div className={`p-2.5 rounded-lg w-fit ${item.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{item.value.toLocaleString("id-ID")}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">{item.label}</span>
                  <span className="text-[9px] text-slate-400 mt-1 font-semibold">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chart 1: TTE Issued (APTIKA Performance) */}
          <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Statistik Penerbitan TTE Bulanan 2025</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Volume pengajuan tanda tangan elektronik ASN disetujui</p>
            </div>
            {loading ? (
              <div className="h-[220px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ) : (
              <BarChart data={tteMonthlyData} color="#499ed7" height={220} />
            )}
          </div>

          {/* Chart 2: Ticket breakdown */}
          <div className="lg:col-span-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6 justify-between">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Status Penyelesaian Tiket Layanan</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Penyelesaian aduan & pengajuan layanan digital</p>
            </div>
            <div className="flex-grow flex items-center justify-center py-4">
              {loading ? (
                <div className="w-[150px] h-[150px] rounded-full border-8 border-slate-200 border-t-slate-500 animate-spin" />
              ) : (
                <DonutChart data={ticketBreakdown} size={150} />
              )}
            </div>
          </div>

        </div>

        {/* Layanan Terlaksana Section */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Layanan yang Telah Terlaksana
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Log real-time permohonan layanan publik digital yang telah diselesaikan oleh admin
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-[9px] font-bold rounded-lg text-emerald-600 dark:text-emerald-400 uppercase tracking-wider self-start md:self-center">
              Pembaruan Otomatis
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : completedServices.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Belum ada layanan terlaksana</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-650">Semua layanan yang selesai akan terdaftar di sini secara transparan.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-850 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="pb-3">No. Tiket</th>
                    <th className="pb-3">Jenis Layanan</th>
                    <th className="pb-3">Pemohon / Instansi</th>
                    <th className="pb-3">Tanggal Selesai</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedServices.map((srv) => {
                    const typeLabel = serviceTypeLabels[srv.serviceType] || srv.serviceType;
                    const SrvIcon = getServiceIcon(srv.serviceType);
                    
                    // Format updatedAt date
                    const formattedDate = new Date(srv.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    });

                    return (
                      <tr key={srv.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 font-extrabold text-slate-900 dark:text-white tracking-tight">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
                              <FileText size={12} />
                            </span>
                            <span>{srv.ticketNumber}</span>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500 dark:text-emerald-400">
                              <SrvIcon size={14} />
                            </span>
                            <span>{typeLabel}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-455 font-semibold leading-tight">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-850 dark:text-slate-200">{srv.applicantName}</span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{srv.instansi}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-455" />
                          {formattedDate}
                        </td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={12} className="stroke-[2.5]" />
                            Terlaksana
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default Dashboard;
