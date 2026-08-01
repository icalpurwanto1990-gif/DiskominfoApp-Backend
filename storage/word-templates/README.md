# 📁 Folder Template Word Dokumen Layanan

Folder ini menyimpan file template `.docx` yang digunakan untuk generate
dokumen surat permohonan dan bukti penyelesaian layanan.

## File Template yang Dikenali Sistem

| Nama File | Fungsi |
|-----------|--------|
| `surat-permohonan.docx` | Template Surat Permohonan Layanan |
| `bukti-selesai.docx` | Template Bukti Penyelesaian Layanan |

## Cara Menggunakan Template Anda Sendiri

1. Buat atau edit file `.docx` menggunakan Microsoft Word / LibreOffice
2. Sisipkan placeholder di mana Anda ingin data diisi otomatis, contoh:
   - Ketik `${nama_pemohon}` di dalam dokumen Word
3. Simpan file dengan nama yang sesuai di folder ini
4. Sistem akan otomatis menggunakan template Anda saat Admin klik "Download Surat"

## Daftar Placeholder yang Tersedia

```
${nomor_tiket}         → Nomor tiket (contoh: SRV-20260801-001)
${jenis_layanan}       → Jenis layanan yang diajukan
${nama_pemohon}        → Nama lengkap pemohon
${email_pemohon}       → Email pemohon
${telepon_pemohon}     → Nomor telepon pemohon
${instansi}            → Instansi / OPD pemohon
${status}              → Status tiket saat ini
${catatan_admin}       → Catatan/tanggapan dari Admin
${tanggal_pengajuan}   → Tanggal tiket dibuat (contoh: 01 Agustus 2026)
${tanggal_selesai}     → Tanggal tiket diselesaikan
${nama_petugas}        → Nama Admin/petugas yang menangani
${tahun}               → Tahun saat ini
${tanggal_hari_ini}    → Tanggal hari ini
```

## Placeholder Dinamis dari Form Pemohon (detail_*)

Setiap field dari formulir pemohon yang tersimpan di database juga tersedia
sebagai placeholder dengan prefix `detail_`.

**Contoh:** Jika formulir pemohon memiliki field `jenis_perangkat`,
maka di template Word gunakan: `${detail_jenis_perangkat}`

## Catatan

- Jika template tidak ditemukan, sistem akan generate dokumen default dari scratch
- Template yang baru diupload langsung aktif tanpa perlu restart server
- Pastikan file berekstensi `.docx` (bukan `.doc`)
