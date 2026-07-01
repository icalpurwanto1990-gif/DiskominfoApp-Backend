import React, { useState } from "react";
import { Image, Video, FileImage, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const Media = ({ mediaList }) => {
  const [activeTab, setActiveTab] = useState("foto");
  const [activeVideo, setActiveVideo] = useState(null);

  const fotoItems = mediaList.filter(item => item.type === "FOTO" || item.type === "foto");
  const videoItems = mediaList.filter(item => item.type === "VIDEO" || item.type === "video");
  const infografisItems = mediaList.filter(item => item.type === "INFOGRAFIS" || item.type === "infografis");

  return (
    <MainLayout>
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
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: "foto", label: "Galeri Foto", icon: Image },
            { id: "video", label: "Galeri Video", icon: Video },
            { id: "infografis", label: "Infografis Layanan", icon: FileImage },
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

        {/* Grid Content */}
        <div className="w-full">
          {activeTab === "foto" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {fotoItems.length === 0 ? (
                <div className="col-span-full py-10 text-center text-slate-400 font-medium">Galeri foto kosong</div>
              ) : (
                fotoItems.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:border-emerald-500/50 transition">
                    <div className="h-48 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                      {item.url ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Image size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-1.5 font-semibold text-xs">
                      <h4 className="text-slate-900 dark:text-white font-extrabold leading-snug">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{item.meta}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "video" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
              {videoItems.length === 0 ? (
                <div className="col-span-full py-10 text-center text-slate-400 font-medium">Galeri video kosong</div>
              ) : (
                videoItems.map((item) => {
                  const ytId = getYoutubeId(item.url);
                  const thumbUrl = ytId 
                    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                    : item.url;

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => item.url && setActiveVideo(item.url)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:border-emerald-500/50 transition cursor-pointer group"
                    >
                      <div className="h-56 bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
                        {thumbUrl ? (
                          <img 
                            src={thumbUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-white dark:via-slate-950 to-teal-600/10 flex items-center justify-center">
                            <Video size={48} className="text-emerald-650" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-200" />
                        <span className="absolute w-14 h-14 bg-emerald-650 text-white rounded-full flex items-center justify-center shadow-lg font-bold hover:scale-110 active:scale-95 transition duration-300 z-10 border border-emerald-500/20">
                          <svg className="w-6 h-6 fill-current pl-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                      <div className="p-5 flex flex-col gap-1.5 font-semibold text-xs">
                        <h4 className="text-slate-900 dark:text-white font-extrabold leading-snug">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Durasi: {item.meta}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "infografis" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {infografisItems.length === 0 ? (
                <div className="col-span-full py-10 text-center text-slate-400 font-medium">Infografis kosong</div>
              ) : (
                infografisItems.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:border-emerald-500/50 transition">
                    <div className="h-56 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                      {item.url ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileImage size={28} className="text-slate-400" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-1.5 font-semibold text-xs">
                      <h4 className="text-slate-900 dark:text-white font-extrabold leading-snug">{item.title}</h4>
                      <a href={item.url || "#"} download className="w-full mt-3 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition border border-emerald-600/10">
                        <span>Unduh Gambar ({item.meta})</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-10"
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
