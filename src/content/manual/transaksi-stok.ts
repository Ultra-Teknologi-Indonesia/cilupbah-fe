export const transaksiStokTabTransfer = `## Tab Transfer di Transaksi Stok

![Tab Transfer (Pindah Bin only)](/bantuan/media/routes/dashboard-transaksi-stok/01-halaman.png "Tab Transfer (Pindah Bin only)")

Menu **Transaksi Stok** menampung seluruh mutasi stok internal gudang. Salah satu tab yang sering menimbulkan kebingungan adalah tab **Transfer**.

### Cakupan Tab Transfer
1. Buka \`/dashboard/transaksi-stok?tab=transfer\`.
2. Tab ini **HANYA** menampilkan Pindah Bin — perpindahan barang antar rak dalam gudang yang sama.
3. Transfer antar gudang **BUKAN** di sini — gunakan menu **Barang Keluar** (\`/dashboard/barang-keluar/transfer\`).

### Kolom yang Ditampilkan
1. \`no_dokumen\` bin transfer.
2. **Gudang**, **Rak Asal**, **Rak Tujuan** (per item bila multi-baris).
3. \`status\` (Baru, Sedang Dijalan, Selesai).
4. **Petugas** pembuat dan pelaksana.

### Cara Mengakses
1. Dari sidebar, klik **Transaksi Stok**.
2. Pilih tab **Transfer** — URL berubah menjadi \`?tab=transfer\`.
3. Klik baris untuk melihat detail item per baris (multi-SKU lintas rak dalam 1 dokumen).

> Peringatan: jangan buat "transfer" antar gudang dari tab ini. Sistem hanya menyediakan bin-to-bin. Kirim antar gudang wajib via Barang Keluar untuk melewati state machine reserve/transit.

> Gotcha: tab default halaman Transaksi Stok bukan Transfer — sesuaikan URL \`?tab=transfer\` atau klik chip tab.`;

export const transaksiStokPenempatan = `## Penempatan Stok (Non-Penerimaan)

![Penempatan](/bantuan/media/routes/dashboard-transaksi-stok/01-halaman.png "Penempatan")

Modul Penempatan pada menu Transaksi Stok digunakan untuk menempatkan stok ke rak di luar alur penerimaan standar (mis. barang temuan, hasil koreksi).

### Kapan Menggunakan
1. Barang fisik ditemukan di gudang tetapi tidak ada dokumen penerimaannya.
2. Hasil koreksi opname yang menambah qty di rak tertentu.
3. Retur internal yang perlu ditempatkan ulang ke rak spesifik.

### Alur Penempatan
1. Buka \`/dashboard/transaksi-stok/penempatan\`.
2. Klik **Buat Penempatan**.
3. Isi **Gudang** target (biasanya WH-KECIL untuk stok jual).
4. Scan atau pilih SKU, isi qty, dan Kode Rak tujuan.
5. Tambahkan baris untuk item berikutnya bila perlu.
6. Klik **Simpan**.

### Catatan Perilaku
1. Kebijakan allow-negative-stock membuat penempatan tidak diblokir bahkan bila membuat stok gudang menjadi ganjil terhadap sumber.
2. Mutasi tercatat sebagai movement bertipe placement (non-purchase).
3. Setelah simpan, stok langsung tersedia untuk picking bila di WH-KECIL.

> Peringatan: gunakan modul ini hemat — mayoritas penempatan seharusnya lewat alur Penerimaan → Putaway agar audit trail rapi.

> Gotcha: penempatan tanpa dokumen sumber sulit ditelusuri saat audit. Selalu isi field **Catatan** dengan alasan singkat.`;

export const transaksiStokPengambilan = `## Pengambilan Stok (Non-Sales)

![Pengambilan](/bantuan/media/routes/dashboard-transaksi-stok/01-halaman.png "Pengambilan")

Pengambilan digunakan untuk mengeluarkan stok dari rak untuk keperluan non-penjualan: sampel promosi, barang rusak, pemakaian internal, hibah.

### Kapan Menggunakan
1. Ambil sampel untuk marketing atau foto produk.
2. Buang barang rusak/expired dari rak.
3. Pakai internal (perlengkapan operasional).
4. Kirim ke event/pameran tanpa proses penjualan.

### Alur Pengambilan
1. Buka \`/dashboard/transaksi-stok\` dan pilih tab **Pengambilan**.
2. Klik **Buat Pengambilan**.
3. Pilih **Gudang** sumber (umumnya WH-KECIL).
4. Scan atau pilih SKU, isi Kode Rak asal dan qty.
5. Pilih **Tujuan Penggunaan** dari dropdown (Sampel/Rusak/Internal/Lain).
6. Isi **Catatan** deskripsi singkat.
7. Klik **Simpan**.

### Perilaku Stok
1. Stok dipotong langsung dari rak asal.
2. Kebijakan allow-negative-stock: sistem tidak memblokir walaupun rak jadi minus (Sales tetap divalidasi).
3. Mutasi tercatat sebagai pengeluaran non-sales — tidak muncul di laporan penjualan.

> Peringatan: Pengambilan tidak menghasilkan invoice atau order. Untuk sampel yang dibayar/dijual, buat pesanan normal.

> Gotcha: pastikan **Tujuan Penggunaan** benar; laporan Riwayat Stok Minus memfilter berdasarkan tipe mutasi ini.`;

