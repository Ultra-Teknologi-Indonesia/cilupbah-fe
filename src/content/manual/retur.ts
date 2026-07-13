export const returTerima = `## Menerima Retur dari Channel

Modul Retur memproses barang kembali dari pelanggan marketplace. Retur channel masuk otomatis via webhook (Shopee/Lazada/TikTok) atau via handler \`detectAndHandleRefunds()\` untuk WooCommerce.

### Langkah Terima Retur
1. Buka menu **Retur** dan pilih tab **Perlu Diproses**.
2. Klik baris retur untuk masuk ke halaman detail.
3. Verifikasi item yang dikembalikan: SKU, qty, alasan pelanggan, foto (jika ada).
4. Cek kondisi fisik barang saat tiba di gudang.
5. Pilih aksi:
   - **Terima Retur**: barang masuk ke **Bin Retur** (rak khusus per lokasi); stok tercatat kembali di \`inventories\`.
   - **Tolak Retur**: barang tidak diterima; sistem mencatat alasan tolak.
6. Klik **Konfirmasi**.

### Status Marketplace (\`dispute_outcome\` — final)
1. \`NO_RETURN_NEEDED\` — marketplace memutuskan tidak perlu retur (mis. refund saja).
2. \`SELLER_WIN\` — penjual menang sengketa; retur ditolak, dana tidak dikembalikan ke pembeli.
3. \`SELLER_REFUSE_RETURN\` — penjual menolak menerima barang balik.

> Peringatan: \`dispute_outcome\` bersifat **final** — tidak dapat diubah dari FE. Semua penyesuaian dispute dikerjakan di Seller Center marketplace, lalu Cilupbah menyerap hasilnya via webhook.

> Peringatan: Bin Retur berbeda dari bin regular. Barang di Bin Retur perlu QC ulang sebelum dipindahkan ke bin jual (via **Pindah Bin** di \`/dashboard/transaksi-stok\`).

Shortcut: filter **Status: Perlu Diproses** + urut tanggal terlama untuk memproses backlog retur lebih dahulu.`;

export const returManual = `## Input Retur Manual

Retur manual dipakai untuk kanal offline (POS/Toko Internal) atau kasus channel yang tidak terintegrasi. Anda menginput retur secara manual dengan referensi pesanan asal.

### Langkah Input
1. Buka menu **Retur** dan klik **Tambah Retur Manual**.
2. Isi field:
   - **Referensi Pesanan**: cari via nomor pesanan (\`sales_order_number\`) — dropdown memanggil API pencarian backend.
   - **Tanggal Retur**: default hari ini, dapat diubah.
   - **Alasan Retur**: pilih dari daftar (rusak / salah kirim / tidak sesuai / lainnya).
3. Tambahkan item retur:
   - Pilih **SKU** (auto-filter dari item pesanan asal).
   - Isi **Qty Retur** (tidak boleh melebihi qty pesanan).
   - Pilih **Kondisi Barang**: Baik / Rusak Ringan / Rusak Berat.
   - Catatan opsional per item.
4. Klik **Simpan Retur**.

### Efek Stok
1. Barang dengan kondisi **Baik** kembali ke **Rak Retur** di gudang yang dipilih.
2. Barang **Rusak Ringan/Berat** tetap tercatat di Rak Retur tetapi dengan flag khusus (perlu keputusan lanjutan: perbaiki / hapus / retur ke pemasok).
3. Stok jual tidak otomatis bertambah — perlu Pindah Bin ke rak jual setelah QC.

> Peringatan: retur manual **tidak** mempengaruhi status di marketplace. Jangan pakai untuk pesanan channel yang masih aktif — gunakan flow retur channel.

Shortcut: klik **Duplikat** pada retur existing untuk mempercepat input jika alasannya sama (batch retur produk cacat).`;

export const returLaporan = `## Laporan Retur Bulanan (Wajib Audit)

Laporan retur bulanan wajib disusun untuk kepentingan audit — termasuk saat outcome retur adalah tolak/dispute. Ini mencakup retur channel maupun retur manual.

### Cara Generate Laporan
1. Buka menu **Laporan** pada path \`/dashboard/laporan\`.
2. Pilih kategori **Retur**.
3. Set filter:
   - **Periode**: pilih bulan/rentang tanggal.
   - **Channel**: All / Shopee / Lazada / TikTok / WC / Internal.
   - **Status**: All / Diterima / Ditolak / Dispute.
4. Klik **Generate Laporan**.
5. Preview tabel muncul; klik **Export XLSX** untuk mengunduh.

### Isi Laporan
1. Kolom: tanggal retur, nomor retur, nomor pesanan asal, channel, toko, SKU, qty, alasan, kondisi, \`dispute_outcome\`, nilai retur (Rp).
2. Baris ringkasan per channel: total retur, total nilai, persentase terhadap penjualan.
3. Baris retur manual dikelompokkan di bagian bawah dengan label **Manual**.

### Kewajiban Audit
1. Retur ditolak (\`SELLER_WIN\` / \`SELLER_REFUSE_RETURN\`) **tetap wajib** masuk laporan sebagai catatan sengketa.
2. Retur \`NO_RETURN_NEEDED\` dicatat untuk audit refund tanpa fisik barang.
3. Simpan file XLSX per bulan sebagai bukti audit internal.

> Peringatan: jangan menghapus record retur di database — statusnya cukup di-arsip. Laporan bulanan harus konsisten lintas periode.

Shortcut: jadwalkan export otomatis dari menu **Aktivitas Impor/Ekspor** untuk generate laporan setiap awal bulan.`;
