import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Calendar, Eye, Tag, User, FileText, Search, ChevronRight } from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import ShareButtons from "../Components/ShareButtons";
import PageHero from "../Components/PageHero";

export const BeritaDetail = ({ post, categories }) => {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <MainLayout>
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

          {/* Featured Image */}
          {post.image && (
            <div className="w-full aspect-video md:max-h-[480px] bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden shadow-md relative border border-slate-200/60 dark:border-slate-800/80">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
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

          {/* News Article Content (renders HTML block) */}
          <article className="prose prose-slate dark:prose-invert max-w-none text-xs md:text-[13px] font-semibold leading-relaxed text-slate-700 dark:text-slate-350 mt-2 post-entry">
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
    </MainLayout>
  );
};

export default BeritaDetail;
