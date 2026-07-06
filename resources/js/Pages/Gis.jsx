import React, { useState, useEffect } from "react";
import { Map, Radio, Wifi } from "lucide-react";
import GISMap from "../Components/GISMap";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

export const Gis = () => {
  const [gisStats, setGisStats] = useState({
    btsCount: "...",
    vsatCount: "...",
  });

  // Fetch real GIS stats from dedicated stats endpoint (efficient aggregation)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/gis/stats");
        if (res.ok) {
          const data = await res.json();
          setGisStats({
            btsCount: data.BTS_TOWER !== undefined ? String(data.BTS_TOWER) : "0",
            vsatCount: data.VSAT !== undefined ? String(data.VSAT) : "0",
          });
        }
      } catch (err) {
        console.error("Gagal memuat statistik GIS:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <MainLayout>
      {/* Premium Page Hero */}
      <PageHero
        label="INFRASTRUKTUR TELEKOMUNIKASI GEOSPASIAL"
        title="Peta Infrastruktur GIS"
        subtitle="Visualisasi sebaran menara BTS, VSAT Bakti, area blankspot, dan jalur kabel fiber optik Kabupaten Banggai Kepulauan secara real-time"
        icon={Map}
        gradient="from-cyan-950 via-slate-900 to-slate-950"
        accentColor="text-cyan-400"
        blobColor="bg-cyan-500"
        breadcrumbs={[{ label: "Peta GIS" }]}
        stats={[
          { label: "Menara BTS", value: gisStats.btsCount, icon: Radio },
          { label: "Akses VSAT", value: gisStats.vsatCount, icon: Wifi },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">

        {/* Embedded Map Component */}
        <ScrollReveal>
          <div className="w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
            <GISMap />
          </div>
        </ScrollReveal>

        {/* Map Legend & Notes */}
        <ScrollReveal delay={100}>
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold leading-relaxed shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Tujuan Pemetaan</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Pemetaan geospasial infrastruktur telekomunikasi ini digunakan oleh pemerintah daerah untuk menganalisis perencanaan perluasan jangkauan sinyal internet dan penentuan titik BTS baru.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Akurasi Koordinat</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Seluruh data BTS, VSAT, dan Blankspot disurvei langsung secara periodik oleh Bidang Infrastruktur TIK Diskominfo dengan tingkat akurasi koordinat global (GPS).
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Keterangan Ikon</span>
              <div className="flex flex-col gap-2 mt-1 text-[11px]">
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">🗼 <span className="text-slate-600 dark:text-slate-400">Menara BTS Operator</span></div>
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">❌ <span className="text-slate-600 dark:text-slate-400">Area Blankspot (Tanpa Sinyal)</span></div>
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">🛰️ <span className="text-slate-600 dark:text-slate-400">Akses Internet VSAT Bakti</span></div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </MainLayout>
  );
};

export default Gis;
