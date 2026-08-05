export const produkTambah = `## Menambah Produk Baru

![Tambah produk (single, varian, bundle)](/bantuan/media/routes/dashboard-produk/01-halaman.png "Tambah produk (single, varian, bundle)")

Modul Produk digunakan untuk mengelola master data barang di Cilupbah SuperApp. Anda dapat membuat produk tunggal, produk dengan varian (ukuran, warna, dll), atau bundle (paket beberapa SKU).

### Langkah Umum
1. Buka menu **Produk** pada path \`/dashboard/produk\`.
2. Klik tombol **Tambah Produk** untuk produk tunggal/varian, atau **Tambah Bundle** untuk paket.
3. Isi field wajib: **Nama Produk**, \`sku\`, **Kategori**, **Merek**, dan **Satuan**.
4. Lengkapi harga jual, harga beli, dan berat/dimensi (untuk kebutuhan ekspedisi).
5. Klik **Simpan** untuk membuat master produk.

### Produk dengan Varian
1. Pada form tambah, aktifkan toggle **Produk memiliki varian**.
2. Definisikan **Attributes** (mis. Warna, Ukuran) beserta nilainya.
3. Sistem otomatis membangkitkan matriks varian; isi \`sku\` unik untuk setiap baris.
4. Setiap varian memiliki record inventory tersendiri di gudang **WH-KECIL**.

### Produk Bundle
1. Buka \`/dashboard/produk/buat-bundle\`.
2. Isi identitas bundle (\`sku\` bundle, nama, harga jual paket).
3. Tambahkan **Komponen Bundle**: pilih SKU varian + qty per bundle.
4. Simpan. Bundle tidak memiliki stok sendiri — stok dihitung dari komponen saat penjualan.

> Peringatan: SKU harus unik lintas seluruh workspace. Jika SKU sudah dipakai, sistem menolak simpan.

Shortcut: gunakan **Import Produk** di \`/dashboard/produk/upload\` untuk unggah massal via Excel.`;

export const produkVarianBundle = `## Perbedaan Produk, Varian, dan Bundle

Cilupbah memisahkan tiga konsep master data dengan perilaku inventory yang berbeda. Memahami perbedaan ini penting agar mapping channel dan hitung stok konsisten.

### Produk (Master)
1. Entitas payung yang berisi metadata (nama dasar, kategori, merek).
2. Tidak memiliki stok langsung; stok selalu melekat pada varian.
3. Digunakan sebagai grup di listing marketplace.

### Varian (SKU + Inventory)
1. Unit terkecil yang dijual dan disimpan di rak.
2. Memiliki \`sku\` unik, stok per bin, dan mapping ke channel.
3. Stok tercatat di tabel \`inventories\` dengan kolom \`bin_id\`. Nilai \`bin_id NULL\` berarti barang sudah diterima tetapi **belum putaway**.
4. Semua penjualan mengalokasikan stok dari **WH-KECIL** saja.

### Bundle
1. Kombinasi beberapa varian dengan qty tetap per komponen.
2. **Tidak memiliki stok sendiri** — ChannelStockResolver menghitung stok bundle secara on-the-fly berdasarkan komponen terkecil, lalu push angka tersebut ke marketplace.
3. Saat pesanan bundle masuk, sistem cascade ke item komponen (\`cascadeBundle\`) untuk mutasi stok di picking/packing.

> Gotcha: jangan tambahkan mapping channel di level Produk. Mapping selalu di level Varian (SKU) atau Bundle.

> Peringatan: mengubah komponen bundle akan langsung mempengaruhi stok yang di-push ke seluruh marketplace pada sinkronisasi berikutnya.`;

export const produkMappingChannel = `## Mapping Produk ke Channel Marketplace

![Mapping SKU ke channel](/bantuan/media/routes/dashboard-produk/01-halaman.png "Mapping SKU ke channel")

Setiap SKU harus dipetakan ke listing di marketplace agar pesanan dari Shopee, Lazada, TikTok, dan WooCommerce dapat diproses otomatis oleh Cilupbah.

### Langkah Mapping
1. Buka menu **Produk** dan pilih varian/bundle yang ingin dipetakan.
2. Masuk ke tab **Channel** pada halaman detail produk.
3. Klik **Tambah Mapping**, lalu pilih **Channel** (Shopee/Lazada/TikTok/WooCommerce) dan **Toko** target.
4. Pilih listing di marketplace pada dropdown **Produk Marketplace** — daftar diambil dari hasil download katalog.
5. Untuk produk berlvarian, mapping dilakukan per SKU varian ke SKU marketplace.
6. Klik **Simpan Mapping**.

### Mapping Bundle
1. Bundle dimapping seperti varian, namun stok yang di-push adalah hasil hitung ChannelStockResolver.
2. Pastikan seluruh komponen bundle memiliki stok cukup di WH-KECIL agar bundle tidak nol.

> Peringatan: satu SKU dapat dimapping ke banyak channel/toko, tapi satu listing marketplace hanya boleh mapping ke satu SKU lokal.

Shortcut: gunakan menu **Naikkan Produk** di \`/dashboard/produk/naikkan\` untuk push produk baru ke channel yang belum memiliki listing.`;

