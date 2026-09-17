#!/bin/bash
# ==============================================================================
# Script Otomasi Backup Data dari VPS (Diskominfo Banggai Kepulauan)
# Menghasilkan arsip migrasi lengkap: Database PostgreSQL + Media Uploads + .env
# ==============================================================================

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./migration_package_${TIMESTAMP}"
ARCHIVE_NAME="diskominfo_migration_${TIMESTAMP}.tar.gz"

echo "========================================================"
echo "🚀 [VPS] Memulai Proses Backup Migrasi ke Server On-Premise"
echo "🕒 Waktu: $(date)"
echo "========================================================"

# 1. Buat direktori penampung
mkdir -p "${BACKUP_DIR}"

# 2. Backup Database PostgreSQL langsung dari container 'db'
echo "📦 1/4 Mengekspor Database PostgreSQL dari container Docker..."
if docker compose ps -q db > /dev/null 2>&1; then
    docker compose exec db pg_dump -U diskominfo_admin -d diskominfo_db -F c -b -v -f /tmp/diskominfo_db.dump
    docker compose cp db:/tmp/diskominfo_db.dump "${BACKUP_DIR}/diskominfo_db.dump"
    docker compose exec db rm -f /tmp/diskominfo_db.dump
    echo "   ✅ Database berhasil diekspor (${BACKUP_DIR}/diskominfo_db.dump)."
else
    echo "   ❌ ERROR: Container database (db) tidak berjalan!"
    exit 1
fi

# 3. Salin file konfigurasi .env
echo "🔐 2/4 Menyalin konfigurasi .env..."
if [ -f .env ]; then
    cp .env "${BACKUP_DIR}/.env"
    echo "   ✅ Berkas .env berhasil diamankan."
else
    echo "   ⚠️ PERINGATAN: Berkas .env tidak ditemukan di direktori saat ini."
fi

# 4. Arsipkan berkas uploads & images
echo "📁 3/4 Mengompres berkas fisik uploads dan images..."
tar -czf "${BACKUP_DIR}/uploads_media.tar.gz" \
    --exclude='*.log' \
    ./public/uploads ./public/images 2>/dev/null || true
echo "   ✅ Berkas uploads dan images berhasil dikompres."

# 5. Gabungkan menjadi satu paket arsip tar.gz
echo "🗜️ 4/4 Memaketkan seluruh data migrasi menjadi satu berkas..."
tar -czf "${ARCHIVE_NAME}" -C . "${BACKUP_DIR}"
rm -rf "${BACKUP_DIR}"

FILESIZE=$(du -h "${ARCHIVE_NAME}" | cut -f1)

echo "========================================================"
echo "🎉 BACKUP SELESAI!"
echo "Berkas Arsip: ${ARCHIVE_NAME} (Ukuran: ${FILESIZE})"
echo "========================================================"
echo ""
echo "📌 Langkah Selanjutnya (Transfer ke Server On-Premise):"
echo "Jalankan perintah ini di Server On-Premise untuk mendownload arsip ini:"
echo "scp root@IP_VPS_ANDA:$(pwd)/${ARCHIVE_NAME} /var/www/"
echo "========================================================"
