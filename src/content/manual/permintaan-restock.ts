export const permintaanRestockRequest = `## Permintaan Restock Antar Cabang

![Request restock antar cabang](/bantuan/media/routes/dashboard-permintaan-restock/01-halaman.png "Request restock antar cabang")

Modul Permintaan Restock memfasilitasi permintaan pasokan barang dari satu cabang (gudang pemohon) ke cabang lain (gudang sumber). Setelah permintaan disetujui, sistem otomatis membuat **Transfer Keluar** di gudang sumber.

### Peran Cabang
1. **Cabang Pemohon** — outlet/gudang yang stoknya menipis dan mengajukan permintaan.
2. **Cabang Sumber** — gudang yang memiliki stok cukup untuk mengirim.
3. Peran ditentukan otomatis dari kombinasi \`requesting_location_id\` dan \`source_location_id\`.

### Langkah Buat Permintaan (Cabang Pemohon)
1. Buka menu **Permintaan Restock** pada path \`/dashboard/permintaan-restock\`.
2. Klik tombol **Tambah Permintaan** di header halaman.
3. Isi field:
   - **Cabang Pemohon**: default cabang user login (dapat diubah jika user punya multi-lokasi).
   - **Cabang Sumber**: pilih gudang tujuan permintaan (biasanya Gudang Pusat).
   - **Tanggal Butuh**: kapan stok diperlukan tiba.
   - **Prioritas**: Normal / Urgent.
4. Tambahkan item permintaan pada tabel:
   - Pilih **SKU** via combobox (search API backend, hormati \`?search=\`).
   - Isi **Qty Diminta**.
   - Catatan per item opsional.
5. Klik **Simpan** untuk draft atau **Kirim** untuk mengajukan.

### Alur Approval & Fulfilment
1. Cabang Sumber menerima notifikasi permintaan masuk.
2. Petugas cabang sumber membuka permintaan, mengecek stok tersedia per SKU.
3. Klik **Setujui**: sistem otomatis membuat **Transfer Keluar** di \`/dashboard/barang-keluar\` dengan \`purpose = RESTOCK\` dan referensi \`restock_request_id\`.
4. Transfer Keluar mengikuti state machine standar: **DRAFT → APPROVED → IN_TRANSIT → RECEIVED**.
5. Setelah Transfer diterima cabang pemohon, permintaan restock berstatus **Selesai**.

### Penolakan / Parsial
1. Klik **Tolak** dengan alasan (mis. stok kosong) — permintaan berstatus **Ditolak**.
2. Untuk fulfilment parsial, edit qty per item saat approve; sisa qty dapat dibuat permintaan baru.

> Peringatan: permintaan restock **tidak** memotong stok saat dibuat. Stok baru dipotong saat Transfer Keluar berstatus \`IN_TRANSIT\` (hold reserve + transit).

> Peringatan: satu permintaan = satu pasangan cabang. Jika butuh dari 2 sumber berbeda, buat 2 permintaan.

Shortcut: filter **Prioritas: Urgent** + status **Menunggu Approval** untuk memproses permintaan mendesak lebih dahulu.`;
