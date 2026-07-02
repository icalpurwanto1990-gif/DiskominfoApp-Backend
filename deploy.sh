#!/bin/bash
# Script deployment otomatis untuk Laravel Docker di VPS
set -e

echo "========================================="
echo "🚀 Memulai Proses Deployment..."
echo "========================================="

# 1. Pull perubahan kode terbaru
echo "📥 Menarik kode terbaru dari Git..."
git pull origin main

# 2. Rebuild dan jalankan kontainer Docker
echo "🐳 Mem-build ulang dan menjalankan container..."
docker compose up -d --build

# 3. Tunggu hingga database PostgreSQL siap menerima koneksi
echo "⏳ Menunggu database PostgreSQL siap..."
until docker compose exec db pg_isready -U diskominfo_admin -d diskominfo_db > /dev/null 2>&1; do
  echo "   [db] database belum siap, menunggu 2 detik..."
  sleep 2
done
echo "   [db] database siap!"

# 4. Jalankan migrasi database
echo "🗄️ Menjalankan migrasi database..."
docker compose exec app php artisan migrate --force

# 5. Optimasi cache Laravel untuk produksi
echo "🧹 Mengoptimalkan konfigurasi dan cache Laravel..."
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
docker compose exec app php artisan event:cache

echo "========================================="
echo "✅ Deployment berhasil diselesaikan!"
echo "========================================="
