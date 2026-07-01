import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight, Home } from "lucide-react";

/**
 * PageHero — Premium page banner component for all interior webclient pages.
 * Matches the visual language of Home.jsx.
 *
 * Props:
 * @param {string} label        - Eyebrow label (e.g. "PROFIL DINAS")
 * @param {string} title        - Main page title (h1)
 * @param {string} subtitle     - Short descriptive text
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string} gradient     - Tailwind gradient classes (e.g. "from-emerald-950 via-slate-900 to-slate-950")
 * @param {string} accentColor  - Tailwind text color class for label (e.g. "text-emerald-400")
 * @param {string} blobColor    - Tailwind bg color for decorative blobs (e.g. "bg-emerald-500")
 * @param {Array}  breadcrumbs  - Array of {label, href} objects
 * @param {Array}  stats        - Optional: [{label, value, icon}]
 */
const PageHero = ({
  label = "HALAMAN",
  title = "Judul Halaman",
  subtitle = "",
  icon: Icon,
  gradient = "from-slate-900 via-slate-900 to-slate-950",
  accentColor = "text-emerald-400",
  blobColor = "bg-emerald-500",
  breadcrumbs = [],
  stats = [],
}) => {
  return (
    <div className={`w-full bg-gradient-to-br ${gradient} relative overflow-hidden`}>
      {/* Decorative blobs */}
      <div className={`absolute -top-24 -right-24 w-96 h-96 ${blobColor} opacity-10 rounded-full blur-3xl pointer-events-none`} />
      <div className={`absolute -bottom-20 -left-16 w-72 h-72 ${blobColor} opacity-8 rounded-full blur-3xl pointer-events-none`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/3 rounded-full blur-3xl pointer-events-none hidden lg:block" />

      {/* Decorative dashed ring (top-right corner) */}
      <div className="absolute top-6 right-6 w-24 h-24 rounded-full border border-dashed border-white/10 pointer-events-none hidden md:block" />
      <div className="absolute top-10 right-10 w-12 h-12 rounded-full border border-dashed border-white/15 pointer-events-none hidden md:block" />

      {/* Grid overlay subtle */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <Home size={12} />
            <span>Beranda</span>
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <ChevronRight size={11} className="text-slate-600" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-300">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Main Content Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            {/* Eyebrow label */}
            <div className="flex items-center gap-2">
              {Icon && (
                <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10`}>
                  <Icon size={16} className={accentColor} />
                </div>
              )}
              <span className={`text-[11px] font-black uppercase tracking-widest ${accentColor}`}>
                {label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight max-w-2xl">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm text-slate-300/80 font-medium leading-relaxed max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Decorative Icon (large, right side) */}
          {Icon && (
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-28 h-28 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Icon size={52} className={`${accentColor} opacity-60`} />
            </div>
          )}
        </div>

        {/* Stats Strip */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2 pt-4 border-t border-white/10">
            {stats.map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm"
                >
                  {StatIcon && <StatIcon size={14} className={`${accentColor} flex-shrink-0`} />}
                  <div className="flex flex-col leading-none">
                    <span className="text-white font-black text-sm">{stat.value}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHero;
