import React, { useState, useEffect, useCallback } from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const HeroSlider = ({ initialImages, heroStats, welcomeSpeech }) => {
  const defaultSlides = [
    {
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
      title: "Transformasi Digital Layanan SPBE",
      description:
        "Selamat datang di Portal Resmi Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan. Hub pusat pelayanan SPBE, Satu Data Daerah, dan Keterbukaan Informasi Publik (PPID) terpadu.",
    },
  ];

  const slides = initialImages && initialImages.length > 0 ? initialImages : defaultSlides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { setIsMounted(true); }, []);

  const INTERVAL = 6000;

  // Auto-advance & progress bar
  useEffect(() => {
    if (slides.length <= 1) return;
    setProgress(0);
    let start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, 50);
    const advance = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, INTERVAL);
    return () => { clearInterval(tick); clearTimeout(advance); };
  }, [currentIndex, slides.length]);

  const goTo = useCallback((idx) => setCurrentIndex(idx), []);
  const handlePrev = () => setCurrentIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const handleNext = () => setCurrentIndex((p) => (p + 1) % slides.length);

  const currentSlide = slides[currentIndex];

  return (
    <section className="w-full relative overflow-hidden min-h-[85vh] flex items-center bg-slate-950">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {isMounted && (
          <AnimatePresence>
            {currentSlide?.url && (
              <motion.div
                key={`bg-${currentIndex}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1.08 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1 }, scale: { duration: 8, ease: "linear" } }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${currentSlide.url}')` }}
              />
            )}
          </AnimatePresence>
        )}
        {/* Multi-layer gradient overlay for dramatic effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-950/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-10" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] z-10 pointer-events-none" />
      </div>

      {/* Floating accent orbs */}
      <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-teal-500/6 rounded-full blur-2xl z-10 pointer-events-none" />

      {/* Slide Content — Grid Layout */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-20 sm:pt-40 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 flex flex-col justify-center">
          {isMounted ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-2xl flex flex-col gap-6"
              >
                {/* Portal Badge */}
                <div className="flex items-center gap-2 w-fit px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">
                    Portal Resmi Digital Kabupaten Banggai Kepulauan
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.15] tracking-tight">
                  {currentSlide?.title || "Transformasi Digital Layanan SPBE"}
                </h1>

                {/* Description */}
                <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl font-medium">
                  {currentSlide?.description ||
                    "Hub pusat pelayanan SPBE, Satu Data Daerah, dan Keterbukaan Informasi Publik (PPID) terpadu Kabupaten Banggai Kepulauan."}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Link
                    href="/layanan"
                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 active:scale-[0.98]"
                  >
                    <span>Layanan Digital</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/profil"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-semibold text-sm rounded-xl backdrop-blur-sm transition-all duration-300"
                  >
                    <Globe size={15} />
                    <span>Tentang Kami</span>
                  </Link>
                </div>

                {/* Quick Stats Strip */}
                <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-white/10">
                  {(heroStats && heroStats.length > 0 ? heroStats : [
                    { label: "Layanan Digital", value: "12+" },
                    { label: "Website OPD", value: "28+" },
                    { label: "Aparatur TTE", value: "377" },
                  ]).map((stat, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xl font-black text-emerald-400">{stat.value}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            /* SSR Fallback */
            <div className="max-w-2xl flex flex-col gap-6">
              <h1 className="text-4xl font-black text-white">Transformasi Digital Layanan SPBE</h1>
              <p className="text-slate-300">Hub pusat pelayanan SPBE Kabupaten Banggai Kepulauan.</p>
            </div>
          )}
        </div>

        {/* Right Side: Three Leaders Photos */}
        <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative min-h-[400px]">
          <div className="flex gap-4 items-end relative z-10">
            {/* 1. Bupati Card */}
            <div className="w-28 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 flex flex-col gap-2 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden relative">
                <img
                  src="/uploads/settings/bupati.png"
                  alt="Bupati"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-slate-800">
                  <span className="text-[8px] font-black text-slate-400">FOTO BUPATI</span>
                </div>
              </div>
              <div className="flex flex-col text-center pb-1">
                <span className="text-[8px] font-black text-white uppercase tracking-wider leading-none">Bupati</span>
                <span className="text-[6px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Pimpinan</span>
              </div>
            </div>

            {/* 2. Wakil Bupati Card (Staggered offset) */}
            <div className="w-28 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 flex flex-col gap-2 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl translate-y-3">
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden relative">
                <img
                  src="/uploads/settings/wakil_bupati.png"
                  alt="Wakil Bupati"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-slate-800">
                  <span className="text-[8px] font-black text-slate-400">FOTO WAKIL</span>
                </div>
              </div>
              <div className="flex flex-col text-center pb-1">
                <span className="text-[8px] font-black text-white uppercase tracking-wider leading-none">Wakil Bupati</span>
                <span className="text-[6px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Wakil</span>
              </div>
            </div>

            {/* 3. Kadis Card */}
            <div className="w-28 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 flex flex-col gap-2 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden relative">
                <img
                  src={welcomeSpeech?.foto || "/uploads/settings/kadis.png"}
                  alt="Kepala Dinas"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-slate-800">
                  <span className="text-[8px] font-black text-slate-400">FOTO KADIS</span>
                </div>
              </div>
              <div className="flex flex-col text-center pb-1">
                <span className="text-[8px] font-black text-white uppercase tracking-wider leading-none">Kadis Kominfo</span>
                <span className="text-[6px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Sekretariat</span>
              </div>
            </div>
          </div>

          {/* Glowing slow-rotating tech background circles */}
          <div className="absolute w-72 h-72 rounded-full border border-emerald-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-80 h-80 rounded-full border border-dashed border-teal-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-[spin_80s_linear_infinite]" />
        </div>
      </div>

      {/* Slide Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
            aria-label="Slide berikutnya"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dot Indicators + Progress */}
          <div className="absolute bottom-8 left-6 md:left-12 z-30 flex items-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Slide ${idx + 1}`}
                className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
                style={{ width: idx === currentIndex ? 32 : 8, background: "rgba(255,255,255,0.3)" }}
              >
                {idx === currentIndex && (
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full transition-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Slide counter */}
          <div className="absolute bottom-8 right-6 md:right-12 z-30 text-white/50 text-xs font-bold tracking-widest">
            {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
