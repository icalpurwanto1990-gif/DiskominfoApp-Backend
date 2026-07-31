#!/bin/bash
# Script deployment otomatis untuk Laravel Docker di VPS
set -e

echo "========================================="
echo "🚀 Memulai Proses Deployment..."
echo "========================================="

# 1. Pull perubahan kode terbaru
echo "📥 Menarik kode terbaru dari Git..."
git fetch origin
git reset --hard origin/main

# 2. Pastikan folder uploads dan images host ada dan permissions benar
echo "📁 Memastikan folder uploads dan images tersedia..."
mkdir -p ./public/uploads/banners
mkdir -p ./public/uploads/settings
mkdir -p ./public/uploads/icons
mkdir -p ./public/images
chmod -R 775 ./public/uploads
chmod -R 755 ./public/images

# 3. Rebuild dan jalankan kontainer Docker
echo "🐳 Mem-build ulang dan menjalankan container..."
docker compose down
docker compose up -d --build

# 4. Tunggu hingga database PostgreSQL siap menerima koneksi
echo "⏳ Menunggu database PostgreSQL siap..."
until docker compose exec db pg_isready -U diskominfo_admin -d diskominfo_db > /dev/null 2>&1; do
  echo "   [db] database belum siap, menunggu 2 detik..."
  sleep 2
done
echo "   [db] database siap!"

# 5. Jalankan migrasi database
echo "🗄️ Menjalankan migrasi database..."
docker compose exec app php artisan migrate --force

# 6. Pastikan permissions upload di dalam container
echo "🔒 Mengatur permission folder uploads dalam container..."
docker compose exec app chmod -R 775 /var/www/html/public/uploads
docker compose exec app chown -R www-data:www-data /var/www/html/public/uploads

# 7. Bersihkan cache lama, lalu buat cache baru
echo "🧹 Membersihkan cache lama dan mengoptimalkan..."
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
docker compose exec app php artisan event:cache

echo "========================================="
echo "✅ Deployment berhasil diselesaikan!"
echo "========================================="
