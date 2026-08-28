import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  BarChart3, TrendingUp, ShieldCheck, Users, Cpu, Database,
  Globe, Server, FileText, Map, Award, Target, Activity,
  Zap, Star, BookOpen, CheckSquare,
  Plus, Pencil, Trash2, Eye, EyeOff, Save, X,
  GripVertical, ArrowUp, ArrowDown, RefreshCw, AlertCircle
} from "lucide-react";

// ──────────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────────

const AVAILABLE_ICONS = [
  { name: "BarChart3",   label: "Bar Chart",        Icon: BarChart3 },
  { name: "TrendingUp",  label: "Trending Up",       Icon: TrendingUp },
  { name: "ShieldCheck", label: "Shield Check",      Icon: ShieldCheck },
  { name: "Users",       label: "Users",             Icon: Users },
  { name: "Cpu",         label: "CPU / App",         Icon: Cpu },
  { name: "Database",    label: "Database",          Icon: Database },
  { name: "Globe",       label: "Globe",             Icon: Globe },
  { name: "Server",      label: "Server",            Icon: Server },
  { name: "FileText",    label: "File / Dokumen",    Icon: FileText },
  { name: "Map",         label: "Map / GIS",         Icon: Map },
  { name: "Award",       label: "Award / Indeks",    Icon: Award },
  { name: "Target",      label: "Target / Capaian",  Icon: Target },
  { name: "Activity",    label: "Aktivitas",         Icon: Activity },
  { name: "Zap",         label: "Kecepatan",         Icon: Zap },
  { name: "Star",        label: "Bintang",           Icon: Star },
  { name: "BookOpen",    label: "Dokumen / Regulasi",Icon: BookOpen },
  { name: "CheckSquare", label: "Check / Status",   Icon: CheckSquare },
];

const AVAILABLE_COLORS = [
  { key: "emerald", label: "Hijau (Emerald)", hex: "#10b981" },
  { key: "blue",    label: "Biru",            hex: "#3b82f6" },
  { key: "purple",  label: "Ungu",            hex: "#a855f7" },
  { key: "amber",   label: "Amber / Kuning",  hex: "#f59e0b" },
  { key: "red",     label: "Merah",           hex: "#ef4444" },
  { key: "indigo",  label: "Indigo",          hex: "#6366f1" },
  { key: "teal",    label: "Teal",            hex: "#14b8a6" },
  { key: "rose",    label: "Rose / Pink",     hex: "#f43f5e" },
];

