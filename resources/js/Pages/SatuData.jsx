import React, { useState, useEffect } from "react";
import { Search, Table, FileSpreadsheet, Braces, Database, DownloadCloud } from "lucide-react";
import { Head } from "@inertiajs/react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

export const SatuData = () => {
  const [datasets, setDatasets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingDataset, setViewingDataset] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const url = `/api/satu-data?q=${encodeURIComponent(search)}`;
        const res = await fetch(url);
        const data = await res.json();
        setDatasets(data);
      } catch (err) {
        console.error("Failed to load datasets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, [search]);

  const handleDownload = async (id, format) => {
    const dataset = datasets.find(d => d.id === id);
    if (!dataset) return;

    // Increment downloads count in local state to give instant visual feedback
    setDatasets(prev => prev.map(d => d.id === id ? { ...d, downloads: d.downloads + 1 } : d));

    if (format === "csv") {
      if (dataset.fileUrl) {
        // Trigger download of the actual CSV file
        const link = document.createElement("a");
        link.href = dataset.fileUrl;
        link.setAttribute("download", `${dataset.slug}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (dataset.jsonData && dataset.jsonData.length > 0) {
        // Generate CSV from JSON data on client-side
        const headers = Object.keys(dataset.jsonData[0]);
        const csvRows = [
          headers.join(","),
          ...dataset.jsonData.map(row => 
            headers.map(fieldName => JSON.stringify(row[fieldName] ?? "")).join(",")
          )
        ];
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${dataset.slug}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("File CSV tidak tersedia.");
      }
    } else if (format === "json") {
      if (dataset.jsonData && dataset.jsonData.length > 0) {
        const jsonString = JSON.stringify(dataset.jsonData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${dataset.slug}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Data JSON tidak tersedia.");
      }
    }
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <MainLayout>
      <Head>
        <title>Portal Data Sektoral Daerah - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan</title>
        <meta name="description" content="Penyediaan data sektoral pemerintah daerah Kabupaten Banggai Kepulauan yang transparan, mudah diakses, dan dapat dibagipakaikan oleh publik." />
        <meta name="keywords" content="Satu Data Banggai Kepulauan, Data Sektoral, Dataset Pemda, Open Data" />
        <link rel="canonical" href={pageUrl || "http://localhost:3001/satu-data"} />
        <meta property="og:title" content="Portal Data Sektoral Daerah - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan" />
        <meta property="og:description" content="Penyediaan data sektoral pemerintah daerah Kabupaten Banggai Kepulauan yang transparan, mudah diakses, dan dapat dibagipakaikan oleh publik." />
        <meta property="og:url" content={pageUrl || "http://localhost:3001/satu-data"} />
        <meta property="og:type" content="website" />
      </Head>
      {/* Premium Page Hero */}
      <PageHero
        label="DATA SEKTORAL"
        title="Portal Data Sektoral Daerah"
        subtitle="Penyediaan data sektoral pemerintah daerah Kabupaten Banggai Kepulauan yang transparan, mudah diakses, dan dapat dibagipakaikan oleh publik dan OPD"
        icon={Database}
        gradient="from-purple-950 via-slate-900 to-slate-950"
        accentColor="text-purple-400"
        blobColor="bg-purple-500"
        breadcrumbs={[{ label: "Data Sektoral" }]}
        stats={[
          { label: "Total Dataset", value: datasets.length || "...", icon: Table },
          { label: "Unduhan Tersedia", value: "CSV & JSON", icon: DownloadCloud },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">

        {/* Search Row */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari dataset daerah (misal: TTE, Kepegawaian)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold dark:text-white"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>

        {/* Main Grid: Left is dataset lists, Right is interactive detail preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Datasets List */}
          <div className={`flex flex-col gap-4 ${viewingDataset ? "lg:col-span-6" : "lg:col-span-12"}`}>
            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2].map((n) => (
                  <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                ))}
              </div>
            ) : datasets.length === 0 ? (
              <div className="w-full text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada dataset ditemukan</span>
              </div>
            ) : (
              datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-4 transition hover:border-emerald-500/30 ${
                    viewingDataset?.id === dataset.id ? "border-emerald-500 ring-2 ring-emerald-500/10" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1.5 font-semibold text-xs">
                      <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded w-fit uppercase tracking-wider">
                        Kategori: {dataset.category}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white leading-snug">
                        {dataset.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setViewingDataset(dataset)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] uppercase transition flex-shrink-0"
                    >
                      <Table size={12} />
                      <span>Intip Data</span>
                    </button>
                  </div>

                  <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold line-clamp-2">
                    {dataset.description}
                  </p>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-wrap justify-between items-center gap-3 text-[10px] font-bold text-slate-400">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span>Produsen: {dataset.metadata?.produsen}</span>
                      <span>Lisensi: {dataset.metadata?.lisensi}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(dataset.id, "csv")}
                        className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition"
                        title="Download CSV"
                      >
                        <FileSpreadsheet size={14} className="text-emerald-500" />
                      </button>
                      <button
                        onClick={() => handleDownload(dataset.id, "json")}
                        className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition"
                        title="Download JSON API"
                      >
                        <Braces size={14} className="text-blue-500" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Right: Interactive Table Data Preview */}
          {viewingDataset && (
            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-6 animate-fadeIn sticky top-36 max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">INTERACTIVE PREVIEW</span>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">{viewingDataset.title}</h3>
                </div>
                <button
                  onClick={() => setViewingDataset(null)}
                  className="text-[10px] text-slate-400 hover:text-slate-950 dark:hover:text-white font-bold uppercase tracking-wider"
                >
                  Tutup
                </button>
              </div>

              {/* Scrollable table container */}
              <div className="flex-grow overflow-auto text-[10px] border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                <table className="w-full text-left border-collapse font-semibold">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      {Object.keys(viewingDataset.jsonData?.[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-3 capitalize">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {viewingDataset.jsonData?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20">
                        {Object.values(row).map((val, colIdx) => (
                          <td key={colIdx} className="px-4 py-3">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-2">
                Menampilkan {viewingDataset.jsonData?.length || 0} baris data sektoral aktif.
              </div>
            </div>
          )}

        </div>

      </div>
    </MainLayout>
  );
};

export default SatuData;
