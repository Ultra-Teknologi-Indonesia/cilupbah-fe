export const prosesAlokasiStok = `## Alokasi Stok

![Alokasi Stok (reserve otomatis vs manual)](/bantuan/media/routes/dashboard-pengaturan-alokasi-stok/01-halaman.png "Alokasi Stok (reserve otomatis vs manual)")

Alokasi menahan (\`reserve\`) stok WH-KECIL agar tidak dipakai pesanan lain sampai fulfillment selesai atau dibatalkan. Pahami dua mode alokasi berikut sebelum menangani pesanan bermasalah.

### Reserve otomatis

1. Setiap pesanan berstatus **Baru** dijalankan lewat job \`AllocateSalesOrderJob\` sesaat setelah masuk.
2. Sistem menghitung \`available = on_hand - reserved\` per SKU dan menahan sejumlah \`qty_diminta\`.
3. Bila semua item berhasil, status naik ke **Siap Diproses** dan siap masuk Picking.

### Reserve manual & atasi Gagal Alokasi

1. Buka \`/dashboard/pesanan/[id]\` panel **Alokasi Stok**. Baris merah **Gagal Alokasi** memperlihatkan SKU + kekurangan qty.
2. Tambah stok via **Penempatan** di \`/dashboard/transaksi-stok\` atau via **Penerimaan** pembelian/transfer masuk.
3. Kembali ke detail pesanan, klik **Retry Alokasi**. Sistem menjalankan ulang \`AllocateSalesOrderJob\` untuk pesanan tersebut saja.
4. Untuk bundle, alokasi berjalan pada level komponen (cascadeBundle). Kegagalan salah satu komponen menandai bundle Gagal Alokasi utuh.

> Alokasi tidak diperbolehkan negatif untuk Sales meskipun policy allow-negative-stock aktif di Penempatan/Transfer. Pastikan stok cukup sebelum retry.
`;

export const prosesPicking = `## Picking

![Picking (Belum Mulai → Berjalan → Selesai)](/bantuan/media/routes/dashboard-proses-pesanan-picking/01-halaman.png "Picking (Belum Mulai → Berjalan → Selesai)")

Modul Picking berada di \`/dashboard/proses-pesanan\` tab **Picking** dan mengatur pengambilan barang dari rak WH-KECIL menuju area packing.

### Tiga sub-tab

1. **Belum Mulai** — daftar picklist baru dibuat, menunggu Picker mengambil tugas. Kolom \`no_picklist\` (format \`PICK-XXXX\`) dapat diklik untuk membuka detail.
2. **Berjalan** — picklist sedang dikerjakan. Menampilkan progres qty terscan vs qty target per SKU.
3. **Selesai** — picklist tuntas. Kolom \`picker_name\` menampilkan nama Picker; sortable dan dapat difilter via UserSelect.

### Alur operasional

1. Picker membuka **Belum Mulai**, klik **Ambil Tugas** pada baris picklist yang tersedia.
2. Sistem membuka layar scan; Picker memindai barcode rak lalu barcode SKU. Scan SKU otomatis +1 tanpa popup konfirmasi (ScanAutoflowBar).
3. Bila kelebihan/salah scan, klik ikon **Koreksi** — sistem mencatat \`PICK_REVERSAL\` di movement, bukan hard-delete.
4. Setelah semua target terscan, klik **Selesaikan Picking**. Picklist pindah ke sub-tab **Selesai** dan pesanan naik ke **Packing Belum Mulai**.

### Aturan penting

1. Semua picking wajib dari **WH-KECIL** (\`Picklist.location_id = kecil\`); tidak ada fallback ke gudang besar.
2. Satu picklist hanya menyentuh 1 rak per SKU. Bila stok tersebar di banyak rak, sistem membuat baris terpisah.

> Manual bin combobox hanya sebagai fallback bila barcode rak rusak. Selalu utamakan scan agar audit trail bersih.
`;

