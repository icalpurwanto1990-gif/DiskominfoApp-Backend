import React, { useState, useEffect } from "react";
import { 
  Image, 
  Video, 
  FileImage, 
  X, 
  ZoomIn, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Calendar, 
  Sparkles,
  Share2,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Head } from "@inertiajs/react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const Media = ({ mediaList = [] }) => {
  const [activeTab, setActiveTab] = useState("foto");
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [activeInfografisIndex, setActiveInfografisIndex] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fotoItems = mediaList.filter(item => item.type === "FOTO" || item.type === "foto");
  const videoItems = mediaList.filter(item => item.type === "VIDEO" || item.type === "video");
  const infografisItems = mediaList.filter(item => item.type === "INFOGRAFIS" || item.type === "infografis");

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Keyboard navigation for Lightbox (Left / Right / Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhotoIndex !== null) {
        if (e.key === "ArrowRight") {
          setActivePhotoIndex((prev) => (prev + 1) % fotoItems.length);
        } else if (e.key === "ArrowLeft") {
          setActivePhotoIndex((prev) => (prev - 1 + fotoItems.length) % fotoItems.length);
        } else if (e.key === "Escape") {
          setActivePhotoIndex(null);
        }
      } else if (activeInfografisIndex !== null) {
        if (e.key === "ArrowRight") {
          setActiveInfografisIndex((prev) => (prev + 1) % infografisItems.length);
        } else if (e.key === "ArrowLeft") {
          setActiveInfografisIndex((prev) => (prev - 1 + infografisItems.length) % infografisItems.length);
        } else if (e.key === "Escape") {
          setActiveInfografisIndex(null);
        }
      } else if (activeVideo !== null) {
        if (e.key === "Escape") {
          setActiveVideo(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, activeInfografisIndex, activeVideo, fotoItems.length, infografisItems.length]);

  const handleShare = (url, title) => {
    if (navigator.share) {
      navigator.share({
        title: title || "Media Diskominfo Banggai Kepulauan",
        url: url || window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url || window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentPhoto = activePhotoIndex !== null ? fotoItems[activePhotoIndex] : null;
  const currentInfografis = activeInfografisIndex !== null ? infografisItems[activeInfografisIndex] : null;

  return (
    <MainLayout>
      <Head>
        <title>Galeri & Media Center - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan</title>
        <meta name="description" content="Dokumentasi kegiatan dinas, video edukasi pelayanan publik, dan infografis statistik daerah Kabupaten Banggai Kepulauan." />
        <meta name="keywords" content="Galeri Foto Diskominfo, Video Dinas Banggai Kepulauan, Infografis Diskominfo" />
        <link rel="canonical" href={pageUrl || "http://localhost:3001/media"} />
        <meta property="og:title" content="Galeri & Media Center - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan" />
        <meta property="og:description" content="Dokumentasi kegiatan dinas, video edukasi pelayanan publik, dan infografis statistik daerah Kabupaten Banggai Kepulauan." />
        <meta property="og:url" content={pageUrl || "http://localhost:3001/media"} />
        <meta property="og:type" content="website" />
      </Head>

      {/* Premium Page Hero */}
      <PageHero
        label="MEDIA CENTER DISKOMINFO"
        title="Galeri & Media Center"
        subtitle="Dokumentasi kegiatan dinas, video edukasi pelayanan publik, dan infografis statistik daerah Kabupaten Banggai Kepulauan"
        icon={Image}
        gradient="from-pink-950 via-slate-900 to-slate-950"
        accentColor="text-pink-400"
        blobColor="bg-pink-500"
        breadcrumbs={[{ label: "Media Center" }]}
        stats={[
          { label: "Galeri Foto", value: fotoItems.length, icon: Image },
          { label: "Video Dinas", value: videoItems.length, icon: Video },
          { label: "Infografis", value: infografisItems.length, icon: FileImage },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">

        {/* Tabs Menu */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "foto", label: "Galeri Foto", icon: Image, count: fotoItems.length },
              { id: "video", label: "Galeri Video", icon: Video, count: videoItems.length },
              { id: "infografis", label: "Infografis Layanan", icon: FileImage, count: infografisItems.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-white" : "text-emerald-500"} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Klik foto atau video untuk membuka preview interaktif</span>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="w-full">
          
          {/* TAB 1: GALERI FOTO */}
          {activeTab === "foto" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {fotoItems.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Image size={28} />
                  </div>
                  <p className="text-slate-500 font-semibold text-sm">Belum ada dokumentasi foto yang diunggah.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
                  {fotoItems.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (index % 6) * 0.08 }}
                      onClick={() => setActivePhotoIndex(index)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer flex flex-col"
                    >
                      {/* Image Container with Smooth Zoom Effect */}
                      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        {item.url ? (
                          <img
                            src={item.url}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                            <Image size={36} />
                          </div>
                        )}

                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5" />

                        {/* Top Floating Badge */}
                        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold tracking-wider shadow-lg">
                          <Calendar size={11} className="text-emerald-400" />
                          <span>{item.meta || "Dokumentasi"}</span>
                        </div>

                        {/* Center Hover Action Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/90 backdrop-blur-md border border-emerald-400/30 text-white rounded-2xl text-xs font-bold shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                            <ZoomIn size={15} />
                            <span>Buka Layar Penuh</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Meta */}
                      <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-slate-900 dark:text-white font-extrabold text-sm leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline">
                            <Eye size={13} />
                            <span>Lihat Foto ({index + 1}/{fotoItems.length})</span>
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Diskominfo Bangkep</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GALERI VIDEO */}
          {activeTab === "video" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 animate-fadeIn">
              {videoItems.length === 0 ? (
                <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Video size={28} />
                  </div>
                  <p className="text-slate-500 font-semibold text-sm">Belum ada video dinas yang diunggah.</p>
                </div>
              ) : (
                videoItems.map((item, index) => {
                  const ytId = getYoutubeId(item.url);
                  const thumbUrl = ytId 
                    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                    : item.url;

                  return (
                    <motion.div 
                      key={item.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => item.url && setActiveVideo(item.url)}
                      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer group flex flex-col"
                    >
                      <div className="h-60 bg-slate-950 flex items-center justify-center relative overflow-hidden">
                        {thumbUrl ? (
                          <img 
                            src={thumbUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex items-center justify-center">
                            <Video size={48} className="text-emerald-500/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors duration-300" />
                        
                        {/* Play Button Glow */}
                        <div className="absolute w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-115 active:scale-95 transition-all duration-300 z-10 border border-white/30">
                          <svg className="w-7 h-7 fill-current pl-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>

                        {/* Top floating duration badge */}
                        <div className="absolute top-3.5 right-3.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white text-[10px] font-bold">
                          {item.meta || "Video"}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col gap-2">
                        <h4 className="text-slate-900 dark:text-white font-extrabold text-sm leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span>Putar Video Sekarang</span>
                          <span>→</span>
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: INFOGRAFIS LAYANAN */}
          {activeTab === "infografis" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 animate-fadeIn">
              {infografisItems.length === 0 ? (
                <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <FileImage size={28} />
                  </div>
                  <p className="text-slate-500 font-semibold text-sm">Belum ada infografis yang diunggah.</p>
                </div>
              ) : (
                infografisItems.map((item, index) => (
                  <motion.div 
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (index % 6) * 0.08 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 transition-all duration-500 flex flex-col"
                  >
                    <div 
                      onClick={() => setActiveInfografisIndex(index)}
                      className="relative h-64 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      {item.url ? (
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      ) : (
                        <FileImage size={36} className="text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xl">
                          <Maximize2 size={13} />
                          <span>Perbesar Infografis</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-3 justify-between flex-1">
                      <h4 className="text-slate-900 dark:text-white font-extrabold text-sm leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => setActiveInfografisIndex(index)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-[11px] transition"
                        >
                          <Eye size={13} />
                          <span>Lihat</span>
                        </button>
                        {item.url && (
                          <a 
                            href={item.url} 
                            download 
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition shadow-sm"
                          >
                            <Download size={13} />
                            <span>Unduh</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 FULLSCREEN PHOTO LIGHTBOX MODAL (INTERACTIVE & FLUID) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Top Toolbar */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs tracking-wider">
                  Foto {activePhotoIndex + 1} dari {fotoItems.length}
                </span>
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                  {currentPhoto.meta || "Dokumentasi Diskominfo"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Share button */}
                <button
                  onClick={() => handleShare(currentPhoto.url, currentPhoto.title)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition backdrop-blur-md focus:outline-none"
                  title="Bagikan"
                >
                  {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                </button>

                {/* Download button */}
                {currentPhoto.url && (
                  <a
                    href={currentPhoto.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition shadow-lg border border-emerald-500/30"
                    title="Unduh Resolusi Asli"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Unduh Foto</span>
                  </a>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setActivePhotoIndex(null)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-red-500 text-white border border-white/10 transition backdrop-blur-md focus:outline-none"
                  aria-label="Tutup Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>

            {/* Main Stage with Image & Nav Buttons */}
            <div className="relative flex-1 flex items-center justify-center my-4 w-full max-w-7xl mx-auto overflow-hidden">
              
              {/* Prev Button */}
              {fotoItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev - 1 + fotoItems.length) % fotoItems.length);
                  }}
                  className="absolute left-2 md:left-6 z-20 p-3.5 md:p-4 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white border border-white/15 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl focus:outline-none"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Central Image with Animate Presence Slide */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhotoIndex}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative max-h-[70vh] md:max-h-[76vh] max-w-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.title}
                    className="max-h-[70vh] md:max-h-[76vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Next Button */}
              {fotoItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev + 1) % fotoItems.length);
                  }}
                  className="absolute right-2 md:right-6 z-20 p-3.5 md:p-4 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white border border-white/15 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl focus:outline-none"
                  aria-label="Foto Berikutnya"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom Caption & Keyboard Instructions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-1.5 z-20 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-extrabold text-sm md:text-base leading-snug">
                {currentPhoto.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Gunakan tombol panah ◀ ▶ pada keyboard untuk navigasi foto, atau tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> untuk menutup
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🌟 FULLSCREEN INFOGRAFIS LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {currentInfografis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none"
            onClick={() => setActiveInfografisIndex(null)}
          >
            {/* Top Toolbar */}
            <div 
              className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs tracking-wider">
                  Infografis {activeInfografisIndex + 1} dari {infografisItems.length}
                </span>
                <span className="hidden sm:inline text-xs text-slate-300 font-bold truncate max-w-md">
                  {currentInfografis.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentInfografis.url && (
                  <a
                    href={currentInfografis.url}
                    download
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition shadow-lg"
                  >
                    <Download size={14} />
                    <span>Unduh Gambar</span>
                  </a>
                )}
                <button
                  onClick={() => setActiveInfografisIndex(null)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-red-500 text-white border border-white/10 transition backdrop-blur-md"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image Stage */}
            <div className="relative flex-1 flex items-center justify-center my-4 w-full max-w-7xl mx-auto overflow-hidden">
              {infografisItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfografisIndex((prev) => (prev - 1 + infografisItems.length) % infografisItems.length);
                  }}
                  className="absolute left-2 md:left-6 z-20 p-3.5 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white border border-white/15 backdrop-blur-md transition hover:scale-110"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeInfografisIndex}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-[76vh] max-w-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={currentInfografis.url}
                    alt={currentInfografis.title}
                    className="max-h-[76vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                </motion.div>
              </AnimatePresence>

              {infografisItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfografisIndex((prev) => (prev + 1) % infografisItems.length);
                  }}
                  className="absolute right-2 md:right-6 z-20 p-3.5 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white border border-white/15 backdrop-blur-md transition hover:scale-110"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            <div className="w-full max-w-2xl mx-auto text-center z-20">
              <p className="text-white font-extrabold text-sm">{currentInfografis.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🌟 LIGHTBOX VIDEO PLAYER MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 md:p-10"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 border border-white/10 text-white rounded-full transition z-50 focus:outline-none"
                aria-label="Tutup Video"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>

              {/* Video Player */}
              <div className="w-full h-full">
                {getYoutubeId(activeVideo) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo)}?autoplay=1&rel=0`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={activeVideo}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </MainLayout>
  );
};

export default Media;
