# Audit UX — cilupbah (FE + BE)

> Tanggal: 2026-07-02 · Fokus: **mudah dimengerti, gampang diingat, sedikit langkah.**
> Bukan audit teknis (lihat `AUDIT-FE.md` untuk itu) — ini soal friksi pengalaman pemakai gudang.
> Basis: pembacaan alur nyata FE (`src/components/dashboard/**`) + kendala BE (`Modules/**`).

Prinsip yang dipakai menilai:
1. **Jangan minta yang sistem sudah tahu** (nama operator, tanggal hari ini, bin default, qty sisa).
2. **Sedikit langkah** — gabungkan transisi status yang selalu berurutan.
3. **Konsisten** — pola sama di semua modul supaya sekali belajar, ingat selamanya.
4. **Keyboard/scanner-first** — operator gudang pakai scanner + tablet, bukan mouse.
5. **Ingat pilihan terakhir** — lokasi, ukuran label, printer.

Skala: 🔴 Tinggi (menyakitkan tiap hari) · 🟠 Sedang · 🟡 Rendah

---

## Ringkasan prioritas

| # | Masalah UX | Dampak | Effort |
|---|---|---|---|
| **P0** | Operator **mengetik namanya sendiri** di hampir setiap aksi (tidak ada user login yang dipakai) | 🔴 | Kecil–Sedang |
| **P0** | Alur multi-langkah yang selalu berurutan dipecah jadi banyak klik (retur, transfer, settlement) | 🔴 | Sedang |
| **P1** | Picking: kode rak **harus diketik dulu** sebelum scan berfungsi | 🔴 | Kecil |
| **P1** | State tab/filter/scroll hilang saat back — posisi kerja lenyap | 🟠 | Sedang |
| **P1** | Nilai yang bisa didefault masih diketik manual (tanggal, qty sisa, bin default) | 🟠 | Kecil |
| **P2** | Inkonsistensi pola (tabel, tombol, badge, dialog vs halaman) → susah diingat | 🟠 | Sedang |
| **P2** | Feedback kurang (loading freeze, empty state, pesan error tidak actionable) | 🟠 | Sedang |
| **P3** | Navigasi/IA: sidebar padat, aksi langka bercampur aksi umum | 🟡 | Sedang |
| **P3** | Ergonomi tablet/scanner: target sentuh, default thermal, angka pakai stepper | 🟡 | Kecil |

---

## P0 — "Ketik nama sendiri" di mana-mana (akar friksi terbesar)

**Bukti:** ~15 file komponen + 44 label meminta operator mengetik namanya sendiri:
`transfer-out-detail-view` (approved_by, shipped_by, cancelled_by), `sales-return-detail-view` & `retur-channel-tab` (processed_by di accept/reject/complete), `buat-penyesuaian-view` (created_by), `pindah-bin-view` (created_by), `penyesuaian-tab`/`opname-tab`/`opname-detail`/`penyesuaian-detail`, `transfer-masuk-tab`, `sales-return-form-page`, dll. Label: "Nama petugas", "Diproses oleh", "Disetujui oleh", "Dikirim oleh", "Dibatalkan oleh", "Dipindahkan oleh".

**Kenapa buruk:** setiap aksi = ketik ulang nama (rawan salah ketik, tidak bisa diaudit dengan benar, lambat). Padahal:
- BE **punya** endpoint user login (`/api/v1/profile`) — dulu dipanggil proxy.
- BE **sudah** memakai user login di sebagian tempat: `SalesReturnSettlementController` mengisi `created_by` dari email auth otomatis. Jadi kemampuannya ada, hanya tidak konsisten dipakai.

