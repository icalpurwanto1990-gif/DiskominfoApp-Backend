import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle } from "lucide-react";
import { Head } from "@inertiajs/react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import ScrollReveal from "../Components/ScrollReveal";

export const Kontak = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Aduan Jaringan");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kontak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        alert(data.message || "Gagal mengirim pengaduan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      alert("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <MainLayout>
      <Head>
        <title>Kontak & Pengaduan - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan</title>
        <meta name="description" content="Hubungi administrasi kantor Diskominfo Kabupaten Banggai Kepulauan atau kirimkan aduan resmi melalui formulir berikut." />
        <meta name="keywords" content="Kontak Diskominfo, Pengaduan Banggai Kepulauan, Telepon Pemda, Email Diskominfo" />
        <link rel="canonical" href={pageUrl || "http://localhost:3001/kontak"} />
        <meta property="og:title" content="Kontak & Pengaduan - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan" />
        <meta property="og:description" content="Hubungi administrasi kantor Diskominfo Kabupaten Banggai Kepulauan atau kirimkan aduan resmi melalui formulir berikut." />
        <meta property="og:url" content={pageUrl || "http://localhost:3001/kontak"} />
        <meta property="og:type" content="website" />
      </Head>
      {/* Premium Page Hero */}
      <PageHero
        label="HUBUNGI KAMI"
        title="Contact Center & Pengaduan"
        subtitle="Hubungi administrasi kantor Diskominfo Kabupaten Banggai Kepulauan atau kirimkan aduan resmi melalui formulir berikut"
        icon={MessageCircle}
        gradient="from-teal-950 via-slate-900 to-slate-950"
        accentColor="text-teal-400"
        blobColor="bg-teal-500"
        breadcrumbs={[{ label: "Kontak" }]}
        stats={[
          { label: "Email Kantor", value: "1", icon: Mail },
          { label: "No. WhatsApp", value: "Aktif", icon: Phone },
          { label: "Jam Layanan", value: "08:00–16:00", icon: MessageCircle },
        ]}
      />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Contact Detail Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
            
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex gap-4 shadow-sm">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl h-fit">
                <MapPin size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Alamat Kantor</span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mt-1 font-semibold">
                  Kompleks Perkantoran Bukit Trikora, Salakan, Kecamatan Tinangkung, Kabupaten Banggai Kepulauan, Provinsi Sulawesi Tengah, Kode Pos 94885.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex gap-4 shadow-sm">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl h-fit">
                <Mail size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Surat Elektronik (Email)</span>
                <a href="mailto:diskominfo@banggaikep.go.id" className="text-emerald-700 dark:text-emerald-400 hover:underline leading-relaxed mt-1 font-bold">
                  diskominfo@banggaikep.go.id
                </a>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex gap-4 shadow-sm">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl h-fit">
                <Phone size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Telepon & WhatsApp</span>
                <span className="text-slate-500 dark:text-slate-400 mt-1">(0462) 22110 (Telepon Kantor)</span>
                <a
                  href="https://wa.me/6282296421245"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:underline mt-2 font-bold"
                >
                  <MessageCircle size={14} />
                  <span>+62 822-9642-1245 (Hubungan Masyarakat)</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right: Dynamic Complaint Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-6">Formulir Kontak Pengaduan Masyarakat</h3>
            
            {submitted ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex gap-3 text-emerald-950 dark:text-emerald-300">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-xs uppercase tracking-wider leading-none">Aduan Terkirim!</span>
                  <p className="text-[11px] leading-relaxed font-semibold mt-1">
                    Terima kasih atas laporan aduan Anda. Pengaduan telah kami catat dalam database layanan daerah dan akan segera diverifikasi oleh admin bidang terkait.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-name" className="text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-phone" className="text-slate-700 dark:text-slate-300">No. Telepon / WA</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-email" className="text-slate-700 dark:text-slate-300">Alamat Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-subject" className="text-slate-700 dark:text-slate-300">Topik Pengaduan</label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white text-xs font-semibold"
                    >
                      <option value="Aduan Jaringan">Layanan Jaringan Internet</option>
                      <option value="Pelayanan PPID">Pelayanan PPID Online</option>
                      <option value="Sertifikat TTE">Penerbitan TTE (ASN)</option>
                      <option value="Lainnya">Lain-lain / Saran</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-message" className="text-slate-700 dark:text-slate-300">Uraian Masalah / Saran</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan secara lengkap pesan Anda..."
                    className="bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40"
                >
                  <Send size={14} />
                  <span>Kirim Pesan</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default Kontak;
