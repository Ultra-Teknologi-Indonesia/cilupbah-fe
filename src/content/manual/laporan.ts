export const laporanDaftar = `## Daftar Laporan Tersedia

Modul **Laporan** menyediakan tujuh jenis laporan operasional yang menjadi sumber kebenaran untuk audit, akuntansi, dan pengambilan keputusan manajerial.

### Menu laporan

1. Buka menu **Laporan** (\`/dashboard/laporan\`) untuk melihat daftar tile laporan.
2. Klik tile untuk masuk ke halaman detail masing-masing laporan.

### Jenis laporan

- **HPP** (\`/dashboard/laporan/hpp\`) — Harga Pokok Penjualan per SKU/kategori berdasarkan metode moving average.
- **Persediaan** (\`/dashboard/laporan/persediaan\`) — snapshot \`on_hand\`, \`available\`, \`reserved\`, dan nilai stok per lokasi.
- **Retur** (\`/dashboard/laporan/retur\`) — rekap retur channel, alasan, dan status \`dispute_outcome\`.
- **Stok Minus** (\`/dashboard/laporan/stok-minus\`) — sub-menu wajib review harian untuk SKU dengan \`on_hand < 0\`.
- **Penjualan** (\`/dashboard/laporan/penjualan\`) — omzet, margin, dan jumlah order per channel/periode.
- **Pembelian** (\`/dashboard/laporan/pembelian\`) — realisasi PO ke supplier, GR outstanding, dan nilai pembelian.
- **Riwayat Stok** (\`/dashboard/laporan/riwayat-stok\`) — jurnal movement per SKU (in/out/adjust/transfer) sebagai jejak audit.

> Semua laporan mengambil data dari database production real-time. Perbedaan angka dengan dashboard biasanya karena filter periode/lokasi berbeda — cek header laporan.
`;

export const laporanFilterExport = `## Filter & Ekspor Laporan

Setiap laporan menyediakan panel filter yang sama untuk memudahkan Anda menyaring data sebelum mengekspor.

### Langkah menerapkan filter

1. Buka laporan yang diinginkan dari menu **Laporan**.
2. Set **Periode** (rentang tanggal) — default 30 hari terakhir.
3. Pilih **Lokasi** melalui combobox multi-select; kosongkan untuk seluruh gudang.
4. Pilih **Channel** (Shopee/Tokopedia/Lazada/TikTok/WooCommerce/Manual) untuk laporan Penjualan/Retur.
5. Klik **Terapkan** untuk merefresh tabel.

### Ekspor data

1. Klik tombol **Ekspor** di kanan atas laporan.
2. Pilih format: **XLSX** (rekomendasi analisis), **CSV** (integrasi tools lain), atau **PDF** (arsip cetak).
3. Job ekspor berjalan asinkron; notifikasi muncul ketika file siap diunduh.
4. Buka **Aktivitas Impex** (\`/dashboard/aktivitas-impex\`) untuk mengunduh ulang hasil ekspor sebelumnya.

> Ekspor PDF dibatasi 5.000 baris untuk menjaga performa. Untuk data besar gunakan XLSX.

### Shortcut

- \`Ctrl + E\` di halaman laporan untuk membuka dialog ekspor cepat.
`;

export const laporanPasteAi = `## Analisis Laporan dengan AI

Anda dapat menyalin data laporan ke ChatGPT/Claude untuk mendapatkan insight naratif tanpa perlu menulis rumus pivot.

### Langkah paste ke AI

1. Buka laporan (mis. **Penjualan**) dan terapkan filter yang diinginkan.
2. Klik tombol **Copy JSON** di kanan atas tabel — data ter-clipboard dalam format array of object.
3. Buka **ChatGPT** atau **Claude** pada tab browser baru.
4. Paste JSON, lalu ketik prompt analisis di baris berikutnya.
5. AI akan mengembalikan insight naratif; verifikasi angka kritikal terhadap tabel asli.

### Contoh prompt

- "Analisis top 10 SKU dengan margin terkecil dari data ini dan usulkan tindakan."
- "Bandingkan performa channel Shopee vs Tokopedia berdasarkan omzet dan jumlah order."
- "Identifikasi SKU yang penjualannya turun >30% dibanding periode sebelumnya."

### Catatan

> Data laporan berisi informasi harga & margin yang bersifat rahasia. **JANGAN** paste ke AI publik jika perusahaan Anda memberlakukan kebijakan larangan berbagi data internal.

- JSON di-copy sudah bersih dari kolom internal (id, timestamps).
- Untuk analisis rutin, pertimbangkan menyimpan prompt template di **Profil Saya > Preferensi**.
`;
