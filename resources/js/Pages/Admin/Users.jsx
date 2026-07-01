import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, Shield, User } from "lucide-react";

export default function Users({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER"); // SUPERADMIN, ADMIN, USER
  const [nip, setNip] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [instansi, setInstansi] = useState("");

  const openAddModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    setNip("");
    setJabatan("");
    setInstansi("");
    setModalOpen(true);
  };

  const openEditModal = (usr) => {
    setEditingUser(usr);
    setName(usr.name);
    setEmail(usr.email);
    setPassword(""); // Leave blank for no change
    setRole(usr.role || "USER");
    setNip(usr.nip || "");
    setJabatan(usr.jabatan || "");
    setInstansi(usr.instansi || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Nama dan email wajib diisi.");
      return;
    }

    const payload = {
      id: editingUser ? editingUser.id : null,
      name,
      email,
      password: password || null,
      role,
      nip,
      jabatan,
      instansi
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Akun pengguna berhasil disimpan!");
        if (editingUser) {
          setUsers(users.map(u => u.id === data.user.id ? data.user : u));
        } else {
          setUsers([data.user, ...users]);
        }
        setModalOpen(false);
      } else {
        alert("Gagal menyimpan akun: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus akun pengguna ini?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Akun pengguna berhasil dihapus.");
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Gagal menghapus akun: " + (data.error || ""));
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
            Pengelolaan Akun Pengguna
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Kelola hak akses administrator serta akun pemohon (USER) untuk pengajuan layanan digital, PPID, dan Satu Data
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
        >
          <Plus size={14} />
          <span>Tambah Akun</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                <th className="p-4">Nama Pengguna</th>
                <th className="p-4">Email</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4">NIP / Jabatan</th>
                <th className="p-4">Instansi</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-450">
                    Belum ada akun pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((usr) => (
                  <tr key={usr.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-600/10 text-emerald-600 rounded-xl">
                          {usr.role === "USER" ? <User size={16} /> : <Shield size={16} />}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">{usr.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-550 dark:text-slate-400">{usr.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider rounded-md ${
                        usr.role === "SUPERADMIN" ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400" :
                        usr.role === "ADMIN" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                      }`}>
                        {usr.role || "USER"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {usr.nip ? `${usr.nip} / ${usr.jabatan}` : "-"}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{usr.instansi || "-"}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(usr)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg text-slate-655 dark:text-slate-300"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(usr.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-655 hover:text-white rounded-lg"
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

      {/* User CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingUser ? "Edit Akun Pengguna" : "Tambah Akun Pengguna Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap pengguna..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="email@instansi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {editingUser ? "Kata Sandi Baru (Kosongkan jika tidak diubah)" : "Kata Sandi"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Peran Akses (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                >
                  <option value="USER">Pemohon (USER)</option>
                  <option value="ADMIN">Administrator (ADMIN)</option>
                  <option value="SUPERADMIN">Super Administrator (SUPERADMIN)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">NIP (Pegawai ASN)</label>
                  <input
                    type="text"
                    placeholder="NIP (opsional)..."
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Jabatan (opsional)</label>
                  <input
                    type="text"
                    placeholder="Jabatan..."
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Instansi / Dinas Terkait</label>
                <input
                  type="text"
                  placeholder="Contoh: Dinas Kesehatan..."
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <Save size={14} />
                <span>Simpan Pengguna</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
