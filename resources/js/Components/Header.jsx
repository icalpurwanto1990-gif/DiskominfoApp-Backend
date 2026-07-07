import React, { useState, useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, X, Landmark, ChevronDown, LogOut, LayoutDashboard, Megaphone, ZoomIn, ZoomOut, LogIn, ExternalLink, User, Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";
import { useAccessibility } from "./AccessibilityContext";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

  // ── Accessibility context ──────────────────────────────────────────────
  const {
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    fontSizeMultiplier,
  } = useAccessibility();

  // ── Scroll-aware masthead state ────────────────────────────────────────
  const [mastheadVisible, setMastheadVisible] = useState(true);
  const lastScrollY = useRef(0);

  // ── Real-time date & clock state ───────────────────────────────────────
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const { url, props } = usePage();
  
  // Load dynamic menus from shared Inertia props with local fallback
  const menus = props.menus || [];
  const socialMedia = props.socialMedia || [];

  const fallbackSocialMedia = [
    { id: "fb", platform: "Facebook", url: "https://facebook.com" },
    { id: "ig", platform: "Instagram", url: "https://instagram.com" },
    { id: "yt", platform: "YouTube", url: "https://youtube.com" }
  ];
  const activeSocialMedia = socialMedia && socialMedia.length > 0 ? socialMedia : fallbackSocialMedia;

  const getSocialIcon = (platform, size = 12) => {
    switch (platform?.toLowerCase()) {
      case "facebook":
        return <Facebook size={size} />;
      case "instagram":
        return <Instagram size={size} />;
      case "youtube":
        return <Youtube size={size} />;
      case "twitter/x":
      case "twitter":
      case "x":
        return <Twitter size={size} />;
      case "linkedin":
        return <Linkedin size={size} />;
      case "tiktok":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.22 2.36 2.05 3.86 2.37v3.83c-1.4-.17-2.76-.74-3.89-1.63-.65-.51-1.22-1.14-1.67-1.85v7.41c.04 1.83-.53 3.63-1.62 5.09-1.42 1.9-3.71 3.02-6.07 3.02-2.35 0-4.63-1.12-6.05-3.01-1.1-1.46-1.67-3.27-1.63-5.1.04-1.83.62-3.62 1.72-5.08 1.42-1.9 3.71-3.02 6.07-3.02.73-.01 1.46.11 2.16.34v3.86c-.71-.24-1.47-.31-2.22-.2-.84.11-1.64.49-2.27 1.07-.63.59-1.04 1.37-1.17 2.21-.12.85.03 1.72.44 2.47.41.76.99 1.36 1.72 1.73.83.42 1.77.53 2.68.3 1.11-.27 2.04-1.04 2.53-2.05.27-.56.4-1.18.39-1.81V0z" />
          </svg>
        );
      default:
        return <ExternalLink size={size} />;
    }
  };

  // ── Scroll detection: transparent header at top, white header when scrolled ───────────
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Solid/scrolled bg triggers after 20px
      setScrolled(currentScrollY > 20);

      // Masthead scroll-aware animation
      if (currentScrollY < 10) {
        setMastheadVisible(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        // Scrolling DOWN → hide masthead
        setMastheadVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        // Scrolling UP → show masthead
        setMastheadVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Session & mount ────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    const sessionStr = localStorage.getItem("userSession");
    if (sessionStr) {
      try { setUser(JSON.parse(sessionStr)); } catch (e) { /* ignore */ }
    }
    const adminSessionStr = localStorage.getItem("adminSession");
    if (adminSessionStr) {
      try { setAdmin(JSON.parse(adminSessionStr)); } catch (e) { /* ignore */ }
    }
  }, []);

  // ── Real-time clock ────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Close mobile menu on route change ─────────────────────────────────
  useEffect(() => { setIsOpen(false); }, [url]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("userSession");
    localStorage.removeItem("adminSession");
    setUser(null);
    setAdmin(null);
    window.location.href = "/";
  };

  /** Format: Sabtu, 28 Juni 2026 */
  const formattedDate = isMounted
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Makassar",
      }).format(currentDateTime)
    : "";

  /** Format: 11:27:04 WITA */
  const formattedTime = isMounted
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Makassar",
      }).format(currentDateTime) + " WITA"
    : "";

  // Static Fallback Menus in case database is empty or not seeded
  const fallbackNavLinks = [
    { id: 1, label: "Beranda", url: "/", target: "_self", children: [] },
    { id: 2, label: "Profil", url: "/profil", target: "_self", children: [
      { id: 21, label: "Sejarah Dinas", url: "/profil#sejarah", target: "_self" },
      { id: 22, label: "Visi & Misi", url: "/profil#visi-misi", target: "_self" },
      { id: 23, label: "Struktur Organisasi", url: "/profil#struktur", target: "_self" }
    ]},
    { id: 3, label: "Berita", url: "/berita", target: "_self", children: [] },
    { id: 4, label: "PPID", url: "/ppid", target: "_self", children: [
      { id: 41, label: "Profil & Layanan PPID", url: "/ppid", target: "_self" },
      { id: 43, label: "Informasi Secara Berkala", url: "/ppid/berkala", target: "_self" },
      { id: 44, label: "Informasi Serta Merta", url: "/ppid/serta-merta", target: "_self" },
      { id: 45, label: "Informasi Tersedia Setiap Saat", url: "/ppid/setiap-saat", target: "_self" },
      { id: 46, label: "Daftar Informasi Publik", url: "/ppid/daftar-informasi-publik", target: "_self" },
      { id: 47, label: "SOP Pelayanan PPID", url: "/ppid/sop-pelayanan", target: "_self" }
    ]},
    { id: 5, label: "Layanan", url: "/layanan", target: "_self", children: [] },
    { id: 6, label: "Smart Gov", url: "/dashboard", target: "_self", children: [] },
    { id: 7, label: "Data Sektoral", url: "/satu-data", target: "_self", children: [] },
    { id: 11, label: "Agenda Pimpinan", url: "/agenda", target: "_self", children: [] },
    { id: 8, label: "Peta GIS", url: "/gis", target: "_self", children: [] },
    { id: 9, label: "Media", url: "/media", target: "_self", children: [] },
    { id: 10, label: "Kontak", url: "/kontak", target: "_self", children: [] },
  ];

  const activeMenus = menus && menus.length > 0 ? menus : fallbackNavLinks;

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/") return url === "/";
    return url.startsWith(path);
  };

  const isParentActive = (menu) => {
    if (menu.url && isActive(menu.url)) return true;
    if (menu.children && menu.children.length > 0) {
      return menu.children.some(child => child.url && isActive(child.url));
    }
    return false;
  };

  const currentUser = admin || user;
  const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || "U";

  // Marquee announcement text
  const marqueeText = `Selamat Datang di Portal Resmi DISKOMINFO Kabupaten Banggai Kepulauan Sulawesi Tengah | Hari ini: ${formattedDate} | Waktu Server: ${formattedTime} | Bersama Wujudkan Transformasi Digital Daerah yang Maju dan Mandiri!`;

  const isHomepage = url === "/" || url === "";

  const toggleMobileDropdown = (id) => {
    setActiveMobileDropdown(activeMobileDropdown === id ? null : id);
  };

  return (
    <header
      className={`w-full fixed top-0 z-50 flex flex-col transition-all duration-500 ${
        isHomepage
          ? scrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/60 dark:border-slate-800/60 text-slate-800"
            : "bg-gradient-to-b from-black/50 via-black/20 to-transparent text-white border-b border-white/10"
          : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/60 dark:border-slate-800/60 text-slate-800"
      }`}
    >
      {/* ── Government Identity Masthead (Warna AI Widget #0a549e) ─────────────────────────── */}
      <div
        className={`
          w-full overflow-hidden bg-[#0a549e] text-white border-b border-sky-800/30
          transition-all duration-300 ease-in-out
          ${mastheadVisible ? "max-h-10 opacity-100 py-1" : "max-h-0 opacity-0"}
        `}
        aria-hidden={!mastheadVisible}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4 text-[11px]">
          
          {/* Left: Info Marquee with yellow badge */}
          <div className="flex-1 flex items-center min-w-0 gap-2">
            <span className="flex items-center gap-1 bg-[#f5d042] text-slate-900 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase shadow-sm whitespace-nowrap animate-pulse">
              <Megaphone size={10} className="stroke-[2.5]" />
              INFO PORTAL
            </span>
            <marquee className="text-white font-medium text-[11px] select-none" scrollamount="4">
              {marqueeText}
            </marquee>
          </div>

          {/* Right Section: FontSize Controls & Desktop Login Widget (integrated neatly) - Hidden on Mobile */}
          <div className="hidden md:flex items-center flex-shrink-0 gap-4 pl-4 border-l border-sky-700/50">
            {/* FontSize Controls */}
            <div className="flex items-center gap-1.5 text-sky-100">
              <button
                onClick={decreaseFontSize}
                className="p-1 hover:bg-[#063360]/50 rounded-md transition"
                title="Perkecil Huruf (-A)"
                aria-label="Perkecil Huruf"
              >
                <ZoomOut size={12} />
              </button>
              <button
                onClick={resetFontSize}
                className="px-1.5 py-0.5 hover:bg-[#063360]/50 rounded-md transition text-[9px] font-bold"
                title="Reset Ukuran (A)"
              >
                A ({Math.round(fontSizeMultiplier * 100)}%)
              </button>
              <button
                onClick={increaseFontSize}
                className="p-1 hover:bg-[#063360]/50 rounded-md transition"
                title="Perbesar Huruf (+A)"
                aria-label="Perbesar Huruf"
              >
                <ZoomIn size={12} />
              </button>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-1 border-l border-sky-700/50 pl-3">
              {activeSocialMedia.map((sm) => (
                <a
                  key={sm.id}
                  href={sm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-[#063360]/50 rounded-md transition text-sky-100 hover:text-white flex items-center justify-center"
                  title={`${sm.platform} Resmi`}
                  aria-label={`${sm.platform} Resmi`}
                >
                  {getSocialIcon(sm.platform, 12)}
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Main Navigation Row ──────────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center py-2">
        {/* Branding Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-1 -ml-1"
          aria-label="Beranda Portal Diskominfo"
        >
          <div className="relative flex-shrink-0">
            {!logoError ? (
              <img
                src="/images/logo.png"
                alt="Logo Diskominfo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="p-2 bg-[#0a549e] text-white rounded-xl shadow-md">
                <Landmark size={20} className="stroke-[2.5]" />
              </div>
            )}
          </div>
          <div className="flex flex-col leading-none">
            <span className={`font-black text-sm tracking-tight transition-colors duration-500 uppercase ${
              !isHomepage || scrolled ? "text-slate-900 dark:text-white" : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
            }`}>
              DISKOMINFO
            </span>
            <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 transition-colors duration-500 ${
              !isHomepage || scrolled ? "text-[#0a549e] dark:text-sky-400" : "text-[#f5d042] [text-shadow:0_1px_3px_rgba(0,0,0,0.3)]"
            }`}>
              Kab. Banggai Kepulauan
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Dynamic database-driven) */}
        <nav className="hidden xl:flex items-center gap-0.5" aria-label="Menu Utama">
          {activeMenus.map((menu) => {
            const hasChildren = menu.children && menu.children.length > 0;
            const isMenuLinkActive = isParentActive(menu);

            if (hasChildren) {
              return (
                <div key={menu.id} className="relative group py-2">
                  <button
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] lg:text-[11.5px] font-semibold tracking-wide transition-all duration-300 ${
                      isMenuLinkActive
                        ? !isHomepage || scrolled
                          ? "text-[#0a549e] dark:text-sky-400 font-bold"
                          : "text-[#f5d042] font-black"
                        : !isHomepage || scrolled
                          ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70"
                          : "text-white hover:text-white hover:bg-white/10 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                    }`}
                  >
                    <span>{menu.label}</span>
                    <ChevronDown size={11} className="transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown Container */}
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl p-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {menu.children.map((child) => {
                      const isExternal = child.url?.startsWith("http");
                      const childActive = isActive(child.url);

                      return isExternal ? (
                        <a
                          key={child.id}
                          href={child.url}
                          target={child.target || "_blank"}
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0a549e] transition"
                        >
                          <span>{child.label}</span>
                          <ExternalLink size={10} className="opacity-60" />
                        </a>
                      ) : (
                        <Link
                          key={child.id}
                          href={child.url || "#"}
                          className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            childActive
                              ? "bg-sky-50 dark:bg-sky-950/40 text-[#0a549e] dark:text-sky-400 font-bold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0a549e]"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isExternal = menu.url?.startsWith("http");

            return isExternal ? (
              <a
                key={menu.id}
                href={menu.url}
                target={menu.target || "_blank"}
                rel="noopener noreferrer"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] lg:text-[11.5px] font-semibold tracking-wide transition-all duration-300 ${
                  !isHomepage || scrolled
                    ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70"
                    : "text-white hover:text-white hover:bg-white/10 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                }`}
              >
                <span>{menu.label}</span>
                <ExternalLink size={10} className="opacity-70" />
              </a>
            ) : (
              <Link
                key={menu.id}
                href={menu.url || "#"}
                className={`relative px-2.5 py-1.5 rounded-lg text-[11px] lg:text-[11.5px] font-semibold tracking-wide transition-all duration-300 group ${
                  isMenuLinkActive
                    ? !isHomepage || scrolled
                      ? "text-[#0a549e] dark:text-sky-400 font-bold"
                      : "text-[#f5d042] font-black"
                    : !isHomepage || scrolled
                      ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                      : "text-white hover:text-white hover:bg-white/10 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                }`}
              >
                {menu.label}
                <span
                  className={`absolute bottom-0 left-2.5 right-2.5 h-0.5 rounded-full transition-all duration-300 ${
                    !isHomepage || scrolled ? "bg-[#0a549e] dark:bg-sky-400" : "bg-[#f5d042]"
                  } ${isMenuLinkActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"} origin-left`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop / Large Screen: Mobile Hamburger Menu / Toggler */}
        <div className="flex items-center gap-2">
          {/* Mobile Login Widget (No Text 'LOGIN' - Just Icon for Professional Layout) */}
          <div className="xl:hidden">
            {isMounted && currentUser ? (
              <Link
                href={admin ? "/admin" : "/user/dashboard"}
                className="p-2 rounded-xl text-sky-600 bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center hover:scale-105 transition"
                title="Dashboard Saya"
              >
                <div className="w-5 h-5 rounded-full bg-[#f5d042] text-slate-950 flex items-center justify-center text-[9px] font-bold">
                  {userInitial}
                </div>
              </Link>
            ) : isMounted ? (
              <Link
                href="/auth/login"
                className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                  scrolled
                    ? "bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Masuk"
              >
                <LogIn size={15} />
              </Link>
            ) : null}
          </div>

          {/* Desktop User Dropdown Menu */}
          <div className="hidden xl:block">
            {isMounted && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition duration-300 font-bold text-xs select-none ${
                    scrolled
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:border-slate-700 text-slate-800 dark:text-white"
                      : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
                  }`}
                  aria-label="Menu Pengguna"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-[#f5d042] text-slate-900 flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0">
                    {userInitial}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-slate-800 dark:text-slate-100 flex flex-col gap-3.5 animate-fadeIn">
                    
                    {/* User profile card inside dropdown */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div className="w-10 h-10 rounded-full bg-[#f5d042] text-slate-900 flex items-center justify-center text-sm font-black shadow-sm flex-shrink-0">
                        {userInitial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</span>
                        <span className="text-[10px] text-slate-450 truncate">{currentUser.email}</span>
                      </div>
                    </div>

                    {/* Nav Links */}
                    <div className="flex flex-col gap-1 text-xs">
                      <Link
                        href={admin ? "/admin" : "/user/dashboard"}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-sky-400 transition"
                      >
                        <LayoutDashboard size={14} className="text-emerald-500 dark:text-sky-400" />
                        <span className="font-bold">{admin ? "Dashboard Admin" : "Dashboard Saya"}</span>
                      </Link>
                      
                      {!admin && (
                        <Link
                          href="/user/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition"
                        >
                          <User size={14} className="text-blue-500" />
                          <span className="font-bold">Profil Pemohon</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-900/30 transition text-left"
                    >
                      <LogOut size={14} />
                      <span>Keluar / Logout</span>
                    </button>

                  </div>
                )}
              </div>
            ) : isMounted ? (
              <Link
                href="/auth/login"
                className="px-4.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-sm active:scale-95 bg-[#f5d042] hover:bg-[#ebd040] text-slate-900"
              >
                Masuk Portal
              </Link>
            ) : null}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`xl:hidden p-2 rounded-xl transition ${
              scrolled
                ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                : "text-white hover:bg-white/10"
            }`}
            aria-expanded={isOpen}
            aria-label="Buka Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer Menu — animated ───────────────────────────────── */}
      <div
        className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[750px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-3 px-4 flex flex-col gap-1 shadow-inner">
          {/* Mobile Font Size & Socials Controls */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Akses & Sosial:</span>
            <div className="flex items-center gap-3">
              {/* FontSize Controls */}
              <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700 pr-3">
                <button
                  onClick={decreaseFontSize}
                  className="p-1.5 bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Perkecil Huruf (-A)"
                  aria-label="Perkecil Huruf"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  onClick={resetFontSize}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition text-[9px] font-bold"
                  title="Reset Ukuran"
                >
                  A ({Math.round(fontSizeMultiplier * 100)}%)
                </button>
                <button
                  onClick={increaseFontSize}
                  className="p-1.5 bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Perbesar Huruf (+A)"
                  aria-label="Perbesar Huruf"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
              {/* Social Media Link Icons */}
              <div className="flex items-center gap-1.5">
                {activeSocialMedia.map((sm) => (
                  <a
                    key={sm.id}
                    href={sm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-sky-50 dark:bg-sky-950/30 text-[#0a549e] dark:text-sky-400 hover:bg-sky-100 rounded-lg transition flex items-center justify-center"
                    title={`${sm.platform} Resmi`}
                    aria-label={`${sm.platform} Resmi`}
                  >
                    {getSocialIcon(sm.platform, 13)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Mobile Menus */}
          <div className="flex flex-col gap-1 max-h-[450px] overflow-y-auto pr-1">
            {activeMenus.map((menu) => {
              const hasChildren = menu.children && menu.children.length > 0;
              const isMenuLinkActive = isParentActive(menu);
              const isDropdownOpen = activeMobileDropdown === menu.id;

              if (hasChildren) {
                return (
                  <div key={menu.id} className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800/50 pb-1.5 mb-1">
                    <button
                      onClick={() => toggleMobileDropdown(menu.id)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isMenuLinkActive
                          ? "bg-sky-50 dark:bg-sky-950/20 text-[#0a549e] dark:text-sky-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{menu.label}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-[#0a549e]" : ""}`} />
                    </button>

                    {/* Mobile Submenu Expanded Area */}
                    <div className={`overflow-hidden transition-all duration-350 ease-in-out ${isDropdownOpen ? "max-h-[300px] opacity-100 mt-1 pl-4 flex flex-col gap-1" : "max-h-0 opacity-0 pointer-events-none"}`}>
                      {menu.children.map((child) => {
                        const childActive = isActive(child.url);
                        const isExternal = child.url?.startsWith("http");

                        return isExternal ? (
                          <a
                            key={child.id}
                            href={child.url}
                            target={child.target || "_blank"}
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100/70"
                          >
                            <span>{child.label}</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <Link
                            key={child.id}
                            href={child.url || "#"}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition ${
                              childActive
                                ? "text-[#0a549e] dark:text-sky-400 font-bold bg-sky-50/55 dark:bg-sky-950/15"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 bg-[#0a549e]/40 rounded-full mr-2" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const isExternal = menu.url?.startsWith("http");

              return isExternal ? (
                <a
                  key={menu.id}
                  href={menu.url}
                  target={menu.target || "_blank"}
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
                >
                  <span>{menu.label}</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              ) : (
                <Link
                  key={menu.id}
                  href={menu.url || "#"}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isMenuLinkActive
                      ? "bg-[#0a549e] text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {menu.label}
                  {isMenuLinkActive && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </Link>
              );
            })}
          </div>

          {/* Mobile Extra Session Details */}
          {isMounted && currentUser ? (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow">
                  {userInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {admin ? "Administrator" : "Pemohon"}
                  </span>
                </div>
              </div>
              <Link
                href={admin ? "/admin" : "/user/dashboard"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 transition text-left"
              >
                <LayoutDashboard size={15} />
                <span>Dashboard Saya</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/40 transition text-left"
              >
                <LogOut size={15} />
                Keluar
              </button>
            </div>
          ) : isMounted ? (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0a549e] to-sky-650 shadow-md hover:from-sky-700 hover:to-indigo-700 transition"
              >
                <LogIn size={15} />
                Masuk
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
