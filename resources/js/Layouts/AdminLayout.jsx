import React, { useState, useEffect } from "react";
import { Link, usePage, Head } from "@inertiajs/react";
import { 
  LayoutDashboard, Image, UserCheck, FileText, FileSpreadsheet, 
  MapPin, Images, Users, LogOut, Globe, Shield, Menu, X, ChevronRight, ListCollapse,
  BarChart3, ClipboardList
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { url } = usePage();
  const [admin, setAdmin] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getPageTitle = (path) => {
    if (path.includes("/admin/banners")) return "Kelola Banners";
    if (path.includes("/admin/profil-staff")) return "Profil & Pegawai";
    if (path.includes("/admin/berita")) return "Kelola Berita";
    if (path.includes("/admin/ppid")) return "Verifikasi PPID";
    if (path.includes("/admin/layanan")) return "Layanan Digital";
    if (path.includes("/admin/satu-data")) return "Data Sektoral";
    if (path.includes("/admin/gis")) return "Peta GIS";
    if (path.includes("/admin/media")) return "Galeri Media";
    if (path.includes("/admin/users")) return "Akun Pengguna";
    if (path.includes("/admin/survey")) return "Survey Kepuasan";
    if (path.includes("/admin/audit-log")) return "Log Audit";
    return "Dashboard Admin";
  };

  useEffect(() => {
    const adminSessionStr = localStorage.getItem("adminSession");
    if (!adminSessionStr) {
      alert("Akses ditolak. Silakan login sebagai administrator terlebih dahulu.");
      window.location.href = "/auth/login";
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminSessionStr);
      if (parsedAdmin.role !== "SUPERADMIN" && parsedAdmin.role !== "ADMIN") {
        alert("Akses ditolak. Akun Anda tidak memiliki izin akses administrator.");
        window.location.href = "/";
        return;
      }
      setAdmin(parsedAdmin);
    } catch (e) {
      console.error(e);
      window.location.href = "/auth/login";
    }
  }, []);

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari panel admin?")) return;

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        localStorage.removeItem("adminSession");
        localStorage.removeItem("userSession");
        alert("Logout berhasil.");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Gagal logout:", err);
      localStorage.removeItem("adminSession");
      window.location.href = "/";
    }
  };

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/banners", label: "Banners Slider", icon: Image },
    { href: "/admin/profil-staff", label: "Profil & Pegawai", icon: UserCheck },
    { href: "/admin/berita", label: "Berita & Kategori", icon: FileText },
    { href: "/admin/ppid", label: "Layanan PPID", icon: FileText },
    { href: "/admin/layanan", label: "Layanan Digital", icon: Shield },
    { href: "/admin/satu-data", label: "Data Sektoral", icon: FileSpreadsheet },
    { href: "/admin/gis", label: "Peta GIS", icon: MapPin },
    { href: "/admin/media", label: "Galeri Media", icon: Images },
    { href: "/admin/users", label: "Akun Pengguna", icon: Users },
    { href: "/admin/survey", label: "Survey Kepuasan", icon: BarChart3 },
    { href: "/admin/audit-log", label: "Log Audit", icon: ClipboardList },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return url === "/admin" || url === "/admin/";
    }
    return url.startsWith(path);
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-bold uppercase tracking-widest text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Memverifikasi Hak Akses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <Head title={getPageTitle(url)} />
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600/10 text-emerald-600 rounded-xl">
            <Shield size={20} />
          </div>
          <span className="font-extrabold text-sm tracking-wider uppercase">ADMIN PORTAL</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-500 dark:text-slate-400"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Nav */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 lg:z-30 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform lg:transform-none transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${!isSidebarOpen && "lg:w-20"}`}
      >
        {/* Branding Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-600 rounded-xl">
              <Shield size={20} className="stroke-[2.5]" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-xs tracking-wider uppercase leading-none text-slate-900 dark:text-white">
                  PORTAL ADMIN
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                  DISKOMINFO
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:block p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
            title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
          >
            <ListCollapse size={16} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto" aria-label="Menu Admin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  active 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={item.label}
              >
                <Icon size={18} className="flex-shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col gap-3">
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{admin.name}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate mt-0.5">{admin.role}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Link 
                href="/" 
                className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                title="Kunjungi Web Klien"
              >
                <Globe size={12} />
                {isSidebarOpen && <span>Lihat Web</span>}
              </Link>
              <button 
                onClick={handleLogout}
                className="flex-grow py-2 px-3 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                title="Log Keluar"
              >
                <LogOut size={12} />
                {isSidebarOpen && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-grow flex flex-col min-h-screen pt-16 lg:pt-0 transition-all duration-300 ${
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
      }`}>
        <main className="flex-grow p-6 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}
