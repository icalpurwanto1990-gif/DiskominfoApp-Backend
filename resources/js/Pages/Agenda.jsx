import React from "react";
import { Calendar } from "lucide-react";
import { Head } from "@inertiajs/react";
import MainLayout from "../Layouts/MainLayout";
import PageHero from "../Components/PageHero";
import LeaderAgendaTable from "../Components/LeaderAgendaTable";
import ScrollReveal from "../Components/ScrollReveal";

export const Agenda = ({ initialAgendas }) => {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <MainLayout>
      <Head>
        <title>Agenda Pimpinan Daerah - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan</title>
        <meta name="description" content="Informasi jadwal resmi, lokasi, dan pelaksana kegiatan Pimpinan Daerah Kabupaten Banggai Kepulauan." />
        <meta name="keywords" content="Agenda Bupati Banggai Kepulauan, Kegiatan Pimpinan Daerah, Jadwal Diskominfo" />
        <link rel="canonical" href={pageUrl || "http://localhost:3001/agenda"} />
        <meta property="og:title" content="Agenda Pimpinan Daerah - Dinas Komunikasi dan Informatika Kab. Banggai Kepulauan" />
        <meta property="og:description" content="Informasi jadwal resmi, lokasi, dan pelaksana kegiatan Pimpinan Daerah Kabupaten Banggai Kepulauan." />
        <meta property="og:url" content={pageUrl || "http://localhost:3001/agenda"} />
        <meta property="og:type" content="website" />
      </Head>
      {/* Premium Page Hero */}
      <PageHero
        label="AGENDA KEGIATAN PIMPINAN"
        title="Agenda Pimpinan Daerah"
        subtitle="Informasi jadwal resmi, lokasi, dan pelaksana kegiatan Pimpinan Daerah Kabupaten Banggai Kepulauan yang terverifikasi secara berkala"
        icon={Calendar}
        gradient="from-emerald-950 via-slate-900 to-slate-950"
        accentColor="text-emerald-400"
        blobColor="bg-emerald-500"
        breadcrumbs={[{ label: "Agenda Pimpinan" }]}
      />

      {/* Main Agenda Section */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex flex-col gap-10">
        <ScrollReveal direction="up" className="w-full">
          <LeaderAgendaTable initialAgendas={initialAgendas} />
        </ScrollReveal>
      </div>
    </MainLayout>
  );
};

export default Agenda;
