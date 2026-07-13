export const standarSearch = `## Standar Search & Filter

Seluruh modul list di aplikasi memakai **Spatie Query Builder** di backend untuk konsistensi pencarian, filter, sort, dan pagination.

### Kontrak query string

1. Ketik kata kunci di kotak **Search** — FE mengirim \`?search=<term>\` ke endpoint list.
2. Backend memakai macro \`->allowedSearch(cols)\` untuk memutuskan kolom mana yang dipindai.
3. Filter kolom → \`filter[status]=NEW\`, \`filter[channel]=SHOPEE\`.
4. Sorting → \`sort=-created_at\` (prefix \`-\` untuk descending).
5. Pagination → \`per_page=25\` (default 10).

### Perilaku FE

- Search & filter di-debounce 300ms; request diperbarui setelah user berhenti mengetik.
- Nilai search/filter/sort/page tersimpan di **URL query string** — dapat di-bookmark & share.
- Reset filter via tombol **Reset** — URL dibersihkan ke default.

> **JANGAN** melakukan filter di sisi FE dengan \`array.filter\` terhadap data page saat ini. Praktik itu memunculkan hasil parsial karena backend hanya mengirim satu halaman.

### Catatan

- Jika kolom yang ingin dicari tidak ikut terpindai, koordinasi dengan BE untuk menambah ke \`allowedSearch\`.
- Search bersifat case-insensitive dan memakai operator \`ILIKE '%term%'\` di Postgres.
- Untuk pencarian eksak (SKU/barcode), gunakan filter \`filter[sku]=EXACT\` alih-alih search umum.
`;

export const standarTabel = `## Standar Tabel

Semua tabel data di aplikasi dibangun dari primitive \`@ui/table\` atau \`@ui/data-table\` (TanStack Table) untuk konsistensi interaksi.

### Interaksi standar

1. **Sort** — klik header kolom untuk toggle asc → desc → clear; ikon panah menandakan arah aktif.
2. **Pagination** — control di footer tabel: **Sebelumnya**, **Berikutnya**, dropdown ukuran halaman (10/25/50/100).
3. **Pilih per_page** default **10**; nilai baru tersimpan per browser via localStorage.
4. **Column visibility** — klik tombol **Kolom** di kanan atas untuk toggle kolom yang tampil.
5. Klik **Reset ke Default** untuk kembali ke set kolom bawaan.

### Persistensi

- Preferensi visibility kolom disimpan di localStorage per user × per tabel.
- Preferensi per_page juga per tabel — memudahkan alur kerja spesifik (mis. 50 untuk picking, 10 untuk laporan).
- URL query string membawa \`page\`, \`sort\`, \`filter\`, \`search\` — bukan visibility.

> Total baris di footer bersifat estimasi bila BE memakai pagination cursor. Untuk angka pasti, cek header laporan atau ekspor data.

### Catatan

- Row selection via checkbox mendukung bulk action (mis. bulk cetak resi, bulk approve).
- Klik baris (bukan checkbox) navigasi ke halaman detail (pola \`kembali-pertahankan-posisi\`).
- Untuk tabel dengan > 10 kolom, aktifkan kolom sticky pertama (mis. SKU) via preferensi tersendiri.
`;

export const standarScan = `## Standar Scan Autoflow

Modul gudang (Picking, Packing, Putaway) memakai komponen bersama **ScanAutoflowBar** agar alur scan seragam dan cepat.

### Alur scan standar

1. Buka halaman scan (mis. **Picking** \`/dashboard/proses-pesanan/picking/{id}\`).
2. Fokus otomatis ke input **ScanAutoflowBar** di header halaman.
3. Scan barcode SKU — sistem menambah **+1** ke qty tanpa dialog popup.
4. Jika target qty tercapai, sistem **auto-advance** ke SKU/rak berikutnya.
5. Ulangi sampai semua item selesai; footer menampilkan progres realtime.

### Fallback manual

- Bila barcode tidak terbaca, klik **Combobox** di sebelah input scan.
- Cari SKU via nama atau kode manual; pilih dari dropdown.
- Klik **+1** atau ketik qty spesifik untuk item bulk.
- Semua input manual dicatat di \`audit_logs\` dengan flag \`manual=true\`.

### Perilaku konsisten

- **Picking** — scan +1 hanya diterima jika SKU ada di rak yang sedang aktif; salah rak muncul toast \`Gagal scan\`.
- **Packing** — mendukung multi-order per sesi; scan berpindah antar order sesuai daftar aktif.
- **Putaway** — scan SKU dulu, lalu scan rak tujuan; hook \`useQtyBumpQueue\` menahan sinkronisasi ke BE agar tidak spam request.

> **JANGAN** membangun input scan ad-hoc di modul baru. Pakai \`ScanAutoflowBar\` agar konsistensi UX dan handling error tetap sama.

### Shortcut

- \`Esc\` untuk clear input scan.
- \`Tab\` untuk pindah ke combobox manual tanpa lepas keyboard.
`;

