import React, { useState, useEffect } from "react";
import { Facebook, MessageCircle, Twitter, Copy } from "lucide-react";

export const ShareButtons = ({ title, slug }) => {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const shareUrl = `${origin}/berita/${slug}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " - " + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full">
      <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Bagikan Berita:</span>
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition uppercase tracking-wider shadow-sm hover:shadow"
        >
          <MessageCircle size={12} />
          <span>WhatsApp</span>
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition uppercase tracking-wider shadow-sm hover:shadow"
        >
          <Facebook size={12} />
          <span>Facebook</span>
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold transition uppercase tracking-wider shadow-sm hover:shadow"
        >
          <Twitter size={12} />
          <span>Twitter</span>
        </a>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition uppercase tracking-wider border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground shadow-sm ${
            copied ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : ""
          }`}
        >
          <Copy size={12} />
          <span>{copied ? "Tersalin!" : "Salin Link"}</span>
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
