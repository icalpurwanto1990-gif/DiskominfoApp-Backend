import React, { useState, useEffect } from "react";
import { Star, CheckCircle, Send, X } from "lucide-react";

export const SurveyModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([
    "Layanan Informasi",
    "Layanan PPID",
    "Aksesibilitas Website",
    "Pengajuan TTE",
    "Aduan Jaringan",
  ]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/survey/categories");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            setCategory(data[0]);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil kategori survey:", error);
      }
    };
    fetchCategories();
  }, []);

  // Auto-close on successful submit after a short delay
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, onClose]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({ rating, category, comment }),
      });
      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Survey submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-5 animate-scaleUp mx-4">
        
        {/* Close Button */}
        {!isSubmitted && (
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        )}

        {isSubmitted ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="text-emerald-500 w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="font-extrabold text-base text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">Terima Kasih!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-semibold">
                Penilaian Anda telah kami simpan. Masukan Anda sangat berharga dalam meningkatkan kualitas pelayanan publik di Kabupaten Banggai Kepulauan.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 pr-6">
              <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Umpan Balik Masyarakat
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-wide">
                Survey Kepuasan Layanan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Bantu kami terus berbenah dan meningkatkan kualitas pelayanan publik dengan memberikan ulasan singkat Anda.
              </p>
            </div>

            {/* QR Code Section */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <img
                src="/images/survey-qr.png"
                alt="QR Code Survey Kepuasan Masyarakat Diskominfo Bangkep"
                className="w-20 h-20 object-contain rounded-lg flex-shrink-0"
                loading="lazy"
              />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  📱 Scan via Ponsel
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Scan QR Code di samping untuk mengisi survey kepuasan layanan secara langsung dari ponsel Anda.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">atau isi di sini</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">

              
              {/* Stars Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300">Bagaimana kualitas layanan Diskominfo?</label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-md transition hover:scale-115 focus:outline-none focus:ring-2 focus:ring-emerald-550"
                      aria-label={`Beri rating ${star} bintang`}
                    >
                      <Star
                        size={28}
                        className={`transition-all duration-150 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400 scale-110"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-2">
                <label htmlFor="survey-category" className="text-slate-700 dark:text-slate-300">Kategori Pelayanan</label>
                <select
                  id="survey-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none dark:text-white transition text-xs font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-2">
                <label htmlFor="survey-comment" className="text-slate-700 dark:text-slate-300">Catatan atau Saran (Opsional)</label>
                <textarea
                  id="survey-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tuliskan kritik, saran, atau masukan..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-550 focus:border-transparent focus:outline-none dark:text-white resize-none transition text-xs font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-md shadow-emerald-500/10"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>{isSubmitting ? "Mengirim..." : "Kirim Masukan"}</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition active:scale-[0.98]"
                >
                  Nanti Saja
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyModal;