const COLOR_CLASSES = {
  emerald: { card: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20", icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" },
  blue:    { card: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",             icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",         badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" },
  purple:  { card: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20",     icon: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400" },
  amber:   { card: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",         icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",     badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" },
  red:     { card: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",                 icon: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",             badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400" },
  indigo:  { card: "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20",     icon: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400" },
  teal:    { card: "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/20",             icon: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400",         badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400" },
  rose:    { card: "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20",             icon: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",         badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400" },
};

const getColorClasses = (colorKey) => COLOR_CLASSES[colorKey] || COLOR_CLASSES.emerald;

const ICON_MAP = Object.fromEntries(AVAILABLE_ICONS.map(({ name, Icon }) => [name, Icon]));
const getIcon  = (name) => ICON_MAP[name] || BarChart3;

// ──────────────────────────────────────────────────
// EMPTY FORM STATE
// ──────────────────────────────────────────────────

const emptyForm = () => ({
  id:           null,
  key:          "",
  value:        "",
  label:        "",
  suffix:       "",
  desc:         "",
  icon:         "BarChart3",
  color:        "emerald",
  is_published: true,
  order_index:  0,
});

// ──────────────────────────────────────────────────
// PREVIEW CARD (mirrors StatCard in Home.jsx)
// ──────────────────────────────────────────────────

function PreviewCard({ form }) {
  const cc  = getColorClasses(form.color);
  const Icon = getIcon(form.icon);
  const display = `${form.value || "—"}${form.suffix || ""}`;

  return (
    <div className={`relative p-5 border rounded-2xl flex flex-col gap-3 shadow-sm overflow-hidden ${cc.card}`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-current rounded-bl-[50px] opacity-10" />
      <div className={`p-2.5 w-fit rounded-xl ${cc.icon}`}>
        <Icon size={18} />
      </div>
      <div className="flex flex-col gap-0.5 relative z-10">
        <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
          {display}
        </span>
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 mt-1">
          {form.label || "Nama Indeks"}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          {form.desc || "Deskripsi singkat"}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────

export default function Statistics() {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm());

  // ── Helpers ──────────────────────────────────────
  const getHeaders = () => {
    try {
      const s = JSON.parse(localStorage.getItem("adminSession") || "{}");
      return {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || "",
        "X-Admin-Name": s.name  || "Administrator",
        "X-Admin-Role": s.role  || "ADMIN",
      };
    } catch {
      return { "Content-Type": "application/json" };
    }
  };

  const flash = (type, msg) => {
    if (type === "success") { setSuccess(msg); setError(""); }
    else                    { setError(msg);   setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  // ── Fetch ─────────────────────────────────────────
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/statistics", { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setStatistics(data.statistics || []);
      } else {
        flash("error", data.error || "Gagal memuat data.");
      }
    } catch (e) {
      flash("error", "Koneksi gagal. Periksa jaringan Anda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatistics(); }, [fetchStatistics]);

  // ── Open Modal ────────────────────────────────────
  const openCreate = () => {
    setForm({ ...emptyForm(), order_index: statistics.length + 1 });
    setShowModal(true);
  };

  const openEdit = (stat) => {
    setForm({
      id:           stat.id,
      key:          stat.key          || "",
      value:        stat.value        || "",
      label:        stat.label        || "",
      suffix:       stat.suffix       || "",
      desc:         stat.desc         || "",
      icon:         stat.icon         || "BarChart3",
      color:        stat.color        || "emerald",
      is_published: !!stat.is_published,
      order_index:  stat.order_index  ?? 0,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setForm(emptyForm()); };

  // ── Save ──────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.value.trim() || !form.key.trim()) {
      flash("error", "Nama Indeks, Kunci, dan Nilai wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/statistics", {
        method:  "POST",
        headers: getHeaders(),
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        flash("success", form.id ? "Statistik berhasil diperbarui!" : "Statistik baru berhasil ditambahkan!");
        closeModal();
        fetchStatistics();
      } else {
        const errMsg = typeof data.error === "object"
          ? Object.values(data.error).flat().join(" ")
          : (data.error || "Gagal menyimpan.");
        flash("error", errMsg);
      }
    } catch {
      flash("error", "Koneksi gagal saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────
  const handleDelete = async (stat) => {
    if (!confirm(`Hapus statistik "${stat.label}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(stat.id);
    try {
      const res  = await fetch(`/api/admin/statistics/${stat.id}`, {
        method:  "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        flash("success", `Statistik "${stat.label}" berhasil dihapus.`);
        fetchStatistics();
      } else {
        flash("error", data.error || "Gagal menghapus.");
      }
    } catch {
      flash("error", "Koneksi gagal saat menghapus.");
    } finally {
      setDeleting(null);
    }
  };

  // ── Quick Toggle Publish ───────────────────────────
  const handleTogglePublish = async (stat) => {
    const updated = { ...stat, is_published: !stat.is_published };
    try {
      const res  = await fetch("/api/admin/statistics", {
        method:  "POST",
        headers: getHeaders(),
        body:    JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setStatistics((prev) =>
          prev.map((s) => (s.id === stat.id ? { ...s, is_published: !s.is_published } : s))
        );
      }
    } catch { /* silent */ }
  };

  // ── Move Order ────────────────────────────────────
  const handleMoveOrder = async (stat, direction) => {
    const idx        = statistics.findIndex((s) => s.id === stat.id);
    const targetIdx  = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= statistics.length) return;

    const reordered = [...statistics];
    const [moved]   = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Update order_index values
    const updatedList = reordered.map((s, i) => ({ ...s, order_index: i + 1 }));
    setStatistics(updatedList);

    // Persist both affected rows
    await Promise.all([
      fetch("/api/admin/statistics", {
        method: "POST", headers: getHeaders(),
        body: JSON.stringify(updatedList[targetIdx]),
      }),
      fetch("/api/admin/statistics", {
        method: "POST", headers: getHeaders(),
        body: JSON.stringify(updatedList[idx]),
      }),
    ]);
  };

  // ──────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────

  const published = statistics.filter((s) => s.is_published).length;

  return (
    <AdminLayout>
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Kelola Statistik Realtime</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Atur indeks kinerja yang tampil di halaman beranda publik
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStatistics}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
          >
            <Plus size={16} />
            Tambah Statistik
          </button>
        </div>
      </div>

      {/* ── Flash Messages ── */}
      {success && (
        <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
          <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Statistik",    value: statistics.length, icon: BarChart3,   color: "text-emerald-600" },
          { label: "Tampil di Beranda",  value: published,         icon: Eye,         color: "text-blue-600" },
          { label: "Disembunyikan",      value: statistics.length - published, icon: EyeOff, color: "text-slate-500" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
              <div className="text-[11px] text-slate-400 font-semibold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Statistics Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <RefreshCw size={22} className="animate-spin mr-3" />
          <span className="text-sm font-medium">Memuat data statistik…</span>
        </div>
      ) : statistics.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <BarChart3 size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-base font-bold text-slate-500 dark:text-slate-400">Belum Ada Statistik</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-6">Tambahkan indeks kinerja pertama Anda</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition">
            <Plus size={16} /> Tambah Statistik
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 w-16">Urutan</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3.5">Indeks / Statistik</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3.5">Nilai</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3.5 hidden md:table-cell">Kunci</th>
                  <th className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3.5">Status</th>
                  <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {statistics.map((stat, idx) => {
                  const cc   = getColorClasses(stat.color);
                  const Icon = getIcon(stat.icon);
                  return (
                    <tr key={stat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      {/* Order */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-slate-400 w-5 text-center">{stat.order_index}</span>
                          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleMoveOrder(stat, "up")} disabled={idx === 0} className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 transition">
                              <ArrowUp size={10} />
                            </button>
                            <button onClick={() => handleMoveOrder(stat, "down")} disabled={idx === statistics.length - 1} className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 transition">
                              <ArrowDown size={10} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Label + Icon */}
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${cc.icon}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{stat.label}</div>
                            {stat.desc && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.desc}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="px-3 py-4">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          {stat.value}{stat.suffix || ""}
                        </span>
                      </td>

                      {/* Key */}
                      <td className="px-3 py-4 hidden md:table-cell">
                        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md font-mono">{stat.key}</code>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(stat)}
                          title={stat.is_published ? "Klik untuk sembunyikan" : "Klik untuk publikasi"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                            stat.is_published
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {stat.is_published ? <><Eye size={10} /> Live</> : <><EyeOff size={10} /> Tersembunyi</>}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(stat)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(stat)}
                            disabled={deleting === stat.id}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                            title="Hapus"
                          >
                            {deleting === stat.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Preview Grid (published only) ── */}
      {statistics.filter(s => s.is_published).length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <Eye size={16} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Preview Tampilan Beranda</h2>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg font-bold">
              {statistics.filter(s => s.is_published).length} ditampilkan
            </span>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${
            statistics.filter(s => s.is_published).length <= 2 ? 'lg:grid-cols-2' :
            statistics.filter(s => s.is_published).length === 3 ? 'lg:grid-cols-3' :
            'lg:grid-cols-4'
          } gap-4`}>
            {statistics.filter(s => s.is_published).map((stat) => (
              <div key={stat.id} className="relative cursor-pointer" onClick={() => openEdit(stat)} title="Klik untuk edit">
                <PreviewCard form={stat} />
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-[9px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-500">Edit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
           MODAL — CREATE / EDIT
      ────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-10 pb-6 px-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {form.id ? "Edit Statistik" : "Tambah Statistik Baru"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  {form.id ? "Perbarui data indeks kinerja" : "Buat indeks kinerja baru untuk beranda"}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="px-7 py-6 flex flex-col gap-5">

                {/* Row: Label + Key */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Nama Indeks / Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Index Keterbukaan Informasi Publik"
                      value={form.label}
                      onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Kunci Unik (key) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: INDEX_KIP_2025"
                      value={form.key}
                      onChange={(e) => setForm((f) => ({ ...f, key: e.target.value.toUpperCase().replace(/\s+/g, "_") }))}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Hanya huruf kapital, angka, dan underscore</p>
                  </div>
                </div>

                {/* Row: Value + Suffix + Desc */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Nilai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 85.20 atau A atau Baik"
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Satuan / Suffix</label>
                    <input
                      type="text"
                      placeholder="%  atau  +  atau  /100"
                      value={form.suffix}
                      onChange={(e) => setForm((f) => ({ ...f, suffix: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Urutan</label>
                    <input
                      type="number"
                      min={0}
                      value={form.order_index}
                      onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Desc */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi Singkat</label>
                  <input
                    type="text"
                    placeholder="Contoh: Berdasarkan penilaian KIP Tahun 2025"
                    value={form.desc}
                    onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                {/* Row: Icon + Color + Publish */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Icon */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ikon</label>
                    <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-h-36 overflow-y-auto">
                      {AVAILABLE_ICONS.map(({ name, Icon }) => (
                        <button
                          key={name}
                          type="button"
                          title={name}
                          onClick={() => setForm((f) => ({ ...f, icon: name }))}
                          className={`p-2 rounded-lg flex items-center justify-center transition ${
                            form.icon === name
                              ? "bg-emerald-500 text-white shadow-md scale-110"
                              : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-600"
                          }`}
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Warna Tema</label>
                    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      {AVAILABLE_COLORS.map(({ key, label, hex }) => (
                        <button
                          key={key}
                          type="button"
                          title={label}
                          onClick={() => setForm((f) => ({ ...f, color: key }))}
                          className={`w-8 h-8 rounded-xl transition border-2 ${
                            form.color === key ? "scale-125 border-slate-700 dark:border-white shadow-lg" : "border-transparent hover:scale-110"
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Publish Toggle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Publikasi</label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-3 h-full justify-center">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition w-full justify-center ${
                          form.is_published
                            ? "bg-emerald-500 text-white shadow-md"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                        }`}
                      >
                        {form.is_published ? <><Eye size={13} /> Tampil di Beranda</> : <><EyeOff size={13} /> Disembunyikan</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={11} /> Preview Kartu
                  </label>
                  <div className="max-w-[240px]">
                    <PreviewCard form={form} />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-60"
                >
                  {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                  {form.id ? "Simpan Perubahan" : "Tambah Statistik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
