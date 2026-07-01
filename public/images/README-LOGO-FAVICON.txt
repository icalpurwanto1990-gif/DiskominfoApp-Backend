===================================================
  PANDUAN MENGGANTI LOGO & FAVICON — DISKOMINFO APP
===================================================

Folder ini (public/images/) adalah lokasi standar untuk
menyimpan aset logo dan favicon website.

----------------------------------------------------
1. CARA MENGGANTI LOGO NAVBAR
----------------------------------------------------
File : public/images/logo.png
Spec : - Format : PNG (transparan/PNG-24 direkomendasikan)
       - Tinggi : ideal 40-50 px (lebar bebas, proporsional)
       - Ukuran : < 200 KB

Langkah:
a. Siapkan file logo Anda dalam format PNG
b. Rename file tersebut menjadi: logo.png
c. Copy/paste ke dalam folder ini (timpa file lama)
d. Hard-refresh browser: Ctrl + Shift + R (Windows)
   atau Command + Shift + R (Mac)

----------------------------------------------------
2. CARA MENGGANTI FAVICON (ICON TAB BROWSER)
----------------------------------------------------
File-file favicon:
  - favicon.png          → fallback utama
  - favicon-32x32.png   → icon 32x32 pixel
  - favicon-16x16.png   → icon 16x16 pixel
  - apple-touch-icon.png → icon Apple/iOS 180x180 pixel

Spec : - Format : PNG
       - favicon-32x32.png : 32 x 32 pixel
       - favicon-16x16.png : 16 x 16 pixel
       - apple-touch-icon.png : 180 x 180 pixel

Tools gratis untuk generate favicon dari logo:
  https://favicon.io/favicon-converter/
  https://realfavicongenerator.net/

Langkah:
a. Buka https://favicon.io/favicon-converter/
b. Upload logo Anda
c. Download hasilnya, akan ada beberapa file
d. Copy file-file tersebut ke folder ini dengan
   nama sesuai daftar di atas
e. Hard-refresh browser: Ctrl + Shift + R

----------------------------------------------------
3. CATATAN PENTING
----------------------------------------------------
- TIDAK PERLU EDIT KODE sama sekali!
- Cukup GANTI FILE dengan nama yang sama
- Jika logo tidak muncul, pastikan nama file persis:
  logo.png (huruf kecil semua)
- Setelah ganti, wajib hard-refresh browser agar
  cache lama terhapus

===================================================
