import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Save, Plus, Edit2, Trash2, X, User } from "lucide-react";

export default function ProfileStaff({ profileContent: initialProfile, staff: initialStaff }) {
  const [profile, setProfile] = useState(initialProfile || {});
  const [staffList, setStaffList] = useState(initialStaff || []);

  // Welcome Speech form states
  const [sambutanTeks, setSambutanTeks] = useState(profile.sambutan_teks || "");
  const [sambutanNama, setSambutanNama] = useState(profile.sambutan_nama || "");
  const [sambutanJabatan, setSambutanJabatan] = useState(profile.sambutan_jabatan || "");
  const [sambutanFoto, setSambutanFoto] = useState(profile.sambutan_foto || "");
  const [savingSpeech, setSavingSpeech] = useState(false);
  const [uploadingSpeechFoto, setUploadingSpeechFoto] = useState(false);

  // Staff CRUD states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [staffNip, setStaffNip] = useState("");
  const [staffPosition, setStaffPosition] = useState("");
  const [staffPhoto, setStaffPhoto] = useState("");
  const [staffOrder, setStaffOrder] = useState(1);
  const [uploadingStaffFoto, setUploadingStaffFoto] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingSpeech(true);

    const payload = {
      sambutan_teks: sambutanTeks,
      sambutan_nama: sambutanNama,
      sambutan_jabatan: sambutanJabatan,
      sambutan_foto: sambutanFoto
    };

    try {
      const res = await fetch("/api/admin/profil/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Sambutan Kepala Dinas berhasil diperbarui.");
      } else {
        alert("Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSavingSpeech(false);
    }
  };

  const handleFotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (type === "speech") setUploadingSpeechFoto(true);
    if (type === "staff") setUploadingStaffFoto(true);

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
        if (type === "speech") setSambutanFoto(data.url);
        if (type === "staff") setStaffPhoto(data.url);
        alert("Foto berhasil diunggah.");
      } else {
        alert("Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      if (type === "speech") setUploadingSpeechFoto(false);
      if (type === "staff") setUploadingStaffFoto(false);
    }
  };

  const openAddStaffModal = () => {
    setEditingStaff(null);
    setStaffName("");
    setStaffNip("");
    setStaffPosition("");
    setStaffPhoto("");
    setStaffOrder(staffList.length + 1);
    setModalOpen(true);
  };

  const openEditStaffModal = (staff) => {
    setEditingStaff(staff);
    setStaffName(staff.name);
    setStaffNip(staff.nip || "");
    setStaffPosition(staff.position);
    setStaffPhoto(staff.photoUrl || "");
    setStaffOrder(staff.orderIndex);
    setModalOpen(true);
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffName || !staffPosition) {
      alert("Nama dan jabatan pegawai wajib diisi.");
      return;
    }

    const payload = {
      id: editingStaff ? editingStaff.id : null,
      name: staffName,
      nip: staffNip,
      position: staffPosition,
      photoUrl: staffPhoto,
      orderIndex: parseInt(staffOrder, 10)
    };

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Data staf berhasil disimpan!");
        const updatedStaff = data.staff;
        if (editingStaff) {
          setStaffList(staffList.map(s => s.id === updatedStaff.id ? updatedStaff : s).sort((a, b) => a.orderIndex - b.orderIndex));
        } else {
          setStaffList([...staffList, updatedStaff].sort((a, b) => a.orderIndex - b.orderIndex));
        }
        setModalOpen(false);
      } else {
        alert("Gagal menyimpan data staf.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleStaffDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pegawai ini?")) return;

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Data staf berhasil dihapus.");
        setStaffList(staffList.filter(s => s.id !== id));
      } else {
        alert("Gagal menghapus data staf.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        
        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Profil Dinas & Manajemen Pegawai
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Edit teks sambutan pimpinan dan kelola basis data kepegawaian kantor
          </p>
        </div>

        {/* Section 1: Welcome Speech Editor */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-5">
            Sambutan Kepala Dinas (Beranda)
          </h3>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Isi Teks Sambutan</label>
              <textarea
                required
                rows={5}
                value={sambutanTeks}
                onChange={(e) => setSambutanTeks(e.target.value)}
                placeholder="Tuliskan kata sambutan kepala dinas..."
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nama Kepala Dinas</label>
                <input
                  type="text"
                  required
                  value={sambutanNama}
                  onChange={(e) => setSambutanNama(e.target.value)}
                  placeholder="Ir. H. Sudirman L. Hasan, M.Si"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jabatan</label>
                <input
                  type="text"
                  required
                  value={sambutanJabatan}
                  onChange={(e) => setSambutanJabatan(e.target.value)}
                  placeholder="Kepala Dinas Komunikasi dan Informatika"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Foto Pimpinan</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFotoUpload(e, "speech")}
                    disabled={uploadingSpeechFoto}
                    className="file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                  />
                  <input
                    type="text"
                    placeholder="URL Foto..."
                    value={sambutanFoto}
                    onChange={(e) => setSambutanFoto(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white w-40"
                  />
                </div>
                {uploadingSpeechFoto && <span className="text-[9px] text-emerald-500">Mengunggah...</span>}
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={savingSpeech}
                className="flex items-center gap-1.5 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
              >
                <Save size={14} />
                <span>Simpan Teks Sambutan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Staff Database CRUD */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Daftar Pegawai & Struktur Organisasi
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Tabel staf pegawai yang muncul pada menu Profil</span>
            </div>
            <button
              onClick={openAddStaffModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={14} />
              <span>Tambah Staf</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 w-16">Foto</th>
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">NIP</th>
                  <th className="pb-3">Jabatan / Struktur</th>
                  <th className="pb-3 w-20">Urutan</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-450">
                      Belum ada data pegawai terdaftar.
                    </td>
                  </tr>
                ) : (
                  staffList.map((st) => (
                    <tr key={st.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-800">
                          {st.photoUrl ? (
                            <img src={st.photoUrl} alt={st.name} className="object-cover w-full h-full" />
                          ) : (
                            <User size={16} className="text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{st.nip || "-"}</td>
                      <td className="py-3 font-semibold">{st.position}</td>
                      <td className="py-3">{st.orderIndex}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditStaffModal(st)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-905 border border-slate-200/55 dark:border-slate-800/50 rounded-lg text-slate-600 dark:text-slate-300"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleStaffDelete(st.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-600 hover:text-white rounded-lg"
                            title="Hapus"
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

      </div>

      {/* Staff Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingStaff ? "Edit Data Staf" : "Tambah Data Staf"}
            </h3>

            <form onSubmit={handleStaffSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap staf..."
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  placeholder="Masukkan NIP (jika PNS)..."
                  value={staffNip}
                  onChange={(e) => setStaffNip(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jabatan / Struktur</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kepala Seksi Humas..."
                  value={staffPosition}
                  onChange={(e) => setStaffPosition(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unggah Foto Staf</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFotoUpload(e, "staff")}
                    disabled={uploadingStaffFoto}
                    className="file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                  />
                  <input
                    type="text"
                    placeholder="URL Foto..."
                    value={staffPhoto}
                    onChange={(e) => setStaffPhoto(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white w-28"
                  />
                </div>
                {uploadingStaffFoto && <span className="text-[9px] text-emerald-500">Mengunggah...</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Urutan Tampil (Indeks)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={staffOrder}
                  onChange={(e) => setStaffOrder(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                <Save size={14} />
                <span>Simpan Staf</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
