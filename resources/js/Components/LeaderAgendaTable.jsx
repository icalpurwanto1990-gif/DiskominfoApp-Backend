import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Award, User, Download, FileText, ChevronLeft, ChevronRight, Camera, ExternalLink } from "lucide-react";

export const LeaderAgendaTable = ({ initialAgendas = [] }) => {
  const [agendas, setAgendas] = useState(initialAgendas);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    const fetchAgendas = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leader-agendas?month=${selectedMonth}&year=${selectedYear}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAgendas(data.agendas);
          }
        }
      } catch (error) {
        console.error("Gagal memuat agenda pimpinan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendas();
  }, [selectedMonth, selectedYear]);

  // Format date helper: "Rabu, 1 Juli 2026"
  const formatIndoDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  };

  const currentMonthLabel = months.find(m => m.value === selectedMonth)?.label || "";

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col gap-8 transition-all duration-300">
      
      {/* Filters and Actions header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Calendar className="text-emerald-500" size={22} />
          <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white uppercase tracking-wider">
            Agenda Kegiatan Pimpinan
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Government layout style */}
      <div className="w-full flex flex-col items-stretch gap-6 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto">
        <div className="min-w-[1050px] w-full flex flex-col items-center">
          
          {/* Government Document Masthead */}
          <div className="w-full flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Lambang Daerah / Logo (Fallback to standard government icon if file doesn't exist) */}
              <img 
                src="/images/logo.png" 
                alt="Logo Banggai Kepulauan" 
                className="w-16 h-20 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://diskominfo.banggaikep.go.id/uploads/settings/logo.png";
                }}
              />
              <div className="flex flex-col text-slate-900 dark:text-white">
                <span className="text-sm font-black uppercase tracking-wide">Sekretariat Daerah</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Bagian Protokol Dan Komunikasi Pimpinan</span>
                <span className="text-lg font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Jadwal Kegiatan Bupati Banggai Kepulauan</span>
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Bulan {currentMonthLabel} {selectedYear}</span>
              </div>
            </div>
            
            {/* Visual Bupati/Wakil photo box matching the document image */}
            <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-1.5 shadow-sm">
              <img
                src="/uploads/settings/bupati-wakil.png"
                alt="Foto Bupati & Wakil Bupati"
                className="w-24 h-16 object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.nextSibling;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
              <div 
                style={{ display: 'none' }}
                className="w-24 h-16 bg-slate-100 dark:bg-slate-900 rounded flex flex-col items-center justify-center text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center px-1"
              >
                <span>Foto Bupati</span>
                <span>& Wakil Bupati</span>
              </div>
            </div>
          </div>

          {/* Tabel Agenda Dinas */}
          <table className="w-full border-collapse border-2 border-slate-950 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
            <thead>
              <tr className="bg-slate-800 text-white border-b-2 border-slate-950 dark:border-slate-700 uppercase font-bold text-center">
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-2 w-[4%]">NO.</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-3 w-[15%]">HARI / TANGGAL</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-2 w-[10%]">JAM</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-3 w-[16%]">TEMPAT</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-3 w-[20%]">URAIAN KEGIATAN</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-3 w-[11%]">PELAKSANA</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-2 w-[10%]">KET</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-2 w-[7%]">FOTO KEGIATAN</th>
                <th className="border border-slate-950 dark:border-slate-700 py-3 px-2 w-[7%]">DOKUMEN SAMBUTAN</th>
              </tr>
              {/* Row index subheader matching the uploaded image document standard */}
              <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold text-center border-b-2 border-slate-950 dark:border-slate-700">
                <td className="border border-slate-950 dark:border-slate-700 py-1">1</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">2</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">3</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">4</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">5</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">6</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">7</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">8</td>
                <td className="border border-slate-950 dark:border-slate-700 py-1">9</td>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="border border-slate-950 dark:border-slate-700 text-center py-10 font-bold text-slate-400">
                    <span className="animate-pulse">Memuat Agenda Pimpinan...</span>
                  </td>
                </tr>
              ) : agendas.length === 0 ? (
                <tr>
                  <td colSpan="9" className="border border-slate-950 dark:border-slate-700 text-center py-8 font-bold text-slate-400">
                    Belum ada agenda pimpinan terjadwal untuk bulan {currentMonthLabel} {selectedYear}
                  </td>
                </tr>
              ) : (
                agendas.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 border-b border-slate-950 dark:border-slate-700 align-top transition"
                  >
                    <td className="border border-slate-950 dark:border-slate-700 text-center py-3 px-1 font-bold">
                      {index + 1}
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {formatIndoDate(item.date)}
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 text-center py-3 px-2 font-bold text-emerald-600 dark:text-emerald-400">
                      {item.time}
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 py-3 px-3 font-medium">
                      {item.location}
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 py-3 px-3 leading-relaxed font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 py-3 px-3 font-semibold">
                      {item.organizer}
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 py-3 px-3 italic text-slate-600 dark:text-slate-400">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold not-italic text-[10px] text-slate-900 dark:text-white">
                          ({item.leader_name})
                        </span>
                        {item.notes || "-"}
                      </div>
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 text-center py-3 px-2 align-middle">
                      {item.photo_url ? (
                        <a
                          href={item.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition shadow-sm"
                          title="Buka Foto Kegiatan (Google Drive)"
                        >
                          <Camera size={12} />
                          <span>Foto Drive</span>
                          <ExternalLink size={10} className="opacity-80" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>
                    <td className="border border-slate-950 dark:border-slate-700 text-center py-3 px-2 align-middle">
                      {item.speech_doc_url ? (
                        <a
                          href={item.speech_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition shadow-sm"
                          title="Buka Dokumen Sambutan (Google Drive)"
                        >
                          <FileText size={12} />
                          <span>Sambutan</span>
                          <ExternalLink size={10} className="opacity-80" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>
      
    </div>
  );
};

export default LeaderAgendaTable;
