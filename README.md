# DRYLINE / OEE — PT. POTENSI BUMI SAKTI

Dashboard web operasional untuk memantau kinerja **OEE (Overall Equipment Effectiveness)** pada fasilitas produksi karet kering, mencakup dua divisi:

- **Produksi Basah** — koagulasi, pencucian, pemerasan
- **Produksi Kering** — pengeringan, penggilingan, penimbangan, gudang

## Fitur

- **Pita status kontrol** — identitas PT. POTENSI BUMI SAKTI, jam WIB langsung, indikator `SISTEM AKTIF`, umur & sumber data
- **Satu shift** — jam shift dapat diatur di Pengaturan (default 07:00–15:00 WIB)
- **Metrik utama** — OEE, Ketersediaan, Kinerja, Kualitas vs target, progres shift
- **Alur Basah → Kering** — 5 tahap proses (tetap); mesin terdaftar di Kamus Alat otomatis tampil di tahapnya
- **Input Shift manual** — catat kejadian berhenti + rekap timbangan (offline, localStorage)
- **Kamus Alat** — daftar mesin per divisi + sumber data (Manual / Semi-otomatis / Realtime)
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
