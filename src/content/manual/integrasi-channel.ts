export const integrasiKoneksi = `## Ringkasan Koneksi Channel

![Ringkasan koneksi channel](/bantuan/media/routes/dashboard-integrasi-channel/01-halaman.png "Ringkasan koneksi channel")

Modul Integrasi Channel menghubungkan Cilupbah dengan marketplace: **Shopee**, **Lazada**, **TikTok Shop**, dan **WooCommerce**. Setiap toko yang terhubung memiliki token akses tersendiri dan indikator status sinkronisasi.

### Langkah Umum
1. Buka menu **Integrasi Channel** pada path \`/dashboard/integrasi-channel\`.
2. Pilih tab channel yang diinginkan (Shopee/Lazada/TikTok/WooCommerce).
3. Klik **Tambah Toko** untuk memulai proses koneksi baru.
4. Ikuti flow autentikasi sesuai channel (OAuth atau Basic Auth).
5. Setelah tersambung, toko muncul di daftar dengan badge status **Aktif**.

### Indikator Status
1. Kolom **Status Token** memakai \`StatusBadge\`: hijau (aktif), kuning (mendekati expired), merah (expired/gagal).
2. Kolom **Sync Terakhir** menampilkan waktu sinkronisasi terakhir (produk/pesanan/stok).
3. Ikon lonceng di header muncul jika ada toko dengan token gagal refresh.

> Peringatan: satu \`consumer_key\` atau \`access_token\` hanya boleh dipakai satu toko di workspace. Duplikasi akan ditolak sistem.

Shortcut: gunakan tombol **Uji Koneksi** pada baris toko untuk memverifikasi token tanpa menunggu jadwal sync.`;

export const integrasiShopee = `## Menghubungkan Shopee

![Connect Shopee (OAuth)](/bantuan/media/routes/dashboard-integrasi-channel/01-halaman.png "Connect Shopee (OAuth)")

Koneksi Shopee memakai **OAuth 2.0** via Shopee Open Platform. Token disimpan terenkripsi di kolom \`access_token\`/\`refresh_token\` dan diperbarui otomatis oleh scheduler.

### Langkah Connect
1. Buka \`/dashboard/integrasi-channel\`, pilih tab **Shopee**.
2. Klik **Tambah Toko Shopee**.
3. Anda diarahkan ke halaman login **Seller Center Shopee** di tab baru.
4. Login memakai akun penjual, lalu klik **Izinkan Aplikasi** pada layar konfirmasi.
5. Shopee melakukan callback ke Cilupbah dengan \`code\` OAuth; sistem menukar \`code\` menjadi \`access_token\` (encrypted).
6. Toko baru muncul di daftar dengan status **Aktif** dan \`shop_id\` terisi.

### Konfigurasi Awal
1. Set **Nama Toko Internal** untuk mempermudah identifikasi.
2. Pilih **Gudang Sumber Stok** (default WH-KECIL) via dropdown.
3. Aktifkan toggle sinkronisasi yang diperlukan (stok, harga, produk, pesanan).

> Peringatan: Shopee membatasi 1 akun Cilupbah = 1 sesi OAuth aktif. Membuka Seller Center di banyak tab dapat menyebabkan token lama tercabut.

Shortcut: klik **Download Produk** setelah koneksi berhasil untuk menarik katalog awal sebelum mapping SKU.`;

export const integrasiLazada = `## Menghubungkan Lazada

![Connect Lazada (state 10 menit)](/bantuan/media/routes/dashboard-integrasi-channel/01-halaman.png "Connect Lazada (state 10 menit)")

Lazada memakai **OAuth 2.0** dengan **host autentikasi khusus** yang berbeda dari host API. Salah host = error \`Missing parameter\`.

### Langkah Connect
1. **WAJIB**: login terlebih dahulu ke **Seller Center Lazada** di tab baru sebelum menekan tombol connect. Tanpa sesi aktif, redirect akan gagal.
2. Buka \`/dashboard/integrasi-channel\`, pilih tab **Lazada**.
3. Klik **Tambah Toko Lazada**.
4. Sistem redirect ke \`auth.lazada.com\` (**BUKAN** \`api.lazada.co.id\` — host API tidak menerima parameter OAuth dan akan melempar \`Missing parameter\`).
5. Login/konfirmasi, lalu Lazada callback ke Cilupbah dengan \`code\`.
6. Token disimpan encrypted; toko muncul di daftar.

### State & Timeout
1. Parameter \`state\` memiliki **TTL 10 menit** dan **sekali pakai** (one-time). Melebihi batas → error \`invalid_state\`.
2. Jika di bawah 1 detik dan \`state\` sudah dipakai, sistem menolak duplikasi callback.
3. Ulangi dari langkah 1 jika mendapat \`invalid_state\`.

> Peringatan: jangan menyalin URL callback antar-browser. \`state\` terikat sesi asal.

Shortcut: tombol **Refresh Token** di baris toko memicu refresh manual jika notifikasi bell menandai kegagalan auto-refresh.`;

