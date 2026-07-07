import React, { useState } from "react";
import { FileText, ArrowDownToLine, Search, AlertCircle, Calendar, Eye, HelpCircle, FileCheck, Layers, ClipboardCheck } from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import PageHero from "../../Components/PageHero";
import ScrollReveal from "../../Components/ScrollReveal";

export const SopPelayanan = ({ initialDocuments = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("permohonan");

  const filteredDocs = initialDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `/uploads/${url}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const permohonanSteps = [
    { num: "01", title: "Pengajuan Permohonan", desc: "Pemohon mengisi formulir permohonan informasi di portal PPID atau datang langsung dengan melampirkan salinan KTP/Identitas resmi." },
    { num: "02", title: "Verifikasi Berkas", desc: "Petugas PPID memeriksa kelengkapan administrasi dan berkas pemohon dalam waktu maksimal 3 hari kerja." },
    { num: "03", title: "Penyusunan Tanggapan", desc: "PPID Utama berkoordinasi dengan OPD pemilik data untuk menghimpun informasi yang diminta." },
    { num: "04", title: "Keputusan Pemberian", desc: "PPID menerbitkan surat keputusan pemberitahuan tertulis tentang status pemberian informasi." },
    { num: "05", title: "Pemberian Informasi", desc: "Informasi diberikan kepada pemohon melalui email, portal, atau diambil langsung dalam waktu 10 + 7 hari kerja." },
  ];

  const keberatanSteps = [
    { num: "01", title: "Pengajuan Keberatan", desc: "Pemohon mengajukan keberatan melalui formulir jika merasa ditolak, informasi lambat, atau biaya tidak wajar." },
    { num: "02", title: "Registrasi Keberatan", desc: "Petugas mencatat pengajuan keberatan dan memberikan tanda terima pendaftaran keberatan." },
    { num: "03", title: "Review Atasan PPID", desc: "Atasan PPID melakukan evaluasi dan koordinasi internal atas keberatan pemohon." },
    { num: "04", title: "Keputusan Atasan", desc: "Atasan PPID memberikan tanggapan tertulis atas keberatan yang diajukan pemohon." },
    { num: "05", title: "Penyelesaian Keberatan", desc: "Tanggapan diberikan dalam waktu maksimal 30 hari kerja sejak permohonan keberatan diregistrasi." },
  ];

  return (
    <MainLayout>
      <PageHero
        label="PPID UTAMA"
        title="Standar Operasional Prosedur (SOP)"
        subtitle="Alur pelayanan permohonan informasi, tata cara pengajuan keberatan, dan dokumen SOP resmi PPID"
        icon={ClipboardCheck}
        gradient="from-slate-900 via-slate-900 to-emerald-950"
        accentColor="text-emerald-400"
        blobColor="bg-emerald-500"
        breadcrumbs={[
          { label: "PPID", href: "/ppid" },
          { label: "SOP Pelayanan" }
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex flex-col gap-16">
        {/* Section 1: Interactive Procedure Flowchart */}
        <ScrollReveal direction="up" className="w-full flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Alur Pelayanan</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Prosedur Layanan Informasi Publik</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Panduan interaktif tata cara permohonan informasi dan pengajuan keberatan pada PPID Utama Kabupaten Banggai Kepulauan
            </p>
          </div>

          {/* Flow Tabs */}
          <div className="flex justify-center gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-px">
            <button
              onClick={() => setActiveTab("permohonan")}
              className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "permohonan"
                  ? "border-emerald-500 text-slate-900 dark:text-white"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
              }`}
            >
              Alur Permohonan Informasi
            </button>
            <button
              onClick={() => setActiveTab("keberatan")}
              className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === "keberatan"
                  ? "border-emerald-500 text-slate-900 dark:text-white"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
              }`}
            >
              Alur Pengajuan Keberatan
            </button>
          </div>

          {/* Steps Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
            {(activeTab === "permohonan" ? permohonanSteps : keberatanSteps).map((step, idx) => (
              <div
                key={idx}
                className="relative bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-bl-[40px] opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-3xl font-black text-emerald-500/30 dark:text-emerald-500/20 leading-none">
                  {step.num}
                </span>
                <div className="flex flex-col gap-1.5 z-10">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{step.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Section 2: SOP Documents Download */}
        <ScrollReveal direction="up" className="w-full flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Unduh Berkas</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Dokumen Regulasi & SOP Resmi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Berkas dokumen Standar Operasional Prosedur yang disahkan untuk menjamin kepastian pelayanan informasi
            </p>
          </div>

          {/* Search bar & statistics */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900/40 p-4 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berkas SOP..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>Menampilkan:</span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded">
                {filteredDocs.length} SOP
              </span>
            </div>
          </div>

          {/* Table list */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/20 mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-4 w-[6%] text-center">No.</th>
                    <th className="py-4 px-4 w-[60%]">Daftar Judul SOP Pelayanan PPID</th>
                    <th className="py-4 px-4 w-[14%]">Tanggal Publikasi</th>
                    <th className="py-4 px-4 w-[10%]">Ukuran</th>
                    <th className="py-4 px-4 w-[10%] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc, idx) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg mt-0.5">
                              <FileText size={14} />
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 leading-snug">
                              {doc.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>{formatDate(doc.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-bold uppercase">{doc.fileSize || "0 KB"}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={getFileUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-slate-100 hover:bg-emerald-500/10 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                              title="Lihat Pratinjau"
                            >
                              <Eye size={14} />
                            </a>
                            <a
                              href={getFileUrl(doc.fileUrl)}
                              download
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-lg transition-all"
                              title="Download Dokumen"
                            >
                              <ArrowDownToLine size={14} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle size={24} className="text-slate-300" />
                          <span className="font-semibold text-sm">Dokumen SOP Tidak Ditemukan</span>
                          <span className="text-[10px]">Belum ada dokumen SOP resmi yang diunggah saat ini.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </MainLayout>
  );
};

export default SopPelayanan;
