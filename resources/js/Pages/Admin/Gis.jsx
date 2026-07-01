import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, MapPin } from "lucide-react";

export default function Gis({ infrastructures: initialInfras }) {
  const [infras, setInfras] = useState(initialInfras || []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInfra, setEditingInfra] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("BTS_TOWER"); // BTS_TOWER, BLANKSPOT, VSAT, FIBER_OPTIK
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [status, setStatus] = useState("AKTIF");
  const [detailDesc, setDetailDesc] = useState("");

  const openAddModal = () => {
    setEditingInfra(null);
    setName("");
    setType("BTS_TOWER");
    setLatitude(-1.3);
    setLongitude(123.1);
    setStatus("AKTIF");
    setDetailDesc("");
    setModalOpen(true);
  };

  const openEditModal = (infra) => {
    setEditingInfra(infra);
    setName(infra.name);
    setType(infra.type);
    setLatitude(infra.latitude);
    setLongitude(infra.longitude);
    setStatus(infra.status);
    setDetailDesc(infra.details?.description || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !latitude || !longitude) {
      alert("Nama, latitude, dan longitude wajib diisi.");
      return;
    }

    const payload = {
      id: editingInfra ? editingInfra.id : null,
      name,
      type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status,
      details: {
        description: detailDesc
      }
    };

    try {
      const res = await fetch("/api/admin/gis-infrastructures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Titik infrastruktur geospasial berhasil disimpan!");
        if (editingInfra) {
          setInfras(infras.map(i => i.id === data.gisInfrastructure.id ? data.gisInfrastructure : i));
        } else {
          setInfras([data.gisInfrastructure, ...infras]);
        }
        setModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus titik koordinat ini?")) return;
    try {
      const res = await fetch(`/api/admin/gis-infrastructures/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        setInfras(infras.filter(i => i.id !== id));
        alert("Titik koordinat berhasil dihapus.");
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
            Pengelolaan Peta Sebaran GIS
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Tambah dan kelola sebaran menara telekomunikasi BTS, jaringan VSAT, serat optik, dan area blankspot daerah
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
        >
          <Plus size={14} />
          <span>Tambah Titik Koordinat</span>
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                <th className="p-4">Nama Infrastruktur / Lokasi</th>
                <th className="p-4">Tipe Jaringan</th>
                <th className="p-4">Latitude (Garis Lintang)</th>
                <th className="p-4">Longitude (Garis Bujur)</th>
                <th className="p-4 w-28">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {infras.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-450">
                    Belum ada titik infrastruktur GIS ditambahkan.
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
                        <span className="font-extrabold text-slate-900 dark:text-white">{infra.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-[9px] uppercase tracking-wider rounded">
                        {infra.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{infra.latitude}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{infra.longitude}</td>
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

      {/* GIS Marker Edit Modal */}
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
                <input
                  type="text"
                  required
                  placeholder="Contoh: BTS Menara Salakan..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Tipe Infrastruktur</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                >
                  <option value="BTS_TOWER">BTS Menara Seluler (Tower)</option>
                  <option value="VSAT">VSAT Jaringan Satelit</option>
                  <option value="FIBER_OPTIK">Fiber Optik (Kabel Tanah)</option>
                  <option value="BLANKSPOT">Blankspot Area (No Signal)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Latitude (Lintang)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Longitude (Bujur)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Status Operasional</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AKTIF, NORMAL, BERMASALAH..."
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Detail Spesifikasi (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Operator Telkomsel, XL, Tinggi Menara 42 meter..."
                  value={detailDesc}
                  onChange={(e) => setDetailDesc(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <Save size={14} />
                <span>Simpan Titik GIS</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
