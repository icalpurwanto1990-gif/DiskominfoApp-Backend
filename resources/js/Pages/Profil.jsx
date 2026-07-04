import React, { useState } from "react";
import { Landmark, Award, BookOpen, Users, FolderOpen, ArrowDownToLine } from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

export const Profil = ({ profileData, staff, documents }) => {
  const [activeTab, setActiveTab] = useState("visi-misi");

  const tabs = [
    { id: "visi-misi", label: "Visi & Misi", icon: Award },
    { id: "tupoksi", label: "Tugas & Fungsi", icon: Landmark },
    { id: "struktur", label: "Struktur Organisasi", icon: BookOpen },
    { id: "pegawai", label: "Daftar Pegawai", icon: Users },
    { id: "dokumen", label: "Dokumen Renstra", icon: FolderOpen },
  ];

  const getProfileVal = (key, fallback) => {
    return profileData[key] !== undefined ? profileData[key] : fallback;
  };

  const getCustomIconUrl = (iconPath) => {
    if (!iconPath) return "";
    if (iconPath.startsWith("http") || iconPath.startsWith("/")) {
      return iconPath;
    }
    return `/uploads/${iconPath}`;
  };

  const visiKabupaten = getProfileVal(
    "visi_kabupaten",
    "Mewujudkan Masyarakat Kabupaten Banggai Kepulauan yang Maju, Mandiri, Aman, Sejahtera, dan Berdaya Saing melalui Pemerintahan yang Bersih dan Digital."
  );

  const tupoksiTugas = getProfileVal(
    "tupoksi_tugas",
    "Dinas Komunikasi dan Informatika mempunyai tugas membantu Bupati dalam melaksanakan urusan pemerintahan bidang komunikasi, informatika, persandian, dan statistik yang menjadi kewenangan daerah."
  );

  const tupoksiFungsi1Title = getProfileVal("tupoksi_fungsi_1_title", "Fungsi Perumusan Kebijakan");
  const tupoksiFungsi1Desc = getProfileVal(
    "tupoksi_fungsi_1_desc",
    "Perumusan kebijakan teknis di bidang aplikasi informatika, infrastruktur TIK, komunikasi publik, pengelolaan data sektoral, serta persandian daerah."
  );

  const tupoksiFungsi2Title = getProfileVal("tupoksi_fungsi_2_title", "Fungsi Pelaksanaan & Pengawasan");
  const tupoksiFungsi2Desc = getProfileVal(
    "tupoksi_fungsi_2_desc",
    "Penyelenggaraan dan pengawasan tata kelola SPBE, keamanan cyber pemerintah, distribusi informasi pembangunan daerah, serta fasilitasi pers."
  );

  // struktur organisasi now uses uploaded image

  // Filter renstra documents (case insensitive)
  const renstraDocuments = documents.filter((doc) =>
    doc.category.toLowerCase().includes("renstra")
  );

  return (
    <MainLayout>
      {/* Premium Page Hero */}
      <PageHero
        label="PROFIL DINAS"
        title="Dinas Komunikasi dan Informatika"
        subtitle="Pemerintah Kabupaten Banggai Kepulauan — Mewujudkan pemerintahan yang cerdas, terhubung, dan transparan melalui transformasi digital"
        icon={Landmark}
        gradient="from-emerald-950 via-slate-900 to-slate-950"
        accentColor="text-emerald-400"
        blobColor="bg-emerald-500"
        breadcrumbs={[{ label: "Profil Dinas" }]}
        stats={[
          { label: "Total Pegawai", value: staff?.length || "—", icon: Users },
          { label: "Layanan Aktif", value: "9+", icon: Award },
          { label: "Dokumen Publik", value: documents?.length || "—", icon: FolderOpen },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">

        {/* Responsive Tabs Menu */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition ${activeTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                  }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full min-h-[300px]">
          {/* TAB 1: VISI MISI */}
          {activeTab === "visi-misi" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
              <div className="p-8 bg-emerald-950 text-white rounded-3xl flex flex-col gap-4 shadow-sm">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">VISI KABUPATEN</span>
                <div
                  className="text-sm md:text-base leading-relaxed font-semibold"
                  dangerouslySetInnerHTML={{ __html: visiKabupaten }}
                />
              </div>
              <div className="flex flex-col gap-6 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">MISI KABUPATEN</span>
                <div
                  className="text-xs md:text-sm font-semibold text-slate-650 dark:text-slate-400 leading-relaxed pl-4"
                  dangerouslySetInnerHTML={{
                    __html: getProfileVal("misi_diskominfo", "Mempercepat pembangunan infrastruktur jaringan telekomunikasi guna mengentaskan area blankspot di wilayah pedesaan.<br/>Mengintegrasikan seluruh sistem pelayanan publik digital Organisasi Perangkat Daerah (OPD) dalam kerangka SPBE.<br/>Meningkatkan keterbukaan informasi publik dan pelayanan dokumentasi informasi secara transparan melalui PPID.<br/>Menyelenggarakan tata kelola keamanan informasi daerah dan sertifikat tanda tangan elektronik (TTE) yang andal.")
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: TUPOKSI */}
          {activeTab === "tupoksi" && (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-6 animate-fadeIn text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Tugas Pokok dan Fungsi</h3>
              <div
                className="leading-relaxed text-xs md:text-sm font-semibold"
                dangerouslySetInnerHTML={{ __html: tupoksiTugas }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl flex flex-col gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">{tupoksiFungsi1Title}</span>
                  <div
                    className="text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                    dangerouslySetInnerHTML={{ __html: tupoksiFungsi1Desc }}
                  />
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl flex flex-col gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">{tupoksiFungsi2Title}</span>
                  <div
                    className="text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                    dangerouslySetInnerHTML={{ __html: tupoksiFungsi2Desc }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STRUKTUR */}
          {activeTab === "struktur" && (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center gap-8 animate-fadeIn w-full">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider self-start">Struktur Organisasi</h3>

              <div className="w-full flex justify-center items-center mt-4 overflow-x-auto pb-4">
                {getProfileVal("struktur_organisasi_foto") ? (
                  <img
                    src={getCustomIconUrl(getProfileVal("struktur_organisasi_foto"))}
                    alt="Struktur Organisasi"
                    className="max-w-full h-auto rounded-2xl shadow-sm object-contain"
                  />
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400 font-semibold uppercase tracking-widest animate-pulse">
                    Gambar Struktur Organisasi Belum Diunggah
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PEGAWAI */}
          {activeTab === "pegawai" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Daftar Pegawai Diskominfo</h3>
              {staff.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-405 font-bold uppercase text-xs">
                  Tidak ada data pegawai yang terdaftar.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map((pegawai, idx) => (
                    <div key={pegawai.id || idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex gap-4 items-center">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-950 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-850 text-slate-400">
                        {pegawai.image ? (
                          <img src={pegawai.image} alt={pegawai.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={24} />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {pegawai.gelarDepan ? pegawai.gelarDepan + " " : ""}{pegawai.name}{pegawai.gelarBelakang ? ", " + pegawai.gelarBelakang : ""}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">{pegawai.position}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOKUMEN RENSTRA */}
          {activeTab === "dokumen" && (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-6 animate-fadeIn">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Download Center Dokumen Perencanaan</h3>
              {renstraDocuments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold uppercase text-xs">
                  Tidak ada dokumen perencanaan (Renstra) yang tersedia saat ini.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {renstraDocuments.map((doc) => (
                    <div key={doc.id} className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{doc.title}</span>
                        <span className="text-[10px] text-slate-400 mt-1 font-bold">Format: PDF • Ukuran: {doc.fileSize} • Unduhan: {doc.downloads} kali</span>
                      </div>
                      <a
                        href={doc.fileUrl ? (doc.fileUrl.startsWith('http') || doc.fileUrl.startsWith('/') ? doc.fileUrl : `/uploads/${doc.fileUrl}`) : '#'}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition self-stretch sm:self-auto text-center justify-center"
                      >
                        <ArrowDownToLine size={14} />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
export default Profil;
