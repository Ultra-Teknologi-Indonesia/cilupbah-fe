import type { FaqItem, FaqCategory } from "./types";

export const FAQ_CATEGORIES: { key: FaqCategory; label: string }[] = [
  { key: "umum", label: "Akun & Umum" },
  { key: "pesanan", label: "Pesanan" },
  { key: "picking-packing-shipping", label: "Picking, Packing, Shipping" },
  { key: "produk", label: "Produk & Bundle" },
  { key: "stok-gudang", label: "Stok, Gudang, Rak" },
  { key: "integrasi-channel", label: "Integrasi Channel" },
  { key: "retur", label: "Retur & Klaim" },
  { key: "pembelian", label: "Pembelian & Pemasok" },
  { key: "laporan", label: "Laporan & Analitik" },
  { key: "pengaturan", label: "Pengaturan" },
  { key: "troubleshooting", label: "Troubleshooting" },
];

export const FAQ_ITEMS: FaqItem[] = [

  {
    id: "umum-01",
    category: "umum",
    question: "Bagaimana cara login pertama kali dan reset password?",
    answer:
      "Login memakai email dan password yang dibagikan Admin. Jika lupa, buka halaman **Login → Lupa Password**, masukkan email, dan tautan reset akan dikirim. Password baru minimal 8 karakter (huruf besar, kecil, angka).",
    tags: ["login", "password"],
    relatedManualSlug: "onboarding/login-aktivasi",
  },
  {
    id: "umum-02",
    category: "umum",
    question: "Kenapa saya di-logout otomatis?",
    answer:
      "Token sesi kedaluwarsa (biasanya setelah beberapa jam idle atau ketika Admin melakukan reset). Sistem akan otomatis mengarahkan ke `/login`. Login ulang dan aktivitas dilanjutkan dari halaman yang sama.",
    tags: ["logout", "sesi", "401"],
  },
  {
    id: "umum-03",
    category: "umum",
    question: "Bagaimana cara ganti foto profil, nomor HP, dan email?",
    answer:
      "Buka **Profil Saya** (klik avatar kanan atas → *Profil Saya*), tab **Profil**. Foto: klik avatar → pilih file (maks 2 MB, JPG/PNG). HP dan email: ubah lalu **Simpan**. Perubahan email akan meminta verifikasi ulang.",
    relatedManualSlug: "profil-saya/tab-profil",
  },
  {
    id: "umum-04",
    category: "umum",
    question: "Apa beda peran Owner, Admin, Manager, Gudang, Kasir, dan Finance?",
    answer:
      "Peran menentukan modul yang bisa diakses. **Owner** = seluruh akses termasuk hapus. **Admin** = seluruh akses kecuali beberapa aksi sensitif. **Manager** = laporan + persetujuan. **Gudang** = penerimaan, penempatan, picking, packing. **Kasir** = pesanan manual + pembayaran. **Finance** = keuangan + retur + laporan. Detail lengkap ada di *Pengaturan → Peran / RBAC*.",
    relatedManualSlug: "pengaturan/rbac",
  },
  {
    id: "umum-05",
    category: "umum",
    question: "Bagaimana cara mengundang pengguna baru?",
    answer:
      "Buka **Pengaturan → Pengguna → Tambah Pengguna**. Isi nama, email, HP, pilih peran. Sistem mengirim email undangan dengan tautan aktivasi (berlaku 7 hari). Pengguna set password sendiri saat aktivasi.",
    relatedManualSlug: "pengaturan/pengguna",
  },
  {
    id: "umum-06",
    category: "umum",
    question: "Bagaimana mengaktifkan 2FA (autentikasi dua langkah)?",
    answer:
      "Profil Saya → tab **Keamanan** → aktifkan **Autentikasi Dua Langkah**. Scan QR code dengan Google Authenticator / Authy, masukkan 6 digit kode untuk verifikasi. Simpan *recovery codes* di tempat aman.",
    relatedManualSlug: "profil-saya/keamanan",
  },
  {
    id: "umum-07",
    category: "umum",
    question: "Bagaimana melihat perangkat yang sedang login dan logout paksa perangkat lain?",
    answer:
      "Profil Saya → tab **Sesi & Riwayat**. Daftar sesi aktif menunjukkan perangkat, browser, IP, dan waktu terakhir. Klik **Logout** di baris tertentu untuk mengakhiri sesi di perangkat itu.",
    relatedManualSlug: "profil-saya/sesi-riwayat",
  },

  {
    id: "pesanan-01",
    category: "pesanan",
    question: "Apa arti setiap status pesanan?",
    answer:
      "- **Baru**: pesanan masuk, belum dialokasi\n- **Siap Diproses**: stok tersedia, siap picking\n- **Picking**: sedang pengambilan barang di gudang\n- **Packing**: sudah picking, sedang dikemas\n- **Shipping**: label/resi sudah dicetak, menunggu pickup kurir\n- **Terkirim (Delivered)**: paket sampai ke pembeli\n- **Selesai**: siklus tuntas, siap arsip\n- **Retur**: pembeli mengembalikan\n- **Batal**: pesanan dibatalkan sebelum shipping",
    relatedManualSlug: "pesanan/status-pesanan",
  },
  {
    id: "pesanan-02",
    category: "pesanan",
    question: "Kenapa pesanan tidak masuk ke Siap Diproses?",
    answer:
      "Penyebab umum: (1) stok gudang kecil tidak cukup untuk salah satu SKU, (2) SKU belum di-mapping ke channel, (3) bundle tidak lengkap komponennya, (4) reservasi gagal karena sudah dipesan pesanan lain. Buka detail pesanan → panel **Alokasi Stok** untuk melihat SKU yang gagal.",
    relatedManualSlug: "proses-pesanan/alokasi-stok",
  },
  {
    id: "pesanan-03",
    category: "pesanan",
    question: "Bagaimana input pesanan manual (POS/offline)?",
    answer:
      "**Pesanan → Tambah Pesanan (Manual)**. Isi: Pelanggan, Toko Internal, Lokasi (wajib WH-KECIL), item SKU + qty + harga, metode pengiriman, ongkir. Klik **Simpan** untuk buat pesanan dengan status *Siap Diproses* (jika stok cukup).",
    relatedManualSlug: "pesanan/input-manual",
  },
  {
    id: "pesanan-04",
    category: "pesanan",
    question: "Bagaimana membatalkan pesanan dan efeknya ke stok?",
    answer:
      "Buka detail pesanan → tombol **Batalkan**. Isi alasan. Stok reserved otomatis kembali ke available. Pesanan yang sudah *Shipping* tidak bisa dibatalkan — harus retur.",
  },
  {
    id: "pesanan-05",
    category: "pesanan",
    question: "Di mana melihat riwayat/timeline pesanan?",
    answer:
      "Detail pesanan → tombol **Riwayat Pesanan** (ikon jam). Menampilkan urutan status: dibuat, dialokasi, dipilih untuk picking, packing, cetak resi, pickup kurir, terkirim, dst — lengkap dengan waktu dan pelaku.",
    relatedManualSlug: "pesanan/riwayat-pesanan",
  },
  {
    id: "pesanan-06",
    category: "pesanan",
    question: "Bagaimana import/export pesanan?",
    answer:
      "**Pesanan → tombol Import / Export**. Import: unggah XLSX sesuai template (unduh template dari halaman yang sama). Export: pilih filter tanggal/channel/status, klik **Export** → file XLSX diunduh. Riwayat proses di *Aktivitas Impex*.",
    relatedManualSlug: "pesanan/import-export",
  },
  {
    id: "pesanan-07",
    category: "pesanan",
    question: "Kenapa pesanan Shopee/Lazada/TikTok/WooCommerce tidak masuk otomatis?",
    answer:
      "Umumnya: (1) token kedaluwarsa — buka *Integrasi Channel*, refresh token. (2) Webhook tidak aktif — cek status webhook di detail toko. (3) Toko dinonaktifkan. (4) Untuk WC: pastikan Basic Auth (consumer key/secret) benar dan URL toko dapat diakses publik.",
    relatedManualSlug: "integrasi-channel/koneksi",
  },

  {
    id: "pps-01",
    category: "picking-packing-shipping",
    question: "Bagaimana cara scan SKU?",
    answer:
      "Halaman Picking/Packing/Putaway menyediakan **ScanAutoflowBar**. Scan barcode SKU → qty otomatis +1 tanpa popup. Scan sekali untuk 1 unit. Combobox manual tersedia untuk input tanpa scanner. Auto-advance ke SKU berikutnya setelah scan lengkap.",
    relatedManualSlug: "proses-pesanan/scan-autoflow",
  },
  {
    id: "pps-02",
    category: "picking-packing-shipping",
    question: "Kenapa hasil scan tidak menambah qty?",
    answer:
      "Kemungkinan: (1) SKU tidak match dengan pesanan aktif, (2) rak sumber salah, (3) qty pesanan sudah terpenuhi, (4) SKU sudah di-scan penuh — cek indikator *Selesai* per baris. Cek log toast merah untuk pesan detail.",
  },
  {
    id: "pps-03",
    category: "picking-packing-shipping",
    question: "Bagaimana koreksi salah scan?",
    answer:
      "Buka baris item → tombol **Reversal** (bukan hapus). Sistem mencatat *movement REVERSAL* untuk audit. Hard-delete tidak diizinkan agar jejak stok tetap konsisten.",
  },
  {
    id: "pps-04",
    category: "picking-packing-shipping",
    question: "Bagaimana packing multi-order dalam 1 sesi?",
    answer:
      "**Packing → Belum Mulai** → ceklis beberapa pesanan → **Mulai Packing (Sesi)**. Scan SKU secara berurutan; sistem otomatis mendistribusikan qty ke pesanan sesuai kebutuhan. Selesai sesi = semua pesanan pindah ke *Shipping*.",
    relatedManualSlug: "proses-pesanan/packing",
  },
  {
    id: "pps-05",
    category: "picking-packing-shipping",
    question: "Bagaimana cetak resi 1 pesanan vs bulk?",
    answer:
      "Per-1: detail pesanan → **Cetak Resi**. Bulk: **Shipping → Belum Cetak** → ceklis pesanan → **Cetak Resi (Bulk)** → PDF gabungan diunduh. Rate-limit 5 request/menit. Tidak ada batas jumlah per request.",
    relatedManualSlug: "proses-pesanan/shipping",
  },
  {
    id: "pps-06",
    category: "picking-packing-shipping",
    question: "Kenapa cetak resi Lazada/WooCommerce di-grey-out?",
    answer:
      "Kedua channel belum mendukung cetak resi otomatis via Cilupbah. Cetak manual di dashboard channel masing-masing, lalu upload nomor resi via **Edit Pesanan → Nomor Resi**.",
  },
  {
    id: "pps-07",
    category: "picking-packing-shipping",
    question: "Bagaimana upload bukti pickup kurir?",
    answer:
      "**Shipping → detail pesanan → Bukti Pickup**. Isi kode pickup (upsert existing-wins), nama & telepon petugas (teks bebas — sengaja), unggah foto (multi-file via Spatie Media). Simpan.",
    relatedManualSlug: "proses-pesanan/bukti-pickup",
  },
  {
    id: "pps-08",
    category: "picking-packing-shipping",
    question: "Kapan menggunakan kurir instan (Grab/Gojek) manual?",
    answer:
      "Untuk pengiriman lokal same-day yang bukan lewat channel marketplace. Di Shipping, pilih **Kurir: Instan (Manual)**, isi nama driver, nomor kendaraan, biaya. Status *Terkirim* di-set manual setelah driver konfirmasi.",
    relatedManualSlug: "proses-pesanan/kurir-instan",
  },
  {
    id: "pps-09",
    category: "picking-packing-shipping",
    question: "Bagaimana mengubah status ke Terkirim manual?",
    answer:
      "Untuk kurir instan / offline: **Shipping → detail pesanan → Terkirim** → isi waktu terima + penerima. Untuk channel MP: status auto sinkron dari webhook tracking.",
  },

  {
    id: "produk-01",
    category: "produk",
    question: "Apa beda Produk, Varian, dan Bundle?",
    answer:
      "**Produk** = master (nama, kategori, merek). **Varian** = SKU unik (ukuran/warna/dsb) — inventory dilacak di level varian. **Bundle** = paket beberapa varian dijual sebagai 1 SKU; stok bundle di-*compute* dari komponennya (min qty tersedia), tidak punya stok sendiri.",
    relatedManualSlug: "produk/varian-bundle",
  },
  {
    id: "produk-02",
    category: "produk",
    question: "Kenapa stok bundle nol walau komponen ada?",
    answer:
      "Bundle butuh **semua komponen** tersedia di WH-KECIL. Cek: (1) setiap komponen punya stok ≥ qty ratio bundle, (2) tidak ada komponen ter-arsip / delete. Buka detail bundle → panel *Ketersediaan* untuk melihat komponen mana yang membatasi.",
  },
  {
    id: "produk-03",
    category: "produk",
    question: "Bagaimana mapping SKU ke channel marketplace?",
    answer:
      "**Produk → detail varian → tab Channel**. Pilih toko → pilih listing dari channel → **Simpan Mapping**. Setelah mapping, stok & harga (jika sync enabled) akan otomatis di-push.",
    relatedManualSlug: "produk/mapping-channel",
  },
  {
    id: "produk-04",
    category: "produk",
    question: "Bagaimana aktifkan/non-aktifkan sync stok & harga per store?",
    answer:
      "**Produk → detail varian → tab Channel → matriks Sync**. Toggle *sync_enabled* per (SKU × toko). Nonaktifkan untuk toko yang harganya diatur promo manual.",
    relatedManualSlug: "produk/sync-stok-harga",
  },
  {
    id: "produk-05",
    category: "produk",
    question: "Bagaimana download produk baru dari marketplace?",
    answer:
      "**Integrasi Channel → toko → tab Gagal Download / Produk Baru**. Klik **Download Sekarang** untuk pull manual. TikTok & Shopee butuh manual (tidak ada webhook produk-baru); Lazada auto via webhook.",
  },
  {
    id: "produk-06",
    category: "produk",
    question: "Apa beda Delete vs Archive produk?",
    answer:
      "**Archive** = tidak muncul di daftar aktif tapi data historis (pesanan lama, stok movement) tetap. **Delete** = putus link ke channel + soft-delete lokal. **Keduanya TIDAK propagate** ke marketplace — hapus di dashboard MP masing-masing.",
  },
  {
    id: "produk-07",
    category: "produk",
    question: "Kenapa master kurir hanya 141 nama tertentu?",
    answer:
      "Master kurir persis mengikuti daftar kurir kanonik (canonicalNames). Tidak boleh custom karena berdampak ke label & tracking. Kurir tidak terpakai di-*deactivate*, bukan dihapus.",
  },

  {
    id: "stok-01",
    category: "stok-gudang",
    question: "Apa arti On Hand, Available, Sellable, Pickable, Reserved?",
    answer:
      "- **On Hand**: total fisik stok DITEMPATKAN di rak (tidak termasuk inbound pending / transit)\n- **Reserved**: dialokasi untuk pesanan aktif\n- **Available**: `on_hand − reserved` (bisa dialokasi)\n- **Sellable**: yang boleh dipush ke channel sebagai stok jual\n- **Pickable**: yang boleh dipilih di picking (biasanya = available - safety stock)",
  },
  {
    id: "stok-02",
    category: "stok-gudang",
    question: "Kenapa on hand lebih besar dari available?",
    answer:
      "Selisih = reserved (dialokasi ke pesanan aktif). Cek: *Posisi Stok → detail SKU → panel Reserved by Order*.",
  },
  {
    id: "stok-03",
    category: "stok-gudang",
    question: "Bagaimana alur penerimaan barang dari PO / Transfer Masuk?",
    answer:
      "**Barang Masuk → Penerimaan → filter Sumber (PO / Transfer)**. Buka baris → *Terima* (scan/manual qty). Setelah semua qty diterima, item pindah ke **Bin Inbound** (belum masuk on_hand). Lanjut ke **Penempatan (Putaway)** untuk scan ke rak final.",
    relatedManualSlug: "barang-masuk/penerimaan",
  },
  {
    id: "stok-04",
    category: "stok-gudang",
    question: "Bagaimana scan penempatan (putaway) dan assign rak?",
    answer:
      "**Barang Masuk → Penempatan → ceklis penerimaan → Mulai Putaway**. Scan SKU → scan barcode rak → qty. Sistem update *bin_id* di tabel inventories. Setelah semua qty di-putaway, on_hand naik.",
    relatedManualSlug: "barang-masuk/putaway",
  },
  {
    id: "stok-05",
    category: "stok-gudang",
    question: "Apa beda Penempatan, Pengambilan, Penyesuaian, Transfer Bin?",
    answer:
      "- **Penempatan** = putaway ke rak (dari inbound)\n- **Pengambilan** = keluarkan dari rak (bukan sales, misal sampel)\n- **Penyesuaian** = koreksi qty (stock opname, kerusakan)\n- **Transfer Bin** = pindah antar rak dalam 1 gudang",
  },
  {
    id: "stok-06",
    category: "stok-gudang",
    question: "Bagaimana transfer stok antar gudang?",
    answer:
      "**Barang Keluar → Transfer Keluar Manual → Buat**. Pilih asal & tujuan, tambah item + qty. State machine: *Draft → Approved → In Transit (cetak Surat Jalan) → Received (di gudang tujuan)*. Draft/Approved: hold reserve+transit; Delete In-Transit = revert.",
    relatedManualSlug: "barang-keluar/transfer-antar-gudang",
  },
  {
    id: "stok-07",
    category: "stok-gudang",
    question: "Bagaimana transfer bin dalam 1 gudang?",
    answer:
      "**Transaksi Stok → tab Transfer (Pindah Bin) → Buat**. 2-langkah: *Baru → Sedang Dijalan → Selesai*. Per baris: rak asal, rak tujuan, SKU, qty. 1 dokumen bisa multi-SKU lintas rak.",
    relatedManualSlug: "transaksi-stok/transfer-bin",
  },
  {
    id: "stok-08",
    category: "stok-gudang",
    question: "Kenapa saya bisa input stok negatif?",
    answer:
      "Kebijakan *allow-negative-stock*: Penempatan, Pengambilan, Transfer Bin, Penyesuaian TIDAK memvalidasi kapasitas. Sales tetap divalidasi. Laporan **Stok Minus** wajib direview.",
  },
  {
    id: "stok-09",
    category: "stok-gudang",
    question: "Di mana laporan Stok Minus?",
    answer:
      "**Laporan → Stok Minus**. Menampilkan SKU dengan on_hand < 0. Filter periode dan lokasi. Wajib direview harian oleh Manager gudang.",
  },
  {
    id: "stok-10",
    category: "stok-gudang",
    question: "Bagaimana atur sub-lokasi persediaan (rak per zone)?",
    answer:
      "**Lokasi → detail gudang → tab Zone**. Buat zone (misal *Ruko*, *Gudang Pusat*), lalu **Bulk-Assign** rak ke zone. LocationZone jadi surface untuk memisah rak fisik.",
  },
  {
    id: "stok-11",
    category: "stok-gudang",
    question: "Kenapa pilihan lokasi picking hanya WH-KECIL?",
    answer:
      "Kebijakan: semua penjualan dialokasi dari WH-KECIL (frontline). Gudang besar hanya untuk restock ke kecil via Transfer. Picklist otomatis set `location_id = WH-KECIL`; tidak ada fallback.",
  },

  {
    id: "chan-01",
    category: "integrasi-channel",
    question: "Bagaimana menghubungkan Shopee?",
    answer:
      "**Integrasi Channel → Shopee → Tambah Toko**. Klik **Connect** → redirect ke Shopee OAuth → login Seller Center → izinkan → kembali ke sistem. Access token & refresh token disimpan encrypted.",
    relatedManualSlug: "integrasi-channel/shopee",
  },
  {
    id: "chan-02",
    category: "integrasi-channel",
    question: "Bagaimana menghubungkan Lazada?",
    answer:
      "**Integrasi Channel → Lazada → Tambah Toko**. Login Seller Center Lazada dulu di tab baru, lalu klik **Connect** — redirect ke `auth.lazada.com` (BUKAN api.lazada.co.id). State token TTL 10 menit sekali pakai; jika expired ulangi.",
    relatedManualSlug: "integrasi-channel/lazada",
  },
  {
    id: "chan-03",
    category: "integrasi-channel",
    question: "Bagaimana menghubungkan TikTok Shop?",
    answer:
      "**Integrasi Channel → TikTok → Tambah Toko**. Login TikTok Seller di tab baru, klik **Connect** → OAuth → pilih toko → izinkan. Sync atribut per kategori via CLI `tiktok:sync-attributes {shop_id}`.",
    relatedManualSlug: "integrasi-channel/tiktok",
  },
  {
    id: "chan-04",
    category: "integrasi-channel",
    question: "Bagaimana menghubungkan WooCommerce?",
    answer:
      "**Integrasi Channel → WooCommerce → Tambah Toko**. Isi: URL toko (harus https publik), Consumer Key, Consumer Secret (dari WC → Settings → Advanced → REST API). Basic Auth per-toko, kredensial disimpan encrypted.",
    relatedManualSlug: "integrasi-channel/woocommerce",
  },
  {
    id: "chan-05",
    category: "integrasi-channel",
    question: "Apa yang di-webhook vs manual polling?",
    answer:
      "**Webhook** (real-time): pesanan baru, update status, refund. **Manual/scheduled**: produk baru (TikTok/Shopee — tidak ada webhook), stok listing lengkap, atribut kategori. WC hanya push: coupon, customer, order, product; refund via `order.updated` status=refunded.",
  },
  {
    id: "chan-06",
    category: "integrasi-channel",
    question: "Bagaimana refresh token yang expired?",
    answer:
      "Umumnya auto-refresh. Jika gagal, notifikasi muncul di bell icon. Buka *Integrasi Channel → toko → Refresh Token* untuk manual re-auth via OAuth ulang.",
  },
  {
    id: "chan-07",
    category: "integrasi-channel",
    question: "Kenapa ada channel yang tidak menerima update stok?",
    answer:
      "Cek: (1) toggle *sync_enabled* di matriks per SKU × store, (2) mapping SKU aktif, (3) token belum expired. Log push stok di menu *Notifikasi* filter *Sync Stok*.",
  },

  {
    id: "retur-01",
    category: "retur",
    question: "Bagaimana menerima retur dari channel?",
    answer:
      "Retur MP auto-buat dari webhook. **Pengaturan → Retur → tab Perlu Diproses**. Buka detail → verifikasi item → **Terima Retur** (barang masuk kembali ke bin retur) atau **Tolak**.",
    relatedManualSlug: "retur/terima-retur",
  },
  {
    id: "retur-02",
    category: "retur",
    question: "Apa arti status marketplace NO_RETURN_NEEDED / SELLER_WIN / SELLER_REFUSE_RETURN?",
    answer:
      "Ketiganya = *dispute_outcome final* dari channel. Bukan berarti tidak ada retur; wajib input laporan retur bulanan untuk audit walau outcome menolak.",
  },
  {
    id: "retur-03",
    category: "retur",
    question: "Di mana laporan retur bulanan?",
    answer:
      "**Laporan → Retur → periode = bulan**. Export XLSX. Termasuk retur online (MP) + retur manual.",
  },
  {
    id: "retur-04",
    category: "retur",
    question: "Bagaimana input retur manual?",
    answer:
      "**Pengaturan → Retur → Tambah Retur Manual**. Referensi pesanan, item + qty retur, alasan, kondisi barang. Simpan → stok kembali ke rak retur.",
  },

  {
    id: "beli-01",
    category: "pembelian",
    question: "Bagaimana membuat Purchase Order (PO)?",
    answer:
      "**Transaksi Pembelian → Tambah PO**. Pilih pemasok, tanggal, gudang tujuan, item + qty + harga beli. Simpan sebagai *Draft* atau *Kirim ke Pemasok*.",
    relatedManualSlug: "pembelian/buat-po",
  },
  {
    id: "beli-02",
    category: "pembelian",
    question: "Apa alur PO → Penerimaan → Bayar?",
    answer:
      "PO *Approved* → barang datang → **Barang Masuk → Penerimaan (filter PO)** → terima qty. Setelah lengkap, buat **Bill/Invoice** dari PO → **Bayar** via kas/bank.",
  },
  {
    id: "beli-03",
    category: "pembelian",
    question: "Bagaimana input pemasok baru?",
    answer:
      "**Kontak Pemasok → Tambah**. Nama, NPWP, alamat, kontak (telepon E.164), termin pembayaran. Simpan.",
    relatedManualSlug: "kontak/pemasok",
  },
  {
    id: "beli-04",
    category: "pembelian",
    question: "Bagaimana request restock antar cabang?",
    answer:
      "**Permintaan Restock → Tambah**. Cabang pemohon → cabang sumber, item + qty. Setelah di-approve, jadi Transfer Keluar.",
  },

  {
    id: "lap-01",
    category: "laporan",
    question: "Laporan apa saja yang tersedia?",
    answer:
      "**HPP, Persediaan, Retur, Stok Minus** (Pengaturan → Retur / Persediaan / Stok Minus), plus laporan penjualan, pembelian, riwayat stok — semuanya di menu *Laporan*.",
  },
  {
    id: "lap-02",
    category: "laporan",
    question: "Bagaimana export laporan?",
    answer:
      "Setiap halaman laporan punya tombol **Export**. Format: XLSX (default), CSV, atau PDF. Riwayat export tersedia di *Aktivitas Impex*.",
  },
  {
    id: "lap-03",
    category: "laporan",
    question: "Bagaimana filter periode dan pivot per lokasi?",
    answer:
      "Gunakan filter *Periode* (dari-sampai, preset harian/mingguan/bulanan) dan *Lokasi* (multi-select). Beberapa laporan mendukung *Group By Lokasi* di kolom tabel.",
  },

  {
    id: "set-01",
    category: "pengaturan",
    question: "Bagaimana mengubah identitas perusahaan?",
    answer:
      "**Pengaturan → Umum → tab Identitas Perusahaan**. Logo, nama, NPWP, alamat, telepon, email. Data ini dipakai di header invoice/PO/surat jalan.",
    relatedManualSlug: "pengaturan/umum",
  },
  {
    id: "set-02",
    category: "pengaturan",
    question: "Bagaimana mengatur kebijakan stok dan SLA?",
    answer:
      "**Pengaturan → Umum → tab Kebijakan Stok / SLA**. Atur: allow-negative-stock, safety stock default, SLA picking/packing/shipping (jam).",
  },
  {
    id: "set-03",
    category: "pengaturan",
    question: "Bagaimana mengatur RBAC?",
    answer:
      "**Pengaturan → Peran / Hak Akses**. Matriks: per-modul × 6 aksi (view/create/edit/delete/export/approve). Override per-user tersedia di *Pengguna → detail → Izin Khusus*.",
    relatedManualSlug: "pengaturan/rbac",
  },
  {
    id: "set-04",
    category: "pengaturan",
    question: "Bagaimana menambah gudang / zone / rak baru?",
    answer:
      "**Lokasi → Tambah Gudang**. Isi kode + nama + alamat. Buka detail → tab Zone → tambah zone → tab Rak → tambah rak (kode unik). Bulk-import via XLSX tersedia.",
    relatedManualSlug: "lokasi/gudang-zone-rak",
  },
  {
    id: "set-05",
    category: "pengaturan",
    question: "Bagaimana mengelola kategori dan merek produk?",
    answer:
      "**Kategori & Merek**. Kategori bisa tree (parent → child). Merek flat. Digunakan sebagai filter di *Produk* dan *Laporan*.",
  },

  {
    id: "trb-01",
    category: "troubleshooting",
    question: "Muncul \"Terjadi kesalahan\" — langkah pertama?",
    answer:
      "1. Cek **Notifikasi** untuk pesan error detail. 2. Cek *Aktivitas Impex* untuk proses async. 3. Refresh (F5). 4. Jika berulang, screenshot + kirim ke Admin (sertakan URL & waktu).",
  },
  {
    id: "trb-02",
    category: "troubleshooting",
    question: "Halaman blank atau loading tak berhenti — kapan hard refresh?",
    answer:
      "Ctrl+F5 (Windows/Linux) atau Cmd+Shift+R (Mac) untuk hard refresh (bypass cache). Jika masih, cek koneksi internet & status backend di *Notifikasi → Sistem*.",
  },
  {
    id: "trb-03",
    category: "troubleshooting",
    question: "Data tidak update setelah aksi (mis. tombol Simpan)?",
    answer:
      "Query cache biasanya invalidate otomatis. Tunggu 1-2 detik, lalu refresh (F5). Jika masih tidak update, laporkan — bisa jadi mutation gagal silent.",
  },
  {
    id: "trb-04",
    category: "troubleshooting",
    question: "Kolom hilang di tabel — bagaimana memunculkan kembali?",
    answer:
      "Preferensi kolom disimpan localStorage. Klik ikon **Kolom** (kepala tabel) → ceklis kolom → *Reset ke default* jika perlu.",
  },
  {
    id: "trb-05",
    category: "troubleshooting",
    question: "Error 401 tiba-tiba — kenapa?",
    answer:
      "Session/token expired. Sistem auto redirect ke `/login`. Login ulang; posisi terakhir dipertahankan lewat URL.",
  },
  {
    id: "trb-06",
    category: "troubleshooting",
    question: "Error 403 (Hak akses ditolak) — apa yang harus dilakukan?",
    answer:
      "Peran Anda tidak punya izin untuk aksi tersebut. Hubungi Admin — mereka bisa menambah izin di *Pengaturan → Peran* atau *Pengguna → Izin Khusus*.",
  },
  {
    id: "trb-07",
    category: "troubleshooting",
    question: "Tombol Kembali membawa saya ke halaman berbeda dari yang diharapkan?",
    answer:
      "Tombol *Kembali* memakai `router.back()` + fallback breadcrumb. Jika alur unik (mis. deeplink), fallback ke parent breadcrumb dipakai. Ini disengaja untuk konsistensi.",
  },
];