**Fix (disepakati):** ganti semua input teks nama dengan **Combobox pilih user yang difilter per ROLE**, sumbernya **API user terfilter/search** (server-side, Spatie) — bukan ketik bebas, bukan daftar statis.
- Pilihan user **sesuai role field-nya**, mis. `assigned_to (picking)` → role `picker`, `packer` → `packer`, `putaway` → `putaway`, `approved_by (transfer/adjustment)` → role penyetuju/supervisor, `processed_by (retur)` → staf gudang, `shipped_by`/`received_by` → staf gudang.
- Untuk field "siapa yang melakukan" (`processed_by`, `created_by`, `cancelled_by`): **default terpilih = user login** (dari `/profile`), tapi tetap bisa diganti ke orang yang benar lewat combobox role.
- Combobox pakai **search API** (ketik → fetch `/users?filter[role]=X&search=…`), konsisten dgn aturan [[feedback-search-api]] (search di picker wajib BE, bukan filter FE).
- Buat 1 komponen bersama `UserCombobox` (props: `role`, `value`, `onChange`) dipakai di semua flow — sekali belajar, konsisten.

**Building block sudah ada:** `useUsers({ "filter[role]": "putaway" })` dipakai di `buat-penempatan-manual-dialog` (putaway assign). Tinggal digeneralkan + tambah search param.
**Dampak:** hilangkan salah ketik nama, pilihan hanya orang yang valid untuk role itu, dan tetap cepat (default user login untuk aksi mandiri).

**✅ Status: SUDAH DIIMPLEMENTASIKAN.**
- `useMe()` (GET `/profile` → user + roles) + komponen bersama `UserSelect` (`components/dashboard/shared/user-select.tsx`): pencarian user via API (`useUsers` search + `filter[role]`), tombol **"Saya sendiri"** yang hanya muncul bila role user login cocok, dan `defaultToSelf` untuk auto-isi pelaku pada aksi mandiri.
- 14 file dimigrasi dari input teks nama → `UserSelect`: transfer (approved/shipped/cancelled), retur (processed ×3 + form), penyesuaian (created/approved), opname (start/finalize/counted), bin-transfer, transfer-masuk (received), purchase-return, retur-pembelian, transfer-keluar. Value tetap string nama → **tanpa perubahan BE**.
- `role` belum di-set (semua user, dapat dicari) — taxonomy role belum dikonfirmasi; tinggal isi `role="picker"/"putaway"/…` bila mau dipersempit. `tsc`/ESLint/`next build` bersih.

---

## P0 — Alur multi-langkah yang bisa dipangkas

Transisi status yang **selalu** berurutan tetap dipaksa jadi beberapa klik + beberapa isian nama.

- **Retur → uang kembali:** accept → (terima barang) → complete → buat settlement → tambah refund → confirm → complete. **≈6–7 langkah** untuk satu retur.
  *Fix:* aktifkan `auto_receive` sebagai default; sediakan tombol **"Terima & Selesaikan"** (accept+complete sekali) untuk retur yang barangnya sudah di tangan; settlement: gabung confirm+complete jadi satu bila hanya 1 refund.
- **Transfer keluar:** DRAFT → Approve (ketik approver) → Kirim (ketik shipper) → sisi masuk: Terima (ketik receiver). **3 transisi + 3 nama.**
  *Fix:* untuk transfer rutin, sediakan **"Setujui & Kirim"** satu klik; nama dari user login (P0). Approval terpisah hanya bila butuh QC.
- **Penyesuaian stok:** buat draft → approve. Untuk koreksi kecil (damage/loss) ini 2 langkah + 2 layar.
  *Fix:* tombol **"Simpan & Setujui"** untuk user berwenang; draft hanya bila perlu persetujuan atasan.
- **Opname:** buat → start → hitung → finalize — wajar untuk stock-take, tapi "start" bisa otomatis saat sesi dibuka.

**Prinsip:** default ke jalur tercepat, sisakan jalur bertingkat hanya untuk yang butuh kontrol.

---

## P1 — Picking: kode rak harus diketik sebelum scan

**Bukti:** `picking-detail-view.tsx` — scan SKU akan gagal dengan toast *"Isi kode rak untuk {sku} terlebih dahulu"* bila kolom bin belum diisi. Operator harus mengetik kode rak manual per baris sebelum scanner berguna.

**Kenapa buruk:** memaksa hafal/ketik kode rak, mematahkan alur scan-cepat yang baru kita satukan.

