export const pesananStatus = `## Arti Setiap Status Pesanan

![Arti setiap status pesanan](/bantuan/media/routes/dashboard-pesanan/01-halaman.png "Arti setiap status pesanan")

Setiap pesanan bergerak melalui rangkaian status yang mencerminkan tahap fulfillment. Memahami arti tiap status penting untuk memilih aksi yang benar dan menghindari salah revert.

### Status utama

1. **Baru** — pesanan baru masuk dari channel (webhook Shopee/Lazada/TikTok/WooCommerce) atau input manual. Stok belum dialokasikan; belum boleh diproses gudang.
2. **Siap Diproses** — reservasi stok berhasil (\`available -> reserved\`). Pesanan siap dipindahkan ke antrean Picking.
3. **Picking** — sedang atau selesai diambil dari rak WH-KECIL. Sub-tab: Belum Mulai, Berjalan, Selesai.
4. **Packing** — barang telah diambil dan sedang dikemas, ditimbang, serta diukur untuk kebutuhan resi.
5. **Shipping** — resi tercetak; menunggu pickup kurir atau sudah diserahkan ke kurir.
6. **Delivered** — kurir melaporkan barang telah sampai; menunggu konfirmasi selesai (otomatis atau manual untuk kurir instan).
7. **Selesai** — pesanan tuntas dan diarsipkan. Tidak dapat direvert; koreksi hanya melalui Retur.
8. **Retur** — pembeli mengembalikan barang; menunggu penerimaan di gudang dan restock atau pemusnahan.
9. **Batal** — dibatalkan sebelum Shipping; stok \`reserved\` dikembalikan ke \`available\` otomatis.

### Catatan penting

> Delete manual pada tahap Picking/Packing/Shipping bersifat **revert 1 langkah**, bukan hard-delete. Model tombstone lama sudah dibatalkan.

> Pesanan Shopee yang sudah **Delivered** dapat memicu status **Retur** kembali bila dispute pembeli disetujui.
`;

export const pesananDaftar = `## Daftar Pesanan

![Daftar pesanan: filter, search, sort, kolom](/bantuan/media/routes/dashboard-pesanan/01-halaman.png "Daftar pesanan: filter, search, sort, kolom")

Halaman \`/dashboard/pesanan\` menampilkan seluruh pesanan lintas channel dalam satu tabel terpadu. Gunakan filter dan search untuk mempersempit hasil sebelum bekerja.

### Filter & search

1. **Filter Channel** (dropdown multi-pilih): Shopee, Lazada, TikTok, WooCommerce, Manual, Internal.
2. **Filter Status** mengikuti daftar status pada bagian Arti Status (Baru sampai Batal).
3. **Filter Tanggal** menyediakan preset (Hari Ini, 7 Hari, 30 Hari) dan rentang custom.
4. **Search** memakai query \`?search=\` ke backend Spatie \`allowedSearch\` (No. Pesanan, No. Invoice, Nama Pembeli, No. HP, SKU). Bukan filter\\[search\\].

### Sort & kolom

1. Klik header kolom yang dapat di-sort (No. Pesanan, Tanggal, Total, Status).
2. Buka **Kolom** di kanan toolbar untuk menyembunyikan/menampilkan kolom (mis. \`no_picklist\`, \`picker_name\`, \`shipping_courier\`).
3. Preferensi visibilitas kolom tersimpan di **localStorage** per user per browser, tidak sinkron antar device.

### Pagination

1. Default \`per_page=10\`. Ubah via dropdown kanan bawah (10, 25, 50, 100).
2. URL query \`?page=\` dan \`?per_page=\` dipertahankan saat kembali dari detail — scroll dan pilihan tab ikut terjaga.

> Kolom Picker/Packer hanya terisi setelah pesanan mencapai status Picking Selesai/Packing Selesai. Sebelumnya kolom tampil kosong (\`-\`), bukan "Belum ditugaskan".
`;

