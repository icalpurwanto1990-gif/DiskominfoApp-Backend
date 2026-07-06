import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, Table, Eye, FileSpreadsheet } from "lucide-react";

export default function SatuData({ datasets: initialDatasets }) {
  const [datasets, setDatasets] = useState(initialDatasets || []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Layanan");
  const [produsen, setProdusen] = useState("Bidang Aptika Diskominfo");
  const [lisensi, setLisensi] = useState("Creative Commons Attribution");
  const [updateCycle, setUpdateCycle] = useState("Tahunan");
  const [fileUrl, setFileUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  // JSON Data Grid states
  const [gridRows, setGridRows] = useState([]);
  const [newRowKey, setNewRowKey] = useState("");
  const [newRowVal, setNewRowVal] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploadingFile(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFileUrl(data.url);
        alert("File dataset berhasil diunggah.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingFile(false);
    }
  };

  const openAddModal = () => {
    setEditingDataset(null);
    setTitle("");
    setDescription("");
    setCategory("Layanan");
    setProdusen("Bidang Aptika Diskominfo");
    setLisensi("Creative Commons Attribution");
    setUpdateCycle("Tahunan");
    setFileUrl("");
    setGridRows([
      { bulan: "Januari", pengajuan: 0, disetujui: 0 },
      { bulan: "Februari", pengajuan: 0, disetujui: 0 }
    ]);
    setModalOpen(true);
  };

  const openEditModal = (ds) => {
    setEditingDataset(ds);
    setTitle(ds.title);
    setDescription(ds.description);
    setCategory(ds.category);
    setProdusen(ds.metadata?.produsen || "Bidang Aptika Diskominfo");
    setLisensi(ds.metadata?.lisensi || "Creative Commons Attribution");
    setUpdateCycle(ds.metadata?.updateCycle || "Tahunan");
    setFileUrl(ds.fileUrl || "");
    setGridRows(ds.jsonData || []);
    setModalOpen(true);
  };

  const addGridRow = () => {
    setGridRows([...gridRows, { bulan: "Baru", pengajuan: 0, disetujui: 0 }]);
  };

  const removeGridRow = (idx) => {
    setGridRows(gridRows.filter((_, i) => i !== idx));
  };

  const updateRowField = (idx, field, val) => {
    const numVal = isNaN(val) ? val : parseInt(val, 10);
    setGridRows(gridRows.map((r, i) => i === idx ? { ...r, [field]: numVal } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Judul dan deskripsi dataset wajib diisi.");
      return;
    }

    const payload = {
      id: editingDataset ? editingDataset.id : null,
      title,
      description,
      category,
      metadata: {
        produsen,
        lisensi,
        updateCycle
      },
      fileUrl,
      jsonData: gridRows
    };

    try {
      const res = await fetch("/api/admin/datasets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Dataset berhasil disimpan!");
        if (editingDataset) {
          setDatasets(datasets.map(d => d.id === data.dataset.id ? data.dataset : d));
        } else {
          setDatasets([data.dataset, ...datasets]);
        }
        setModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dataset ini?")) return;
    try {
      const res = await fetch(`/api/admin/datasets/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        setDatasets(datasets.filter(d => d.id !== id));
        alert("Dataset berhasil dihapus.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      
      {/* Title */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Pengelolaan Data Sektoral (Open Data)
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Kelola dataset statistik sektoral daerah dan masukkan data baris (JSON Grid) secara langsung
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
        >
          <Plus size={14} />
          <span>Tambah Dataset</span>
        </button>
      </div>

      {/* Datasets Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                <th className="p-4">Judul Dataset Sektoral</th>
                <th className="p-4 w-40">Kategori</th>
                <th className="p-4 w-52">Produsen Data</th>
                <th className="p-4 w-28 text-center">Jumlah Baris</th>
                <th className="p-4 w-28 text-center">Downloads</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {datasets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-450">
                    Belum ada dataset terdaftar. Silakan buat baru.
                  </td>
                </tr>
              ) : (
                datasets.map((ds) => (
                  <tr key={ds.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-white line-clamp-1">{ds.title}</span>
                        <span className="text-[10px] text-slate-400 truncate">/{ds.slug}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-[9px] uppercase tracking-wider rounded">
                        {ds.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{ds.metadata?.produsen || "-"}</td>
                    <td className="p-4 text-center font-bold">{ds.jsonData ? ds.jsonData.length : 0}</td>
                    <td className="p-4 text-center font-bold">{ds.downloads || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a href="/satu-data" target="_blank" rel="noreferrer" className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg text-slate-500">
                          <Eye size={12} />
                        </a>
                        <button
                          onClick={() => openEditModal(ds)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg text-slate-655 dark:text-slate-300"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(ds.id)}
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

      {/* Dataset CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-5 relative h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingDataset ? "Edit Dataset Sektoral" : "Tambah Dataset Sektoral Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left columns: fields */}
                <div className="md:col-span-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Judul Dataset</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan judul dataset..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Deskripsi / Penjelasan</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Jelaskan mengenai dataset sektoral ini..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Kategori Sektoral</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Layanan, Kepegawaian, Keuangan..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Instansi Produsen Data</label>
                    <input
                      type="text"
                      required
                      value={produsen}
                      onChange={(e) => setProdusen(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Unggah Berkas Pendukung (CSV/XLSX)</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                      />
                      <input
                        type="text"
                        placeholder="URL..."
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white w-20"
                      />
                    </div>
                    {uploadingFile && <span className="text-[9px] text-emerald-500">Mengunggah...</span>}
                  </div>
                </div>

                {/* Right Column: JSON Data grid editor */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Editor Tabel Baris Data (JSON Grid)</label>
                    <button
                      type="button"
                      onClick={addGridRow}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/10 text-emerald-600 rounded-lg text-[10px] font-bold"
                    >
                      <Plus size={10} />
                      <span>Tambah Baris</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl max-h-96 overflow-y-auto flex flex-col gap-3">
                    {gridRows.length === 0 ? (
                      <span className="text-slate-450 italic text-center py-6">Tidak ada baris data. Klik tombol diatas untuk menambahkan data baris tabel.</span>
                    ) : (
                      gridRows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-3 rounded-xl shadow-inner">
                          <div className="grid grid-cols-3 gap-3 flex-grow">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] text-slate-400 uppercase font-bold">Bulan / Label</span>
                              <input
                                type="text"
                                value={row.bulan || ""}
                                onChange={(e) => updateRowField(idx, "bulan", e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border-0 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-xs font-bold dark:text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] text-slate-400 uppercase font-bold">Jumlah Pengajuan</span>
                              <input
                                type="number"
                                value={row.pengajuan !== undefined ? row.pengajuan : ""}
                                onChange={(e) => updateRowField(idx, "pengajuan", e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border-0 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-xs font-bold dark:text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] text-slate-400 uppercase font-bold">Jumlah Disetujui / Realisasi</span>
                              <input
                                type="number"
                                value={row.disetujui !== undefined ? row.disetujui : ""}
                                onChange={(e) => updateRowField(idx, "disetujui", e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border-0 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-xs font-bold dark:text-white"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGridRow(idx)}
                            className="p-2 bg-red-500/10 hover:bg-red-500 border border-red-550/10 text-red-600 hover:text-white rounded-lg flex items-center justify-center h-fit self-end"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                  >
                    <Save size={14} />
                    <span>Simpan Dataset</span>
                  </button>

                </div>

              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