**✅ Status: DIIMPLEMENTASIKAN (keputusan user: rekomendasi rak di PDF, BUKAN di FE).**
Alur picking baru (`picking-detail-view.tsx`) — **scan-driven, keyboard hanya untuk qty**:
- **WAJIB scan rak** dulu (baca dari PDF) → "Rak aktif: X". Rak di FE kosong sampai discan (tanpa saran di layar).
- **Scan SKU** → **qty=1 auto-selesai** (nol keyboard); **qty>1** → input qty muncul ter-default = sisa, tekan **Enter**.
- **Feedback**: hijau/merah + **bunyi** (Web Audio, `lib/scan-feedback.ts`) + getar tiap scan (via `ScanAutoflowBar` prop `sound`). Bunyi disintesis, tanpa file.
- Input rak manual per baris dihapus; daftar item jadi read-only (progres) pakai `ui/table`.
- BE tanpa perubahan: `pickItem` sudah terima `bin_code` hasil scan + validasi stok per bin.
- Packing & putaway otomatis dapat **bunyi feedback**; penerapan qty=1-auto + scan-rak untuk keduanya = follow-up.

---

## P1 — State kerja hilang saat back/refresh

**Bukti:** sebagian halaman menyimpan tab/filter/halaman di `useState` lokal, bukan URL. `transaksi-stok` sudah pakai `useUrlTab` (baik), tapi `kontak-pelanggan` (tab `useState` lokal) dan beberapa tab lain belum. Filter & posisi scroll list umumnya hilang setelah masuk detail lalu back.

**Kenapa buruk:** operator memproses daftar panjang, buka satu item, kembali → filter/scroll reset → cari ulang dari awal.
**Fix:** simpan tab (`?tab=`), filter, dan halaman di URL (searchParams) di semua list; restore scroll saat back. (Selaras §5.4/§6.8 di `AUDIT-FE.md`.)

---

## P1 — Nilai yang bisa didefault masih diketik

- **Tanggal**: `buat-penyesuaian-view`, settlement refund pakai input `type=date` yang harus diisi — default sudah "hari ini" (baik), tapi masih terlihat sebagai field wajib. Sisanya banyak tanggal diketik manual.
- **Qty**: retur/adjustment/packing sering butuh ketik qty padahal defaultnya jelas = **qty sisa/qty pesanan**. Packing modal minta ketik qty; default = sisa yang belum dipack.
- **Bin/lokasi**: bin-transfer & putaway pilih bin dari nol tiap kali; tidak mengingat lokasi terakhir.
- **No. dokumen**: settlement minta ketik `refund_number` manual — bisa auto-generate (seperti return_number/adjustment_no yang sudah auto).

**Fix:** default qty = sisa (tinggal Enter); no. refund auto; ingat lokasi/gudang terakhir dipilih (localStorage) dan pra-pilih; tanggal default hari ini + jarang perlu diubah.

---

## P2 — Konsistensi (supaya gampang diingat)

Semakin seragam, semakin sedikit yang perlu dihafal. Temuan:
- **Tabel**: campuran `DataTable` bersama vs `<table>` mentah (mis. retur detail, settlement, picking pakai tabel mentah) → paginasi/sort/empty beda-beda. *Fix:* satukan ke `DataTable`/`ui/table`.
- **Tombol aksi sama, kata beda**: "Simpan" / "Tambah" / "Buat" / "Pindahkan" / "Selesaikan" untuk aksi serupa. *Fix:* kamus istilah tetap (mis. selalu "Simpan" untuk commit form, "Buat …" untuk create).
- **Surface**: `LiquidGlass` vs `Card` vs div polos beda kedalaman antar halaman. *Fix:* satu komponen `Surface`.
- **Status badge**: sebagian pakai `Badge`, sebagian span manual. *Fix:* `StatusBadge` + peta status→warna terpusat (`lib/status.ts`).
- **Dialog vs halaman**: sudah diperbaiki (form berat → halaman), pertahankan aturan itu; dialog hanya konfirmasi ringan.