export const pesananDetailTimeline = `## Detail Pesanan

![Detail pesanan & panel Alokasi](/bantuan/media/routes/dashboard-pesanan/01-halaman.png "Detail pesanan & panel Alokasi")

Halaman \`/dashboard/pesanan/[id]\` menampilkan seluruh informasi pesanan dalam tiga panel utama plus header ringkas. Semua panel dapat dikonsumsi tanpa scroll horizontal.

### Header info

1. Menampilkan **No. Pesanan**, **No. Invoice**, badge **Channel**, badge **Status**, dan tombol aksi (Cetak Resi, Batalkan, Riwayat).
2. Metadata sekunder: tanggal masuk, kasir/creator, toko internal, dan total pembayaran.

### Panel Alokasi Stok

1. Menampilkan tabel SKU dengan kolom \`sku\`, \`qty_diminta\`, \`qty_teralokasi\`, dan status per baris.
2. Baris berbadge merah **Gagal Alokasi** menandakan stok tidak cukup di WH-KECIL. Klik **Retry Alokasi** setelah stok masuk atau lakukan input Penempatan.
3. Bundle otomatis ter-expand: mutasi mengikuti bundle-cascade di ORDER ITEM level.

### Panel Item

1. Kolom: gambar, nama produk, variasi, SKU, qty, harga satuan, subtotal, diskon per item.
2. Total keranjang, ongkir, diskon global, dan grand total dihitung di footer panel.

### Panel Pengiriman

1. Menampilkan alamat lengkap (nama, HP E.164, provinsi/kota/kecamatan/kode pos, catatan).
2. Menampilkan kurir & layanan, No. Resi, dan status tracking terakhir bila sudah Shipping.
3. Tombol **Ubah Alamat** hanya aktif saat status **Baru**; setelahnya alamat dikunci untuk integritas resi.

> Panel Alokasi Stok wajib bersih (semua baris hijau) sebelum pesanan bisa naik ke Picking.
`;

export const pesananRiwayat = `## Riwayat Pesanan

![Riwayat Pesanan (timeline lifecycle)](/bantuan/media/routes/dashboard-pesanan/01-halaman.png "Riwayat Pesanan (timeline lifecycle)")

Dialog **Riwayat Pesanan** memperlihatkan lifecycle penuh sebuah pesanan dalam bentuk timeline, sehingga Anda dapat menelusuri kapan dan siapa yang mengubah apa.

### Cara membuka

1. Buka detail pesanan di \`/dashboard/pesanan/[id]\`.
2. Klik tombol **Riwayat** di header, atau ikon jam pada baris tabel daftar pesanan.
3. Dialog muncul di sisi kanan (sheet) tanpa meninggalkan konteks halaman.

### Isi timeline

1. Timeline diambil dari tabel \`sales_order_status_histories\` dengan urutan terbaru di atas.
2. Setiap entri menampilkan: waktu (relatif + absolut), aktor (nama user atau **Sistem**/**Webhook**), status lama -> baru, dan catatan.
3. Perubahan field non-status (mis. alamat, kurir, catatan) ditangkap oleh **diff observer** dengan allowlist kolom penting.
4. Setiap diff diringkas per field: \`shipping_courier: JNE -> SICEPAT\`.

### Pagination cursor

1. Timeline memuat 50 entri per fetch (cursor-based), bukan offset.
2. Scroll ke bawah dialog memicu **Muat lebih banyak** otomatis; loader spinner tampil sampai batch berikutnya masuk.
3. Bila sudah tidak ada data, muncul teks **"Awal lifecycle pesanan"** sebagai penanda.

> Timeline bersifat immutable. Anda tidak dapat mengedit atau menghapus entri; koreksi data dilakukan pada pesanan itu sendiri, yang akan menambah entri baru.
`;

export const pesananInputManual = `## Input Pesanan Manual

![Input pesanan manual (offline/POS)](/bantuan/media/routes/dashboard-pesanan/01-halaman.png "Input pesanan manual (offline/POS)")

Fitur input manual dipakai untuk pesanan telepon, walk-in, atau pesanan lintas toko internal yang tidak lewat channel marketplace. Akses via \`/dashboard/pesanan/tambah\`.

### Form Pelanggan

1. Cari pelanggan existing dengan combobox (search backend Spatie); pilih untuk auto-isi alamat & HP.
2. Bila pelanggan baru, klik **Tambah Pelanggan Baru** — form inline meminta nama, HP E.164, email opsional.
3. **Toko Internal** wajib dipilih; menentukan invoice header dan channel report.
4. **Lokasi Alokasi** dikunci ke **WH-KECIL** karena seluruh penjualan wajib dari gudang kecil. Field lain tidak muncul.

### Item Pesanan

1. Tambahkan baris item dengan combobox SKU (search backend). Menampilkan foto, nama, stok on-hand di WH-KECIL.
2. Isi \`qty\`, \`harga_satuan\` (default dari buku harga toko), dan \`diskon\` per baris.
3. Untuk bundle, cukup pilih SKU bundle; komponen otomatis ter-expand pada saat Alokasi Stok.

### Pengiriman & Ongkir

1. Pilih **Metode Pengiriman**: COURIER (default hardcoded), PICKUP, atau INSTANT.
2. Untuk COURIER, isi alamat penerima dengan pin map dan combobox Provinsi/Kota/Kecamatan (API nama, bukan kode).
3. Isi \`ongkir\` manual atau klik **Estimasi** untuk memanggil kurir yang dikonfigurasi.
4. Field \`shipping_coordinate\` terisi otomatis dari pin map dan disimpan untuk kurir instan.

Klik **Simpan** di footer card. Pesanan langsung berstatus **Baru** dan lanjut ke alur alokasi seperti pesanan channel.

> Field ongkir dan harga tidak divalidasi ke tarif kurir. Bertanggung jawablah atas selisih yang mungkin muncul di rekonsiliasi.
`;

