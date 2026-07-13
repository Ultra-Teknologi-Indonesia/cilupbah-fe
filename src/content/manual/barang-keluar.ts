export const barangKeluarTransfer = `## Transfer Keluar Manual (Antar Gudang)

Menu **Barang Keluar** digunakan untuk mengirim stok antar gudang secara manual (mis. WH-BESAR ke WH-KECIL). Modul ini mengikuti state machine yang ketat agar stok reserve & transit tidak bocor.

### Membuat Transfer Keluar
1. Buka \`/dashboard/barang-keluar/transfer\`.
2. Klik **Buat Transfer Keluar**.
3. Isi **No. Transfer** dengan format \`TRFO-XXXX\` (input manual — tidak auto).
4. Pilih **Gudang Asal** dan **Gudang Tujuan**.
5. Tambah item: pilih SKU dan qty (rak asal/tujuan diisi saat submit Surat Jalan).
6. Simpan sebagai **DRAFT**.

### State Machine
1. **DRAFT** — dokumen dibuat, stok di-hold sebagai reserve + transit hold. Belum dipotong.
2. **APPROVED** — supervisor menyetujui. Reserve tetap tertahan.
3. **IN_TRANSIT** — cetak Surat Jalan; stok resmi keluar dari gudang asal.
4. **RECEIVED** — dokumen diterima di gudang tujuan (via menu Penerimaan Transfer di \`/dashboard/transaksi-stok/penerimaan-transfer\`).

### Perilaku Reserve
1. DRAFT & APPROVED menahan reserve agar barang tidak double-alokasi ke penjualan.
2. Saat IN_TRANSIT, reserve dilepas dan digantikan mutasi keluar aktual.
3. Bila transfer dibatalkan sebelum IN_TRANSIT, reserve otomatis dilepas.

> Peringatan: nomor \`TRFO-XXXX\` diinput manual. Sistem legacy dengan format \`TRFO-<tanggal>\` masih dapat ditemukan di data lama (empty rak).`;

export const barangKeluarSuratJalan = `## Cetak Surat Jalan & Pemotongan Stok

Cetak Surat Jalan bukan sekadar aksi print — ini adalah titik commit yang mengubah status ke IN_TRANSIT dan memotong stok gudang asal.

### Alur Cetak
1. Buka dokumen transfer di \`/dashboard/barang-keluar/transfer\` dengan status **APPROVED**.
2. Klik **Cetak Surat Jalan**.
3. Sistem menampilkan form input per item: **SKU**, **Kode Rak** asal, dan **Qty** aktual.
4. Isi baris per baris (multi-SKU multi-rak diperbolehkan).
5. Klik **Submit & Cetak**.

### Efek Submit
1. Status berpindah **APPROVED → IN_TRANSIT**.
2. Stok dipotong dari rak asal saat itu juga berdasarkan input SKU + rak + qty.
3. Mutasi stok tercatat sebagai keluar dari gudang asal + masuk ke stok transit sistem (\`SYS-TRANSIT\`).
4. File PDF Surat Jalan diunduh untuk dilampirkan pada pengiriman.

### Multi-Rak per Item
1. Bila 1 item diambil dari beberapa rak, tambah baris untuk setiap rak dengan qty parsial.
2. Total qty per SKU harus sama dengan qty di dokumen transfer.

> Peringatan: setelah cetak, dokumen tidak bisa diedit langsung. Gunakan **Revert to Draft** bila perlu koreksi (lihat manual Revert).

> Gotcha: kebijakan allow-negative-stock berlaku — sistem tidak memblokir bila rak asal minus, tetapi laporan **Riwayat Stok Minus** wajib direview.`;

export const barangKeluarRevert = `## Revert & Delete Transfer Keluar

Untuk mengoreksi kesalahan atau membatalkan pengiriman, Cilupbah menyediakan mekanisme revert dan delete yang aman terhadap sinkronisasi channel.

### Revert to Draft (dari IN_TRANSIT)
1. Buka dokumen transfer berstatus **IN_TRANSIT**.
2. Klik menu **Aksi** > **Revert to Draft**.
3. Sistem melakukan un-ship: stok dikembalikan ke rak asal, transit hold dipasang lagi.
4. Status kembali ke **DRAFT** dan flag \`SYNCED\` **tetap dipertahankan** — tidak perlu re-sync mapping channel.
5. Anda dapat mengedit dokumen dan cetak ulang Surat Jalan.

### Delete In-Transit = Revert
1. Klik **Hapus** pada dokumen berstatus IN_TRANSIT.
2. Sistem menganggap ini sebagai revert-to-draft, bukan hard-delete.
3. Setelah revert, Anda dapat menghapus dokumen dari status DRAFT bila memang tidak dipakai.

### Data Legacy
1. Dokumen dengan **rak kosong** dan nomor format \`TRFO-<tanggal>\` adalah data legacy migrasi.
2. Legacy tidak dapat direvert karena tidak menyimpan detail rak per item.
3. Perlakukan sebagai read-only; gunakan penyesuaian stok manual bila perlu koreksi.

> Peringatan: revert menjalankan reversal movement (\`*_REVERSAL\`), bukan menghapus record. Jejak audit tetap utuh.

> Gotcha: tidak ada tombol **Hapus** untuk dokumen DRAFT yang sudah pernah IN_TRANSIT — hanya arsipkan setelah revert.`;
