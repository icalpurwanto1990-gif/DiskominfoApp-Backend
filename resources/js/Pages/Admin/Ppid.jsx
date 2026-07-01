import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, Eye, FileText, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function Ppid({ requests: initialRequests, objections: initialObjections, documents: initialDocs }) {
  const [requests, setRequests] = useState(initialRequests || []);
  const [objections, setObjections] = useState(initialObjections || []);
  const [documents, setDocuments] = useState(initialDocs || []);

  const [activeTab, setActiveTab] = useState("requests"); // requests, objections, documents

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [objectionModalOpen, setObjectionModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);

  // PPID Request Process States
  const [selectedReq, setSelectedReq] = useState(null);
  const [reqStatus, setReqStatus] = useState("PENDING");
  const [reqResponse, setReqResponse] = useState("");
  const [reqAttachment, setReqAttachment] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // PPID Objection Process States
  const [selectedObj, setSelectedObj] = useState(null);
  const [objStatus, setObjStatus] = useState("PENDING");
  const [objResponse, setObjResponse] = useState("");

  // Document states
  const [editingDoc, setEditingDoc] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("DIP"); // DIP, Laporan Keuangan, Renstra, Regulasi
  const [docFileUrl, setDocFileUrl] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [uploadingDocFile, setUploadingDocFile] = useState(false);

  // Handle Request Response Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/ppid/requests/${selectedReq.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          status: reqStatus,
          response: reqResponse,
          attachment: reqAttachment
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Permohonan PPID berhasil diproses!");
        setRequests(requests.map(r => r.id === data.request.id ? data.request : r));
        setRequestModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses permohonan.");
    }
  };

  // Handle Objection Response Submit
  const handleObjectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/ppid/objections/${selectedObj.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          status: objStatus,
          response: objResponse
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Pengajuan keberatan berhasil diproses!");
        
        // Reload list
        setObjections(objections.map(o => o.id === data.objection.id ? { ...o, status: data.objection.status, response: data.objection.response } : o));
        setObjectionModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle File Uploads (Attachment or Document)
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (type === "attachment") setUploadingAttachment(true);
    if (type === "document") setUploadingDocFile(true);

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
        if (type === "attachment") setReqAttachment(data.url);
        if (type === "document") setDocFileUrl(data.url);
        alert("Berkas berhasil diunggah.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (type === "attachment") setUploadingAttachment(false);
      if (type === "document") setUploadingDocFile(false);
    }
  };

  // ==========================================
  // DOCUMENT METHODS
  // ==========================================
  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docTitle || !docFileUrl) {
      alert("Judul dokumen dan file wajib diisi.");
      return;
    }

    const payload = {
      id: editingDoc ? editingDoc.id : null,
      title: docTitle,
      fileType: docType,
      fileUrl: docFileUrl,
      description: docDesc
    };

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Dokumen berhasil disimpan!");
        if (editingDoc) {
          setDocuments(documents.map(d => d.id === data.document.id ? data.document : d));
        } else {
          setDocuments([data.document, ...documents]);
        }
        setDocModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas dokumen publik ini?")) return;
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        alert("Dokumen berhasil dihapus.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Pengelolaan Layanan PPID Online
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Proses permohonan informasi publik, pengaduan keberatan, serta kelola arsip dokumen keterbukaan informasi daerah
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
          Permohonan Informasi ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("objections")}
          className={`pb-3 px-2 border-b-2 transition-all ${
            activeTab === "objections" 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Pengajuan Keberatan ({objections.length})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 px-2 border-b-2 transition-all ${
            activeTab === "documents" 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Dokumen Publik PPID ({documents.length})
        </button>
      </div>

      {/* Tab 1: PPID REQUESTS */}
      {activeTab === "requests" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">No. Tiket</th>
                  <th className="p-4">Nama Pemohon</th>
                  <th className="p-4">NIK</th>
                  <th className="p-4">Uraian Permohonan</th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-450">
                      Belum ada permohonan informasi publik masuk.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{req.ticketNumber}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span>{req.name}</span>
                          <span className="text-[10px] text-slate-400">{req.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{req.nik}</td>
                      <td className="p-4 max-w-xs truncate">{req.details}</td>
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
                            setReqResponse(req.response || "");
                            setReqAttachment(req.attachment || "");
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

      {/* Tab 2: PPID OBJECTIONS */}
      {activeTab === "objections" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">No. Tiket Asal</th>
                  <th className="p-4">Nama Pengaju</th>
                  <th className="p-4">Alasan Keberatan</th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {objections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-455">
                      Belum ada laporan keberatan masuk.
                    </td>
                  </tr>
                ) : (
                  objections.map((obj) => (
                    <tr key={obj.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {obj.request ? obj.request.ticketNumber : "Unknown"}
                      </td>
                      <td className="p-4">{obj.request ? obj.request.name : "-"}</td>
                      <td className="p-4 max-w-xs truncate">{obj.reason}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                          obj.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                          obj.status === "DIPROSES" ? "bg-blue-500/10 text-blue-600" :
                          obj.status === "SELESAI" ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-red-500/10 text-red-600"
                        }`}>
                          {obj.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedObj(obj);
                            setObjStatus(obj.status);
                            setObjResponse(obj.response || "");
                            setObjectionModalOpen(true);
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

      {/* Tab 3: DOCUMENTS LIST */}
      {activeTab === "documents" && (
        <div className="flex flex-col gap-6 mt-2">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingDoc(null);
                setDocTitle("");
                setDocType("DIP");
                setDocFileUrl("");
                setDocDesc("");
                setDocModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={14} />
              <span>Unggah Dokumen Publik</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                    <th className="p-4">Nama Dokumen</th>
                    <th className="p-4">Kategori Berkas</th>
                    <th className="p-4">Keterangan</th>
                    <th className="p-4">File Link</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-450">
                        Belum ada dokumen publisitas. Silakan tambah baru.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-850">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{doc.title}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-350 font-bold text-[9px] uppercase tracking-wider rounded">
                            {doc.fileType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 max-w-xs truncate">{doc.description || "-"}</td>
                        <td className="p-4">
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline truncate inline-block max-w-[120px]">
                            {doc.fileUrl}
                          </a>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingDoc(doc);
                                setDocTitle(doc.title);
                                setDocType(doc.fileType);
                                setDocFileUrl(doc.fileUrl);
                                setDocDesc(doc.description || "");
                                setDocModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-350"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDocDelete(doc.id)}
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
        </div>
      )}

      {/* PPID Request Process Modal */}
      {requestModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setRequestModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Detail & Tindak Lanjut Permohonan PPID
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Nomor Tiket</span><strong>{selectedReq.ticketNumber}</strong></div>
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Tanggal</span><strong>{selectedReq.createdAt ? new Date(selectedReq.createdAt).toLocaleString() : "-"}</strong></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Nama Pemohon</span><strong>{selectedReq.name} (NIK: {selectedReq.nik})</strong></div>
                <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Email / Telepon</span><strong>{selectedReq.email} / {selectedReq.phone}</strong></div>
              </div>
              <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Alamat Pemohon</span><p className="font-bold">{selectedReq.address}</p></div>
              <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Uraian Informasi yang Dibutuhkan</span><p className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 font-bold whitespace-pre-line leading-relaxed">{selectedReq.details}</p></div>
              <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Tujuan Penggunaan Informasi</span><p className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 font-bold leading-relaxed">{selectedReq.purpose}</p></div>
              {selectedReq.ktpFile && (
                <div>
                  <span className="text-slate-455 block font-semibold uppercase text-[9px] mb-1">Unduh Berkas KTP Pendukung</span>
                  <a href={selectedReq.ktpFile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg font-bold">
                    <FileText size={12} />
                    <span>Lihat KTP Pemohon</span>
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Pembaruan Status</label>
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
                  <label className="text-[10px] uppercase font-bold text-slate-400">Lampirkan Berkas Respons (PDF / ZIP)</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, "attachment")}
                      disabled={uploadingAttachment}
                      className="file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                    />
                    <input
                      type="text"
                      placeholder="URL Berkas..."
                      value={reqAttachment}
                      onChange={(e) => setReqAttachment(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white w-32"
                    />
                  </div>
                  {uploadingAttachment && <span className="text-[9px] text-emerald-500">Mengunggah...</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Tanggapan Resmi PPID</label>
                <textarea
                  rows={4}
                  value={reqResponse}
                  onChange={(e) => setReqResponse(e.target.value)}
                  placeholder="Masukkan kalimat tanggapan/jawaban resmi untuk dikirimkan kepada pemohon..."
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none leading-relaxed"
                />
              </div>

              <button type="submit" className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-md">
                <Save size={14} />
                <span>Simpan Tindak Lanjut</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PPID Objection Process Modal */}
      {objectionModalOpen && selectedObj && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 rounded-3xl shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setObjectionModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Proses Keberatan Layanan Informasi
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/55 dark:border-slate-850 rounded-2xl flex flex-col gap-3 text-xs">
              <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Nomor Tiket Asal</span><strong>{selectedObj.request ? selectedObj.request.ticketNumber : "-"}</strong></div>
              <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Nama Pengaju Keberatan</span><strong>{selectedObj.request ? selectedObj.request.name : "-"}</strong></div>
              <div><span className="text-slate-450 block font-semibold uppercase text-[9px]">Alasan Keberatan Dikirim</span><p className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 font-bold whitespace-pre-line leading-relaxed">{selectedObj.reason}</p></div>
              {selectedObj.ktpFile && (
                <div>
                  <span className="text-slate-455 block font-semibold uppercase text-[9px] mb-1">Berkas Surat Keberatan Pendukung</span>
                  <a href={selectedObj.ktpFile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg font-bold">
                    <FileText size={12} />
                    <span>Unduh Surat Keberatan</span>
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleObjectionSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Pembaruan Status</label>
                <select
                  value={objStatus}
                  onChange={(e) => setObjStatus(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="DIPROSES">DIPROSES</option>
                  <option value="SELESAI">SELESAI (TERSELESAIKAN)</option>
                  <option value="DITOLAK">DITOLAK</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Catatan/Jawaban Sengketa</label>
                <textarea
                  rows={3}
                  value={objResponse}
                  onChange={(e) => setObjResponse(e.target.value)}
                  placeholder="Catatan verifikasi atas pengajuan keberatan..."
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none leading-relaxed"
                />
              </div>

              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2">
                <Save size={14} />
                <span>Simpan Tanggapan Keberatan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload/Edit Modal */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col gap-5 relative">
            <button onClick={() => setDocModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-655">
              <X size={20} />
            </button>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingDoc ? "Edit Dokumen PPID" : "Unggah Dokumen Publik Baru"}
            </h3>
            <form onSubmit={handleDocSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nama/Judul Dokumen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laporan Keuangan Semester 1 2025..."
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Kategori Dokumen Publik</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                >
                  <option value="DIP">DIP (Daftar Informasi Publik)</option>
                  <option value="Laporan Keuangan">Laporan Keuangan</option>
                  <option value="Renstra">Renstra (Rencana Strategis)</option>
                  <option value="Regulasi">Regulasi Daerah / Perda</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">File Berkas (PDF / Dokumen)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFileUpload(e, "document")}
                    disabled={uploadingDocFile}
                    className="file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                  />
                  <input
                    type="text"
                    required
                    placeholder="URL Berkas..."
                    value={docFileUrl}
                    onChange={(e) => setDocFileUrl(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white w-24"
                  />
                </div>
                {uploadingDocFile && <span className="text-[9px] text-emerald-500">Mengunggah...</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Keterangan Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  placeholder="Masukkan penjelasan singkat tentang dokumen..."
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none"
                />
              </div>

              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <Save size={14} />
                <span>Simpan Dokumen</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
