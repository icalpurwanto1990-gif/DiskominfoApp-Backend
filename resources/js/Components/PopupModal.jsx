import React, { useState, useEffect } from "react";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import SurveyModal from "./SurveyModal";

export const PopupModal = ({ initialConfig = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(initialConfig);

  // Fetch config if not passed via props
  useEffect(() => {
    if (!initialConfig) {
      const fetchConfig = async () => {
        try {
          const res = await fetch("/api/popup-modal");
          if (res.ok) {
            const data = await res.json();
            setConfig(data);
          }
        } catch (err) {
          console.error("Gagal memuat konfigurasi popup:", err);
        }
      };
      fetchConfig();
    } else {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // Handle open timer and session suppression
  useEffect(() => {
    if (!config || !config.is_active) {
      setIsOpen(false);
      return;
    }

    // Check if session storage has suppressed it
    if (config.show_once_per_session) {
      const dismissed = sessionStorage.getItem("diskominfo_popup_dismissed");
      if (dismissed === "1") {
        return;
      }
    }

    const delayMs = Math.max(1, (config.delay_seconds || 2)) * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [config]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("diskominfo_popup_dismissed", "1");
    } catch (e) {
      // Ignore
    }
  };

  if (!isOpen || !config || !config.is_active) {
    return null;
  }

  // If type is SURVEY, delegate to SurveyModal
  if (config.content_type === "SURVEY") {
    return <SurveyModal isOpen={isOpen} onClose={handleClose} />;
  }

  // Mode IMAGE (Gambar Penuh / Poster / Flyer)
  if (config.content_type === "IMAGE" && config.image_url) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label={config.title || "Poster Pengumuman"}
      >
        <div
          className="relative max-w-lg md:max-w-xl w-auto max-h-[90vh] flex flex-col items-center animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button Top-Right */}
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 text-white hover:bg-rose-600 border-2 border-white/20 shadow-xl flex items-center justify-center transition-all transform hover:scale-110 focus:outline-none"
            aria-label="Tutup Pengumuman"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Poster Content */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 group">
            {config.link_url ? (
              <a
                href={config.link_url}
                target={config.link_url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="block relative overflow-hidden"
                title="Buka Tautan Informasi"
              >
                <img
                  src={config.image_url}
                  alt={config.title || "Poster Pengumuman Resmi"}
                  className="w-auto h-auto max-h-[82vh] max-w-full object-contain rounded-2xl transition duration-300 group-hover:scale-[1.01]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center p-4">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg">
                    {config.button_text || "Buka Informasi Lengkap"}
                    <ExternalLink size={14} />
                  </span>
                </div>
              </a>
            ) : (
              <img
                src={config.image_url}
                alt={config.title || "Poster Pengumuman Resmi"}
                className="w-auto h-auto max-h-[85vh] max-w-full object-contain rounded-2xl"
                loading="eager"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mode ANNOUNCEMENT (Gambar + Judul + Keterangan + Tombol)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Optional Image Header */}
        {config.image_url && (
          <div className="relative w-full max-h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={config.image_url}
              alt={config.title || "Pengumuman"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-3">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Pengumuman Resmi
          </div>
          {config.title && (
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
              {config.title}
            </h3>
          )}
          {config.caption && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {config.caption}
            </p>
          )}

          {/* Action Button */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Tutup
            </button>
            {config.link_url && (
              <a
                href={config.link_url}
                target={config.link_url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
              >
                <span>{config.button_text || "Lihat Selengkapnya"}</span>
                <ArrowRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
