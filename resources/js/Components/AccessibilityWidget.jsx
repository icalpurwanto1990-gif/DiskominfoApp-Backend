import React, { useState, useEffect } from "react";
import { useAccessibility } from "./AccessibilityContext";
import {
  Sun, Moon, Eye, ZoomIn, ZoomOut, RotateCcw, X,
  Type, Link2, HelpCircle, Volume2
} from "lucide-react";

export const AccessibilityWidget = () => {
  const {
    fontSizeMultiplier,
    contrastMode,
    dyslexiaMode,
    highlightLinks,
    readingGuide,
    ttsEnabled,
    setContrastMode,
    setDyslexiaMode,
    setHighlightLinks,
    setReadingGuide,
    setTtsEnabled,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    resetAll,
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const [lineY, setLineY] = useState(0);

  // Reading Guide mouse tracker
  useEffect(() => {
    if (!readingGuide) return;
    const handleMouseMove = (e) => {
      setLineY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [readingGuide]);

  return (
    <>
      {/* Reading Guide Line */}
      {readingGuide && (
        <div
          className="fixed left-0 right-0 pointer-events-none z-[9999] border-b-2 border-emerald-500/70 bg-emerald-500/5 shadow-sm"
          style={{
            top: `${lineY}px`,
            height: "24px",
            transform: "translateY(-12px)",
            backdropFilter: "contrast(1.1)",
          }}
        />
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#0a549e] hover:bg-[#073d73] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-white/10"
          title="Fasilitas Aksesibilitas (Disabilitas)"
          aria-label="Buka Menu Aksesibilitas"
          aria-expanded={isOpen}
        >
          {/* Custom Human Accessibility SVG Icon */}
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
          </svg>
        </button>

        {/* Accessibility Control Panel */}
        {isOpen && (
          <div className="absolute bottom-14 left-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350 animate-fadeIn backdrop-blur-md bg-white/95 dark:bg-slate-900/95 max-h-[75vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex flex-col">
                <span className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider">Fasilitas Aksesibilitas</span>
                <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Penyesuaian untuk disabilitas & lansia</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label="Tutup Menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Font Size Adjuster */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Ukuran Huruf Konten</label>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-150 dark:border-slate-850">
                <button
                  onClick={decreaseFontSize}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                  title="Perkecil Huruf"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round(fontSizeMultiplier * 100)}%</span>
                <button
                  onClick={increaseFontSize}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                  title="Perbesar Huruf"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Contrast Mode Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Mode Kontras Layar</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "normal", label: "Terang", icon: Sun, style: "bg-slate-50 border-slate-200 text-slate-800" },
                  { id: "dark", label: "Gelap", icon: Moon, style: "bg-slate-950 border-slate-800 text-slate-200" },
                  { id: "high-contrast", label: "Kontras", icon: Eye, style: "bg-black border-yellow-500 text-yellow-400" },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setContrastMode(opt.id)}
                      className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-[9px] uppercase transition ${opt.style} ${
                        contrastMode === opt.id
                          ? "ring-2 ring-emerald-500 border-emerald-500 scale-[1.03]"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Icon size={12} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dyslexia Mode Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Type size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-250">Huruf Ramah Disleksia</span>
                  <span className="text-[8px] text-slate-400 font-semibold">Ubah font agar mudah dibaca</span>
                </div>
              </div>
              <button
                onClick={() => setDyslexiaMode(!dyslexiaMode)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  dyslexiaMode ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ${
                    dyslexiaMode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Highlight Links Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
                  <Link2 size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-250">Sorot Tautan (Link)</span>
                  <span className="text-[8px] text-slate-400 font-semibold">Tebalkan penanda semua link</span>
                </div>
              </div>
              <button
                onClick={() => setHighlightLinks(!highlightLinks)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  highlightLinks ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ${
                    highlightLinks ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Reading Guide Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <HelpCircle size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-250">Garis Panduan Membaca</span>
                  <span className="text-[8px] text-slate-400 font-semibold">Garis bantu pembaca layar</span>
                </div>
              </div>
              <button
                onClick={() => setReadingGuide(!readingGuide)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  readingGuide ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ${
                    readingGuide ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Text-to-Speech (TTS) Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
                  <Volume2 size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-250">Penyuara Teks (TTS)</span>
                  <span className="text-[8px] text-slate-400 font-semibold">Klik pada teks untuk bersuara</span>
                </div>
              </div>
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  ttsEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ${
                    ttsEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-3.5">
              <button
                onClick={resetAll}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={12} />
                Reset Semua
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition"
              >
                Simpan & Tutup
              </button>
            </div>

          </div>
        )}
      </div>
    </>
  );
};
