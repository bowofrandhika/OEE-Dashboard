# DRYLINE / OEE — Dashboard Produksi Karet Kering

Dashboard web operasional untuk memantau kinerja **OEE (Overall Equipment Effectiveness)** pada fasilitas produksi karet kering, mencakup dua divisi:

- **Produksi Basah** — koagulasi, pencucian, pemerasan
- **Produksi Kering** — pengeringan, penggilingan, penimbangan, gudang

## Fitur

- **Pita status kontrol** — jam WIB langsung, pilihan plant, indikator `SISTEM AKTIF`
- **Metrik utama** — OEE, Ketersediaan, Kinerja, Kualitas vs target, progres shift
- **Alur Basah → Kering** — 5 tahap proses dengan status peralatan langsung
- **Tren OEE** — grafik SVG interaktif (8 jam / 24 jam / 7 hari), garis Target & Rencana
- **Sumber Kehilangan** — peringkat waktu henti dengan batang berarsir untuk periode lampau
- **Matriks Divisi** — OEE per unit kerja & waktu henti per penyebab
- **Buku Catatan Peristiwa** — ledger peristiwa terbaru dengan status
- **Aksi** — laporan shift (cetak/PDF), kelola target, pengaturan
- **Ekspor CSV** untuk analisis luar sistem
- Responsif (desktop, tablet, ponsel) + dukungan `prefers-reduced-motion`

## Menjalankan

Aplikasi statis tanpa build step. Buka `index.html` langsung di browser, atau:

```bash
python3 -m http.server 4173
# buka http://localhost:4173
```

## Struktur

```
index.html   — struktur dashboard
styles.css   — sistem desain industrial (token warna, tipografi, layout, cetak)
app.js       — data, grafik SVG, simulasi langsung, interaksi
favicon.svg  — ikon pabrik
```

## Teknologi

HTML, CSS, dan JavaScript murni — tanpa dependensi eksternal (font dimuat dari Google Fonts dengan fallback sistem).