export const transaksiStokPenyesuaian = `## Penyesuaian Stok (Stock Opname)

![Penyesuaian (opname / koreksi)](/bantuan/media/routes/dashboard-transaksi-stok/01-halaman.png "Penyesuaian (opname / koreksi)")

Penyesuaian digunakan untuk mengoreksi qty stok berdasarkan hasil opname fisik atau untuk mencatat susut/loss.

### Alur Penyesuaian
1. Buka \`/dashboard/transaksi-stok/penyesuaian\`.
2. Klik **Buat Penyesuaian**.
3. Pilih **Gudang** yang diopname.
4. Untuk setiap item: pilih SKU, isi **Kode Rak** (\`bin_id\` = rak tempat penyesuaian dilakukan, bukan rekomendasi sistem), dan qty aktual hasil opname.
5. Sistem menghitung selisih terhadap qty sistem sebagai adjustment.
6. Isi **Alasan** (Susut/Rusak/Hilang/Opname).
7. Klik **Simpan**.

### Hasil dan Laporan
1. Selisih positif menambah stok; selisih negatif memotong stok.
2. Bin \`bin_id\` yang diinput digunakan sebagai **Kode Rak** di laporan PDF Penyesuaian, bukan sekadar catatan.
3. Laporan **Kode Rak PDF** menampilkan lokasi fisik tempat penyesuaian dilakukan agar auditor mudah memverifikasi.

### Tips Opname
1. Lakukan penyesuaian per rak, bukan agregat. Ini mempermudah audit trail dan pencetakan Kode Rak.
2. Untuk opname masif, gunakan menu **Opname** di \`/dashboard/transaksi-stok/opname\` yang mendukung sesi opname terstruktur.

> Peringatan: kebijakan allow-negative-stock aktif — penyesuaian dapat membuat qty minus. Selalu tinjau laporan **Riwayat Stok Minus** setelah opname.

> Gotcha: field \`bin_id\` di \`stock_adjustment_items\` SELALU merepresentasikan rak fisik tempat opname, bukan usulan sistem.`;

export const transaksiStokTransferBin = `## Transfer Bin (Pindah Rak)

![Transfer Bin (2-langkah)](/bantuan/media/routes/dashboard-transaksi-stok/01-halaman.png "Transfer Bin (2-langkah)")

Pindah Bin adalah perpindahan barang antar rak dalam satu gudang, sekarang menggunakan alur 2-langkah agar aman terhadap barang yang sedang dijalan.

### State 2-Langkah
1. **Baru** — dokumen dibuat, item + rak asal/tujuan didefinisikan. Stok belum berpindah.
2. **Sedang Dijalan** — petugas mulai memindahkan; stok keluar rak asal dan masuk stok transit.
3. **Selesai** — barang tiba di rak tujuan; stok tercatat di rak tujuan.

### Alur Pindah Bin
1. Buka \`/dashboard/transaksi-stok/pindah-bin\`.
2. Klik **Buat Pindah Bin**.
3. Pilih **Gudang**.
4. Tambahkan item per baris: **SKU**, **Rak Asal**, **Rak Tujuan**, **Qty**.
5. 1 dokumen dapat berisi banyak SKU dengan pasangan rak asal-tujuan berbeda (\`bin_transfer_items\`).
6. Simpan sebagai **Baru**.
7. Petugas lapangan tekan **Mulai** → status **Sedang Dijalan**.
8. Setelah barang sampai, tekan **Selesai**.

### Multi-SKU Lintas Rak
1. Setiap baris item memiliki rak asal & tujuan sendiri — tidak harus seragam.
2. Cocok untuk operasi konsolidasi (banyak SKU dari banyak rak → 1 rak tujuan).

> Peringatan: extend model \`BinTransfer\` yang baru — bukan reuse \`InventoryTransfer\` (inventory transfer untuk antar gudang).

> Gotcha: bila dokumen dihapus di status **Sedang Dijalan**, sistem menjalankan revert stok ke rak asal.`;

export const transaksiStokRiwayat = `## Riwayat Mutasi Stok

![Riwayat mutasi stok](/bantuan/media/routes/dashboard-transaksi-stok/01-halaman.png "Riwayat mutasi stok")

Riwayat Mutasi menampilkan seluruh gerakan stok (movement log) di gudang untuk audit dan investigasi selisih.

### Cara Mengakses
1. Buka \`/dashboard/transaksi-stok\` dan pilih tab **Riwayat**.
2. Sistem menampilkan tabel movement dari semua modul (penerimaan, putaway, penjualan, transfer, penyesuaian, pengambilan, reversal).

### Filter yang Tersedia
1. **Periode** — rentang tanggal (default 30 hari terakhir).
2. **SKU** — search via API dengan allowedSearch macro (\`?search=\`).
3. **Tipe Mutasi** — Penerimaan, Putaway, Sales, Transfer, Penyesuaian, Pengambilan, Reversal.
4. **Gudang** dan **Rak** (opsional).

### Kolom Data
1. \`tanggal\`, \`no_referensi\` (link ke dokumen asal).
2. **SKU**, **Nama Produk**.
3. **Rak Asal / Rak Tujuan** (bila relevan).
4. **Qty In / Qty Out** dan **Saldo Akhir**.
5. **Petugas**.

### Export
1. Klik **Export** di kanan atas untuk mengunduh Excel.
2. Filter yang aktif diteruskan ke file export.
3. Cocok untuk investigasi selisih opname atau audit periode tertentu.

> Peringatan: entri **Reversal** (\`*_REVERSAL\`) muncul sebagai catatan koreksi — bukan mutasi baru. Jangan double-hitung.

> Gotcha: mutasi dari sub-lokasi \`SYS-TRANSIT\` tidak dihitung sebagai stok gudang; filter khusus tersedia bila ingin melihatnya.`;
