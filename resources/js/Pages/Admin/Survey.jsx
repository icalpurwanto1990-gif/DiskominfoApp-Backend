import React, { useState, useEffect } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  BarChart3, Star, Users, TrendingUp, Filter, Download,
  Trash2, MessageSquare, RefreshCw, Search, ChevronLeft, ChevronRight,
  Plus, Edit, Settings, QrCode, Check, ExternalLink, Eye, Upload, X, Tag
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
  const [activeMainTab, setActiveMainTab] = useState("responses"); // 'responses' | 'categories' | 'settings'

  // --- TAB 1: SURVEY RESPONSES & ANALYTICS STATE ---
  const [data, setData] = useState({ responses: [], summary: { total: 0, avgRating: 0, distribution: {}, categories: [] } });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating]     = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPeriod, setFilterPeriod]     = useState("");
  const [search, setSearch]                 = useState("");
  const [page, setPage]                     = useState(1);
  const PAGE_SIZE = 15;

  // --- TAB 2: SURVEY CATEGORIES CRUD STATE ---
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: "", active: true });
  const [savingCategory, setSavingCategory] = useState(false);

  // --- TAB 3: WIDGET SETTINGS STATE ---
  const [settings, setSettings] = useState({
    title: "Survey Kepuasan Masyarakat",
    subtitle: "Bantu kami meningkatkan pelayanan publik dengan memberikan penilaian Anda.",
    qr_image: "/images/survey-qr.png",
    qr_caption: "📱 Scan QR untuk mengisi survey via ponsel",
    qr_link: "",
    show_qr: true,
    divider_text: "atau isi di sini",
    thank_you_title: "Terima Kasih!",
    thank_you_message: "Umpan balik Anda telah kami terima. Data ini sangat berharga untuk meningkatkan kualitas pelayanan publik digital di Kabupaten Banggai Kepulauan.",
    is_active: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  const getAdminHeaders = () => {
    try {
      const s = JSON.parse(localStorage.getItem("adminSession") || "{}");
      return { "X-Admin-Name": s.name || "Administrator", "X-Admin-Role": s.role || "ADMIN" };
    } catch { return {}; }
  };

  // --- FETCH RESPONSES ---
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

  // --- FETCH CATEGORIES ---
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/admin/survey-categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.categories)) {
        setCategories(json.categories);
      }
    } catch (e) {
      console.error("Gagal memuat kategori:", e);
    } finally {
      setLoadingCategories(false);
    }
  };

  // --- FETCH SETTINGS ---
  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/survey-settings");
      const json = await res.json();
      if (json.success && json.settings) {
        setSettings(json.settings);
        setQrPreview(json.settings.qr_image || "/images/survey-qr.png");
      }
    } catch (e) {
      console.error("Gagal memuat pengaturan survey:", e);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchCategories();
    fetchSettings();
  }, [filterRating, filterCategory, filterPeriod]);

  // Delete response
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

  // Export CSV
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

  // Save Category (Create / Edit)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    setSavingCategory(true);
    try {
      const res = await fetch("/api/admin/survey-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(categoryForm),
      });
      const json = await res.json();
      if (json.success) {
        setCategoryModalOpen(false);
        setCategoryForm({ id: null, name: "", active: true });
        fetchCategories();
        fetchData();
      } else {
        alert(json.error || "Gagal menyimpan kategori.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan kategori.");
    } finally {
      setSavingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus kategori "${name}"? Kategori ini tidak akan muncul lagi di formulir survey publik.`)) return;
    try {
      const res = await fetch(`/api/admin/survey-categories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders(),
        }
      });
      const json = await res.json();
      if (json.success) {
        fetchCategories();
        fetchData();
      } else {
        alert(json.error || "Gagal menghapus kategori.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Category Active status directly
  const handleToggleCategoryActive = async (cat) => {
    try {
      const res = await fetch("/api/admin/survey-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          id: cat.id,
          name: cat.name,
          active: !cat.active,
        }),
      });
      const json = await res.json();
      if (json.success) fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle QR Code image selection
  const handleQrFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onload = () => setQrPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Save Widget Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const formData = new FormData();
      formData.append("title", settings.title || "");
      formData.append("subtitle", settings.subtitle || "");
      formData.append("qr_caption", settings.qr_caption || "");
      formData.append("qr_link", settings.qr_link || "");
      formData.append("show_qr", settings.show_qr ? "1" : "0");
      formData.append("divider_text", settings.divider_text || "atau isi di sini");
      formData.append("thank_you_title", settings.thank_you_title || "Terima Kasih!");
      formData.append("thank_you_message", settings.thank_you_message || "");
      formData.append("is_active", settings.is_active ? "1" : "0");

      if (qrFile) {
        formData.append("qr_image_file", qrFile);
      } else if (settings.qr_image) {
        formData.append("qr_image", settings.qr_image);
      }

      const res = await fetch("/api/admin/survey-settings", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders(),
        },
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.settings) {
        setSettings(json.settings);
        setQrPreview(json.settings.qr_image);
        setQrFile(null);
        setSettingsSavedAlert(true);
        setTimeout(() => setSettingsSavedAlert(false), 4000);
      } else {
        alert(json.error || "Gagal menyimpan pengaturan widget.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredResponses = (data.responses || []).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.category || "").toLowerCase().includes(q) || (r.comment || "").toLowerCase().includes(q);
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
            Pengelolaan Survey Kepuasan
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Analitik hasil survey, pengelolaan kategori layanan, dan kustomisasi Survey Widget
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeMainTab === "responses" && (
            <>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-400/60 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <Download size={14} /> Export CSV
              </button>
            </>
          )}

          {activeMainTab === "categories" && (
            <button
              onClick={() => {
                setCategoryForm({ id: null, name: "", active: true });
                setCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <Plus size={15} /> Tambah Kategori
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-1">
        <button
          onClick={() => setActiveMainTab("responses")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
            activeMainTab === "responses"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BarChart3 size={15} />
          <span>Hasil & Analitik ({summary.total})</span>
        </button>

        <button
          onClick={() => setActiveMainTab("categories")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
            activeMainTab === "categories"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Tag size={15} />
          <span>Kelola Kategori Layanan ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab("settings")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
            activeMainTab === "settings"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Settings size={15} />
          <span>Pengaturan Tampilan Widget</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HASIL & ANALITIK SURVEY */}
      {/* ========================================================================= */}
      {activeMainTab === "responses" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: "Total Responden", value: summary.total, sub: "Semua waktu",
                icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10"
              },
              {
                label: "Rating Rata-Rata", value: `${summary.avgRating} / 5.0`,
                sub: <StarDisplay rating={Math.round(summary.avgRating)} size={12} />,
                icon: Star, color: "text-amber-500", bg: "bg-amber-500/10"
              },
              {
                label: "Puas & Sangat Puas",
                value: summary.total > 0
                  ? `${Math.round(((summary.distribution[5] || 0) + (summary.distribution[4] || 0)) / summary.total * 100)}%`
                  : "0%",
                sub: `${(summary.distribution[5] || 0) + (summary.distribution[4] || 0)} responden`,
                icon: TrendingUp, color: "text-teal-500", bg: "bg-teal-500/10"
              },
              {
                label: "Kritik / Kurang Puas",
                value: summary.total > 0
                  ? `${Math.round(((summary.distribution[1] || 0) + (summary.distribution[2] || 0)) / summary.total * 100)}%`
                  : "0%",
                sub: `${(summary.distribution[1] || 0) + (summary.distribution[2] || 0)} responden (Rating 1-2)`,
                icon: MessageSquare, color: "text-rose-500", bg: "bg-rose-500/10"
              },
            ].map((c, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <c.icon className={`w-6 h-6 ${c.color}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">{c.label}</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">{c.value}</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Rating Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">Distribusi Bintang</h3>
            <div className="flex flex-col gap-2.5 max-w-xl">
              {STARS.map(star => {
                const count = summary.distribution[star] || 0;
                const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 w-14 font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                      {star} <Star size={12} className="text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${STAR_COLORS[star]} rounded-full transition-all duration-500`}
                        style={{ width: `${(count / maxDist) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-slate-500 dark:text-slate-400 text-[11px] flex-shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <Filter size={13} /> Filter:
              </div>

              <select
                value={filterRating}
                onChange={e => setFilterRating(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Rating</option>
                {[5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>{r} Bintang</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Kategori</option>
                {(categories || []).map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterPeriod}
                onChange={e => setFilterPeriod(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Waktu</option>
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
              </select>

              {(filterRating || filterCategory || filterPeriod) && (
                <button
                  onClick={() => { setFilterRating(""); setFilterCategory(""); setFilterPeriod(""); }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="relative min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari ulasan / komentar..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Responses Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Data Respons Survey</h3>
              <span className="text-xs text-slate-400 font-medium">Menampilkan {paginatedResponses.length} dari {filteredResponses.length} respons</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-500" /> Memuat data survey...
              </div>
            ) : paginatedResponses.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <span className="text-sm font-semibold">Belum ada respons survey yang sesuai kriteria filter.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Waktu</th>
                      <th className="px-6 py-3.5">Rating</th>
                      <th className="px-6 py-3.5">Kategori</th>
                      <th className="px-6 py-3.5">Komentar / Saran</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                    {paginatedResponses.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-[11px] font-mono">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StarDisplay rating={r.rating} size={13} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            {r.category || "Umum"}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          {r.comment ? (
                            <p className="line-clamp-2 text-slate-800 dark:text-slate-200">{r.comment}</p>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Tanpa komentar</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg transition"
                            title="Hapus respons ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Halaman {page} dari {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KELOLA KATEGORI LAYANAN SURVEY (CRUD) */}
      {/* ========================================================================= */}
      {activeMainTab === "categories" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Daftar Kategori Layanan Survey
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Kategori yang berstatus aktif akan langsung muncul di pilihan dropdown SurveyWidget pada halaman utama.
              </p>
            </div>
            <button
              onClick={() => {
                setCategoryForm({ id: null, name: "", active: true });
                setCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus size={15} /> Tambah Kategori Baru
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {loadingCategories ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-500" /> Memuat kategori...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Tag size={32} className="mx-auto mb-3 opacity-30" />
                <span className="text-sm font-semibold">Belum ada kategori survey. Silakan tambah kategori pertama Anda.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Nama Kategori Layanan</th>
                      <th className="px-6 py-3.5">Status di Form</th>
                      <th className="px-6 py-3.5">Jumlah Respon Masuk</th>
                      <th className="px-6 py-3.5">Tanggal Dibuat</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                    {categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {cat.name}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryActive(cat)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                              cat.active
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700"
                            }`}
                            title="Klik untuk mengubah status aktif"
                          >
                            {cat.active ? "Aktif (Tampil)" : "Nonaktif (Sembunyi)"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 dark:text-white">{cat.responses_count || 0}</span> ulasan
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                          {cat.created_at || "-"}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setCategoryForm({ id: cat.id, name: cat.name, active: cat.active });
                                setCategoryModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 rounded-lg transition"
                              title="Edit Nama Kategori"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg transition"
                              title="Hapus Kategori"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PENGATURAN TAMPILAN WIDGET (LIVE CUSTOMIZER) */}
      {/* ========================================================================= */}
      {activeMainTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          {/* Form Settings (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 rounded-2xl shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Kustomisasi Survey Widget
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur judul, gambar QR Code, dan teks tampilan yang tampil di beranda
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Widget Aktif:</span>
                <input
                  type="checkbox"
                  checked={settings.is_active}
                  onChange={e => setSettings(s => ({ ...s, is_active: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {settingsSavedAlert && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <Check size={16} className="text-emerald-600" />
                <span>Pengaturan Survey Widget berhasil disimpan dan langsung aktif di halaman depan!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-5 text-xs font-semibold">
              {/* Widget Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300">Judul Utama Widget</label>
                <input
                  type="text"
                  required
                  value={settings.title || ""}
                  onChange={e => setSettings(s => ({ ...s, title: e.target.value }))}
                  placeholder="Survey Kepuasan Masyarakat"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Subtitle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300">Subjudul / Deskripsi Petunjuk</label>
                <textarea
                  rows={2}
                  value={settings.subtitle || ""}
                  onChange={e => setSettings(s => ({ ...s, subtitle: e.target.value }))}
                  placeholder="Bantu kami meningkatkan pelayanan publik dengan memberikan penilaian Anda."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium resize-none"
                />
              </div>

              {/* QR Code Upload & Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode size={16} className="text-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Pengaturan QR Code Mobile</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-bold text-slate-500">Tampilkan QR Code</span>
                    <input
                      type="checkbox"
                      checked={settings.show_qr}
                      onChange={e => setSettings(s => ({ ...s, show_qr: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </label>
                </div>

                {settings.show_qr && (
                  <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                    {/* QR Image Box */}
                    <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center p-1 bg-white dark:bg-slate-900 flex-shrink-0 relative group">
                      {qrPreview ? (
                        <img src={qrPreview} alt="Preview QR" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <QrCode size={32} className="text-slate-300" />
                      )}
                    </div>

                    <div className="flex flex-col gap-2.5 flex-1">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-bold">
                          Upload Gambar QR Code Baru (PNG, JPG, SVG)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrFileChange}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-bold">
                          Tautan Eksternal QR Code (Opsional)
                        </label>
                        <input
                          type="url"
                          value={settings.qr_link || ""}
                          onChange={e => setSettings(s => ({ ...s, qr_link: e.target.value }))}
                          placeholder="https://forms.gle/... atau link SKM"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {settings.show_qr && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-slate-600 dark:text-slate-400 text-[11px] font-bold">Teks Petunjuk di Bawah QR</label>
                    <input
                      type="text"
                      value={settings.qr_caption || ""}
                      onChange={e => setSettings(s => ({ ...s, qr_caption: e.target.value }))}
                      placeholder="📱 Scan QR untuk mengisi survey via ponsel"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Thank you message settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Judul Ucapan Terima Kasih</label>
                  <input
                    type="text"
                    value={settings.thank_you_title || ""}
                    onChange={e => setSettings(s => ({ ...s, thank_you_title: e.target.value }))}
                    placeholder="Terima Kasih!"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Teks Pembatas Divider</label>
                  <input
                    type="text"
                    value={settings.divider_text || ""}
                    onChange={e => setSettings(s => ({ ...s, divider_text: e.target.value }))}
                    placeholder="atau isi di sini"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300">Pesan Ucapan Terima Kasih</label>
                <textarea
                  rows={2}
                  value={settings.thank_you_message || ""}
                  onChange={e => setSettings(s => ({ ...s, thank_you_message: e.target.value }))}
                  placeholder="Umpan balik Anda telah kami terima..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="mt-2 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {savingSettings ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>{savingSettings ? "Menyimpan..." : "Simpan Pengaturan Survey Widget"}</span>
              </button>
            </form>
          </div>

          {/* Live Preview Box (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Eye size={14} className="text-emerald-500" />
              <span>Pratinjau Langsung (Live Preview)</span>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl pointer-events-none opacity-95">
              <div className="flex flex-col gap-1 mb-5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white tracking-wide">
                  {settings.title || "Survey Kepuasan Masyarakat"}
                </h3>
                {settings.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {settings.subtitle}
                  </p>
                )}
              </div>

              {/* QR Code Preview */}
              {settings.show_qr && (
                <>
                  <div className="flex flex-col items-center gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <img
                      src={qrPreview || "/images/survey-qr.png"}
                      alt="Preview QR"
                      className="w-28 h-28 object-contain rounded-lg"
                    />
                    {settings.qr_caption && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium leading-relaxed whitespace-pre-line">
                        {settings.qr_caption}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">
                      {settings.divider_text || "atau isi di sini"}
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Bagaimana kualitas layanan kami?</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={22} className={star <= 4 ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-700 dark:text-slate-300">Kategori Pelayanan</label>
                  <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 text-xs">
                    {categories.length > 0 ? categories[0].name : "Layanan Informasi"}
                  </div>
                </div>

                <div className="mt-2 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl text-center shadow-md">
                  Kirim Umpan Balik
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium text-center">
              *Tampilan di atas merupakan simulasi persis komponen di halaman beranda publik.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT KATEGORI */}
      {/* ========================================================================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                {categoryForm.id ? "Edit Kategori Layanan" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300">Nama Kategori Layanan</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Contoh: Layanan Konsultasi Domain"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={categoryForm.active}
                  onChange={e => setCategoryForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="cat-active" className="text-slate-700 dark:text-slate-300 cursor-pointer font-bold">
                  Aktifkan Kategori (Tampilkan di Form Publik)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {savingCategory && <RefreshCw size={13} className="animate-spin" />}
                  <span>Simpan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
