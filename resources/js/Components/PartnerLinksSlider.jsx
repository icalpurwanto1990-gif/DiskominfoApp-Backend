import React, { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { usePage } from "@inertiajs/react";

/**
 * PartnerLinksSlider — Auto-scrolling marquee of government collaboration links
 * Pauses on hover, seamlessly loops using CSS animation + JS duplicate.
 */

const partners = [
  {
    name: "Kementerian Kominfo",
    short: "Komdigi",
    url: "https://www.kominfo.go.id",
    color: "#1e40af",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Kementerian_Komunikasi_dan_Informatika_RI.svg/120px-Kementerian_Komunikasi_dan_Informatika_RI.svg.png",
    desc: "Kementerian Komunikasi & Digital RI",
  },
  {
    name: "BSSN",
    short: "BSSN",
    url: "https://www.bssn.go.id",
    color: "#166534",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Logo_Badan_Siber_dan_Sandi_Negara.svg/120px-Logo_Badan_Siber_dan_Sandi_Negara.svg.png",
    desc: "Badan Siber & Sandi Negara",
  },
  {
    name: "Bappenas",
    short: "Bappenas",
    url: "https://www.bappenas.go.id",
    color: "#7c3aed",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bappenas_Logo.svg/120px-Bappenas_Logo.svg.png",
    desc: "Kementerian PPN / Bappenas RI",
  },
  {
    name: "PDIP Sulawesi Tengah",
    short: "Prov. Sulteng",
    url: "https://sultengprov.go.id",
    color: "#0e7490",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Coat_arms_Central_Sulawesi.svg/120px-Coat_arms_Central_Sulawesi.svg.png",
    desc: "Pemerintah Provinsi Sulawesi Tengah",
  },
  {
    name: "Kemenpan RB",
    short: "Kemenpan RB",
    url: "https://www.menpan.go.id",
    color: "#b45309",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Logo_Kemenpan_RB_RI.svg/120px-Logo_Kemenpan_RB_RI.svg.png",
    desc: "Kemen. Pendayagunaan Aparatur Negara",
  },
  {
    name: "SP4N LAPOR!",
    short: "SP4N Lapor",
    url: "https://www.lapor.go.id",
    color: "#be123c",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/SP4N-Lapor_logo.png/120px-SP4N-Lapor_logo.png",
    desc: "Layanan Aspirasi & Pengaduan Online",
  },
  {
    name: "Kementerian Dalam Negeri",
    short: "Kemendagri",
    url: "https://www.kemendagri.go.id",
    color: "#0f766e",
    logo: "https://th.bing.com/th/id/ODF.qIdEFZvKP8_x4brJobTNow?w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2",
    desc: "Kementerian Dalam Negeri RI",
  },
  {
    name: "BPKP",
    short: "BPKP",
    url: "https://www.bpkp.go.id",
    color: "#1d4ed8",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/BPKP-Logo.svg/120px-BPKP-Logo.svg.png",
    desc: "Badan Pengawasan Keuangan & Pembangunan",
  },
];

export const PartnerLinksSlider = () => {
  const { partnerLinks } = usePage().props;
  const items = partnerLinks && partnerLinks.length > 0 ? partnerLinks : partners;
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  // Auto-scroll using requestAnimationFrame for smoothness
  const posRef = useRef(0);
  const animRef = useRef(null);
  const speed = 0.6; // px per frame

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      if (!paused) {
        posRef.current += speed;
        // Reset when first set has scrolled fully
        const halfWidth = track.scrollWidth / 2;
        if (posRef.current >= halfWidth) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [paused]);

  const handleImgError = (name) => {
    setImgErrors((prev) => ({ ...prev, [name]: true }));
  };

  // Duplicate list for seamless loop
  const displayed = [...items, ...items];

  return (
    <section className="w-full border-t border-b border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/30 py-8 overflow-hidden">
      {/* Section Label */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Kolaborasi & Ekosistem Digital
          </span>
          <h2 className="font-black text-base md:text-lg text-slate-900 dark:text-white">
            Portal Pemerintah <span className="text-emerald-600 dark:text-emerald-400">Terkait</span>
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Auto-Scrolling
        </div>
      </div>

      {/* Marquee Track */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-label="Daftar portal pemerintah kolaborasi"
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-slate-50 dark:from-[#0f1117] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-slate-50 dark:from-[#0f1117] to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex gap-4 w-max will-change-transform"
          style={{ transform: "translateX(0)" }}
        >
          {displayed.map((partner, idx) => (
            <a
              key={`${partner.name}-${idx}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              title={partner.name}
              className="group flex-shrink-0 flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300/60 dark:hover:border-emerald-700/60 hover:-translate-y-0.5 transition-all duration-300 min-w-[200px]"
            >
              {/* Logo / Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: `${partner.color}15`, border: `1.5px solid ${partner.color}25` }}
              >
                {!imgErrors[partner.name] ? (
                  <img
                    src={partner.logo}
                    alt={partner.short}
                    className="w-7 h-7 object-contain"
                    onError={() => handleImgError(partner.name)}
                    draggable="false"
                  />
                ) : (
                  <span
                    className="text-[10px] font-black leading-none text-center"
                    style={{ color: partner.color }}
                  >
                    {partner.short.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {partner.short}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight truncate mt-0.5">
                  {partner.desc}
                </span>
              </div>

              {/* Arrow icon */}
              <ExternalLink
                size={12}
                className="ml-auto flex-shrink-0 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLinksSlider;
