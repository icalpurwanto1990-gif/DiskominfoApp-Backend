import React, { useState, useEffect } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  BarChart3, Star, Users, TrendingUp, Filter, Download,
  Trash2, MessageSquare, RefreshCw, Search, ChevronLeft, ChevronRight
} from "lucide-react";

const STARS = [5, 4, 3, 2, 1];
const STAR_COLORS = {
  5: "bg-emerald-500", 4: "bg-teal-400",
  3: "bg-amber-400",   2: "bg-orange-400", 1: "bg-red-500"
};

function StarDisplay({ rating, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"} />
      ))}
    </span>
  );
}

export default function Survey() {
  const [data, setData] = useState({ responses: [], summary: { total: 0, avgRating: 0, distribution: {}, categories: [] } });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterRating, setFilterRating]     = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPeriod, setFilterPeriod]     = useState("");
  const [search, setSearch]                 = useState("");

  // Pagination
  const [page, setPage]           = useState(1);
  const PAGE_SIZE = 15;

  const getAdminHeaders = () => {
    try {
      const s = JSON.parse(localStorage.getItem("adminSession") || "{}");
      return { "X-Admin-Name": s.name || "Administrator", "X-Admin-Role": s.role || "ADMIN" };
    } catch { return {}; }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRating)   params.set("rating", filterRating);
      if (filterCategory) params.set("category", filterCategory);
      if (filterPeriod)   params.set("period", filterPeriod);
      const res  = await fetch(`/api/admin/survey-responses?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setPage(1);
      }
    } catch (e) {
      console.error("Gagal memuat survey:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterRating, filterCategory, filterPeriod]);

  const handleDelete = async (id) => {
    if (!confirm("Hapus respons survey ini?")) return;
    try {
      const res = await fetch(`/api/admin/survey-responses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders(),
        }
      });
      const json = await res.json();
      if (json.success) fetchData();
    } catch (e) { console.error(e); }
  };

  const exportCSV = () => {
    const headers = ["No", "Tanggal", "Rating", "Kategori", "Komentar"];
    const rows = filteredResponses.map((r, i) => [
      i + 1,
      r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID") : "-",
      r.rating,
      r.category || "-",
      `"${(r.comment || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `survey-kepuasan-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredResponses = (data.responses || []).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.comment || "").toLowerCase().includes(q) || (r.category || "").toLowerCase().includes(q);
  });

  const paginatedResponses = filteredResponses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / PAGE_SIZE));
  const { summary } = data;
  const maxDist = Math.max(1, ...Object.values(summary.distribution || {}));

  const formatDate = (d) => d ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)) : "-";

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Survey Kepuasan
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Pengelolaan hasil umpan balik publik terhadap layanan Diskominfo
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-400/60 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total Responden", value: summary.total, sub: "Semua waktu",
            icon: Users, color: "bg-emerald-500/10 text-emerald-600"
          },
          {
            label: "Rata-rata Rating", value: summary.avgRating ? `${summary.avgRating} / 5` : "N/A", sub: "Kepuasan keseluruhan",
            icon: Star, color: "bg-amber-500/10 text-amber-600"
          },
          {
            label: "Rating Bintang 5", value: summary.distribution?.[5] || 0, sub: "Responden puas",
            icon: TrendingUp, color: "bg-teal-500/10 text-teal-600"
          },
          {
            label: "Kategori Layanan", value: (summary.categories || []).length, sub: "Jenis layanan dinilai",
            icon: BarChart3, color: "bg-indigo-500/10 text-indigo-600"
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{card.value}</span>
                <span className="text-[9px] text-slate-500 font-semibold uppercase mt-1">{card.sub}</span>
              </div>
              <div className={`p-4 ${card.color} rounded-2xl`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution Chart */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex flex-col gap-1 mb-5">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Distribusi Rating Bintang</h3>
          <span className="text-[10px] font-semibold text-slate-500">Proporsi penilaian publik berdasarkan jumlah bintang</span>
        </div>
        <div className="flex flex-col gap-3">
          {STARS.map(star => {
            const count = summary.distribution?.[star] || 0;
            const pct   = maxDist > 0 ? Math.round((count / maxDist) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20 flex-shrink-0">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{star} Bintang</span>
                </div>
                <div className="flex-grow bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full ${STAR_COLORS[star]} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Table */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Data Respons Survey</h3>
            <span className="text-[10px] font-semibold text-slate-500">{filteredResponses.length} respons ditemukan</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Cari komentar..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 w-40"
              />
            </div>

            <select
              value={filterRating} onChange={e => setFilterRating(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <option value="">Semua Rating</option>
              {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Bintang</option>)}
            </select>

            <select
              value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <option value="">Semua Kategori</option>
              {(summary.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <option value="">Semua Waktu</option>
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Memuat data...</span>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <MessageSquare size={36} className="opacity-30" />
            <span className="text-sm font-semibold">Belum ada respons survey.</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Komentar</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResponses.map((r, i) => (
                    <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                      <td className="px-4 py-3 text-slate-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StarDisplay rating={r.rating} size={12} />
                          <span className="font-bold text-slate-700 dark:text-slate-300">{r.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.category ? (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                            {r.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-400 font-medium line-clamp-2">
                          {r.comment || <span className="italic text-slate-400">Tidak ada komentar</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title="Hapus respons"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400 font-semibold">
                  Halaman {page} dari {totalPages} ({filteredResponses.length} respons)
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
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
