import React, { useState } from "react";
import { Star, CheckCircle, Send } from "lucide-react";

export const SurveyWidget = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("Layanan Informasi");
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Layanan Informasi",
    "Layanan PPID",
    "Aksesibilitas Website",
    "Pengajuan TTE",
    "Aduan Jaringan",
  ];

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

  if (isSubmitted) {
    return (
      <div className="w-full p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
          <CheckCircle className="text-emerald-500 w-8 h-8 stroke-[2]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h4 className="font-black text-base text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Terima Kasih!</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-xs leading-relaxed font-medium">
            Umpan balik Anda telah kami terima. Data ini sangat berharga untuk meningkatkan kualitas pelayanan publik digital di Kabupaten Banggai Kepulauan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
      <div className="flex flex-col gap-1 mb-5">
        <h3 className="font-black text-sm text-slate-900 dark:text-white tracking-wide">Survey Kepuasan Masyarakat</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Bantu kami meningkatkan pelayanan publik dengan memberikan penilaian Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
        {/* Rating selection */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300">Bagaimana kualitas layanan kami?</label>
          <div className="flex items-center gap-1.5 mt-1" role="img" aria-label={`Rating: ${rating} dari 5 bintang`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 rounded-md transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                aria-label={`Beri rating ${star} bintang`}
              >
                <Star
                  size={26}
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

        {/* Category select */}
        <div className="flex flex-col gap-2">
          <label htmlFor="survey-category" className="text-slate-700 dark:text-slate-300">Kategori Pelayanan</label>
          <select
            id="survey-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none dark:text-white transition text-xs"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Comment textarea */}
        <div className="flex flex-col gap-2">
          <label htmlFor="survey-comment" className="text-slate-700 dark:text-slate-300">Catatan atau Saran (Opsional)</label>
          <textarea
            id="survey-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tuliskan saran perbaikan..."
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none dark:text-white resize-none transition text-xs"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={13} />
          )}
          <span>{isSubmitting ? "Mengirim..." : "Kirim Umpan Balik"}</span>
        </button>
      </form>
    </div>
  );
};
export default SurveyWidget;