export const prosesPacking = `## Packing

![Packing (multi-order, timbang, ukur)](/bantuan/media/routes/dashboard-proses-pesanan-packing/01-halaman.png "Packing (multi-order, timbang, ukur)")

Modul Packing di \`/dashboard/proses-pesanan\` tab **Packing** mengubah barang yang sudah dipick menjadi paket siap kirim, lengkap dengan berat dan dimensi.

### Tiga sub-tab

1. **Belum Mulai** — antrean paket menunggu packer. Kolom \`no_picklist\` clickable memperlihatkan sumber picking.
2. **Berjalan** — sedang di-pack, boleh menampung banyak pesanan dalam 1 sesi (multi-order).
3. **Selesai** — packing tuntas; kolom \`packer_name\` terisi dari user yang menekan **Selesaikan Packing**.

### Alur operasional

1. Packer klik **Mulai Packing** — layar meminta scan barcode pertama.
2. Scan SKU +1 per item mengurangi target; layar menampilkan progres per pesanan aktif.
3. Untuk **multi-order** dalam 1 sesi, scan barcode pesanan berikutnya di badge atas layar; sistem mengalihkan konteks tanpa membatalkan progres sebelumnya.
4. Isi \`berat_paket\` (kg) dan \`dimensi\` (P x L x T, cm) sebelum menekan **Selesaikan**. Angka dipakai untuk mencetak resi & estimasi ongkir kurir.

### Aturan penting

1. Packing hanya boleh melanjutkan pesanan berstatus **Packing Belum Mulai**; pesanan yang belum melewati Picking tidak muncul.
2. Koreksi salah scan memakai \`PACK_REVERSAL\`, bukan hapus baris.

> Jangan menutup tab browser saat sesi Berjalan. Sesi disimpan per user; tab tertutup mendadak dapat menahan lock hingga 5 menit.
`;

export const prosesShipping = `## Shipping

![Shipping (cetak resi & pickup)](/bantuan/media/routes/dashboard-proses-pesanan-shipping/01-halaman.png "Shipping (cetak resi & pickup)")

Modul Shipping di \`/dashboard/proses-pesanan\` tab **Shipping** mengatur pencetakan resi, pickup, dan penyerahan paket ke kurir.

### Tiga sub-tab

1. **Belum Mulai** — paket sudah packing, menunggu resi tercetak.
2. **Berjalan** — resi sudah dicetak, menunggu pickup atau serah terima.
3. **Selesai** — paket sudah diserahkan ke kurir; menunggu update **Delivered** dari tracking channel atau konfirmasi manual.

### Cetak resi

1. **Cetak 1**: buka baris paket, klik **Cetak Resi**. PDF resi terbuka via document-preview.
2. **Cetak Bulk**: ceklis beberapa baris, klik **Cetak Resi Bulk**. Sistem mem-batch panggilan Jubelio dan menggabungkan hasil PDF dengan FPDI.
3. Rate limit **5 request/menit** ke Jubelio; jika terlampaui, muncul progress polling asinkron.
4. Baris channel **Lazada** dan **WooCommerce** ditampilkan grey-out (\`getRowSelectable = false\`) karena label harus ditarik dari sisi channel, bukan generate lokal.

### Bukti pickup

1. Setelah cetak resi, klik **Bukti Pickup** pada baris paket.
2. Isi form: kode pickup, nama kurir/driver, nomor telepon (teks bebas), unggah foto sebagai media Spatie multi-file.
3. Klik **Simpan** — status pindah ke **Shipping Selesai** dan paket dianggap terserah ke kurir.

> Kode pickup memakai strategi **existing-wins upsert**: mengirim ulang kode yang sama tidak menimpa catatan sebelumnya.
`;

