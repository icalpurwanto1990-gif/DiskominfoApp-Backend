import React, { useState, useRef, useCallback } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, MapPin, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Download, ChevronDown, ChevronUp, Eye, RefreshCw } from "lucide-react";

// ─── SheetJS loader (CDN dinamis, tidak perlu install package) ────────────────
let xlsxLib = null;
function loadXlsx() {
  return new Promise((resolve, reject) => {
    if (xlsxLib) return resolve(xlsxLib);
    if (window.XLSX) { xlsxLib = window.XLSX; return resolve(xlsxLib); }
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    script.onload = () => { xlsxLib = window.XLSX; resolve(xlsxLib); };
    script.onerror = () => reject(new Error("Gagal memuat library Excel (SheetJS). Periksa koneksi internet."));
    document.head.appendChild(script);
  });
}

// ─── Validasi & normalisasi tipe infrastruktur ────────────────────────────────
const VALID_TYPES = ["BTS_TOWER", "BLANKSPOT", "VSAT", "FIBER_OPTIK"];
const TYPE_ALIASES = {
  bts: "BTS_TOWER", "bts tower": "BTS_TOWER", "bts_tower": "BTS_TOWER", menara: "BTS_TOWER",
  blankspot: "BLANKSPOT", "blank spot": "BLANKSPOT", "no signal": "BLANKSPOT",
  vsat: "VSAT", satelit: "VSAT", satellite: "VSAT",
  "fiber optik": "FIBER_OPTIK", "fiber_optik": "FIBER_OPTIK", fiber: "FIBER_OPTIK", fo: "FIBER_OPTIK",
};
function normalizeType(raw) {
  if (!raw) return null;
  const key = String(raw).toLowerCase().trim();
  if (TYPE_ALIASES[key]) return TYPE_ALIASES[key];
  const upper = key.toUpperCase();
  if (VALID_TYPES.includes(upper)) return upper;
  return null;
}

// ─── Warna badge tipe ─────────────────────────────────────────────────────────
const typeBadge = {
  BTS_TOWER:   "bg-blue-500/10 text-blue-600",
  VSAT:        "bg-purple-500/10 text-purple-600",
  FIBER_OPTIK: "bg-amber-500/10 text-amber-700",
  BLANKSPOT:   "bg-red-500/10 text-red-600",
};

// ─── Download template Excel ──────────────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await loadXlsx();
  const ws = XLSX.utils.aoa_to_sheet([
    ["name", "type", "latitude", "longitude", "status", "description"],
    ["BTS Menara Salakan", "BTS_TOWER", -1.3597, 123.5671, "AKTIF", "Operator Telkomsel, tinggi 42m"],
    ["VSAT Desa Tatakalai", "VSAT", -1.4123, 123.6012, "AKTIF", ""],
    ["Blankspot Kec. Bulagi", "BLANKSPOT", -1.5001, 123.4801, "BERMASALAH", "Area tanpa sinyal"],
    ["Fiber Optik Jl. Poros", "FIBER_OPTIK", -1.3421, 123.5500, "NORMAL", "Kabel tanah 1.2km"],
  ]);
  // Set column widths
  ws["!cols"] = [{ wch: 35 }, { wch: 14 }, { wch: 12 }, { wch: 13 }, { wch: 12 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "GIS Import");
  XLSX.writeFile(wb, "template_import_gis.xlsx");
}

