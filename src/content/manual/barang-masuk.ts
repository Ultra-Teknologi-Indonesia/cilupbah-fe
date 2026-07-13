export const barangMasukPenerimaan = `## Penerimaan Barang Masuk

Menu **Barang Masuk** menyatukan seluruh arus barang yang masuk ke gudang: Pesanan Pembelian (PO) dari supplier dan Transfer Masuk dari gudang lain.

### Struktur Halaman
1. Buka \`/dashboard/barang-masuk/penerimaan\`.
2. Halaman menampilkan tab-filter: **Semua**, **Pesanan Pembelian**, dan **Transfer Masuk**.
3. Pesanan Pembelian & Transfer Masuk **bukan menu terpisah** — keduanya di-filter di halaman Penerimaan.
4. Kolom \`no_dokumen\`, \`sumber\`, \`tanggal_kirim\`, \`status\`, dan **Petugas** tersedia di list.

### Alur Terima Barang
1. Pilih baris dokumen yang akan diterima, klik **Terima**.
2. Sistem memasukkan barang ke **Bin Inbound** (rak sementara) dengan \`bin_id = NULL\`.
3. Setelah terima, dokumen berpindah ke antrian **Penempatan / Putaway**.
4. Barang yang berada di Bin Inbound **belum tersedia** untuk picking sampai selesai putaway.

### Transfer Masuk
1. Transfer dengan status \`IN_TRANSIT\` otomatis muncul di tab **Transfer Masuk**.
2. Aksi **Terima** membuat mutasi \`TRANSIT_IN\` dan menaruh barang di Bin Inbound tujuan.

> Peringatan: On Hand / Available / Sellable / Pickable **HANYA** menghitung stok yang sudah ditempatkan. Barang di Bin Inbound tidak dihitung sebagai stok tersedia.

> Gotcha: filter default \`status = IN_TRANSIT\` — ubah manual bila ingin melihat yang \`RECEIVED\`.`;

export const barangMasukPutaway = `## Penempatan (Putaway) Barang

Putaway adalah proses memindahkan barang dari Bin Inbound ke rak tujuan menggunakan scan. Hanya setelah putaway selesai, stok resmi tersedia untuk penjualan.

### Alur Penempatan via Scan
1. Buka \`/dashboard/barang-masuk/putaway\`.
2. Centang satu atau beberapa dokumen penerimaan yang akan di-putaway.
3. Klik **Buat Putaway** — sistem POST \`inbound_ids[]\` dan menggabungkan sumber via pivot \`putaway_sources\`.
4. Pada layar scan: pindai barcode **SKU**, lalu barcode **Kode Rak** tujuan.
5. Input **qty** yang ditempatkan pada rak tersebut.
6. Ulangi untuk item berikutnya; scan autoflow (ScanAutoflowBar) menambah +1 tanpa popup.

### Gabung Beberapa Inbound
1. Anda dapat memilih beberapa dokumen penerimaan sekaligus untuk diproses dalam 1 putaway.
2. Sistem menyimpan sumber via pivot \`putaway_sources\` sehingga tiap item dapat ditelusuri asalnya.
3. Status inbound akan recompute otomatis di \`ProcessPutawayItemJob\` setelah semua item terputaway.

### Setelah Putaway Selesai
1. Stok berpindah dari Bin Inbound (\`bin_id NULL\`) ke rak tujuan.
2. Nilai on_hand/available/sellable/pickable naik dan siap dijual.
3. ChannelStockResolver akan push angka baru ke marketplace pada sinkronisasi berikutnya.

> Peringatan: koreksi hasil scan bukan hard-delete. Sistem menjalankan reversal (\`reverseBinMove\`) yang tercatat sebagai movement \`*_REVERSAL\`.`;

export const barangMasukAssign = `## Assign Petugas Penerimaan

Cilupbah memisahkan tanggung jawab: **web** untuk assign & monitoring, **mobile** untuk aksi lapangan (Terima, QC, pindah qty).

### Assign di Web
1. Buka \`/dashboard/barang-masuk/penerimaan\`.
2. Centang dokumen penerimaan (PO / Transfer Masuk) yang akan diproses.
3. Klik **Assign Petugas**, pilih user via **UserSelect** (search API dengan filter role + shortcut "Saya sendiri").
4. Sistem menyimpan petugas ke kolom \`assigned_to\` dan menampilkan nama di kolom **Petugas**.

### Monitoring Progress
1. Kolom **Status** menampilkan tahap: **Ditugaskan**, **Sedang Diterima**, **Selesai Terima**.
2. Manajer dapat memfilter berdasarkan petugas untuk melihat beban kerja per user.
3. Klik nama petugas untuk melihat riwayat aksi user tersebut.

### Aksi di Mobile
1. Petugas login di aplikasi mobile Cilupbah.
2. Menu **Penerimaan** menampilkan tugas yang di-assign kepada mereka.
3. Aksi **Terima**, **QC**, dan **Pindah Qty** dilakukan di mobile — layar web tidak menyediakan tombol tersebut.

> Peringatan: jangan lakukan aksi Terima/QC di web meskipun terlihat mungkin — flow field disengaja di mobile untuk memaksa scan fisik.

> Gotcha: field pelaku (\`*_by\`, \`assigned_to\`) selalu pakai UserSelect, bukan free text — hindari input manual nama.`;
