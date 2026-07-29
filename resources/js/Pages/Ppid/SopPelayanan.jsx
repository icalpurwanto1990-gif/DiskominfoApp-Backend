import React, { useState } from "react";
import { FileText, ArrowDownToLine, Search, AlertCircle, Calendar, Eye, HelpCircle, FileCheck, Layers, ClipboardCheck } from "lucide-react";
import { Head } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import PageHero from "../../Components/PageHero";
import ScrollReveal from "../../Components/ScrollReveal";

export const SopPelayanan = ({ initialDocuments = [] }) => {
  const [activeTab, setActiveTab] = useState("SOP APTIKA");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "SOP APTIKA", label: "Aplikasi Informatika (APTIKA)" },
    { id: "SOP IKP", label: "Informasi & Komunikasi Publik (IKP)" },
    { id: "SOP PERSANDIAN", label: "Persandian" },
    { id: "SOP Statistik", label: "Statistik Sektoral" },
    { id: "SOP", label: "Umum / Lainnya" },
  ];

  const getTabCount = (tabId) => {
    return initialDocuments.filter((doc) => {
      const docCategory = doc.category || "SOP";
      return tabId === "SOP"
        ? (docCategory === "SOP" || !tabs.some(t => t.id !== "SOP" && t.id === docCategory))
        : docCategory === tabId;
    }).length;
  };

  const filteredDocs = initialDocuments.filter((doc) => {
    const docCategory = doc.category || "SOP";
    const matchesTab = activeTab === "SOP"
      ? (docCategory === "SOP" || !tabs.some(t => t.id !== "SOP" && t.id === docCategory))
      : docCategory === activeTab;

    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

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

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <MainLayout>
      <Head>
        <title>SOP Pelayanan & Regulasi - PPID Kab. Banggai Kepulauan</title>
        <meta name="description" content="Alur pelayanan, tata cara pengajuan, dan dokumen Standar Operasional Prosedur (SOP) resmi Dinas Komunikasi dan Informatika." />
        <meta name="keywords" content="SOP Pelayanan, SOP Diskominfo, Regulasi Banggai Kepulauan, SOP IKP, SOP APTIKA" />
        <link rel="canonical" href={pageUrl || "http://localhost:3001/ppid/sop-pelayanan"} />
        <meta property="og:title" content="SOP Pelayanan & Regulasi - PPID Kab. Banggai Kepulauan" />
        <meta property="og:description" content="Alur pelayanan, tata cara pengajuan, dan dokumen Standar Operasional Prosedur (SOP) resmi Dinas Komunikasi dan Informatika." />
        <meta property="og:url" content={pageUrl || "http://localhost:3001/ppid/sop-pelayanan"} />
        <meta property="og:type" content="website" />
      </Head>
      <PageHero
        label="SOP LAYANAN"
        title="Standar Operasional Prosedur (SOP)"
        subtitle="Alur pelayanan, tata cara pengajuan, dan dokumen SOP resmi Diskominfo, APTIKA, Persandian, Statistik, dan Informasi Komunikasi Publik"
        icon={ClipboardCheck}
        gradient="from-slate-900 via-slate-900 to-emerald-950"
        accentColor="text-emerald-400"
        blobColor="bg-emerald-500"
        breadcrumbs={[
          { label: "Layanan", href: "/layanan" },
          { label: "SOP Pelayanan" }
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex flex-col gap-12">
        {/* Section 1: SOP Documents Download */}
        <ScrollReveal direction="up" className="w-full flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Unduh Berkas</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Dokumen Regulasi & SOP Resmi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Berkas dokumen Standar Operasional Prosedur yang disahkan untuk menjamin kepastian pelayanan informasi
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-800 scrollbar-none overflow-x-auto">
            <div className="flex gap-2 md:gap-6 -mb-px pb-1 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchQuery("");
                    }}
                    className={`pb-4 px-1 text-xs font-bold transition-all border-b-2 outline-none whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold transition-colors ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-850 text-slate-500"
                    }`}>
                      {getTabCount(tab.id)}
                    </span>
                  </button>
                );
              })}
            </div>
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
                placeholder="Cari berkas SOP di kategori ini..."
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
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-4 w-[6%] text-center">No.</th>
                    <th className="py-4 px-4 w-[60%]">Daftar Judul SOP Pelayanan</th>
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
                          <span className="text-[10px]">Belum ada dokumen SOP resmi di kategori ini.</span>
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
