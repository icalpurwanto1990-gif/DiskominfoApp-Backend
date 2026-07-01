import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  ClipboardList, Search, Filter, RefreshCw, Download,
  Trash2, Edit, Plus, LogIn, Eye, ChevronLeft, ChevronRight, Activity
} from "lucide-react";

const ACTION_COLORS = {
  CREATE: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
  UPDATE: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  DELETE: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  LOGIN:  "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
  LOGOUT: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
  VIEW:   "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
};

const MODULE_COLORS = {
  BERITA:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  BANNER:   "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PPID:     "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  LAYANAN:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  USER:     "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  GIS:      "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  SATU_DATA:"bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  SURVEY:   "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  PROFIL:   "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  MEDIA:    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

const ACTION_ICONS = { CREATE: Plus, UPDATE: Edit, DELETE: Trash2, LOGIN: LogIn, VIEW: Eye };

const PAGE_SIZE = 20;
const MODULES = ["BERITA","BANNER","PPID","LAYANAN","USER","GIS","SATU_DATA","SURVEY","PROFIL","MEDIA"];
const ACTIONS = ["CREATE","UPDATE","DELETE","LOGIN","LOGOUT","VIEW"];

function timeAgo(dateStr) {
  if (!dateStr) return "-";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff} detik lalu`;
  if (diff < 3600)  return `${Math.floor(diff/60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
  return `${Math.floor(diff/86400)} hari lalu`;
}

function formatFull(dateStr) {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit" }).format(new Date(dateStr));
}

export default function AuditLog() {
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  const [filterModule, setFilterModule] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [search, setSearch]             = useState("");
  const [searchInput, setSearchInput]   = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 500 });
      if (filterModule) params.set("module", filterModule);
      if (filterAction) params.set("action", filterAction);
      if (search)       params.set("search", search);

      const res  = await fetch(`/api/admin/audit-logs?${params}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || []);
        setTotal(json.total || 0);
        setPage(1);
      }
    } catch (e) {
      console.error("Gagal memuat audit log:", e);
    } finally {
      setLoading(false);
    }
  }, [filterModule, filterAction, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const exportCSV = () => {
    const headers = ["No","Waktu","Modul","Aksi","Deskripsi","Admin","Role","IP Address"];
    const rows = logs.map((l, i) => [
      i+1, formatFull(l.createdAt), l.module, l.action,
      `"${(l.description||"").replace(/"/g,'""')}"`,
      l.adminName, l.adminRole, l.ipAddress||"-"
    ]);
    const csv = [headers,...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download=`audit-log-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const paginated   = logs.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const totalPages  = Math.max(1, Math.ceil(logs.length/PAGE_SIZE));

  // Stats from current filtered logs
  const actionCounts = ACTIONS.reduce((acc, a) => {
    acc[a] = logs.filter(l => l.action === a).length;
    return acc;
  }, {});

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Log Audit Sistem
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Rekam jejak seluruh aktivitas administratif — {total} total catatan tersimpan
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-400/60 transition">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Action Count Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map(action => {
          const Icon = ACTION_ICONS[action] || Activity;
          const colorClass = ACTION_COLORS[action] || "text-slate-600 bg-slate-100";
          return (
            <button key={action}
              onClick={() => setFilterAction(filterAction === action ? "" : action)}
              className={`p-4 rounded-2xl border flex flex-col gap-1.5 transition cursor-pointer text-left ${
                filterAction === action
                  ? "border-emerald-400/60 ring-2 ring-emerald-400/30 bg-emerald-50 dark:bg-emerald-900/10"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300/50"
              }`}
            >
              <div className={`p-1.5 rounded-lg w-fit ${colorClass}`}>
                <Icon size={12} />
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{actionCounts[action]||0}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{action}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter size={14} className="text-slate-400 flex-shrink-0 mt-2 sm:mt-0" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Filter:</span>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari deskripsi / admin..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>
            <button type="submit"
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition">
              Cari
            </button>
          </form>

          {/* Module Filter */}
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
            <option value="">Semua Modul</option>
            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Reset */}
          {(filterModule || filterAction || search) && (
            <button onClick={() => { setFilterModule(""); setFilterAction(""); setSearch(""); setSearchInput(""); }}
              className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/40 transition">
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menampilkan {paginated.length} dari {logs.length} log{filterModule||filterAction||search ? " (terfilter)" : ""}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Halaman {page} / {totalPages}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Memuat audit log...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <ClipboardList size={36} className="opacity-30" />
            <span className="text-sm font-semibold">Belum ada log audit tercatat.</span>
            <p className="text-xs text-center max-w-xs">Log akan muncul setelah admin melakukan aksi seperti simpan, hapus, atau edit data melalui panel ini.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Modul</th>
                    <th className="px-4 py-3">Aksi</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(log => {
                    const ActionIcon = ACTION_ICONS[log.action] || Activity;
                    const actionStyle = ACTION_COLORS[log.action] || "text-slate-600 bg-slate-100";
                    const moduleStyle = MODULE_COLORS[log.module] || "bg-slate-100 text-slate-700";
                    return (
                      <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{timeAgo(log.createdAt)}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{formatFull(log.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${moduleStyle}`}>
                            {log.module}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold w-fit ${actionStyle}`}>
                            <ActionIcon size={10} />
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-slate-600 dark:text-slate-400 font-medium truncate" title={log.description}>
                            {log.description}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{log.adminName}</span>
                            <span className="text-[9px] text-slate-400">{log.adminRole}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {log.ipAddress || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">
                  {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, logs.length)} dari {logs.length} log
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({length:Math.min(totalPages,5)},(_,i)=>{
                    const pg = page<=3 ? i+1 : page+i-2;
                    if (pg<1||pg>totalPages) return null;
                    return (
                      <button key={pg} onClick={()=>setPage(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${pg===page ? "bg-emerald-600 text-white" : "border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        {pg}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