export const standarUserSelect = `## Standar UserSelect

Field pelaku (\`*_by\`, \`assigned_to\`, \`picker_id\`, \`packer_id\`) memakai komponen bersama **UserSelect** — bukan input teks bebas.

### Karakteristik UserSelect

1. Combobox dengan search yang memanggil API backend (\`?search=\`), bukan filter FE.
2. Filter tambahan berdasarkan **role** — pilihan hanya menampilkan user relevan (mis. picking hanya role **Picker**).
3. Shortcut **Saya sendiri** di header dropdown — 1 klik isi dengan user login.
4. Tampilkan avatar + nama + role sebagai visual disambiguation.

### Langkah penggunaan

1. Klik field pelaku pada form (mis. **Assign ke** di modal reassign task).
2. Ketik nama/username — hasil live-search muncul dari API.
3. Pilih user dari dropdown; nilai tersimpan sebagai \`user_id\`.
4. Untuk mengganti, klik ikon **X** di badge lalu pilih ulang.

### Batasan

- User **nonaktif** otomatis tersembunyi dari hasil search.
- Bila diperlukan multi-user (mis. approver), gunakan varian \`UserMultiSelect\` — tetap dari komponen shared.
- Field pelaku audit-log tidak boleh diedit setelah tersimpan; hanya field \`assigned_to\` yang mutable.

> **JANGAN** memakai \`Input\` teks bebas untuk field pelaku. Data yang tidak ter-relasi ke \`users.id\` akan gagal di join laporan dan menyulitkan audit.

### Catatan

- API search di-cache 30 detik untuk mempercepat modal yang sering dibuka.
- Untuk task lintas gudang, filter role dapat dinonaktifkan via prop \`allowCrossRole\` — gunakan sepakat dengan approver.
`;

export const standarPhone = `## Standar Nomor Telepon (E.164)

Semua field telepon/fax di aplikasi memakai **PhoneInput** dengan standar **E.164** untuk kompatibilitas kanal WhatsApp dan integrasi kurir.

### Cara kerja PhoneInput

1. Combobox negara di kiri input — daftar bersumber dari \`lib/country-codes.json\`.
2. Kode negara default **+62** (Indonesia); ubah via klik bendera.
3. Ketik nomor tanpa kode negara; format otomatis mengikuti aturan lokal (mis. \`0812-3456-7890\`).
4. Nilai disimpan di database dalam format E.164 tanpa spasi: \`+6281234567890\`.
5. Validasi: nomor tidak valid muncul error \`Format telepon tidak valid\`.

### Field yang wajib E.164

- \`user.phone\` — telepon user aplikasi.
- \`kontak_pelanggan.phone\`, \`kontak_pemasok.phone\` — kontak eksternal.
- \`company_profile.telepon\` — nomor perusahaan di dokumen.
- \`courier_phone\` di pickup — nomor driver kurir.

### Pengecualian

- \`shipping_phone\` yang datang dari **webhook channel** (Shopee/Tokopedia/Lazada/TikTok/WooCommerce) dikecualikan.
- Data tersebut disimpan **as-is** dari source of truth channel — konversi paksa E.164 dapat merusak reply-to logic channel.
- Bila ingin blast WA ke customer, gunakan field \`kontak_pelanggan.phone\` (terformat E.164) sebagai fallback.

> Perubahan nomor \`user.phone\` **tidak** otomatis memverifikasi ulang kanal WhatsApp. OTP baru dikirim saat toggle kanal WA di **Preferensi**.

### Catatan

- Helper \`lib/phone.ts\` menyediakan \`normalize\`, \`format\`, \`isValid\` — pakai helper ini, jangan regex manual.
- Country codes JSON di-lazy-load agar tidak membebani bundle awal.
`;

export const standarKembali = `## Standar Tombol Kembali & Breadcrumb

Navigasi kembali dari halaman detail ke list dirancang **URL-as-truth** agar posisi user (tab/search/filter/page/scroll) tetap terjaga.

### Cara kerja

1. Halaman list mengekspos state (search, filter, tab, page, sort) ke URL query string.
2. Saat klik baris → navigasi ke detail, URL detail menyimpan referrer parameter.
3. Klik tombol **Kembali** atau item breadcrumb → \`router.back()\` sebagai jalur utama.
4. Bila history browser tidak sesuai (mis. deep link), fallback ke URL list dengan query state tersimpan.

### Langkah operasional

1. Di list, terapkan filter/search yang diinginkan — perhatikan URL berubah.
2. Klik baris untuk masuk detail; scroll & tab detail tersimpan di sessionStorage.
3. Klik **Kembali** — list muncul dengan filter, page, scroll persis seperti sebelum masuk detail.
4. Untuk kembali ke root modul, klik item **paling kiri** di breadcrumb.

### Kasus khusus

- **Redirect setelah simpan** — halaman edit yang menyimpan lewat **FormFooter** kembali ke detail (bukan list) — konsistensi flow \`edit → detail → list\`.
- **Deep link dari notifikasi** — history kosong; **Kembali** langsung ke list default modul.
- **Multi-tab** — buka detail via klik tengah (\`Ctrl/Cmd + Click\`) untuk tab baru; **Kembali** di tab baru = close tab.

> **JANGAN** memakai \`router.push('/dashboard/<modul>')\` untuk tombol Kembali. Praktik itu menghilangkan filter user dan memaksa re-fetch dari awal.

### Catatan

- Scroll restoration mengandalkan sessionStorage kunci \`scroll:<pathname>\`; kunci di-clear saat modul berpindah.
- Untuk halaman baru, wrap layout dengan \`PreservePosition\` provider (tersedia di \`components/dashboard\`).
`;
