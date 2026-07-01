import React, { useEffect, useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  Plus, Trash2, FileText, Image, Copy, Search, UploadCloud,
  Video, FileImage, ExternalLink, RefreshCw, X, Edit, Save
} from "lucide-react";

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function Media() {
  const [activeTab, setActiveTab] = useState("files"); // files, foto, video, infografis

  // States for Filesystem explorer (Files)
  const [fileList, setFileList] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [fileSearch, setFileSearch] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  // States for Database Media
  const [dbMediaList, setDbMediaList] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbSearch, setDbSearch] = useState("");

  // Modal States for Database Media CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUrl, setModalUrl] = useState("");
  const [modalMeta, setModalMeta] = useState("");
  const [modalType, setModalType] = useState("FOTO"); // FOTO, VIDEO, INFOGRAFIS
  const [mediaUploading, setMediaUploading] = useState(false);

  const getAdminHeaders = () => {
    try {
      const s = JSON.parse(localStorage.getItem("adminSession") || "{}");
      return { "X-Admin-Name": s.name || "Administrator", "X-Admin-Role": s.role || "ADMIN" };
    } catch { return {}; }
  };

  // 1. Filesystem Explorer Handlers
  const fetchFiles = async () => {
    setFilesLoading(true);
    try {
      const res = await fetch("/api/admin/media-files");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFileList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setFileUploading(true);

    try {
      const res = await fetch("/api/admin/media-files", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders()
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Berkas media berhasil diunggah!");
        setFileList([data.media, ...fileList]);
      } else {
        alert("Gagal mengunggah berkas.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setFileUploading(false);
    }
  };

  const handleFileDelete = async (filename) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas media ini secara permanen dari server?")) return;
    try {
      const res = await fetch(`/api/admin/media-files/${filename}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders()
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Media dihapus.");
        setFileList(fileList.filter(m => m.name !== filename));
      } else {
        alert("Gagal menghapus media.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Database Media Handlers
  const fetchDbMedia = async () => {
    setDbLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDbMediaList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDbLoading(false);
    }
  };

  const handleDbSubmit = async (e) => {
    e.preventDefault();
    if (!modalTitle || !modalUrl) {
      alert("Judul dan URL/Gambar wajib diisi.");
      return;
    }

    const payload = {
      id: editingItem ? editingItem.id : null,
      title: modalTitle,
      type: modalType,
      url: modalUrl,
      meta: modalMeta
    };

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Media berhasil disimpan!");
        fetchDbMedia();
        setModalOpen(false);
      } else {
        alert("Gagal menyimpan media: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleDbDelete = async (id) => {
    if (!confirm("Hapus data media ini dari database?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          ...getAdminHeaders()
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Media berhasil dihapus dari database.");
        setDbMediaList(dbMediaList.filter(m => m.id !== id));
      } else {
        alert("Gagal menghapus media.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setMediaUploading(true);

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
        setModalUrl(data.url);
        alert("File berhasil diunggah.");
      } else {
        alert("Gagal mengunggah file.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setMediaUploading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchDbMedia();
  }, []);

  const openAddModal = (type) => {
    setEditingItem(null);
    setModalTitle("");
    setModalUrl("");
    setModalMeta("");
    setModalType(type);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalTitle(item.title);
    setModalUrl(item.url);
    setModalMeta(item.meta || "");
    setModalType(item.type);
    setModalOpen(true);
  };

  const handleCopyLink = (url) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    alert("Tautan media berhasil disalin ke clipboard!\n" + fullUrl);
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter lists
  const filteredFiles = fileList.filter(f =>
    f.name.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const dbMediaByType = (type) => dbMediaList.filter(m => m.type === type && m.title.toLowerCase().includes(dbSearch.toLowerCase()));

  return (
    <AdminLayout>
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Media & Galeri Center
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Manajemen berkas uploads, galeri foto, video YouTube, dan infografis layanan publik
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchFiles(); fetchDbMedia(); }}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 hover:border-emerald-400/60 transition"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          {activeTab !== "files" && (
            <button
              onClick={() => openAddModal(activeTab.toUpperCase())}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={14} />
              <span>Tambah {activeTab === "foto" ? "Foto" : activeTab === "video" ? "Video" : "Infografis"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-2">
        {[
          { id: "files", label: "File Browser (Explorer)", icon: FileText },
          { id: "foto", label: "Galeri Foto (Database)", icon: Image },
          { id: "video", label: "Galeri Video (Database)", icon: Video },
          { id: "infografis", label: "Infografis Layanan (Database)", icon: FileImage },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="w-full">
        
        {/* TAB 1: FILE BROWSER */}
        {activeTab === "files" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center gap-4 relative">
                <UploadCloud size={40} className="text-emerald-500 animate-bounce" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Unggah Berkas Baru</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1">File akan disimpan langsung di /uploads/</span>
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={fileUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {fileUploading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-3xl flex items-center justify-center text-xs font-bold text-emerald-500">
                    Mengunggah...
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Pencarian Nama Berkas Explorer</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari file..."
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <span>Total File Explorer: {fileList.length}</span>
                  <span>Disimpan di directory public/uploads</span>
                </div>
              </div>
            </div>

            {filesLoading ? (
              <div className="flex justify-center items-center py-16 text-slate-450 text-xs font-bold uppercase animate-pulse">
                Memuat folder uploads...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-slate-450 font-bold uppercase tracking-wider">
                Belum ada berkas terunggah yang cocok.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredFiles.map((file) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
                  return (
                    <div
                      key={file.name}
                      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all group"
                    >
                      <div className="h-32 bg-slate-100 dark:bg-slate-950/60 flex items-center justify-center overflow-hidden relative">
                        {isImage ? (
                          <img src={file.url} alt={file.name} className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300" />
                        ) : (
                          <FileText size={32} className="text-slate-400" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopyLink(file.url)}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all"
                            title="Salin Tautan"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => handleFileDelete(file.name)}
                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="p-3.5 flex flex-col gap-1.5 font-semibold text-xs">
                        <span className="text-[10px] text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                          {formatSize(file.size)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2, 3, 4: DATABASE MEDIA */}
        {activeTab !== "files" && (
          <div className="flex flex-col gap-5 mt-2">
            
            {/* Search filter for DB */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Cari data ${activeTab === "foto" ? "foto" : activeTab === "video" ? "video" : "infografis"} di database...`}
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {dbLoading ? (
              <div className="flex justify-center items-center py-16 text-slate-450 text-xs font-bold uppercase animate-pulse">
                Memuat data dari database...
              </div>
            ) : dbMediaByType(activeTab.toUpperCase()).length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-slate-450 font-bold uppercase tracking-wider">
                Belum ada data media {activeTab} terdaftar di database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {dbMediaByType(activeTab.toUpperCase()).map((item) => {
                  const ytId = activeTab === "video" ? getYoutubeId(item.url) : null;
                  const displayThumb = ytId 
                    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                    : item.url;

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all group"
                    >
                      <div className="h-40 bg-slate-100 dark:bg-slate-950/60 flex items-center justify-center overflow-hidden relative">
                        {activeTab === "video" ? (
                          <>
                            <img src={displayThumb} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300" />
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <span className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow border border-emerald-500/20">
                                <svg className="w-4 h-4 fill-current pl-0.5" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </span>
                            </div>
                          </>
                        ) : (
                          <img src={item.url} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300" />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDbDelete(item.id)}
                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                          <a
                            href={item.url} target="_blank" rel="noopener noreferrer"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center"
                            title="Buka Link URL"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2" title={item.title}>
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                            {activeTab === "video" ? `Link: ${item.url}` : `Meta: ${item.meta || "-"}`}
                          </p>
                        </div>
                        {activeTab === "video" && (
                          <div className="text-[9px] font-bold text-slate-450 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
                            <span>Durasi: {item.meta || "-"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DATABASE MEDIA EDITOR MODAL (Foto/Video/Infografis) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingItem ? `Edit ${modalType}` : `Tambah ${modalType}`}
            </h3>

            <form onSubmit={handleDbSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              {/* Judul */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Judul Media</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul media..."
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              {/* URL/File (conditional uploader) */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {modalType === "VIDEO" ? "URL Video YouTube" : "Berkas Gambar / File Poster"}
                </label>
                {modalType !== "VIDEO" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMediaUpload}
                        disabled={mediaUploading}
                        className="file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                      />
                      {mediaUploading && <span className="text-[9px] text-emerald-500">Uploading...</span>}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="/uploads/filename.jpg"
                      value={modalUrl}
                      onChange={(e) => setModalUrl(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Contoh: https://www.youtube.com/watch?v=xxxxxx"
                    value={modalUrl}
                    onChange={(e) => setModalUrl(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                )}
              </div>

              {/* Meta information */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {modalType === "VIDEO" ? "Keterangan Durasi (Meta)" : modalType === "FOTO" ? "Keterangan Sub-Label/Tanggal" : "Keterangan Ukuran File (Meta)"}
                </label>
                <input
                  type="text"
                  placeholder={modalType === "VIDEO" ? "Contoh: 10:45" : modalType === "FOTO" ? "Contoh: Kegiatan Musrenbang 2026" : "Contoh: 1.2 MB / PDF"}
                  value={modalMeta}
                  onChange={(e) => setModalMeta(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                <Save size={14} />
                <span>Simpan Media</span>
              </button>

            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