export const pesananImportExport = `## Import & Export Pesanan

![Import & export pesanan](/bantuan/media/routes/dashboard-pesanan/01-halaman.png "Import & export pesanan")

Untuk operasi bulk (migrasi awal, penyesuaian massal, laporan eksternal), gunakan menu Import/Export di \`/dashboard/pesanan\` toolbar kanan atas.

### Import pesanan

1. Klik **Import** lalu **Unduh Template XLSX**. Template berisi kolom wajib: \`no_pesanan_external\`, \`tanggal\`, \`channel\`, \`toko_internal\`, \`pelanggan_nama\`, \`hp\`, \`sku\`, \`qty\`, \`harga\`.
2. Isi template — semua kolom mengikuti skema existing, **tidak ada migrasi baru**.
3. Upload file. Sistem menjalankan validasi dry-run dan menampilkan preview baris valid/invalid.
4. Klik **Proses Import**. Antrian job berjalan asinkron; pantau progres di \`/dashboard/aktivitas-impex\`.

### Export pesanan

1. Klik **Export**. Muncul dialog filter periode (wajib), channel (multi), status (multi), dan toko internal.
2. Pilih format: XLSX (default) atau CSV. Kolom mengikuti daftar tabel + kolom detail (alamat, item ringkas).
3. Klik **Buat Export**. File diproses asinkron; tautan unduh muncul di \`/dashboard/aktivitas-impex\` dan notifikasi bell saat selesai.

### Riwayat Impex

1. Menu \`/dashboard/aktivitas-impex\` menyimpan seluruh job import/export 90 hari terakhir.
2. Klik baris untuk melihat detail: rows total, sukses, gagal (dengan alasan per baris), dan file source.
3. Import gagal sebagian tetap menyimpan yang sukses; export selalu utuh atau gagal total.

> Import tidak menciptakan pelanggan atau produk baru. Pastikan master data sudah ada sebelum menjalankan import bulk.
`;

export const pesananBatalkan = `## Batalkan Pesanan

![Membatalkan pesanan](/bantuan/media/routes/dashboard-pesanan/01-halaman.png "Membatalkan pesanan")

Pembatalan memutus lifecycle pesanan dan mengembalikan stok yang telah di-reserve. Aksi ini permanen dan tidak dapat dibatalkan; koreksi lanjutan hanya lewat input pesanan baru.

### Syarat pembatalan

1. Status pesanan **belum mencapai Shipping**. Setelah resi tercetak dan pickup berjalan, pembatalan hanya bisa lewat alur Retur.
2. Anda memiliki izin **pesanan.cancel** (RBAC Spatie). Bila tombol tidak muncul, minta admin memberikan izin.
3. Untuk pesanan channel, sebagian marketplace (Shopee/Lazada) memvalidasi pembatalan ke sisi mereka. Bila ditolak, sistem menampilkan pesan error asli dari API channel.

### Langkah membatalkan

1. Buka detail pesanan di \`/dashboard/pesanan/[id]\`.
2. Klik tombol **Batalkan** di header. Dialog konfirmasi muncul.
3. Pilih **Alasan Pembatalan** dari dropdown (mis. Stok Habis, Permintaan Pembeli, Fraud, Alamat Salah).
4. Isi **Catatan** minimal 10 karakter untuk audit trail.
5. Klik **Ya, Batalkan**. Pesanan langsung berpindah ke status **Batal**.

### Efek pembatalan

1. Stok \`reserved\` dikembalikan ke \`available\` per SKU otomatis.
2. Movement stok tercatat sebagai \`RESERVE_REVERSAL\` di \`inventory_movements\`.
3. Timeline pesanan bertambah entri **"Dibatalkan oleh [User] — Alasan: [teks]"**.
4. Untuk pesanan channel: sinkron status ke marketplace bila API mendukung; bila tidak, ditandai badge **"Cancel Local Only"**.

> Allow-negative-stock berlaku di Penempatan/Pengambilan/Transfer, TIDAK di Sales. Pembatalan tetap wajib bila stok tidak dapat dipenuhi.
`;
