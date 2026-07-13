export const pembelianBuatPo = `## Membuat Purchase Order (PO)

Modul Transaksi Pembelian mengelola siklus pengadaan barang dari pemasok, mulai dari PO, penerimaan barang, hingga pembayaran invoice.

### Langkah Buat PO
1. Buka menu **Transaksi Pembelian** pada path \`/dashboard/transaksi-pembelian\`.
2. Klik tombol **Tambah PO** di header halaman.
3. Isi header PO:
   - **Pemasok**: pilih dari daftar (data dari \`/dashboard/kontak-pemasok\`).
   - **Tanggal PO**: default hari ini, dapat disesuaikan.
   - **Tanggal Estimasi Datang**: tanggal target barang tiba.
   - **Gudang Tujuan**: gudang yang akan menerima barang.
   - **Catatan**: opsional (mis. syarat khusus pemasok).
4. Tambahkan item PO pada tabel:
   - Pilih **SKU** via combobox (search API backend).
   - Isi **Qty Beli**.
   - Isi **Harga Beli** per unit (default dari harga beli terakhir).
   - Diskon opsional per baris.
5. Sistem menghitung subtotal, PPN (jika aktif), dan total PO otomatis.
6. Pilih aksi simpan:
   - **Simpan Draft**: PO tersimpan sebagai draft, dapat diedit.
   - **Kirim**: PO masuk ke antrian approval.

### Nomor PO
1. Sistem otomatis generate \`purchase_order_number\` dengan format \`PO-YYYYMM-NNNN\`.
2. Nomor terkunci setelah PO Kirim; tidak dapat diubah manual.

> Peringatan: satu PO = satu pemasok = satu gudang tujuan. Jika ingin memesan dari 2 pemasok, buat 2 PO terpisah.

Shortcut: klik **Duplikat PO** pada PO existing untuk mempercepat pembuatan PO berulang (mis. restock rutin).`;

export const pembelianApproval = `## Alur Approval Purchase Order

PO melalui alur status berjenjang sebelum menjadi PO aktif. Approval memakai RBAC — hanya role dengan izin tertentu (mis. **Manager Pembelian**) yang dapat menyetujui.

### Diagram Status
1. **Draft** — PO baru dibuat, dapat diedit bebas oleh pembuat.
2. **Submitted** — PO diajukan untuk review; edit terkunci.
3. **Approved** — Manager menyetujui; PO menjadi aktif dan dikirim ke pemasok.
4. **Rejected** — Manager menolak; PO kembali ke pembuat dengan catatan revisi (dapat diedit ulang → Submitted).

### Langkah Submit
1. Buka PO Draft di \`/dashboard/transaksi-pembelian\`.
2. Klik tombol **Submit untuk Approval** di footer kartu (\`FormFooter\`).
3. Status berubah ke **Submitted**; notifikasi terkirim ke user role Manager.

### Langkah Approve/Reject (role Manager)
1. Buka menu **Transaksi Pembelian**, filter **Status: Submitted**.
2. Klik baris PO untuk review detail.
3. Klik **Approve** untuk menyetujui — status → **Approved**, PO aktif.
4. Klik **Reject** untuk menolak — isi **Alasan Penolakan** wajib; status → **Rejected**.

### RBAC (Hak Akses)
1. Role dengan izin \`purchase_order.approve\` (default: Manager) dapat menyetujui.
2. Role dengan izin \`purchase_order.create\` (default: Staff Pembelian) dapat membuat & submit.
3. Konfigurasi izin di \`/dashboard/pengaturan\` → **Hak Akses**.

> Peringatan: PO **Approved** tidak dapat diedit langsung. Untuk perubahan, buat **Revisi PO** (menautkan ke PO asal via \`parent_po_id\`).

Shortcut: gunakan notifikasi bell untuk menuju langsung ke PO yang menunggu approval Anda.`;

export const pembelianPoBayar = `## Alur PO → Barang Datang → Bill → Bayar

PO Approved memicu siklus operasional: barang datang → dicatat sebagai Penerimaan → Bill/Invoice dibuat → Pembayaran.

### 1. Barang Datang (Penerimaan)
1. Barang tiba di gudang; buka menu **Barang Masuk** pada \`/dashboard/barang-masuk\`.
2. Pilih tab **Penerimaan** dan filter **Sumber: Purchase Order**.
3. Cari PO Approved yang barangnya datang, klik **Terima**.
4. Verifikasi qty per SKU (input qty diterima; boleh kurang dari PO untuk partial).
5. Klik **Konfirmasi Penerimaan**. Sistem membuat \`inbound_id\` dengan \`bin_id NULL\` (belum putaway).
6. Barang lanjut ke flow **Penempatan/Putaway** oleh tim gudang.

### 2. Bill / Invoice
1. Setelah penerimaan tercatat, buka PO di \`/dashboard/transaksi-pembelian\`.
2. Klik tab **Bill**.
3. Klik **Buat Bill**; sistem meng-generate draft invoice dari data penerimaan (qty aktual × harga PO).
4. Verifikasi angka, tambahkan **Nomor Faktur Pemasok** & **Tanggal Faktur**.
5. Upload file faktur (PDF/JPG) sebagai bukti.
6. Klik **Simpan Bill** — status Bill: **Unpaid**.

### 3. Pembayaran
1. Buka Bill Unpaid, klik **Bayar**.
2. Pilih **Metode Pembayaran**:
   - **Kas** — pembayaran tunai.
   - **Bank** — pilih akun bank sumber dana.
3. Isi **Tanggal Bayar**, **Jumlah Bayar** (boleh partial), **Referensi** (nomor transfer).
4. Klik **Konfirmasi Bayar**.
5. Status Bill: **Paid** (jika full) atau **Partially Paid** (jika parsial).

### Rekonsiliasi
1. Sistem otomatis mencatat jurnal: Dr Persediaan / Cr Hutang Usaha saat Bill dibuat; Dr Hutang / Cr Kas/Bank saat bayar.
2. Laporan hutang pemasok tersedia di \`/dashboard/laporan\` kategori **Pembelian**.

> Peringatan: jangan membuat Bill sebelum ada penerimaan yang tercatat — sistem akan menolak karena qty basis Bill = qty terima aktual, bukan qty PO.

> Peringatan: pembayaran ganda dicegah dengan validasi \`amount_paid ≤ amount_due\`. Kelebihan bayar harus dicatat via retur atau uang muka terpisah.

Shortcut: filter **Bill Unpaid** + urut jatuh tempo terdekat untuk memprioritaskan pembayaran menghindari denda pemasok.`;