export const integrasiTikTok = `## Menghubungkan TikTok Shop

![Connect TikTok Shop](/bantuan/media/routes/dashboard-integrasi-channel/01-halaman.png "Connect TikTok Shop")

TikTok Shop memakai **OAuth 2.0** dengan tambahan langkah sinkronisasi atribut per kategori sebelum produk dapat di-push.

### Langkah Connect
1. Buka \`/dashboard/integrasi-channel\`, pilih tab **TikTok Shop**.
2. Klik **Tambah Toko TikTok**.
3. Login ke **TikTok Seller Center** dan setujui izin aplikasi.
4. Callback menyimpan \`access_token\` + \`shop_id\` (encrypted).
5. Toko muncul di daftar dengan status **Aktif**.

### Sinkronisasi Atribut Kategori
1. TikTok mewajibkan setiap kategori memiliki atribut wajib (brand, warranty, dsb) sebelum listing bisa dibuat.
2. Jalankan CLI di server: \`php artisan tiktok:sync-attributes {shop_id}\`.
3. Hasil sync tersimpan di tabel atribut TikTok dan menjadi opsi form saat mapping.
4. **Mapping kategori WAJIB** — tanpa mapping kategori TikTok ke kategori lokal, push produk akan ditolak.

### Mapping Kategori
1. Buka detail toko TikTok, tab **Kategori**.
2. Klik **Tambah Mapping**, pilih kategori lokal + kategori TikTok.
3. Simpan.

> Peringatan: jalankan \`tiktok:sync-attributes\` setiap kali TikTok mengubah struktur kategori (biasanya diumumkan lewat email Seller Center).

Shortcut: gunakan filter **Belum Dimapping** pada tab Kategori untuk mengidentifikasi kategori yang menghalangi push produk massal.`;

export const integrasiWooCommerce = `## Menghubungkan WooCommerce

![Connect WooCommerce (Basic Auth)](/bantuan/media/routes/dashboard-integrasi-channel/01-halaman.png "Connect WooCommerce (Basic Auth)")

WooCommerce memakai **Basic Auth** per-toko (bukan OAuth). Anda perlu \`store_url\`, \`consumer_key\`, dan \`consumer_secret\` yang di-generate dari admin WordPress toko.

### Persiapan di WordPress
1. Login ke admin WordPress toko.
2. Buka **WooCommerce → Settings → Advanced → REST API**.
3. Klik **Add Key**, isi deskripsi, pilih user, permission **Read/Write**.
4. Salin \`consumer_key\` dan \`consumer_secret\` yang muncul (hanya sekali muncul).

### Langkah Connect di Cilupbah
1. Buka \`/dashboard/integrasi-channel\`, pilih tab **WooCommerce**.
2. Klik **Tambah Toko WooCommerce**.
3. Isi field: \`store_url\` (mis. \`https://toko.example.com\`), \`consumer_key\`, \`consumer_secret\`.
4. Klik **Uji Koneksi** untuk validasi kredensial (Cilupbah memanggil endpoint \`/wp-json/wc/v3/system_status\`).
5. Klik **Simpan**. Kredensial disimpan terenkripsi.

### Webhook Topic yang Didukung
1. \`coupon\` — sinkronisasi kupon (create/update/delete).
2. \`customer\` — sinkronisasi pelanggan.
3. \`order\` — pesanan masuk/perubahan status.
4. \`product\` — perubahan katalog produk.

> Peringatan: **TIDAK ADA topic \`refund\`** di integrasi WC Cilupbah. Refund/retur diproses lewat \`order.updated\` dengan status \`refunded\` (di-handle otomatis via \`detectAndHandleRefunds()\`).

> Peringatan: gunakan HTTPS. Basic Auth di HTTP polos akan ditolak WooCommerce.

Shortcut: tombol **Regenerate Webhook** membuat ulang endpoint webhook di WordPress jika \`webhook_secret\` bocor.`;

