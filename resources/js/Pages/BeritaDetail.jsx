import React, { useState, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";

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
import { ArrowLeft, Calendar, Eye, Tag, User, FileText, Search, ChevronRight, Maximize2, X } from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import ShareButtons from "../Components/ShareButtons";
import PageHero from "../Components/PageHero";

export const BeritaDetail = ({ post, categories }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/berita?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  if (!post) {
    return (
      <MainLayout>
        <PageHero
          label="DETAIL ARTIKEL"
          title="Berita Tidak Ditemukan"
          subtitle="Artikel berita tidak ditemukan atau telah dihapus dari sistem."
          icon={FileText}
          gradient="from-blue-950 via-slate-900 to-slate-950"
          accentColor="text-blue-400"
          blobColor="bg-blue-500"
          breadcrumbs={[{ label: "Berita", href: "/berita" }, { label: "Tidak Ditemukan" }]}
        />
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-16 text-center">
          <Link 
            href="/berita" 
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Semua Berita</span>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const articleUrl = `https://diskominfo.banggaikep.go.id/berita/${post.slug}`;
  const plainDesc = post ? stripHtml(post.content).substring(0, 160) + "..." : "";
  const postImage = post && post.image ? (post.image.startsWith("http") ? post.image : `https://diskominfo.banggaikep.go.id${post.image}`) : `https://diskominfo.banggaikep.go.id/images/default-news.png`;

  return (
    <MainLayout>
      <Head>
        <title>{`${post.title} | Diskominfo Banggai Kepulauan`}</title>
        <meta name="description" content={plainDesc} />
        <meta name="keywords" content={`Berita Banggai Kepulauan, Diskominfo Bangkep, ${post.category?.name || ""}, ${post.title}`} />
        <link rel="canonical" href={articleUrl} />
        <meta property="og:title" content={`${post.title} | Diskominfo Banggai Kepulauan`} />
        <meta property="og:description" content={plainDesc} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={postImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Diskominfo Banggai Kepulauan`} />
        <meta name="twitter:description" content={plainDesc} />
        <meta name="twitter:image" content={postImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": post.title,
            "image": [postImage],
            "datePublished": post.createdAt || post.created_at,
            "dateModified": post.updatedAt || post.updated_at || post.createdAt || post.created_at,
            "author": {
              "@type": "Person",
              "name": post.author?.name || "Admin Diskominfo"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Dinas Komunikasi dan Informatika Kabupaten Banggai Kepulauan",
              "url": "https://diskominfo.banggaikep.go.id",
              "logo": {
                "@type": "ImageObject",
                "url": "https://diskominfo.banggaikep.go.id/images/favicon.png"
              }
            },
            "description": plainDesc
          })}
        </script>
      </Head>
      {/* Premium Page Hero — uses article info */}
      <PageHero
        label={post.category?.name || "BERITA DAERAH"}
        title={post.title}
        subtitle={`Diterbitkan oleh ${post.author?.name || "Admin Diskominfo"} · ${new Date(post.createdAt || post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
        icon={FileText}
        gradient="from-[#04284d] via-slate-900 to-slate-950"
        accentColor="text-sky-400"
        blobColor="bg-sky-500"
        breadcrumbs={[
          { label: "Berita", href: "/berita" }, 
          { label: post.title?.substring(0, 40) + (post.title?.length > 40 ? "..." : "") }
        ]}
        stats={[
          { label: "Ditayangkan", value: post.views + " kali", icon: Eye },
        ]}
      />

      {/* Main Container: 2-column sidebar design matching Tulang Bawang style */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column (col-lg-8): Featured image, Article contents, Tags & Social share */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Back Navigation */}
          <Link 
            href="/berita" 
            className="flex items-center gap-1.5 text-xs font-bold text-[#0a549e] dark:text-sky-400 hover:underline w-fit uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Semua Berita</span>
          </Link>

          {/* Featured Image - Adaptive Auto-Fit Frame with Ambient Blur & Fullscreen Zoom */}
          {post.image && (
            <div className="relative group w-full rounded-3xl overflow-hidden shadow-md border border-slate-200/70 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/60">
              {/* Ambient blurred backdrop for aesthetic framing of any aspect ratio */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 dark:opacity-25 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${post.image})` }}
              />

              {/* Main Adaptive Image */}
              <div className="relative z-10 flex items-center justify-center p-2 sm:p-4 min-h-[240px]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="max-h-[550px] md:max-h-[680px] w-auto max-w-full h-auto object-contain rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-[1.01] cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                  loading="lazy"
                />
              </div>

              {/* Zoom hint badge */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold rounded-xl transition duration-200 shadow-md cursor-pointer"
                title="Lihat Gambar Ukuran Penuh"
              >
                <Maximize2 size={13} />
                <span>Lihat Ukuran Penuh</span>
              </button>
            </div>
          )}

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-450 font-bold uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
              <User size={12} className="stroke-[2.5]" />
              <span>{post.author?.name || "Admin Diskominfo"} ({post.author?.role || "SUPERADMIN"})</span>
            </span>
            <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>
                {new Date(post.createdAt || post.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </span>
            <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Eye size={12} />
              <span>{post.views} Dilihat</span>
            </span>
          </div>

          {/* News Article Content (renders HTML block with TinyMCE fidelity) */}
          <article className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200 mt-2 post-entry">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                <Tag size={12} />
                <span>Tags:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="text-[9px] font-extrabold text-slate-650 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl uppercase tracking-wider"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Share Buttons Widget */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </div>

        {/* Right Column (col-lg-4): Search input widget and Categories listing */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Widget 1: Cari Berita (Search widget) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0a549e] dark:text-sky-400 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              Cari Berita
            </h3>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Widget 2: Kategori List (Categories widget) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0a549e] dark:text-sky-400 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              Kategori
            </h3>
            <ul className="flex flex-col gap-2 font-bold text-xs text-slate-700 dark:text-slate-350">
              <li>
                <Link
                  href="/berita?category=ALL"
                  className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition group text-[11px]"
                >
                  <span className="group-hover:text-[#0a549e] dark:group-hover:text-sky-400">Semua Kategori</span>
                  <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
              {categories?.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/berita?category=${cat.slug}`}
                    className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition group text-[11px]"
                  >
                    <span className="capitalize group-hover:text-[#0a549e] dark:group-hover:text-sky-400">{cat.name}</span>
                    <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Lightbox / Fullscreen Image Modal */}
      {isLightboxOpen && post.image && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 cursor-pointer shadow-lg"
            title="Tutup (Esc)"
          >
            <X size={24} />
          </button>

          {/* Modal Container */}
          <div 
            className="max-w-5xl max-h-[88vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={post.image}
              alt={post.title}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <p className="text-white/80 text-xs md:text-sm font-semibold mt-3 text-center max-w-2xl line-clamp-2 px-4">
              {post.title}
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default BeritaDetail;
