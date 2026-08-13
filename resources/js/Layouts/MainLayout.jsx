import React from "react";
import { usePage, Head } from "@inertiajs/react";
import { AccessibilityProvider } from "../Components/AccessibilityContext";
import { AccessibilityWidget } from "../Components/AccessibilityWidget";
import { RadioStreamingWidget } from "../Components/RadioStreamingWidget";
import { AIChatWidget } from "../Components/AIChatWidget";
import { Header } from "../Components/Header";
import { Footer } from "../Components/Footer";

export const MainLayout = ({ children }) => {
  const { url } = usePage();

  const getPageTitle = (path) => {
    const pathname = path.split("?")[0];
    if (pathname === "/" || pathname === "") return "Beranda Resmi";
    if (pathname.startsWith("/berita")) return "Berita & Pengumuman";
    if (pathname.startsWith("/layanan")) return "Layanan Digital Publik";
    if (pathname.startsWith("/ppid")) return "Layanan PPID";
    if (pathname.startsWith("/satu-data")) return "Data Sektoral";
    if (pathname.startsWith("/gis")) return "Peta Infrastruktur GIS";
    if (pathname.startsWith("/kontak")) return "Hubungi Kami";
    if (pathname.startsWith("/profil")) return "Profil Dinas";
    if (pathname.startsWith("/media")) return "Galeri Media Center";
    if (pathname.startsWith("/user/dashboard")) return "Portal Pengguna";
    if (pathname.startsWith("/user/requests")) return "Permohonan Layanan Saya";
    return "";
  };

  const isHomepage = url === "/" || url === "";

  return (
    <AccessibilityProvider>
      <Head title={getPageTitle(url)} />
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Navigation & Masthead Header */}
        <Header />

        {/* Content Slots */}
        <main className={`flex-grow w-full flex flex-col items-center ${!isHomepage ? "pt-[104px]" : ""}`}>
          {children}
        </main>

        {/* Branding Footer */}
        <Footer />

        {/* Floating Accessibility Panel (Bottom-Left) */}
        <AccessibilityWidget />

        {/* Floating Action Suite (Bottom-Right): MY MOE 101.1 FM + Tanya AI */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <RadioStreamingWidget />
          <AIChatWidget />
        </div>
      </div>
    </AccessibilityProvider>
  );
};
export default MainLayout;