**✅ Status: SEBAGIAN BESAR DIIMPLEMENTASIKAN.**
- **Status badge → terpusat:** `lib/status.ts` (registry `domain → status → {label, variant}`) + `StatusBadge` (`components/dashboard/shared/status-badge.tsx`). ~28 komponen dimigrasi, peta status lokal dihapus. (Dikecualikan sengaja: `channel-badge` (badge sumber, bukan status), `stores-table` (dot warna khusus), listing-sync badge dgn tooltip.)
- **Surface:** komponen `Surface` (`components/ui/surface.tsx`) sebagai pembungkus kartu kanonik (default LiquidGlass). Pakai untuk kode baru; adopsi penuh (ganti `Card`/div ad-hoc lama) bertahap.
- **Tabel → `ui/table`:** 11 tabel display disatukan ke primitives `ui/table` (purchase-return/transfer-out/penerimaan detail, stock-position detail, user login-history, zona, master-produk komposisi/variant, retur detail, settlement ×2). Tabel interaktif (scan picking/packing, editor varian) sengaja tetap.
- **Kamus istilah tombol:** `UI-CONVENTIONS.md` (glossary + tabel "pakai komponen mana"). Fix contoh: "Tambah Pengiriman Baru" → "Buat Pengiriman" (samakan dgn dialog sebelah).
- Verifikasi: `tsc` bersih, `next build` **0 error/0 warning**.
- Sisa (follow-up): normalisasi label tombol menyeluruh (mis. "Tambah Produk/Kategori" → "Buat …" bila membuat entitas baru), adopsi `Surface` di file lama, tabel interaktif tetap dibiarkan.

---

## P2 — Feedback kurang jelas

- **Loading**: sebagian pakai skeleton (baik), sebagian spinner, sebagian freeze saat transisi. *Fix:* skeleton konsisten + `loading.tsx` per route (baru 32/79 route).
- **Empty state**: ada yang informatif, ada yang kosong tanpa arahan. *Fix:* empty state + CTA ("Belum ada X — Buat X").
- **Error**: sebagian toast generik ("Gagal …") tanpa langkah. *Fix:* pesan actionable ("Stok bin asal kurang, tersedia N") — BE sebagian sudah begini, samakan.
- **Optimistic**: aksi cepat (pick +1, pack) sebaiknya update UI instan (sebagian sudah), sisanya menunggu round-trip.

---

## P3 — Navigasi & IA

- Sidebar padat (±34 link). *Fix:* kelompokkan per peran (Gudang / Penjualan / Master / Pengaturan), sembunyikan yang jarang; tandai aksi destruktif terpisah.
- Aksi langka (hapus/batalkan) kadang sederajat dengan aksi umum → risiko salah klik. *Fix:* pisahkan ke menu "⋯" atau beri jarak/warna.
- Breadcrumb sudah ada dan konsisten (baik).

---

## P3 — Ergonomi tablet/scanner (aplikasi gudang)

- **Scan autoflow** sudah bagus (scanner + combobox manual + auto-advance) — jadikan standar semua input pilih-item.
- Target sentuh kecil (icon-sm button) untuk tablet. *Fix:* mode "gudang" dengan tombol lebih besar.
- **Cetak label**: default ukuran/format per channel sudah ada (TikTok/Shopee) — ingat pilihan terakhir per printer/user.
- Angka pakai stepper +/- untuk qty (lebih cepat dari keyboard di tablet).

---

## Rekomendasi urutan eksekusi

1. **P0 — user login untuk semua `*_by`** (BE derive dari auth + hapus input FE). Sekali kerja, menghapus 40+ isian dari alur harian. **Dampak terbesar, effort kecil.**
2. **P0 — tombol gabungan** untuk transisi yang selalu berurutan (Setujui & Kirim, Terima & Selesaikan, Simpan & Setujui).
3. **P1 — picking tanpa ketik rak** (default bin dari BE / scan bin).
4. **P1 — state di URL + default qty/tanggal/no-dokumen/lokasi terakhir.**
5. **P2 — konsistensi** (tabel, istilah tombol, StatusBadge, Surface) + feedback.
6. **P3 — IA sidebar & mode tablet.**

> Catatan: banyak fix P2 beririsan dengan `AUDIT-FE.md` (§4.2 ResourceListView, §5 design-system, §1.2 prefetch). Mengerjakan keduanya bersama lebih hemat.
