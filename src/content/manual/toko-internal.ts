export const tokoInternalSetup = `## Setup Toko Internal (POS/Offline)

Toko Internal adalah representasi outlet fisik atau kanal offline (POS) di Cilupbah. Setiap Toko Internal memiliki identitas sendiri dan dipakai saat membuat pesanan manual sehingga penjualan offline dapat dilacak terpisah dari channel marketplace.

### Langkah Setup
1. Buka menu **Toko Internal** pada path \`/dashboard/toko-internal\`.
2. Klik tombol **Tambah Toko Internal** di header halaman.
3. Isi field wajib:
   - **Nama Toko**: identitas outlet (mis. "Cilupbah Outlet Jogja").
   - **Logo**: unggah gambar (PNG/JPG, maks 2 MB) — dipakai di header struk & invoice.
   - **Alamat**: alamat lengkap outlet, termasuk kota & kode pos.
   - **Telepon**: nomor kontak dalam format **E.164** (mis. \`+6281234567890\`) via komponen \`PhoneInput\`.
4. Klik **Simpan** untuk membuat Toko Internal.
5. Toko baru muncul di daftar dengan \`internal_store_id\` yang dipakai referensi di modul lain.

### Pemakaian di Pesanan Manual
1. Buka \`/dashboard/pesanan\` dan klik **Tambah Pesanan**.
2. Pilih channel **Internal**; dropdown **Toko Internal** menampilkan daftar outlet yang sudah dibuat.
3. Sistem otomatis mengisi \`internal_store_id\` pada payload pesanan.

### Edit & Nonaktifkan
1. Klik baris toko untuk membuka modal edit; ubah field lalu **Simpan**.
2. Toggle **Aktif/Nonaktif** untuk menyembunyikan outlet dari dropdown pesanan tanpa menghapus data historis.

> Peringatan: nomor telepon **wajib E.164**. Format lokal (mis. \`08123456789\`) akan divalidasi ulang oleh \`lib/phone.ts\` dan bisa ditolak.

> Peringatan: mengganti nama toko tidak mengubah invoice/struk yang sudah terbit — hanya berlaku untuk transaksi baru.

Shortcut: gunakan filter **Status: Aktif** pada daftar untuk menampilkan hanya outlet operasional.`;