export default function Gis({ infrastructures: initialInfras }) {
  const [infras, setInfras] = useState(initialInfras || []);

  // ── Form modal state ──────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInfra, setEditingInfra] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("BTS_TOWER");
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [status, setStatus] = useState("AKTIF");
  const [detailDesc, setDetailDesc] = useState("");

  // ── Import Excel state ────────────────────────────────────────────────────
  const [importModal, setImportModal] = useState(false);
  const [importStep, setImportStep] = useState("upload"); // upload | preview | result
  const [isDragging, setIsDragging] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [previewRows, setPreviewRows] = useState([]);       // parsed valid rows
  const [previewErrors, setPreviewErrors] = useState([]);   // per-row parse errors
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // ── Form open/close ───────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingInfra(null);
    setName(""); setType("BTS_TOWER"); setLatitude(-1.3);
    setLongitude(123.1); setStatus("AKTIF"); setDetailDesc("");
    setModalOpen(true);
  };
  const openEditModal = (infra) => {
    setEditingInfra(infra);
    setName(infra.name); setType(infra.type);
    setLatitude(infra.latitude); setLongitude(infra.longitude);
    setStatus(infra.status); setDetailDesc(infra.details?.description || "");
    setModalOpen(true);
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !latitude || !longitude) { alert("Nama, latitude, dan longitude wajib diisi."); return; }
    const payload = {
      id: editingInfra ? editingInfra.id : null,
      name, type, latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      status, details: { description: detailDesc }
    };
    try {
      const res = await fetch("/api/admin/gis", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Titik infrastruktur geospasial berhasil disimpan!");
        if (editingInfra) setInfras(infras.map(i => i.id === data.gisInfrastructure.id ? data.gisInfrastructure : i));
        else setInfras([data.gisInfrastructure, ...infras]);
        setModalOpen(false);
      } else alert(data.error || "Gagal menyimpan data.");
    } catch (err) { console.error(err); alert("Terjadi kesalahan jaringan."); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus titik koordinat ini?")) return;
    try {
      const res = await fetch(`/api/admin/gis/${id}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }
      });
      if (res.ok) { setInfras(infras.filter(i => i.id !== id)); alert("Titik koordinat berhasil dihapus."); }
    } catch (e) { console.error(e); }
  };

  // ── Excel parsing ─────────────────────────────────────────────────────────
  const parseExcelFile = useCallback(async (file) => {
    setImportLoading(true);
    setImportProgress(10);
    try {
      const XLSX = await loadXlsx();
      setImportProgress(30);
      const buffer = await file.arrayBuffer();
      setImportProgress(55);
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
      setImportProgress(75);

      const validRows = [];
      const errRows = [];

      raw.forEach((r, idx) => {
        const rowNum = idx + 2;
        const rowErrors = [];

        // Name
        const name = String(r["name"] || r["Nama"] || r["nama"] || "").trim();
        if (!name) rowErrors.push("Kolom 'name' kosong");

        // Type
        const rawType = r["type"] || r["Type"] || r["Tipe"] || r["tipe"] || "";
        const type = normalizeType(rawType);
        if (!type) rowErrors.push(`Tipe '${rawType}' tidak valid (gunakan: BTS_TOWER, VSAT, FIBER_OPTIK, BLANKSPOT)`);

        // Lat / Lng
        const lat = parseFloat(r["latitude"] || r["Latitude"] || r["lat"] || r["Lat"] || "");
        const lng = parseFloat(r["longitude"] || r["Longitude"] || r["lng"] || r["Lng"] || "");
        if (isNaN(lat) || lat < -90 || lat > 90) rowErrors.push("Latitude tidak valid (antara -90 dan 90)");
        if (isNaN(lng) || lng < -180 || lng > 180) rowErrors.push("Longitude tidak valid (antara -180 dan 180)");

        const status = String(r["status"] || r["Status"] || "AKTIF").toUpperCase().trim() || "AKTIF";
        const description = String(r["description"] || r["Description"] || r["deskripsi"] || r["Deskripsi"] || "").trim();

        if (rowErrors.length > 0) {
          errRows.push({ row: rowNum, name: name || `(Baris ${rowNum})`, errors: rowErrors });
        } else {
          validRows.push({ name, type, latitude: lat, longitude: lng, status, description });
        }
      });

      setImportProgress(100);
      setPreviewRows(validRows);
      setPreviewErrors(errRows);
      setFileName(file.name);
      setImportStep("preview");
    } catch (err) {
      alert("Gagal membaca file Excel: " + err.message);
    } finally {
      setImportLoading(false);
      setImportProgress(0);
    }
  }, []);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) { alert("Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv"); return; }
    parseExcelFile(file);
  }, [parseExcelFile]);

  // ── Confirm import to server ──────────────────────────────────────────────
  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return;
    setImportLoading(true);
    try {
      const res = await fetch("/api/admin/gis-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({ rows: previewRows })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult(data);
        setImportStep("result");
        // Re-fetch list
        const listRes = await fetch("/api/admin/gis");
        if (listRes.ok) { const listData = await listRes.json(); setInfras(listData); }
      } else {
        alert("Import gagal: " + (data.error || "Kesalahan tidak diketahui."));
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan: " + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // ── Reset import flow ─────────────────────────────────────────────────────
  const resetImport = () => {
    setImportStep("upload"); setPreviewRows([]); setPreviewErrors([]);
    setFileName(""); setImportResult(null); setShowErrorLog(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeImportModal = () => { setImportModal(false); setTimeout(resetImport, 300); };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Pengelolaan Peta Sebaran GIS
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Tambah dan kelola sebaran menara BTS, VSAT, serat optik, dan blankspot daerah
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/10"
          >
            <FileSpreadsheet size={14} />
            <span>Import Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
          >
            <Plus size={14} />
            <span>Tambah Titik</span>
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {[
          { label: "BTS Tower", type: "BTS_TOWER", color: "blue" },
          { label: "VSAT", type: "VSAT", color: "purple" },
          { label: "Fiber Optik", type: "FIBER_OPTIK", color: "amber" },
          { label: "Blankspot", type: "BLANKSPOT", color: "red" },
        ].map(({ label, type: t, color }) => {
          const count = infras.filter(i => i.type === t).length;
          return (
            <div key={t} className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-1`}>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider text-${color}-600`}>{label}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{count}</span>
              <span className="text-[10px] text-slate-400 font-semibold">dari {infras.length} total titik</span>
            </div>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                <th className="p-4">Nama Infrastruktur / Lokasi</th>
                <th className="p-4">Tipe Jaringan</th>
                <th className="p-4">Latitude</th>
                <th className="p-4">Longitude</th>
                <th className="p-4 w-28">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {infras.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-450">
                    Belum ada titik infrastruktur GIS. Tambahkan manual atau impor dari Excel.
                  </td>
                </tr>
              ) : (
                infras.map((infra) => (
                  <tr key={infra.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white block">{infra.name}</span>
                          {infra.details?.description && (
                            <span className="text-[10px] text-slate-400 font-medium">{infra.details.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider rounded ${typeBadge[infra.type] || "bg-slate-100 text-slate-600"}`}>
                        {infra.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{infra.latitude}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{infra.longitude}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                        infra.status === "AKTIF" || infra.status === "NORMAL"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-red-500/10 text-red-650"
                      }`}>
                        {infra.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(infra)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg text-slate-655 dark:text-slate-300"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(infra.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-650 hover:text-white rounded-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MODAL: ADD / EDIT GIS
      ═══════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col gap-5 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingInfra ? "Edit Titik Koordinat" : "Tambah Titik Koordinat Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nama Infrastruktur / Lokasi</label>
                <input type="text" required placeholder="Contoh: BTS Menara Salakan..."
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Tipe Infrastruktur</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white">
                  <option value="BTS_TOWER">BTS Menara Seluler (Tower)</option>
                  <option value="VSAT">VSAT Jaringan Satelit</option>
                  <option value="FIBER_OPTIK">Fiber Optik (Kabel Tanah)</option>
                  <option value="BLANKSPOT">Blankspot Area (No Signal)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Latitude (Lintang)</label>
                  <input type="number" step="0.000001" required value={latitude} onChange={(e) => setLatitude(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Longitude (Bujur)</label>
                  <input type="number" step="0.000001" required value={longitude} onChange={(e) => setLongitude(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Status Operasional</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white">
                  <option value="AKTIF">AKTIF</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="BERMASALAH">BERMASALAH</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Detail Spesifikasi (Opsional)</label>
                <textarea rows={2} placeholder="Contoh: Operator Telkomsel, XL, Tinggi Menara 42 meter..."
                  value={detailDesc} onChange={(e) => setDetailDesc(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none" />
              </div>
              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <Save size={14} />
                <span>Simpan Titik GIS</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: IMPORT EXCEL
      ═══════════════════════════════════════════════════ */}
      {importModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col relative overflow-hidden max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Import Data GIS dari Excel</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {importStep === "upload" && "Upload file .xlsx / .xls / .csv"}
                    {importStep === "preview" && `File: ${fileName} — ${previewRows.length} baris valid ditemukan`}
                    {importStep === "result" && "Import selesai"}
                  </p>
                </div>
              </div>
              <button onClick={closeImportModal} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex px-6 py-3 gap-2 shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              {[{ id: "upload", label: "1. Upload File" }, { id: "preview", label: "2. Preview Data" }, { id: "result", label: "3. Selesai" }].map((step) => (
                <div key={step.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  importStep === step.id
                    ? "bg-blue-600 text-white"
                    : (importStep === "result" || (importStep === "preview" && step.id === "upload") || (importStep === "result" && step.id !== "result"))
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}>
                  {step.label}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">

              {/* ── Step 1: Upload ── */}
              {importStep === "upload" && (
                <div className="flex flex-col gap-5">
                  {/* Drag & drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileDrop} />
                    {importLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                        </div>
                        <p className="text-xs font-semibold text-slate-500">Memproses file... {importProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
                          <Upload size={28} />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Seret & lepas file Excel di sini</p>
                          <p className="text-xs text-slate-400 mt-1">atau klik untuk memilih file (.xlsx, .xls, .csv)</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                          Maks. 2000 baris data
                        </span>
                      </>
                    )}
                  </div>

                  {/* Format guide */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Format Kolom yang Dibutuhkan</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] font-semibold">
                        <thead>
                          <tr className="text-blue-600 dark:text-blue-400">
                            {["name *", "type *", "latitude *", "longitude *", "status", "description"].map(h => (
                              <th key={h} className="text-left pb-1 pr-4">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-slate-500 dark:text-slate-400">
                            <td className="pr-4 pb-0.5">BTS Menara Salakan</td>
                            <td className="pr-4 pb-0.5">BTS_TOWER</td>
                            <td className="pr-4 pb-0.5 font-mono">-1.3597</td>
                            <td className="pr-4 pb-0.5 font-mono">123.5671</td>
                            <td className="pr-4 pb-0.5">AKTIF</td>
                            <td className="pr-4 pb-0.5">Tinggi 42m</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      Tipe valid: <strong>BTS_TOWER</strong> | <strong>VSAT</strong> | <strong>FIBER_OPTIK</strong> | <strong>BLANKSPOT</strong>
                    </p>
                  </div>

                  {/* Download template */}
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Download size={14} />
                    Download Template Excel
                  </button>
                </div>
              )}

              {/* ── Step 2: Preview ── */}
              {importStep === "preview" && (
                <div className="flex flex-col gap-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-emerald-600">{previewRows.length}</div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Baris Valid</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-red-600">{previewErrors.length}</div>
                      <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Baris Error</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-slate-700 dark:text-slate-200">{previewRows.length + previewErrors.length}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Baris</div>
                    </div>
                  </div>

                  {/* Error log */}
                  {previewErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setShowErrorLog(!showErrorLog)}
                        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-red-700 dark:text-red-400"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} />
                          {previewErrors.length} baris akan dilewati karena ada kesalahan
                        </div>
                        {showErrorLog ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {showErrorLog && (
                        <div className="px-4 pb-4 flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                          {previewErrors.map((e, i) => (
                            <div key={i} className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                              <span className="font-black">Baris {e.row} ({e.name}):</span> {e.errors.join("; ")}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview table */}
                  {previewRows.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-950/30 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Preview Data yang Akan Diimpor</span>
                      </div>
                      <div className="overflow-x-auto max-h-56">
                        <table className="w-full text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          <thead className="sticky top-0 bg-white dark:bg-slate-900">
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wider text-slate-400">
                              <th className="p-2.5 text-left">#</th>
                              <th className="p-2.5 text-left">Nama</th>
                              <th className="p-2.5 text-left">Tipe</th>
                              <th className="p-2.5 text-left">Lat</th>
                              <th className="p-2.5 text-left">Lng</th>
                              <th className="p-2.5 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-100 dark:border-slate-850">
                                <td className="p-2.5 text-slate-400">{idx + 1}</td>
                                <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.name}</td>
                                <td className="p-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${typeBadge[row.type] || ""}`}>{row.type}</span>
                                </td>
                                <td className="p-2.5 font-mono">{row.latitude}</td>
                                <td className="p-2.5 font-mono">{row.longitude}</td>
                                <td className="p-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${row.status === "AKTIF" || row.status === "NORMAL" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-red-200 dark:border-red-800/40 rounded-2xl p-8 text-center">
                      <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
                      <p className="text-sm font-bold text-red-600">Tidak ada data valid yang bisa diimpor.</p>
                      <p className="text-xs text-slate-400 mt-1">Periksa format kolom dan perbaiki file Excel Anda.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Result ── */}
              {importStep === "result" && importResult && (
                <div className="flex flex-col items-center gap-5 py-4">
                  <div className="p-5 bg-emerald-500/10 text-emerald-600 rounded-full">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{importResult.message}</h4>
                    <p className="text-xs text-slate-400 mt-1">Data GIS telah berhasil ditambahkan ke database.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-emerald-600">{importResult.inserted}</div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Berhasil</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/60 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-slate-500">{importResult.skipped}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dilewati</div>
                    </div>
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5">Error Detail:</p>
                      {importResult.errors.map((e, i) => <p key={i} className="text-[10px] text-red-500">{e}</p>)}
                    </div>
                  )}
                  <button
                    onClick={resetImport}
                    className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <RefreshCw size={13} />
                    Import File Lain
                  </button>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {importStep === "preview" && (
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <button
                  onClick={resetImport}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <RefreshCw size={12} />
                  Ganti File
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={previewRows.length === 0 || importLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {importLoading ? (
                    <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />Menyimpan...</>
                  ) : (
                    <><Upload size={13} />Konfirmasi Import {previewRows.length} Titik</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
