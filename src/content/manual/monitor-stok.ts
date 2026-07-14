export const monitorStokWatchlist = `## Watchlist Stok Minus

![Watchlist stok minus](/bantuan/media/routes/dashboard-monitor-stok/01-halaman.png "Watchlist stok minus")

Laporan **Stok Minus** memantau seluruh SKU dengan \`on_hand < 0\` sebagai konsekuensi kebijakan allow-negative-stock pada modul Penempatan, Pengambilan, Transfer, dan Penyesuaian.

### Langkah review harian

1. Buka menu **Monitor Stok > Stok Minus** (\`/dashboard/monitor-stok/stok-minus\`).
2. Atur filter **Periode** ke rentang tanggal transaksi yang menyebabkan minus.
3. Atur filter **Lokasi** untuk fokus ke satu gudang; kosongkan untuk semua lokasi.
4. Klik baris untuk melihat **Riwayat Movement** SKU tersebut dan menelusuri sumber selisih.
5. Setelah root cause ditemukan, buat **Penyesuaian Stok** dari halaman terkait untuk mengoreksi angka.

### Tanggung jawab

> Manager Gudang **WAJIB** mereview laporan ini setiap hari kerja. Stok minus yang dibiarkan lebih dari 3 hari akan tampil sebagai insiden di dashboard eksekutif.

- Sales tetap tidak diperbolehkan melewatkan validasi stok; minus hanya bisa muncul dari operasi internal.
- Kolom \`Umur (hari)\` menghitung berapa lama SKU tersebut minus tanpa koreksi.
- Ekspor ke XLSX tersedia via tombol **Ekspor** untuk kebutuhan audit.

### Shortcut

- \`Shift + T\` untuk toggle filter hanya SKU dengan umur ≥ 3 hari.
`;

export const monitorStokReorderPoint = `## Reorder Point Alert

![Reorder point alert](/bantuan/media/routes/dashboard-monitor-stok/01-halaman.png "Reorder point alert")

Modul **Reorder Point** memberi peringatan otomatis ketika stok suatu SKU turun di bawah ambang batas yang Anda tetapkan agar tim purchasing dapat segera membuat PO.

### Langkah setup threshold

1. Buka menu **Monitor Stok > Reorder Point** (\`/dashboard/monitor-stok/reorder-point\`).
2. Klik tombol **Tambah SKU** atau **Impor XLSX** untuk memasukkan daftar SKU yang dipantau.
3. Isi kolom \`reorder_point\` (angka minimum \`available\` yang masih aman) dan \`reorder_qty\` (usulan qty PO).
4. Pilih **Lokasi** yang menjadi acuan; biarkan **Semua Lokasi** untuk agregat.
5. Klik **Simpan** untuk mengaktifkan pemantauan.

### Cara kerja notifikasi

- Sistem mengevaluasi ulang setiap SKU pada setiap perubahan movement stok.
- Ketika \`available <= reorder_point\`, notifikasi otomatis muncul di bell dan channel Slack (jika terkonfigurasi).
- Status **Below** berwarna merah, **Near** berwarna kuning bila \`available <= reorder_point * 1.2\`.

### Catatan

> Threshold berlaku per SKU per lokasi. Jangan set nilai terlalu rendah untuk SKU fast-moving karena lead time PO bisa lebih panjang dari yang diperkirakan.

- SKU nonaktif otomatis dilewati.
- Riwayat trigger tersimpan 90 hari untuk kebutuhan analisa forecasting.
`;