export const prosesTerkirim = `## Terkirim (Delivered)

![Terkirim (Delivered)](/bantuan/media/routes/dashboard-proses-pesanan-delivered/01-halaman.png "Terkirim (Delivered)")

Sub-tab **Delivered** di \`/dashboard/proses-pesanan\` memperlihatkan paket yang sudah dilaporkan sampai oleh kurir tetapi belum masuk **Selesai**.

### Sumber status

1. **Otomatis** — webhook tracking channel Shopee/Lazada/TikTok/WooCommerce menandai paket **Delivered** saat kurir melaporkan sampai.
2. **Manual** — untuk **kurir instan** (Grab, Gojek) yang tidak sinkron webhook, driver memberi bukti serah dan operator menandai manual.

### Konfirmasi manual

1. Buka baris paket di sub-tab **Delivered**.
2. Klik **Konfirmasi Terkirim**. Dialog meminta waktu penyerahan, nama penerima, dan foto opsional.
3. Setelah tersimpan, paket menunggu window auto-Selesai (default 3x24 jam) atau bisa langsung **Tandai Selesai** manual bila tidak ada sengketa.

### Tracking channel

1. Kolom **Status Tracking** menampilkan event terakhir dari channel (mis. \`OUT_FOR_DELIVERY\`, \`DELIVERED\`, \`FAILED_ATTEMPT\`).
2. Klik ikon timeline untuk melihat riwayat event lengkap per resi.
3. Bila kurir memperbarui status setelah Delivered menjadi \`FAILED\` atau \`RETURN\`, pesanan pindah ke antrean Retur otomatis.

> Konfirmasi manual untuk pesanan channel non-instan sebaiknya dihindari kecuali tracking macet lebih dari 7 hari — utamakan menunggu update resmi channel.
`;

export const prosesSelesai = `## Selesai

![Selesai (Done) — arsip](/bantuan/media/routes/dashboard-proses-pesanan-done/01-halaman.png "Selesai (Done) — arsip")

Sub-tab **Selesai** di \`/dashboard/proses-pesanan\` adalah arsip akhir untuk pesanan yang seluruh proses fulfillment-nya tuntas dan dana sudah diakui.

### Kapan pesanan masuk Selesai

1. Untuk pesanan channel: setelah **Delivered** dan **window sengketa** channel berakhir (mis. Shopee 3-7 hari).
2. Untuk pesanan manual/internal: setelah operator menekan **Tandai Selesai** pada sub-tab Delivered.
3. Untuk pesanan COD: setelah pembayaran diterima dan direkonsiliasi.

### Karakteristik Selesai

1. **Tidak dapat direvert** kembali ke Shipping/Delivered. Koreksi hanya via alur **Retur** atau input pesanan baru bertanda kompensasi.
2. Kolom \`picker_name\`, \`packer_name\`, \`shipping_courier\`, dan \`no_resi\` tetap terlihat untuk audit.
3. Data stok, akuntansi, dan komisi kurir dikunci pada snapshot tanggal Selesai.

### Yang bisa dilakukan

1. **Lihat Detail** — semua panel tetap terbuka read-only.
2. **Cetak Ulang Invoice / Resi** — untuk kebutuhan arsip pembeli.
3. **Ajukan Retur** — bila pembeli mengembalikan barang setelah tanggal Selesai (dalam window Retur channel).
4. **Export** — masuk ke laporan penjualan periodik.

> Status Selesai adalah sinyal ke modul Laporan bahwa pendapatan sudah dapat diakui. Jangan gunakan "revert" workaround; buat Retur atau pesanan koreksi.
`;

export const prosesScanAutoflow = `## Scan Autoflow

Komponen **ScanAutoflowBar** adalah shared UI yang dipakai konsisten di Picking, Packing, dan Putaway. Tujuannya menghilangkan gesekan popup dan mempercepat operasi gudang.

### Perilaku scan

1. Scan barcode SKU **+1** otomatis pada target aktif tanpa popup konfirmasi.
2. Bila SKU sudah mencapai target, scan berikutnya diabaikan dan bar berkedip merah.
3. Bila SKU **tidak dikenali** dalam picklist/packlist, muncul toast error tanpa mengganggu fokus input.
4. Perpindahan target berikut (auto-advance) terjadi begitu SKU aktif tuntas.

### Combobox manual (fallback)

1. Klik tombol **Cari Manual** di kanan bar untuk membuka combobox SKU dengan search backend.
2. Pilih SKU dan qty; sistem mencatat entri sebagai **manual** di audit trail (bukan scanned).
3. Gunakan hanya bila barcode rusak; operasi manual berlebihan akan di-flag di laporan audit.

### Debouncing & hook

1. Bar memakai hook \`useQtyBumpQueue\` untuk mengantre scan cepat (>10 scan/detik) tanpa race condition.
2. Setiap +1 dikirim ke BE dalam batch pendek (250 ms) demi menghindari flooding endpoint.

> Scan otomatis diaktifkan untuk mempercepat throughput. Jangan pindahkan fokus keyboard keluar dari halaman selama sesi scan berjalan.
`;

