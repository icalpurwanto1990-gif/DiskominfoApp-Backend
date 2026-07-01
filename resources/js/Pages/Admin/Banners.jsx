import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight, FileImage } from "lucide-react";

export default function Banners({ banners: initialBanners }) {
  const [banners, setBanners] = useState(initialBanners || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [active, setActive] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);
  const [uploading, setUploading] = useState(false);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLinkUrl("");
    setActive(true);
    setOrderIndex(banners.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description || "");
    setImageUrl(banner.imageUrl || "");
    setLinkUrl(banner.linkUrl || "");
    setActive(banner.active);
    setOrderIndex(banner.orderIndex);
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

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
        setImageUrl(data.url);
        alert("Gambar berhasil diunggah.");
      } else {
        alert("Gagal mengunggah gambar: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Judul dan gambar spanduk wajib diisi.");
      return;
    }

    const payload = {
      id: editingBanner ? editingBanner.id : null,
      title,
      description,
      imageUrl,
      linkUrl,
      active,
      orderIndex: parseInt(orderIndex, 10)
    };

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Spanduk berhasil disimpan!");
        
        // Reload list from response or update local state
        const updatedBanner = data.banner;
        if (editingBanner) {
          setBanners(banners.map(b => b.id === updatedBanner.id ? updatedBanner : b));
        } else {
          setBanners([...banners, updatedBanner].sort((a, b) => a.orderIndex - b.orderIndex));
        }
        setModalOpen(false);
      } else {
        alert("Gagal menyimpan spanduk: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus slide spanduk ini?")) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Spanduk berhasil dihapus.");
        setBanners(banners.filter(b => b.id !== id));
      } else {
        alert("Gagal menghapus spanduk.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <AdminLayout>
      
      {/* Title Header */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Pengelolaan Banner Slider
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Atur spanduk gambar promosi yang tampil di halaman beranda depan
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
        >
          <Plus size={14} />
          <span>Tambah Banner</span>
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {banners.length === 0 ? (
          <div className="col-span-full p-12 bg-white dark:bg-slate-900 text-center border border-slate-200/60 dark:border-slate-800 rounded-3xl text-slate-400 font-semibold">
            Belum ada data spanduk. Tambah baru untuk menampilkan di slider beranda.
          </div>
        ) : (
          banners.map((banner) => (
            <div 
              key={banner.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all"
            >
              <div className="h-44 w-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
                {banner.imageUrl ? (
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FileImage size={40} className="text-slate-400" />
                )}
                <span className={`absolute top-4 right-4 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                  banner.active 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-400" 
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {banner.active ? "Aktif" : "Nonaktif"}
                </span>
                <span className="absolute bottom-4 left-4 px-2 py-0.5 bg-slate-950/70 backdrop-blur text-white font-bold text-[9px] rounded">
                  Urutan: {banner.orderIndex}
                </span>
              </div>

              <div className="p-5 flex-grow flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{banner.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold line-clamp-2 leading-relaxed">{banner.description || "-"}</p>
                </div>

                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex-grow py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-650 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center"
                    title="Hapus"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingBanner ? "Edit Slide Spanduk" : "Tambah Slide Spanduk"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Judul Banner</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul banner..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Masukkan penjelasan singkat..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">File Gambar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 file:cursor-pointer cursor-pointer text-slate-500 py-1"
                  />
                  {uploading && <span className="text-[10px] text-emerald-500">Mengunggah...</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">URL Gambar (atau Otomatis)</label>
                  <input
                    type="text"
                    required
                    placeholder="/uploads/banner.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tautan Link URL (Opsional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Urutan Indeks</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className="text-slate-500 focus:outline-none"
                >
                  {active ? (
                    <ToggleRight size={32} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={32} />
                  )}
                </button>
                <div className="flex flex-col">
                  <span className="text-slate-900 dark:text-white font-bold">Status Tampil Aktif</span>
                  <span className="text-[10px] text-slate-400">Aktifkan untuk langsung menampilkan di halaman utama</span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                <Save size={14} />
                <span>Simpan Spanduk</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
