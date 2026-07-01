import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { Search, Calendar, Eye, Tag, Clock, FileText, ArrowRight, Filter, Newspaper, ChevronRight } from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import ScrollReveal from "../Components/ScrollReveal";
import PageHero from "../Components/PageHero";

const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
};

const estimateReadTime = (content) => {
  const words = stripHtml(content).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

// Skeleton loader card
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
    <div className="h-44 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 shimmer-bg" />
    </div>
    <div className="p-5 flex flex-col gap-3">
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3 relative overflow-hidden">
        <div className="absolute inset-0 shimmer-bg" />
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5 relative overflow-hidden">
        <div className="absolute inset-0 shimmer-bg" />
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-2/5 relative overflow-hidden mt-2">
        <div className="absolute inset-0 shimmer-bg" />
      </div>
    </div>
  </div>
);

const categoryColors = {
  "berita": "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
  "pengumuman": "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40",
  "artikel": "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40",
  "siaran-pers": "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40",
  default: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-slate-800/40",
};

const getCategoryColor = (slug) => categoryColors[slug] || categoryColors.default;

export const Berita = ({ categories = [] }) => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Filter parameters matching Tulang Bawang Sidebar
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(8);

  const [activeStartDate, setActiveStartDate] = useState("");
  const [activeEndDate, setActiveEndDate] = useState("");
  const [activeLimit, setActiveLimit] = useState(8);

  // Build full categories list with ALL option
  const allCategories = [
    { slug: "ALL", name: "Semua" },
    ...(categories || []).map(cat => ({ slug: cat.slug, name: cat.name }))
  ];

  // Parse URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    const catParam = params.get("category");
    if (qParam) {
      setSearch(qParam);
      setLocalSearch(qParam);
    }
    if (catParam) setSelectedCat(catParam);
  }, []);

  // Fetch news based on filters
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("q", search);
        if (selectedCat && selectedCat !== "ALL") queryParams.append("category", selectedCat);
        if (activeStartDate) queryParams.append("tanggal_awal", activeStartDate);
        if (activeEndDate) queryParams.append("tanggal_akhir", activeEndDate);
        if (activeLimit) queryParams.append("limit", activeLimit);

        const res = await fetch(`/api/berita?${queryParams.toString()}`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchNews, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedCat, activeStartDate, activeEndDate, activeLimit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(localSearch);
  };

  const handleApplyFilters = () => {
    setActiveStartDate(startDate);
    setActiveEndDate(endDate);
    setActiveLimit(limit);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setLimit(8);
    setSearch("");
    setLocalSearch("");
    setSelectedCat("ALL");
    setActiveStartDate("");
    setActiveEndDate("");
    setActiveLimit(8);
  };

  return (
    <MainLayout>
      {/* Premium Page Hero */}
      <PageHero
        label="PUBLIKASI KABUPATEN"
        title={<>Berita & <span className="text-blue-400">Siaran Pers</span></>}
        subtitle="Informasi terkini pembangunan daerah, pengumuman resmi, dan liputan kegiatan Diskominfo Kabupaten Banggai Kepulauan"
        icon={Newspaper}
        gradient="from-[#04284d] via-slate-900 to-slate-950"
        accentColor="text-sky-400"
        blobColor="bg-sky-500"
        breadcrumbs={[{ label: "Berita" }]}
        stats={[
          { label: "Total Artikel", value: posts.length || "...", icon: FileText },
        ]}
      />

      {/* Main Container: 2-column sidebar design matching Tulang Bawang style */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column (col-lg-8): News grid cards list */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Results count & dynamic filter chips */}
          {!loading && (
            <div className="flex flex-wrap items-center justify-between gap-4 -mb-2 text-xs font-semibold text-slate-550">
              <p>
                Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{posts.length}</span> artikel
                {search && <> untuk pencarian "<span className="text-[#0a549e] dark:text-sky-400">{search}</span>"</>}
              </p>
              {(search || selectedCat !== "ALL" || activeStartDate || activeEndDate || activeLimit !== 8) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#0a549e] dark:text-sky-400 hover:underline"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          )}

          {/* Catalog grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="w-full text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center gap-3 bg-slate-50/50 dark:bg-slate-950/20">
              <FileText size={32} className="text-slate-350 dark:text-slate-700" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada berita ditemukan</span>
              <button
                onClick={handleResetFilters}
                className="mt-2 text-xs font-bold text-[#0a549e] dark:text-sky-400 hover:underline"
              >
                Atur Ulang Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post, idx) => (
                <ScrollReveal key={post.id} delay={idx * 30}>
                  <article className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
                    {/* Thumbnail */}
                    <Link href={`/berita/${post.slug}`} className="block h-44 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                          <FileText size={28} className="text-slate-300 dark:text-slate-650" />
                        </div>
                      )}
                      {/* Category badge */}
                      {post.category && (
                        <span className={`absolute top-3 left-3 text-[9px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getCategoryColor(post.category.slug)}`}>
                          {post.category.name}
                        </span>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-5 flex flex-col gap-3 flex-grow">
                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(post.createdAt || post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        <span className="flex items-center gap-1">
                          <Eye size={11} />
                          {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock size={11} />
                          ~{estimateReadTime(post.content)} mnt
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-[13px] text-slate-850 dark:text-white leading-snug line-clamp-2 group-hover:text-[#0a549e] dark:group-hover:text-sky-400 transition">
                        <Link href={`/berita/${post.slug}`}>{post.title}</Link>
                      </h3>

                      {/* Excerpt */}
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold line-clamp-3 flex-1">
                        {stripHtml(post.content)}
                      </p>

                      {/* Footer row */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 1).map((tag) => (
                            <span key={tag.slug} className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Tag size={8} />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={`/berita/${post.slug}`}
                          className="text-[10px] font-bold text-[#0a549e] dark:text-sky-400 flex items-center gap-1 hover:gap-1.5 transition-all uppercase tracking-wider"
                        >
                          Baca Selengkapnya
                          <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (col-lg-4): Search, Filters & Categories */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Widget 1: Cari Berita */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0a549e] dark:text-sky-400 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              Cari Berita
            </h3>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Cari informasi..."
                className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a549e]/50 dark:text-white"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-[#0a549e] hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center"
              >
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Widget 2: Filter Berita (Date range & limit) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0a549e] dark:text-sky-400 border-b border-slate-100 dark:border-slate-850 pb-2.5 flex items-center gap-1.5">
              <Filter size={14} />
              Filter Berita
            </h3>
            <div className="flex flex-col gap-3.5 text-xs font-bold text-slate-600 dark:text-slate-350">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-400">Tanggal Awal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-400">Tanggal Akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-400">Jumlah Berita</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="8"
                  min="1"
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <button
                onClick={handleApplyFilters}
                className="mt-2 w-full py-2.5 bg-[#0a549e] hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition duration-200 shadow-sm"
              >
                Tampilkan
              </button>
            </div>
          </div>

          {/* Widget 3: Kategori (Dynamic Category list) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0a549e] dark:text-sky-400 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              Kategori
            </h3>
            <ul className="flex flex-col gap-2 font-bold text-xs text-slate-700 dark:text-slate-350">
              {allCategories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => setSelectedCat(cat.slug)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition group text-[11px] text-left ${
                      selectedCat === cat.slug
                        ? "bg-slate-50 dark:bg-slate-850 text-[#0a549e] dark:text-sky-400 font-extrabold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    <span className="capitalize group-hover:text-[#0a549e] dark:group-hover:text-sky-400">{cat.name}</span>
                    <ChevronRight size={12} className={`text-slate-400 group-hover:translate-x-0.5 transition-transform ${selectedCat === cat.slug ? "translate-x-0.5" : ""}`} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default Berita;
