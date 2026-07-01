import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Landmark, Mail, Phone, MapPin, MessageCircle, Globe, ArrowUpRight, Shield, Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";
import PartnerLinksSlider from "./PartnerLinksSlider";

export const Footer = () => {
  const { props } = usePage();
  const socialMedia = props.socialMedia || [];

  const fallbackSocialMedia = [
    { id: "fb", platform: "Facebook", url: "https://facebook.com" },
    { id: "ig", platform: "Instagram", url: "https://instagram.com" },
    { id: "yt", platform: "YouTube", url: "https://youtube.com" }
  ];
  const activeSocialMedia = socialMedia && socialMedia.length > 0 ? socialMedia : fallbackSocialMedia;

  const getSocialIcon = (platform, size = 14) => {
    switch (platform?.toLowerCase()) {
      case "facebook":
        return <Facebook size={size} className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition" />;
      case "instagram":
        return <Instagram size={size} className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition" />;
      case "youtube":
        return <Youtube size={size} className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition" />;
      case "twitter/x":
      case "twitter":
      case "x":
        return <Twitter size={size} className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition" />;
      case "linkedin":
        return <Linkedin size={size} className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition" />;
      case "tiktok":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.22 2.36 2.05 3.86 2.37v3.83c-1.4-.17-2.76-.74-3.89-1.63-.65-.51-1.22-1.14-1.67-1.85v7.41c.04 1.83-.53 3.63-1.62 5.09-1.42 1.9-3.71 3.02-6.07 3.02-2.35 0-4.63-1.12-6.05-3.01-1.1-1.46-1.67-3.27-1.63-5.1.04-1.83.62-3.62 1.72-5.08 1.42-1.9 3.71-3.02 6.07-3.02.73-.01 1.46.11 2.16.34v3.86c-.71-.24-1.47-.31-2.22-.2-.84.11-1.64.49-2.27 1.07-.63.59-1.04 1.37-1.17 2.21-.12.85.03 1.72.44 2.47.41.76.99 1.36 1.72 1.73.83.42 1.77.53 2.68.3 1.11-.27 2.04-1.04 2.53-2.05.27-.56.4-1.18.39-1.81V0z" />
          </svg>
        );
      default:
        return <Globe size={size} className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition" />;
    }
  };

  return (
    <footer className="w-full relative overflow-hidden">
      {/* Partner Collaboration Links */}
      <PartnerLinksSlider />

      {/* Wave Divider */}
      <div className="w-full overflow-hidden leading-none bg-slate-50 dark:bg-slate-950">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#0d1117" />
        </svg>
      </div>

      <div className="bg-[#0d1117] text-slate-400 pt-4 pb-10 px-4 md:px-8">
        {/* Subtle emerald glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">

          {/* Branding & Contact */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20">
                <Landmark size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-white tracking-tight leading-none">DISKOMINFO</span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Kab. Banggai Kepulauan</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Penyedia infrastruktur jaringan, pengelola data, komunikasi publik, dan fasilitator transformasi digital di lingkungan Pemerintah Kabupaten Banggai Kepulauan, Provinsi Sulawesi Tengah.
            </p>
            <div className="flex flex-col gap-2.5 text-xs">
              <a href="https://maps.app.goo.gl/V8u4bWv9vQT9pumz9" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 hover:text-white transition group">
                <MapPin size={14} className="text-emerald-500 mt-0.5 flex-shrink-0 group-hover:text-emerald-400 transition" />
                <span>Kompleks Perkantoran Jalan Trikora, Salakan, Sulawesi Tengah</span>
              </a>
              <a href="mailto:diskominfo@banggaikep.go.id" className="flex items-center gap-2.5 hover:text-white transition group">
                <Mail size={14} className="text-emerald-500 flex-shrink-0 group-hover:text-emerald-400 transition" />
                <span>diskominfo@banggaikep.go.id</span>
              </a>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-emerald-500 flex-shrink-0" />
                <span>(0462) 22110 / +62 822-9642-1245</span>
              </div>
              {activeSocialMedia.map((sm) => (
                <a
                  key={sm.id}
                  href={sm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition group"
                >
                  {getSocialIcon(sm.platform, 14)}
                  <span>{sm.platform} Resmi</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-0.5 bg-emerald-500 rounded-full" />
              Navigasi Utama
            </h4>
            <nav className="flex flex-col gap-2 text-xs" aria-label="Navigasi Footer">
              {[
                { href: "/profil", label: "Profil Instansi" },
                { href: "/berita", label: "Berita & Pengumuman" },
                { href: "/ppid", label: "Layanan PPID Online" },
                { href: "/layanan", label: "Portal Layanan Digital Hub" },
                { href: "/layanan/lacak", label: "Lacak Status Permohonan" },
                { href: "/auth/login", label: "Portal Pemohon (Login)" },
                { href: "/dashboard", label: "Smart Government Dashboard" },
                { href: "/satu-data", label: "Satu Data Daerah" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-1.5 text-slate-500 hover:text-white transition group">
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 text-emerald-500 transition flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-0.5 bg-emerald-500 rounded-full" />
              Layanan OPD & ASN
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              {[
                { href: "/layanan?type=tte", label: "Sertifikat Elektronik (TTE)" },
                { href: "/layanan?type=email", label: "Email Instansi Pemerintah" },
                { href: "/layanan?type=hosting", label: "Penyewaan Hosting Website" },
                { href: "/layanan?type=zoom", label: "Permintaan Link Zoom Meeting" },
                { href: "/layanan?type=subdomain", label: "Pengajuan Domain & Subdomain" },
                { href: "/layanan?type=jaringan", label: "Aduan Gangguan Jaringan" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-1.5 text-slate-500 hover:text-white transition group">
                    <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 text-emerald-500 transition flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Contact */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-0.5 bg-emerald-500 rounded-full" />
              Kepatuhan & Standar
            </h4>
            <div className="p-4 bg-white/5 rounded-xl border border-white/8 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-white text-[11px]">WCAG 2.2 AA Compliant</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                Situs ini mematuhi standar aksesibilitas web W3C untuk penyandang disabilitas, ramah pembaca layar, dan navigasi keyboard.
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/8 flex flex-col gap-1.5">
              <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <Globe size={12} className="text-emerald-400" />
                SPBE Terintegrasi
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Sistem Pemerintahan Berbasis Elektronik sesuai Perpres No. 132 Tahun 2022.
              </p>
            </div>
            <a
              href="https://wa.me/6282296421245"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all duration-300 font-bold text-xs shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 w-fit"
            >
              <MessageCircle size={14} />
              WhatsApp Contact Center
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-600">
          <div>
            © {new Date().getFullYear()} <span className="text-slate-500">Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan.</span> All Rights Reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={10} className="text-emerald-700" />
            <span>Powered by</span>
            <span className="text-emerald-600 font-bold">Laravel</span>
            <span>&</span>
            <span className="text-emerald-600 font-bold">Inertia React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
