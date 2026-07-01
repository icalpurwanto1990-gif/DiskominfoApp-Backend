import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, Eye, HelpCircle, ChevronRight, Shield, ToggleLeft, ToggleRight } from "lucide-react";

export default function Layanan({ services: initialServices, requests: initialRequests }) {
  const [services, setServices] = useState(initialServices || []);
  const [requests, setRequests] = useState(initialRequests || []);

  const [activeTab, setActiveTab] = useState("requests"); // requests, services

  // Modals
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Service form states
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceIcon, setServiceIcon] = useState("Globe");
  const [serviceActive, setServiceActive] = useState(true);
  const [reqInputs, setReqInputs] = useState([]); // Array of strings (custom fields)
  const [newInputName, setNewInputName] = useState("");

  // Request Process states
  const [selectedReq, setSelectedReq] = useState(null);
  const [reqStatus, setReqStatus] = useState("PENDING");
  const [reqNotes, setReqNotes] = useState("");

  const addInput = () => {
    if (!newInputName.trim()) return;
    setReqInputs([...reqInputs, newInputName.trim()]);
    setNewInputName("");
  };

  const removeInput = (index) => {
    setReqInputs(reqInputs.filter((_, i) => i !== index));
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceName("");
    setServiceDesc("");
    setServiceIcon("Globe");
    setServiceActive(true);
    setReqInputs(["NIP Pegawai", "Nama Atasan", "Instansi Terkait"]);
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (srv) => {
    setEditingService(srv);
    setServiceName(srv.name);
    setServiceDesc(srv.description);
    setServiceIcon(srv.icon || "Globe");
    setServiceActive(srv.active);
    setReqInputs(srv.requirements || []);
    setServiceModalOpen(true);
  };

  // Handle Service CRUD Submit
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!serviceName || !serviceDesc) {
      alert("Nama dan deskripsi layanan wajib diisi.");
      return;
    }

    const payload = {
      id: editingService ? editingService.id : null,
      name: serviceName,
      description: serviceDesc,
      icon: serviceIcon,
      requirements: reqInputs,
      active: serviceActive
    };

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Layanan digital berhasil disimpan!");
        if (editingService) {
          setServices(services.map(s => s.id === data.service.id ? data.service : s));
        } else {
          setServices([...services, data.service]);
        }
        setServiceModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleServiceDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
        alert("Layanan berhasil dihapus.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Request Verification Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/service-requests/${selectedReq.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          status: reqStatus,
          notes: reqNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Status tiket pengajuan berhasil diperbarui!");
        setRequests(requests.map(r => r.id === data.request.id ? data.request : r));
        setRequestModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Layanan Digital & Tiket Pengajuan (OPD)
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Verifikasi tiket pengajuan integrasi aplikasi dan kelola direktori penawaran layanan publik digital
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 mt-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 px-2 border-b-2 transition-all ${
            activeTab === "requests" 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Tiket Pengajuan OPD ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`pb-3 px-2 border-b-2 transition-all ${
            activeTab === "services" 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Direktori Layanan ({services.length})
        </button>
      </div>

      {/* Tab 1: REQUESTS TICKETS LIST */}
      {activeTab === "requests" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">No. Tiket</th>
                  <th className="p-4">Jenis Layanan</th>
                  <th className="p-4">Pemohon / Instansi</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-450">
                      Belum ada tiket pengajuan layanan digital masuk.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{req.ticketNumber}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-[9px] uppercase tracking-wider rounded">
                          {req.serviceType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span>{req.applicantName}</span>
                          <span className="text-[10px] text-slate-400">{req.instansi}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate">
                        {req.details ? Object.entries(req.details).map(([k, v]) => `${k}: ${v}`).join(", ") : "-"}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                          req.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                          req.status === "DIPROSES" ? "bg-blue-500/10 text-blue-600" :
                          req.status === "SELESAI" ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-red-500/10 text-red-600"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setReqStatus(req.status);
                            setReqNotes(req.notes || "");
                            setRequestModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-500 ml-auto bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <span>Proses</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: SERVICES OFFERED LIST */}
      {activeTab === "services" && (
        <div className="flex flex-col gap-6 mt-2">
          <div className="flex justify-end">
            <button
              onClick={openAddServiceModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={14} />
              <span>Tambah Layanan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div key={srv.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                    <Shield size={20} />
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                    srv.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {srv.active ? "Aktif" : "Draft"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{srv.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold line-clamp-2 leading-relaxed">{srv.description}</p>
                </div>

                <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Input Diperlukan:</span>
                  <div className="flex flex-wrap gap-1">
                    {srv.requirements && srv.requirements.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200/65 dark:border-slate-850 rounded text-[9px] font-bold text-slate-500">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={() => openEditServiceModal(srv)}
                    className="flex-grow py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-655 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleServiceDelete(srv.id)}
                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-650 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Request Verification Modal */}
      {requestModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-5 relative">
            <button onClick={() => setRequestModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Proses Tiket Pengajuan Layanan
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Nomor Tiket</span><strong>{selectedReq.ticketNumber}</strong></div>
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Tipe Layanan</span><strong>{selectedReq.serviceType}</strong></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Instansi Pemohon</span><strong>{selectedReq.instansi}</strong></div>
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Nama Pegawai</span><strong>{selectedReq.applicantName}</strong></div>
              </div>
              <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Email / Telepon</span><p className="font-bold">{selectedReq.applicantEmail} / {selectedReq.applicantPhone}</p></div>
              <div>
                <span className="text-slate-450 block font-semibold uppercase text-[9px] mb-1">Rincian Form Pengisian</span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 font-bold space-y-1">
                  {selectedReq.details ? Object.entries(selectedReq.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2 border-b border-slate-50 dark:border-slate-850 pb-1">
                      <span className="text-slate-450">{k}</span>
                      <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  )) : "Tidak ada rincian."}
                </div>
              </div>
            </div>

            <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Verifikasi Status</label>
                <select
                  value={reqStatus}
                  onChange={(e) => setReqStatus(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="DIPROSES">DIPROSES</option>
                  <option value="SELESAI">SELESAI (DISETUJUI)</option>
                  <option value="DITOLAK">DITOLAK</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Catatan Tanggapan Verifikator</label>
                <textarea
                  rows={3}
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="Contoh: Akun Zoom berhasil dibuat, detil terkirim ke email instansi terkait..."
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2">
                <Save size={14} />
                <span>Simpan Tanggapan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Service CRUD Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setServiceModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingService ? "Edit Layanan Digital" : "Buat Layanan Digital Baru"}
            </h3>
            <form onSubmit={handleServiceSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nama Layanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penerbitan TTE (ASN)..."
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Keterangan Layanan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Deskripsikan layanan secara lengkap..."
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Icon Komponen (Lucide Icon Name)</label>
                <select
                  value={serviceIcon}
                  onChange={(e) => setServiceIcon(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                >
                  <option value="Globe">Globe (Umum / Jaringan)</option>
                  <option value="Shield">Shield (Keamanan / TTE)</option>
                  <option value="Video">Video (Zoom Meeting)</option>
                  <option value="Database">Database (Aplikasi / Hosting)</option>
                  <option value="FileText">FileText (Persuratan)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Kebutuhan Syarat Form Input (Requirements)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Alamat Email Instansi..."
                    value={newInputName}
                    onChange={(e) => setNewInputName(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white w-full"
                  />
                  <button
                    type="button"
                    onClick={addInput}
                    className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl">
                  {reqInputs.length === 0 ? (
                    <span className="text-slate-450 italic">Belum ada input kustom.</span>
                  ) : (
                    reqInputs.map((inp, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-lg">
                        <span className="text-[11px]">{inp}</span>
                        <button type="button" onClick={() => removeInput(idx)} className="text-red-500 hover:text-red-750 font-bold">×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 border-t border-slate-100 dark:border-slate-850 mt-2">
                <button
                  type="button"
                  onClick={() => setServiceActive(!serviceActive)}
                  className="text-slate-500 focus:outline-none"
                >
                  {serviceActive ? (
                    <ToggleRight size={32} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={32} />
                  )}
                </button>
                <div className="flex flex-col">
                  <span className="text-slate-900 dark:text-white font-bold">Aktifkan Layanan</span>
                  <span className="text-[9px] text-slate-455">Izinkan pemohon untuk mengisi formulir di web depan</span>
                </div>
              </div>

              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <Save size={14} />
                <span>Simpan Layanan</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