export const prosesBuktiPickup = `## Bukti Pickup Kurir

Bukti pickup adalah catatan serah terima paket dari operator gudang ke kurir/driver. Wajib diisi sebelum paket dianggap **Shipping Selesai**.

### Form isian

1. **Kode Pickup** — dikirim kurir (mis. AWB pickup code). Sistem memakai **existing-wins upsert**: jika kode sama telah tersimpan, entri lama dipertahankan, tidak ditimpa.
2. **Nama Kurir/Driver** — pilih dari daftar kurir kanonik (141 nama sinkron Jubelio) atau isi manual untuk kurir instan.
3. **Nomor Telepon Driver** — **field teks bebas** (sengaja tidak divalidasi E.164) karena driver kadang tidak memiliki nomor tetap yang bisa diverifikasi.
4. **Foto Bukti** — multi-file, disimpan sebagai media **Spatie Media Library** di collection \`courier_id\`.

### Langkah pengisian

1. Buka baris paket di sub-tab **Shipping Berjalan**, klik **Bukti Pickup**.
2. Isi kode, nama, telepon, dan unggah minimal 1 foto (paket + AWB terlihat).
3. Klik **Simpan** — status paket pindah ke **Shipping Selesai** dan pesanan siap dilacak sampai Delivered.

### Kebijakan foto

1. Format JPG/PNG/HEIC/WebP, maks 5 MB per foto, maks 5 foto per bukti.
2. Foto tidak dapat dihapus setelah tersimpan; unggah pengganti hanya bisa oleh admin dengan izin \`shipping.replace_proof\`.

> Fase 2 (auto-channel pickup) masih terblok integrasi; semua bukti pickup saat ini diinput manual oleh operator gudang.
`;

export const prosesKurirInstan = `## Kurir Instan (Grab/Gojek)

Kurir instan seperti **Grab** dan **Gojek** tidak memiliki webhook tracking terintegrasi, sehingga alurnya sepenuhnya **driver-manual** di dalam modul Shipping dan Terkirim.

### Setup awal

1. Pastikan kurir Grab/Gojek terdaftar di master kurir (\`/dashboard/pengaturan/kurir\`) dengan flag \`is_instant = true\`.
2. Master kurir mengikuti daftar kanonik 141 nama Jubelio; kurir tidak dihapus, hanya deactivate.

### Alur Shipping

1. Setelah packing selesai, buka paket di sub-tab **Shipping Belum Mulai**.
2. Klik **Pesan Kurir Instan** — sistem TIDAK memanggil API Grab/Gojek. Operator memesan sendiri via app kurir.
3. Setelah driver hadir, isi **Bukti Pickup** (kode order Grab/Gojek, nama driver, telepon, foto).
4. Klik **Simpan**; paket pindah ke **Shipping Selesai** persis seperti kurir reguler.

### Alur Terkirim

1. Driver mengirim bukti sampai (foto/chat). Operator membuka sub-tab **Delivered**, cari paket by resi.
2. Klik **Konfirmasi Terkirim**, isi waktu penyerahan dan nama penerima manual.
3. Status set manual ke **Delivered**; setelah 24 jam tanpa sengketa, sistem auto-Selesai (atau klik manual **Tandai Selesai**).

### Indikator UI

1. Baris kurir instan memiliki badge biru **INSTANT** pada kolom kurir.
2. Kolom tracking channel diisi **"Manual (Driver)"** karena tidak ada event otomatis.
3. Indikator status **Terkirim manual** sebelumnya Shopee-only, kini digeneralisasi untuk semua kurir instan.

> Karena tidak ada webhook, pastikan operator disiplin menandai Delivered — laporan SLA menghitung durasi Shipping->Delivered berdasarkan timestamp manual.
`;
