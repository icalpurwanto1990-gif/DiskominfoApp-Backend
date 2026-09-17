#!/bin/bash
# ==============================================================================
# Script Otomasi Restore Data di Server On-Premise (Diskominfo Banggai Kepulauan)
# Memulihkan Database PostgreSQL + Media Uploads + Konfigurasi Environment
# ==============================================================================

set -e

ARCHIVE_FILE="$1"

if [ -z "$ARCHIVE_FILE" ]; then
    echo "❌ ERROR: Harap tentukan nama berkas arsip migrasi!"
    echo "Penggunaan: ./scripts/restore-onpremise.sh <nama_berkas_arsip.tar.gz>"
    echo "Contoh:     ./scripts/restore-onpremise.sh diskominfo_migration_20260917_090000.tar.gz"
    exit 1
fi

if [ ! -f "$ARCHIVE_FILE" ]; then
    echo "❌ ERROR: Berkas arsip '$ARCHIVE_FILE' tidak ditemukan!"
    exit 1
fi

echo "========================================================"
echo "🚀 [ON-PREMISE] Memulai Proses Pemulihan (Restore) Data"
echo "📦 Berkas: $ARCHIVE_FILE"
echo "========================================================"

EXTRACT_DIR="/tmp/diskominfo_restore_$(date +%s)"
mkdir -p "$EXTRACT_DIR"

echo "📂 1/6 Mengekstrak paket arsip migrasi..."
tar -xzf "$ARCHIVE_FILE" -C "$EXTRACT_DIR"

# Cari folder hasil ekstraksi
SUBDIR=$(find "$EXTRACT_DIR" -maxdepth 1 -type d -name "migration_package_*" | head -n 1)
if [ -z "$SUBDIR" ]; then
    SUBDIR="$EXTRACT_DIR"
fi

# 2. Pulihkan berkas .env
echo "🔐 2/6 Memulihkan berkas konfigurasi .env..."
if [ -f "$SUBDIR/.env" ]; then
    cp "$SUBDIR/.env" ./.env
    chmod 644 ./.env
    echo "   ✅ File .env berhasil dipulihkan."
else
    echo "   ⚠️ File .env tidak ditemukan dalam arsip. Menggunakan .env yang ada."
fi

# 3. Pulihkan berkas fisik uploads & images
echo "📁 3/6 Memulihkan berkas fisik uploads & images..."
if [ -f "$SUBDIR/uploads_media.tar.gz" ]; then
    tar -xzf "$SUBDIR/uploads_media.tar.gz" -C ./
    mkdir -p ./public/uploads ./public/images
    chmod -R 775 ./public/uploads
    chmod -R 755 ./public/images
    echo "   ✅ Berkas media dan gambar berhasil dipulihkan."
fi

# 4. Build dan nyalakan container Docker On-Premise
echo "🐳 4/6 Menyalakan kontainer Docker On-Premise..."
docker compose down || true
docker compose up -d --build

# 5. Tunggu database PostgreSQL siap
echo "⏳ Menunggu database PostgreSQL siap menerima koneksi..."
until docker compose exec db pg_isready -U diskominfo_admin -d diskominfo_db > /dev/null 2>&1; do
    echo "   [db] menunggu kesiapan database PostgreSQL..."
    sleep 2
done
echo "   ✅ Database PostgreSQL siap!"

# 6. Pulihkan Database PostgreSQL
echo "🗄️ 5/6 Memulihkan database dari dump PostgreSQL..."
if [ -f "$SUBDIR/diskominfo_db.dump" ]; then
    docker compose cp "$SUBDIR/diskominfo_db.dump" db:/tmp/restore_db.dump
    # Lakukan restore dengan flag clean agar data awal diganti dengan data VPS yang terbaru
    docker compose exec db pg_restore -U diskominfo_admin -d diskominfo_db --clean --if-exists -v /tmp/restore_db.dump || true
    docker compose exec db rm -f /tmp/restore_db.dump
    echo "   ✅ Database berhasil dipulihkan secara penuh!"
else
    echo "   ⚠️ Berkas diskominfo_db.dump tidak ditemukan dalam arsip."
fi

# 7. Sinkronisasi permissions, migrasi lanjutan, dan cache
echo "🧹 6/6 Menjalankan migrasi, storage link, dan optimasi cache..."
docker compose exec app php artisan migrate --force
docker compose exec app php artisan storage:link || true
docker compose exec app chmod -R 775 /var/www/html/public/uploads
docker compose exec app chown -R www-data:www-data /var/www/html/public/uploads /var/www/html/storage /var/www/html/bootstrap/cache

docker compose exec app php artisan optimize:clear
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache

# Bersihkan direktori temporary
rm -rf "$EXTRACT_DIR"

echo "========================================================"
echo "🎉 RESTORE BERHASIL SELESAI!"
echo "Aplikasi Portal Diskominfo kini telah aktif di Server On-Premise."
echo "Silakan lakukan pengetesan melalui browser: http://localhost:8080 atau IP Lokal Server."
echo "========================================================"