export const integrasiRefreshToken = `## Refresh Token & Notifikasi Expired

![Refresh token yang expired](/bantuan/media/routes/dashboard-integrasi-channel/01-halaman.png "Refresh token yang expired")

Setiap channel OAuth (Shopee/Lazada/TikTok) memiliki \`access_token\` dengan masa berlaku terbatas. Cilupbah otomatis me-refresh menggunakan \`refresh_token\`, tetapi ada kondisi yang butuh intervensi manual.

### Refresh Otomatis
1. Scheduler memeriksa token 24 jam sebelum expired.
2. Jika refresh sukses, \`access_token\` diperbarui tanpa notifikasi.
3. Jika \`refresh_token\` juga expired atau ditolak, sistem menandai toko sebagai **Perlu Reconnect** dan menampilkan notifikasi di ikon lonceng.

### Refresh Manual
1. Buka \`/dashboard/integrasi-channel\` dan cari baris toko dengan badge merah/kuning.
2. Klik **Refresh Token** untuk mencoba ulang.
3. Jika gagal, klik **Reconnect** untuk mengulangi flow OAuth dari awal.

### Notifikasi
1. Ikon lonceng di header menampilkan angka jumlah toko dengan token bermasalah.
2. Toast \`"Gagal refresh token {channel}"\` muncul setelah percobaan otomatis gagal.
3. Notifikasi tersimpan di \`/dashboard/notifikasi\` untuk audit.

> Peringatan: reconnect memakai flow OAuth yang sama; pastikan Seller Center sudah login (khusus Lazada).

Shortcut: filter **Status: Perlu Reconnect** pada daftar toko untuk menampilkan hanya toko yang butuh aksi.`;

export const integrasiToggleSync = `## Toggle Sinkronisasi per Fitur & per Toko

![Toggle sync per fitur](/bantuan/media/routes/dashboard-integrasi-channel/01-halaman.png "Toggle sync per fitur")

Cilupbah memisahkan sinkronisasi berdasarkan fitur (stok, harga, pesanan, produk) sehingga Anda dapat mengaktifkan hanya sebagian sync per toko.

### Cara Mengatur
1. Buka \`/dashboard/integrasi-channel\` dan klik nama toko untuk masuk ke detail.
2. Buka tab **Pengaturan Sinkronisasi**.
3. Sistem menampilkan empat toggle utama:
   - **Sync Stok**: push stok Cilupbah ke marketplace secara real-time.
   - **Sync Harga**: push harga jual sesuai daftar harga aktif.
   - **Sync Pesanan**: tarik pesanan baru + update status.
   - **Sync Produk**: tarik/push katalog produk.
4. Toggle sesuai kebutuhan lalu klik **Simpan**.

### Sync per SKU × Toko
1. Untuk kontrol lebih granular, buka detail produk → tab **Sinkronisasi**.
2. Matriks SKU × Toko dengan kolom \`sync_enabled\` per sel.
3. Aktifkan hanya untuk SKU yang ingin di-push ke toko tertentu.

### Efek Nonaktif
1. Sync Stok OFF → stok di marketplace tidak diperbarui otomatis (risiko oversell/understock).
2. Sync Harga OFF → perubahan harga di Cilupbah tidak diteruskan.
3. Sync Pesanan OFF → pesanan baru tidak masuk (hanya untuk kasus troubleshoot).

> Peringatan: mematikan Sync Stok pada toko produksi hanya disarankan saat maintenance. Nyalakan kembali agar mencegah oversell.

Shortcut: gunakan **Aktifkan Semua** / **Nonaktifkan Semua** di header matriks untuk toggle massal.`;