export const produkSyncStokHarga = `## Sinkronisasi Stok & Harga per Toko

![Sync stok & harga per store](/bantuan/media/routes/dashboard-produk/01-halaman.png "Sync stok & harga per store")

Cilupbah menyediakan matriks kontrol sinkronisasi harga & stok per pasangan (SKU × Toko) agar Anda dapat memilih channel mana yang di-push otomatis.

### Cara Mengatur
1. Buka detail produk pada \`/dashboard/produk\` lalu pilih tab **Sinkronisasi**.
2. Sistem menampilkan matriks: baris = varian/SKU, kolom = setiap toko marketplace yang terhubung.
3. Toggle kolom \`sync_enabled\` (aktif/nonaktif) untuk setiap sel matriks.
4. Klik **Simpan** untuk menyimpan konfigurasi mapping ke \`product_variant_channel_mappings\`.

### Cakupan Sinkronisasi
1. Sinkronisasi berjalan di 4 adapter marketplace melalui method \`syncPriceAndStock\`.
2. Jika \`sync_enabled = false\`, adapter melewati SKU tersebut tanpa update — nilai stok/harga di marketplace tetap terakhir kali di-set manual.
3. Bundle mengikuti mapping yang sama; angka stok berasal dari ChannelStockResolver.

> Peringatan: menonaktifkan sync tidak menghapus listing di marketplace. Untuk mencabut listing, lakukan **Unlink** melalui tab **Channel**.

> Gotcha: perubahan harga di dashboard hanya push ke marketplace jika toggle \`sync_enabled\` aktif untuk toko bersangkutan.`;

export const produkDownloadMarketplace = `## Download Produk dari Marketplace

Untuk pesanan yang menyertakan produk baru (belum ada di master), Cilupbah menyediakan mekanisme download katalog dari marketplace.

### Langkah Download
1. Buka \`/dashboard/produk/download\` untuk download katalog per toko.
2. Pilih **Toko** target, lalu klik **Tarik Katalog**.
3. Sistem menyinkronkan listing beserta SKU marketplace ke tabel staging.
4. Setelah selesai, buka tab **Gagal Download** untuk melihat produk yang gagal ter-link otomatis.

### Perilaku per Channel
1. **Lazada**: produk baru masuk otomatis via webhook — biasanya tidak perlu manual download.
2. **TikTok & Shopee**: tidak ada webhook produk baru; pesanan dengan SKU asing akan masuk **Gagal Download**. Jalankan \`downloadOrderItem\` atau download katalog toko terkait.
3. **WooCommerce**: mengikuti pola manual seperti Shopee/TikTok untuk produk baru.

### Tindak Lanjut Gagal Download
1. Di tab **Gagal Download**, klik **Coba Ulang** setelah katalog toko di-refresh.
2. Jika listing memang tidak ada, buatlah produk lokal terlebih dahulu, lalu mapping manual.

> Peringatan: pesanan tidak dapat lanjut ke picking sebelum SKU asing berhasil ter-link ke master produk lokal.`;

export const produkArchiveDelete = `## Arsipkan vs Hapus Produk

Cilupbah membedakan dua aksi penghentian produk. Keduanya bersifat **LOKAL** — tidak menghapus listing di marketplace secara otomatis.

### Arsipkan Produk
1. Buka detail produk, klik menu **Aksi** > **Arsipkan**.
2. Produk berpindah ke \`/dashboard/produk/arsip\`.
3. Data historis (pesanan, mutasi stok, laporan) tetap utuh dan dapat ditelusuri.
4. Produk arsip tidak muncul di listing default dan tidak dapat dijual baru.

### Hapus Produk
1. Buka detail produk, klik **Hapus**.
2. Sistem melakukan **unlink** dari seluruh mapping channel sekaligus.
3. Master produk tetap ada bila masih tereferensi oleh transaksi lama (soft-delete).

### Yang Perlu Dilakukan Manual
1. Untuk menonaktifkan listing di marketplace, buka masing-masing dashboard channel dan **archive/delist** sendiri.
2. Sinkronisasi Cilupbah tidak mengirim perintah delete ke Shopee/Lazada/TikTok/WooCommerce.

> Peringatan: delete/archive di Cilupbah **TIDAK** auto propagate ke marketplace. Anda wajib archive manual di dashboard channel bila memang ingin menutup listing.

> Gotcha: setelah arsip, mapping channel tetap ada tetapi dinonaktifkan. Aktifkan kembali produk sebelum re-mapping.`;
