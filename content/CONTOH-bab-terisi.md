---
bab: 20
volume: 4
judul: Trigonometri Bola untuk Kiblat
tingkat: lanjut
status: draft
penulis: (nama Anda)
diperbarui: 2026-11-22
---

# Bab 20 — Trigonometri Bola untuk Kiblat

<!-- CONTOH pengisian. Salin bagian yang berguna ke berkas bab-20 yang sebenarnya. Hanya untuk memperlihatkan format; isinya masih perlu Anda tinjau. -->

## Ringkasan

Arah kiblat dari suatu tempat adalah arah **lingkaran besar** (jalur terpendek pada permukaan bola Bumi) menuju Ka'bah. Karena Bumi hampir bulat, arah ini dihitung dengan trigonometri bola: lokasi pengamat, Kutub Utara, dan Ka'bah membentuk satu *segitiga bola*.

## Rumus

**Azimut kiblat** (diukur dari utara sejati searah jarum jam):

```
Q = atan2( sin C , cos φx · tan φk − sin φx · cos C )
C = λk − λx
```

| Simbol | Arti | Satuan |
|---|---|---|
| φx, λx | lintang dan bujur pengamat (utara dan timur positif) | derajat |
| φk, λk | lintang dan bujur Ka'bah (21,4225° ; 39,8262°) | derajat |
| Q | azimut kiblat, hasil dinormalkan ke 0°–360° | derajat |

Asumsi: Bumi dianggap bola sempurna. Keterbatasan: selisih dengan model elipsoid sangat kecil untuk keperluan ibadah.

## Contoh hitung

Semarang: φx = −6,9666°, λx = 110,4203° BT.

1. C = 39,8262 − 110,4203 = −70,5941°
2. Hitung dengan rumus di atas → **Q ≈ 294,50°** (± 24,5° ke utara dari arah barat)
3. Validasi: cocok dengan Kalkulator Falak situs ini (294,50°).

## Konsep

### Rumus azimuth

Rumus yang mengubah koordinat pengamat dan Ka'bah menjadi sudut arah. Lihat bagian *Rumus* untuk bentuk lengkapnya.

## Relasi

prerequisite: Trigonometri Bola
mathematical_basis: Atan2
instrument: Theodolit
problem: Gangguan magnet
application: Rashdul Kiblat

## Referensi

- M. Ilyas, *A Modern Guide to Astronomical Calculations of Islamic Calendar, Times & Qibla*, Berita Publishing, 1984.
