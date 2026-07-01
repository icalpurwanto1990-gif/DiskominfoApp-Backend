"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Landmark, Clock } from "lucide-react";
import { AccessibilityBar } from "./AccessibilityBar";

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Scroll-aware masthead state
  const [mastheadVisible, setMastheadVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Real-time date & time state
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  const pathname = usePathname();

  // ── Session & mount effect ──────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    const sessionStr = localStorage.getItem("userSession");
    if (sessionStr) {
      try {
        setUser(JSON.parse(sessionStr));
      } catch (e) {
        console.error("Failed to parse user session in header:", e);
      }
    }
    const adminSessionStr = localStorage.getItem("adminSession");
    if (adminSessionStr) {
      try {
        setAdmin(JSON.parse(adminSessionStr));
      } catch (e) {
        console.error("Failed to parse admin session in header:", e);
      }
    }
  }, []);

  // ── Scroll-aware animation effect ──────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show at top of page
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

  // ── Real-time clock effect ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    localStorage.removeItem("adminSession");
    setUser(null);
    setAdmin(null);
    alert("Logout berhasil.");
    window.location.href = "/";
  };

  /** Format: Sabtu, 28 Juni 2026 (zona WITA) */
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

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/profil", label: "Profil" },
    { href: "/berita", label: "Berita & Publikasi" },
    { href: "/ppid", label: "PPID" },
    { href: "/layanan", label: "Layanan Digital" },
    { href: "/dashboard", label: "Smart Gov" },
    { href: "/satu-data", label: "Satu Data" },
    { href: "/gis", label: "Peta GIS" },
    { href: "/media", label: "Media" },
    { href: "/kontak", label: "Hubungi Kami" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="w-full sticky top-0 z-50 flex flex-col shadow-sm bg-background/95 text-foreground backdrop-blur-md border-b border-border">
      {/* Top Accessibility Bar */}
      <AccessibilityBar />

      {/* ── Government Identity Masthead ──────────────────────────────── */}
      {/* Scroll-aware: slides up when scrolling down, reappears on scroll up */}
      <div
        className={`
          w-full overflow-hidden
          transition-all duration-300 ease-in-out
          ${mastheadVisible ? "max-h-10 opacity-100" : "max-h-0 opacity-0"}
        `}
        aria-hidden={!mastheadVisible}
      >
        <div className="w-full bg-muted border-b border-border py-1 px-4 md:px-8 text-[11px] text-muted-foreground flex items-center gap-2">
          {/* Mini flag Merah-Putih */}
          <div className="flex-shrink-0 flex flex-col overflow-hidden rounded-[2px] border border-border w-4 h-[11px]">
            <div className="flex-1 bg-red-600" />
            <div className="flex-1 bg-white" />
          </div>

          {/* Date — left side */}
          <span className="font-semibold text-foreground/80 capitalize whitespace-nowrap">
            {formattedDate}
          </span>

          <span className="text-muted-foreground/50 select-none">|</span>

          {/* Official website label — grows to fill space */}
          <span className="flex-1 truncate">
            Situs Resmi Pemerintah Daerah Kabupaten Banggai Kepulauan
          </span>

          {/* Real-time clock — right side, hidden on very small screens */}
          <span
            className="hidden sm:flex items-center gap-1 font-mono font-semibold text-foreground/70 whitespace-nowrap ml-auto"
            aria-live="polite"
            aria-label={`Waktu saat ini ${formattedTime}`}
          >
            <Clock size={10} className="text-primary/70" />
            {formattedTime}
          </span>
        </div>
      </div>

      {/* ── Main Navigation Row ───────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center py-3.5">
        {/* Branding Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
          aria-label="Beranda Portal Diskominfo"
        >
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-105 transition-transform duration-200">
            <Landmark size={24} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-foreground uppercase leading-none">
              DISKOMINFO
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
              Kab. Banggai Kepulauan
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Menu Utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isActive(link.href)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Session Widget for Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          {isMounted && (user || admin) ? (
            <div className="flex items-center gap-2">
              <Link
                href={admin ? "/admin" : "/user/dashboard"}
                className="px-3.5 py-1.5 text-xs font-semibold text-foreground hover:text-primary border border-border hover:border-primary/30 bg-card rounded-xl transition-all shadow-sm hover:shadow"
              >
                Hi, {admin ? admin.name : user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-destructive hover:text-destructive-foreground border border-destructive/20 hover:bg-destructive rounded-xl transition-all"
              >
                Logout
              </button>
            </div>
          ) : isMounted ? (
            <Link
              href="/auth/login"
              className="px-3.5 py-1.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/95 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Masuk
            </Link>
          ) : null}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-xl text-foreground/80 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          aria-expanded={isOpen}
          aria-label="Buka Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Drawer Menu ────────────────────────────────────────── */}
      {isOpen && (
        <div className="lg:hidden w-full bg-background border-t border-border py-3 px-4 flex flex-col gap-1.5 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                isActive(link.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Session Widget for Mobile */}
          <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
            {isMounted && (user || admin) ? (
              <>
                <div className="px-4 py-1 text-xs text-muted-foreground">
                  Masuk sebagai:{" "}
                  <strong className="text-foreground">
                    {admin ? admin.name : user.name}
                  </strong>
                </div>
                <Link
                  href={admin ? "/admin" : "/user/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-muted border border-border"
                >
                  {admin ? "Dashboard Admin" : "Dashboard Pemohon"}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 text-left border border-destructive/20"
                >
                  Logout
                </button>
              </>
            ) : isMounted ? (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/95 shadow-sm"
              >
                Masuk / Login
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};
