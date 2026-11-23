# Panduan mengisi konten SamawatLab

Ada 88 berkas, satu per bab: `content/vol-XX/bab-NN-judul.md`.

## Alur kerja
1. Buka satu berkas bab. Baca blok `> Draf tujuan` dan `Disarankan sudah dibaca` di bagian atas.
2. Isi teks **di bawah** tiap judul `##`. Teks dalam `<!-- ... -->` adalah panduan dan tidak tampil di situs.
3. Bagian yang dibiarkan kosong tidak ditampilkan. Isi sebagian dulu tidak apa-apa.
4. Untuk tiap konsep, tulis di bawah judul `###` yang sama persis dengan di indeks (jangan diganti namanya).
5. Isi `## Relasi` dengan format `jenis: Nama topik` (jenis: prerequisite, related, application, mathematical_basis, astronomical_basis, instrument, historical_origin, method, problem, solution, advanced_topic, example). Nama topik harus sama dengan nama bab atau konsep di atlas agar tertaut.
6. Ubah `status:` di bagian atas berkas: kosong → draft → review → verified → published.
7. Jalankan `python3 tools/build_atlas.py` (butuh `pip install markdown`), lalu buka `index.html`.
8. Lihat `content/INDEKS.md` untuk progres semua bab.

## Aturan isi (dari skill SamawatLab)
- Jelaskan istilah teknis saat pertama muncul; pakai pasangan Inggris–Indonesia bila berguna.
- Setiap rumus: variabel, satuan, asumsi, contoh, batasan.
- Pisahkan hasil hitung astronomis dari keputusan fikih. Jangan menyajikan kriteria yang diperdebatkan sebagai konsensus.
- Dalil dan sejarah wajib bersumber. Jangan mengutip dari ingatan; tandai "(perlu verifikasi)" bila belum yakin.
- Format Markdown: `**tebal**`, `*miring*`, daftar, tabel, dan blok kode ``` untuk rumus.

`CONTOH-bab-terisi.md` memperlihatkan bab yang sudah terisi (hanya contoh format).
