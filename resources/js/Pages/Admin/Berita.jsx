import React, { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import { Plus, Edit2, Trash2, Save, X, Eye, FileText, ToggleLeft, ToggleRight, Check } from "lucide-react";

export default function Berita({ posts: initialPosts, categories: initialCategories, tags: initialTags }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [tags, setTags] = useState(initialTags || []);

  const [activeTab, setActiveTab] = useState("posts"); // posts, categories, tags

  // Modals
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  // Post form states
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Category form states
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState("");

  // Tag form states
  const [editingTag, setEditingTag] = useState(null);
  const [tagName, setTagName] = useState("");

  // Handle Post File Upload
  const handlePostImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploadingImage(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImage(data.url);
        alert("Gambar artikel berhasil diunggah.");
      } else {
        alert("Gagal mengunggah gambar.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Open modals
  const openAddPostModal = () => {
    setEditingPost(null);
    setTitle("");
    setContent("");
    setImage("");
    setPublished(true);
    setCategoryId(categories[0]?.id || "");
    setSelectedTags([]);
    setPostModalOpen(true);
  };

  const openEditPostModal = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImage(post.image || "");
    setPublished(post.published);
    setCategoryId(post.categoryId);
    setSelectedTags(post.tags ? post.tags.map(t => t.id) : []);
    setPostModalOpen(true);
  };

  // Handle Post Submit
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      alert("Judul, konten, dan kategori wajib diisi.");
      return;
    }

    const payload = {
      id: editingPost ? editingPost.id : null,
      title,
      content,
      image,
      published,
      categoryId,
      tags: selectedTags
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Artikel berita berhasil disimpan!");
        const updatedPost = data.post;
        if (editingPost) {
          setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
        } else {
          setPosts([updatedPost, ...posts]);
        }
        setPostModalOpen(false);
      } else {
        alert("Gagal menyimpan artikel.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  // Delete Post
  const handlePostDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Artikel berhasil dihapus.");
        setPosts(posts.filter(p => p.id !== id));
      } else {
        alert("Gagal menghapus artikel.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  // ==========================================
  // CATEGORIES METHODS
  // ==========================================
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catName) return;

    const payload = {
      id: editingCat ? editingCat.id : null,
      name: catName
    };

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Kategori berhasil disimpan.");
        if (editingCat) {
          setCategories(categories.map(c => c.id === data.category.id ? data.category : c));
        } else {
          setCategories([...categories, data.category]);
        }
        setCatModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCatDelete = async (id) => {
    if (!confirm("Hapus kategori ini? Berita di dalamnya mungkin akan kehilangan kategori.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
        alert("Kategori dihapus.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // TAGS METHODS
  // ==========================================
  const handleTagSubmit = async (e) => {
    e.preventDefault();
    if (!tagName) return;

    const payload = {
      id: editingTag ? editingTag.id : null,
      name: tagName
    };

    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Tag berhasil disimpan.");
        if (editingTag) {
          setTags(tags.map(t => t.id === data.tag.id ? data.tag : t));
        } else {
          setTags([...tags, data.tag]);
        }
        setTagModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagDelete = async (id) => {
    if (!confirm("Hapus tag ini?")) return;
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (res.ok) {
        setTags(tags.filter(t => t.id !== id));
        alert("Tag dihapus.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTagSelection = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <AdminLayout>
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Pengelolaan Berita & Publikasi
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Tulis artikel berita, pengumuman resmi daerah, serta kelola kategori dan kata kunci pencarian
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 mt-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3 px-2 border-b-2 transition-all ${
            activeTab === "posts" 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Daftar Berita ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 px-2 border-b-2 transition-all ${
            activeTab === "categories" 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Kategori ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`pb-3 px-2 border-b-2 transition-all ${
            activeTab === "tags" 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Tags Kata Kunci ({tags.length})
        </button>
      </div>

      {/* Tab 1: POSTS LIST */}
      {activeTab === "posts" && (
        <div className="flex flex-col gap-6 mt-2">
          <div className="flex justify-end">
            <button
              onClick={openAddPostModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={14} />
              <span>Tulis Berita Baru</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                    <th className="p-4 w-20">Gambar</th>
                    <th className="p-4">Judul Artikel</th>
                    <th className="p-4 w-40">Kategori</th>
                    <th className="p-4 w-28">Status</th>
                    <th className="p-4 w-20 text-center">Pembaca</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-450">
                        Belum ada artikel berita ditulis. Silakan tambah baru.
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-4">
                          <div className="w-14 h-10 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200/40 dark:border-slate-850 flex items-center justify-center">
                            {post.image ? (
                              <img src={post.image} alt="" className="object-cover w-full h-full" />
                            ) : (
                              <FileText size={16} className="text-slate-400" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-extrabold text-slate-900 dark:text-white line-clamp-1 text-sm">{post.title}</span>
                            <span className="text-[10px] text-slate-400 font-semibold truncate">/{post.slug}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] uppercase tracking-wider rounded-md">
                            {post.category ? post.category.name : "Uncategorized"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded ${
                            post.published 
                              ? "text-emerald-600 bg-emerald-500/10" 
                              : "text-slate-500 bg-slate-100"
                          }`}>
                            {post.published ? "PUBLISHED" : "DRAFT"}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold">{post.views || 0}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`/berita/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-lg text-slate-500"
                              title="Intip Tampilan Klien"
                            >
                              <Eye size={12} />
                            </a>
                            <button
                              onClick={() => openEditPostModal(post)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-lg text-slate-650 dark:text-slate-300"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handlePostDelete(post.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-650 hover:text-white rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CATEGORIES LIST */}
      {activeTab === "categories" && (
        <div className="flex flex-col gap-6 mt-2">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingCat(null);
                setCatName("");
                setCatModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={14} />
              <span>Tambah Kategori</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm w-full max-w-xl mx-auto overflow-hidden">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">Nama Kategori</th>
                  <th className="p-4">Slug URL</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-850">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="p-4 text-slate-400">/{c.slug}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingCat(c);
                            setCatName(c.name);
                            setCatModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-350"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleCatDelete(c.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-600 hover:text-white rounded-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: TAGS LIST */}
      {activeTab === "tags" && (
        <div className="flex flex-col gap-6 mt-2">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingTag(null);
                setTagName("");
                setTagModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={14} />
              <span>Tambah Tag</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm w-full max-w-xl mx-auto overflow-hidden">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">Nama Tag</th>
                  <th className="p-4">Slug URL</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-850">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">#{t.name}</td>
                    <td className="p-4 text-slate-400">/{t.slug}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTag(t);
                            setTagName(t.name);
                            setTagModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-350"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleTagDelete(t.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-600 hover:text-white rounded-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Modal Form (Write / Edit) */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-5 relative h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPostModalOpen(false)}
              className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingPost ? "Sunting Artikel Berita" : "Tulis Artikel Berita Baru"}
            </h3>

            <form onSubmit={handlePostSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left side: Inputs */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Judul Artikel</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan judul berita utama..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white text-xs font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Isi Konten Berita</label>
                    <textarea
                      required
                      rows={14}
                      placeholder="Tuliskan konten artikel secara detail disini..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none font-mono text-[11px] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Right side: Options */}
                <div className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kategori Berita</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="" disabled>Pilih Kategori...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gambar Utama (Sampul)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePostImageUpload}
                      disabled={uploadingImage}
                      className="file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 text-slate-500 cursor-pointer overflow-hidden py-1 w-full"
                    />
                    <input
                      type="text"
                      placeholder="URL Gambar..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white mt-1.5"
                    />
                    {uploadingImage && <span className="text-[9px] text-emerald-500">Mengunggah...</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pilih Tags Kata Kunci</label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl">
                      {tags.map(t => {
                        const selected = selectedTags.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTagSelection(t.id)}
                            className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border transition flex items-center gap-1 ${
                              selected
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-55"
                            }`}
                          >
                            {selected && <Check size={10} />}
                            <span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2 border-t border-slate-100 dark:border-slate-850 mt-2">
                    <button
                      type="button"
                      onClick={() => setPublished(!published)}
                      className="text-slate-500 focus:outline-none"
                    >
                      {published ? (
                        <ToggleRight size={32} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={32} />
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white font-bold">Publikasikan Langsung</span>
                      <span className="text-[9px] text-slate-450 leading-tight">Draft tidak akan muncul di web klien</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    <span>Simpan Berita</span>
                  </button>

                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal (Add / Edit) */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl flex flex-col gap-5 relative">
            <button onClick={() => setCatModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-650">
              <X size={20} />
            </button>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingCat ? "Edit Kategori" : "Tambah Kategori"}
            </h3>
            <form onSubmit={handleCatSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengumuman Resmi..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>
              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider">
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tag Modal (Add / Edit) */}
      {tagModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl flex flex-col gap-5 relative">
            <button onClick={() => setTagModalOpen(false)} className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-650">
              <X size={20} />
            </button>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {editingTag ? "Edit Tag" : "Tambah Tag"}
            </h3>
            <form onSubmit={handleTagSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nama Tag</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: spbe..."
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>
              <button type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider">
                Simpan Tag
              </button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
