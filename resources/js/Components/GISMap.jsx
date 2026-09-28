import React, { useEffect, useRef, useState } from "react";
import { Landmark, Compass, Server, WifiOff } from "lucide-react";

export const GISMap = () => {
  const mapRef = useRef(null);
  const [items, setItems] = useState([]);
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Fetch points from API
  useEffect(() => {
    const fetchGIS = async () => {
      try {
        const res = await fetch("/api/gis");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to load GIS data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGIS();
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current) return;

    let mapInstance = null;

    const initMap = async () => {
      // 1. Inject Leaflet CSS
      const linkId = "leaflet-cdn-css";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS if not available
      const scriptId = "leaflet-cdn-js";
      if (!document.getElementById(scriptId) && !window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const L = window.L;
      if (!L) return;

      // Clean up past instances
      const container = L.DomUtil.get(mapRef.current);
      if (container != null) {
        container._leaflet_id = null;
      }

      // Center map around Salakan, Banggai Kepulauan
      mapInstance = L.map(mapRef.current).setView([-1.3328, 123.1189], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      // Render items
      items.forEach((item) => {
        if (selectedType !== "ALL" && item.type !== selectedType) return;

        let color = "#0a549e"; // primary Deep Navy
        let emoji = "📡";

        if (item.type === "BTS_TOWER") {
          color = "#499ed7"; // Sky Blue
          emoji = "🗼";
        } else if (item.type === "BLANKSPOT") {
          color = "#EF4444"; // Red
          emoji = "❌";
        } else if (item.type === "VSAT") {
          color = "#fcd116"; // Gold
          emoji = "🛰️";
        } else if (item.type === "FIBER_OPTIK") {
          color = "#3B82F6"; // Blue
          emoji = "🔌";
        }

        // Custom div icon
        const customIcon = L.divIcon({
          className: "custom-leaflet-icon",
          html: `<div style="background-color: ${color}; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 16px;">${emoji}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // Add Marker
        const marker = L.marker([item.latitude, item.longitude], { icon: customIcon })
          .addTo(mapInstance);

        const photoUrl = item.imageUrl || (item.image ? (item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/uploads/${item.image}`) : null);

        const photoHtml = photoUrl ? `
          <div style="margin-bottom: 8px; border-radius: 8px; overflow: hidden; background: #f1f5f9;">
            <a href="${photoUrl}" target="_blank" rel="noopener noreferrer" title="Klik untuk membuka foto ukuran penuh">
              <img src="${photoUrl}" alt="${item.name}" style="width: 100%; height: 120px; object-fit: cover; display: block;" onerror="this.parentElement.parentElement.style.display='none'" />
            </a>
          </div>
        ` : '';

        const detailsHtml = Object.entries(item.details || {})
          .filter(([k, v]) => v && k !== 'image' && k !== 'foto' && k !== 'photoUrl')
          .map(([k, v]) => `<div style="display: flex; justify-content: space-between; gap: 8px;"><span style="color: #64748b;">${k}:</span> <span style="font-weight: 600; color: #1e293b; text-align: right;">${v}</span></div>`)
          .join("");

        marker.bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; padding: 2px; min-width: 200px; max-width: 260px;">
            ${photoHtml}
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">${item.name}</div>
            <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
              <span style="font-size: 9px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">${item.type.replace(/_/g, " ")}</span>
              <span style="font-size: 9px; font-weight: 700; background: ${item.status === 'AKTIF' || item.status === 'NORMAL' ? '#dcfce7' : '#fee2e2'}; color: ${item.status === 'AKTIF' || item.status === 'NORMAL' ? '#15803d' : '#b91c1c'}; padding: 2px 6px; border-radius: 4px;">${item.status}</span>
            </div>
            ${detailsHtml ? `<div style="display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #f1f5f9; padding-top: 6px; font-size: 10px;">${detailsHtml}</div>` : ''}
          </div>
        `, { maxWidth: 280 });
      });
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [loading, items, selectedType]);

  const mapTypes = [
    { key: "ALL", label: "Semua", icon: Compass },
    { key: "BTS_TOWER", label: "Menara BTS", icon: Landmark },
    { key: "BLANKSPOT", label: "Blankspot", icon: WifiOff },
    { key: "VSAT", label: "Koneksi VSAT", icon: Server },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        {mapTypes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition ${
                selectedType === t.key
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[500px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 animate-pulse">Memuat Peta Infrastruktur...</span>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default GISMap;
