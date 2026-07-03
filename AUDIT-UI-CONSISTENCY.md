# Audit Inkonsistensi Penggunaan UI — cilupbah-fe

> Tanggal audit: 2026-07-03
> Cakupan: `src/components` dan `src/app` (dashboard web). Mobile di luar scope.
> Metode: scan statis terhadap pola pemakaian komponen UI, format helper, dan konvensi bersama.

## Ringkasan

| # | Temuan | Prioritas | Skala |
|---|--------|-----------|-------|
| 1 | ~~Raw `<table>` bypass ui/table & data-table~~ ✅ selesai 2026-07-03 | Tinggi | 14 file |
| 2 | ~~Dua dialog berbeda untuk aksi "buat pengiriman"~~ ✅ selesai 2026-07-03 | Tinggi | 2 file duplikat |
| 3 | ~~`window.confirm` vs `ConfirmDialog`~~ ✅ selesai 2026-07-03 | Tinggi | 3 titik |
| 4 | ~~Search picker masih FE-side filtering~~ ✅ selesai 2026-07-03 | Tinggi | 11 file |
| 5 | Form data-heavy di dalam dialog | Tinggi | 6+ dialog |
| 6 | ~~Format tanggal 3 pendekatan paralel~~ ✅ selesai 2026-07-03 | Menengah | 10+ file |
| 7 | Format uang inline `Intl.NumberFormat` | Menengah | 4 file |
| 8 | Status pill ad-hoc bypass `StatusBadge` | Menengah | ~15 file |
| 9 | Loading state tanpa standar | Menengah | codebase-wide |
| 10 | Raw `<button>` / `<input>` | Menengah | 68 / 11 file |
| 11 | Dead code `UserCombobox` | Kecil | 1 file |
| 12 | Empty state wording tidak seragam | Kecil | codebase-wide |
| 13 | Adopsi komponen shared timpang | Kecil | — |

---

## Prioritas Tinggi

### 1. Tabel: 3 cara berbeda dalam satu codebase — ✅ SELESAI (2026-07-03)

> Semua 14 file telah dimigrasi ke `ui/table` (Table/TableHeader/TableBody/TableRow/TableHead/TableCell). Verifikasi: `tsc` bersih, ESLint tidak ada isu baru, `grep '<table'` = 0 hasil.

Standar yang berlaku: tabel dibangun dengan primitif `ui/table` atau `ui/data-table`.

- 41 file pakai `ui/data-table` ✅
- 25 file pakai primitif `ui/table` ✅
- **14 file masih render raw `<table>`** ❌

File pelanggar:

| File | Lokasi |
|------|--------|
| `components/dashboard/persediaan/posisi-stok-view.tsx` | L417 |
| `components/dashboard/integrasi-channel/stores-table.tsx` | L71 |
| `components/dashboard/proses-pesanan/packing/packing-proses-view.tsx` | L543 |
| `components/dashboard/proses-pesanan/packing/packing-detail-view.tsx` | — |
| `components/dashboard/proses-pesanan/picking/ad-hoc-picking-view.tsx` | — |
| `components/dashboard/proses-pesanan/picking/picking-proses-view.tsx` | — |
| `components/dashboard/proses-pesanan/picking/bulk-buat-picklist-confirm-dialog.tsx` | — |
| `components/dashboard/transaksi-stok/buat-penyesuaian-view.tsx` | — |
| `components/dashboard/transaksi-stok/pindah-bin-view.tsx` | — |
| `components/dashboard/transaksi-stok/pindah-bin-detail-view.tsx` | — |
| `components/dashboard/transaksi-stok/import-penyesuaian-view.tsx` | — |
| `components/dashboard/master-produk/detail/tab-variasi.tsx` | — |
| `components/dashboard/master-produk/buat/form-variant-section.tsx` | — |
| `components/dashboard/manajemen-rak/lokasi/layout-gudang-tab.tsx` | — |

**Rekomendasi:** migrasi ke `ui/table` (untuk tabel statis/inline) atau `ui/data-table` (untuk list dengan sorting/pagination).

### 2. Duplikasi dialog "Buat Pengiriman" — ✅ SELESAI (2026-07-03)

> Digabung menjadi satu `BuatPengirimanDialog` (`shipping/buat-pengiriman-dialog.tsx`) dengan dua mode: mode pesanan (orderIds terpilih, marketplace-aware) dan mode standalone (no. pengiriman + picker lokasi + tanggal-jam). `tambah-pengiriman-dialog.tsx` dihapus; `proses-pesanan-view.tsx` diarahkan ke dialog gabungan. UX kini seragam (judul, footer Batal + Buat Pengiriman, field catatan). Bonus: `useLocations` dapat param `enabled`, dan reset state pindah dari `useEffect` ke remount natural konten dialog (lolos rule `react-hooks/set-state-in-effect`). Verifikasi: `tsc` bersih, ESLint bersih.

Dua implementasi hampir identik untuk aksi yang sama, dua-duanya masih hidup:

- `components/dashboard/proses-pesanan/shipping/buat-pengiriman-dialog.tsx` (8.4K, 33 elemen form) — dipakai `shared/fulfillment-orders-table.tsx`
- `components/dashboard/proses-pesanan/shipping/tambah-pengiriman-dialog.tsx` (6.6K, 33 elemen form) — dipakai `proses-pesanan-view.tsx`

Dampak: user mendapat UX berbeda untuk aksi yang sama tergantung entry point-nya. Perubahan/bugfix harus dilakukan dua kali dan mudah lolos di salah satunya.

**Rekomendasi:** pilih satu implementasi, arahkan kedua pemanggil ke sana, hapus sisanya.

### 3. Konfirmasi destruktif: `window.confirm` vs `ConfirmDialog` — ✅ SELESAI (2026-07-03)

> Ketiga titik dimigrasi ke `ConfirmDialog` (variant destructive, loading dari mutation isPending). Verifikasi: `grep window.confirm` = 0 hasil, `tsc` bersih, ESLint bersih.

39 file sudah pakai `ui/confirm-dialog`, tapi 3 titik masih pakai dialog native browser:

- `components/dashboard/proses-pesanan/shipping/shipment-detail-view.tsx:128`
- `components/dashboard/proses-pesanan/shipping/shipment-table.tsx:111` — "Batalkan pengiriman …?"
- `components/dashboard/master-produk/detail/tab-variasi.tsx:144` — "Hapus … varian terpilih?"

**Rekomendasi:** ganti ketiganya ke `ConfirmDialog`.

### 4. Search di picker masih FE-side filtering — ✅ SELESAI (2026-07-03)

> Hasil audit per file (setelah verifikasi sumber data + BE):
>
> **Diperbaiki:**
> - **BE `cilupbah-be`** — `CategoryRepository.getAll()`: `/categories?all=1&search=` sebelumnya rusak diam-diam (search hanya mencari kategori ROOT karena `whereNull('parent_id')` selalu diterapkan; macro `allowedSearch` full-text juga tidak cocok untuk typeahead). Kini `search` pakai `ilike` substring di SEMUA level (konsisten dgn `getMappingList`), tanpa constraint root. Ini sekaligus memperbaiki picker induk di `tambah-kategori-dialog` yang sudah bergantung pada endpoint ini. 32 test Category lolos.
> - `master-produk/buat/category-picker.tsx` — search kini via `useSearchKategori` (debounce 300ms, min 2 char); hasil BE dipetakan ke path via tree lokal.
> - `kategori-merek/kategori-list-tab.tsx` — search via `useSearchKategori`; hasil dipetakan ke `fullPath` dari tree lokal; plus perbaikan pola `useRef`-during-render → state (lolos rule `react-hooks/refs`).
>
> **Pengecualian sah (dataset lengkap di client, non-paginated):**
> - `petakan-kategori-dialog.tsx` — tree kategori channel wajib dimuat utuh untuk navigasi kolom + pemetaan `external_id`; BE channel categories tidak punya search.
> - `import-system-dialog.tsx` — tree sistem dimuat utuh untuk import checkbox + perbandingan `enabledIds`.
> - `form-specification-section.tsx`, `atribut-variasi-view.tsx` — daftar atribut per kategori, payload lengkap & kecil.
> - `download-satuan-dialog.tsx`, `download-massal-dialog.tsx` — `useConnectedStores` non-paginated, daftar toko kecil.
> - `zona-tab.tsx` — zones (`listByLocation` non-paginated) & bins (dari detail lokasi, utuh).
> - `layout-gudang-tab.tsx` — serverMode SUDAH mengirim `search` ke API (`BinListParams.search`); filter FE hanya untuk mode draf lokal (bins belum tersimpan).
> - `fulfillment-filter-bar.tsx` L180 — false positive: itu logika exclude "transit", bukan search picker.

Aturan: search di picker/combobox harus lewat API backend (Spatie query), bukan filter `toLowerCase().includes()` di FE. 11 file melanggar:

- `components/dashboard/master-produk/buat/category-picker.tsx`
- `components/dashboard/master-produk/buat/form-specification-section.tsx`
- `components/dashboard/master-produk/download/download-satuan-dialog.tsx`
- `components/dashboard/master-produk/download/download-massal-dialog.tsx`
- `components/dashboard/kategori-merek/petakan-kategori-dialog.tsx`
- `components/dashboard/kategori-merek/import-system-dialog.tsx`
- `components/dashboard/kategori-merek/kategori-list-tab.tsx`
- `components/dashboard/kategori-merek/atribut-variasi-view.tsx`
- `components/dashboard/proses-pesanan/shared/fulfillment-filter-bar.tsx`
- `components/dashboard/manajemen-rak/lokasi/zona-tab.tsx`
- `components/dashboard/manajemen-rak/lokasi/layout-gudang-tab.tsx`

Catatan: filter FE hanya sah kalau dataset memang sudah lengkap di client dan kecil (mis. filter tab lokal). Untuk picker yang datanya paginated dari API, wajib search param ke BE.

### 5. Form data-heavy di dalam dialog

Aturan: form data-heavy pakai halaman tersendiri; dialog hanya untuk konfirmasi ringan. Dialog dengan muatan form terbesar:

| Dialog | Elemen form |
|--------|-------------|
| `manajemen-rak/lokasi/layout-gudang-tab.tsx` | 69 |
| `pesanan/order-card.tsx` | 34 |
| `shipping/buat-pengiriman-dialog.tsx` | 33 |
| ~~`shipping/tambah-pengiriman-dialog.tsx`~~ (dihapus, digabung ke buat-pengiriman-dialog) | 33 |
| `transaksi-pembelian/product-picker-dialog.tsx` | 21 |
| `master-produk/upload/draft-tab.tsx` | 21 |

**Rekomendasi:** evaluasi kandidat di atas untuk dipindah ke halaman tersendiri (product picker boleh tetap dialog karena sifatnya pemilihan, bukan entry data).

---

## Prioritas Menengah

### 6. Format tanggal: 3 pendekatan paralel — ✅ SELESAI (2026-07-03)

> 19 file dimigrasi ke helper `lib/format.ts` (`formatDate`/`formatDateLong`/`formatDateTime`): 10 file inline `toLocaleDateString` dari daftar audit + laporan-retur-view, tab-riwayat, progress-columns, hasil-tab (upload), monitor-kronologi-table, `lib/proses-pesanan/print.ts`, dan 3 file display `date-fns` (stock-position-detail-view, order-detail-view, order-card). Semua helper lokal duplikat dihapus.
>
> Pemakaian `date-fns` yang TETAP (bukan display): payload/param API `yyyy-MM-dd` (pesanan-list-view, terima-po-view, progress-tab, hasil-tab, order-filters, buat-pengiriman-dialog) dan `ui/date-picker` internal. Pengecualian display yang disengaja: `order-card.tsx` L611 deadline `dd MMM HH:mm` (kompak tanpa tahun untuk chip batas kirim).
>
> Verifikasi: `grep toLocaleDateString` = 0 hasil, `tsc` bersih, ESLint tanpa isu baru (4 error yang tersisa terverifikasi pre-existing di HEAD: purity `Date.now()` order-card, `any` tab-riwayat, set-state-in-effect fulfillment-orders-table ×2).

`lib/format.ts` sudah menyediakan `formatDate`, `formatDateLong`, `formatDateTime`, `formatDateTimeFull` — tapi hanya 28 file yang mengimpornya. Sisanya:

- **Inline `toLocaleDateString("id-ID")`** (10+ file): `transaksi-pembelian/pesanan-detail-view.tsx`, `barang-masuk/penerimaan-detail-view.tsx`, `laporan/hpp-report-view.tsx`, `proses-pesanan/shared/fulfillment-orders-table.tsx`, `shipping/shipment-table.tsx`, `kontak-pelanggan/pelanggan-detail-view.tsx`, `master-produk/naikkan/naikkan-aktivitas-columns.tsx`, `master-produk/import/import-view.tsx`, `monitor-stok/monitor-analytics-table.tsx`, `monitor-stok/monitor-sync-failed-table.tsx`
- **`date-fns` langsung** (9 file)

Dampak: format tampilan tanggal bisa berbeda antar halaman untuk data yang sama.

**Rekomendasi:** standarkan ke helper `lib/format.ts`; kalau butuh format baru, tambahkan di sana.

### 7. Format uang inline

`formatCurrency` ada di `lib/format.ts:75`, tapi 4 file masih membuat `new Intl.NumberFormat` sendiri:

- `components/dashboard/laporan/hpp-report-view.tsx`
- `components/dashboard/master-produk/product-columns.tsx`
- `components/dashboard/master-produk/detail/tab-variasi.tsx`
- `components/dashboard/master-produk/detail/variant-table.tsx`

### 8. Status pill ad-hoc bypass `StatusBadge`

Standar: `components/dashboard/shared/status-badge.tsx` (berbasis `lib/status` `getStatusMeta`) — sudah dipakai 36 file. Tapi ~15 file masih membuat pill `rounded-full` manual, antara lain:

- `barang-keluar/transfer-out-detail-view.tsx`
- `barang-masuk/retur-channel-tab.tsx`
- `proses-pesanan/picking/ad-hoc-picking-view.tsx`, `picking-proses-view.tsx`
- `proses-pesanan/shipping/buat-pengiriman-dialog.tsx`
- `master-produk/naikkan/naikkan-produk-columns.tsx`, `naikkan-store-columns.tsx`, `naikkan-aktivitas-columns.tsx`
- `master-produk/download/download-satuan-dialog.tsx`
- `monitor-stok/monitor-stok-view.tsx`
- `pesanan/order-detail-view.tsx`

Plus 2 file hardcode warna status langsung (`bg-emerald-100` dll): `kontak-pemasok/import-pemasok-view.tsx`, `master-produk/download/progress-columns.tsx`.

Dampak: warna/label untuk status yang sama bisa berbeda antar modul.

**Rekomendasi:** daftarkan status yang belum ada ke `lib/status`, lalu pakai `StatusBadge`. (Pengecualian sah: `channel-badge.tsx`, `sub-status-pills.tsx`, `shared/pill-tabs.tsx` — komponen bertujuan khusus.)

### 9. Loading state tanpa standar

Campuran bebas tanpa konvensi kapan pakai yang mana:

- `Skeleton` — 88 file
- `Loader2` (lucide) — 70 file
- `animate-spin` manual — 90 file
- Teks "Memuat..." polos — 5 titik

`ui/page-skeleton.tsx` sudah tersedia tapi adopsinya tidak merata.

**Rekomendasi konvensi:** initial load halaman/tabel → `Skeleton`/`PageSkeleton`; aksi tombol (submit/mutasi) → `Loader2` di dalam tombol; hapus teks "Memuat..." polos.

### 10. Raw `<button>` dan `<input>`

- **68 file** mengandung `<button>` mentah. Sebagian sah (icon button di cell, row-click target), tapi banyak yang semestinya `ui/button` — contoh: `kategori-merek/kategori-view.tsx`, `kontak-pemasok/kontak-form-page.tsx`, `pengaturan/pengguna/user-form-page.tsx`, `kategori-merek/tambah-kategori-dialog.tsx`.
- **11 file** pakai `<input>` mentah. Hidden file-input untuk upload itu sah (`media-uploader.tsx` dll), tapi `kategori-merek/tambah-kategori-dialog.tsx` dan `edit-kategori-dialog.tsx` pakai raw input untuk field teks biasa.

**Rekomendasi:** sapu bertahap saat menyentuh file terkait; prioritaskan input teks di dialog kategori.

---

## Prioritas Kecil

### 11. Dead code: `UserCombobox`

`components/dashboard/shared/user-combobox.tsx` (0 pemakaian) adalah duplikat `shared/user-select.tsx` (14 pemakaian, standar untuk field pelaku). **Hapus.**

### 12. Empty state wording

Tidak ada komponen `EmptyState` bersama; wording campuran:

- "Belum ada …" — 78×
- "Tidak ditemukan" — 6×
- "Tidak ada data" — 1×

**Rekomendasi:** standarkan wording ("Belum ada …" untuk data kosong, "Tidak ditemukan" untuk hasil search kosong) dan pertimbangkan komponen `EmptyState` bersama.

### 13. Adopsi komponen shared timpang

| Komponen shared | Pemakaian |
|-----------------|-----------|
| `StatusBadge` | 36 |
| `FilterToolbar` | 23 |
| `SimplePagination` | 17 |
| `UserSelect` | 14 |
| `ResourceListView` | 5 |
| `ScanAutoflowBar` | 3 |
| `PillTabs` | 2 |
| `UserCombobox` | 0 (dead) |

`ResourceListView` dan `PillTabs` kurang teradopsi — banyak view membangun pola yang sama secara manual.

---

## Urutan Eksekusi yang Disarankan

1. Hapus salah satu dialog pengiriman (temuan #2) + hapus `UserCombobox` (#11) — cepat, dampak jelas.
2. Ganti 3 `window.confirm` → `ConfirmDialog` (#3).
3. Sapu format tanggal & uang ke `lib/format.ts` (#6, #7).
4. Migrasi 14 raw `<table>` → `ui/table`/`ui/data-table` (#1) — per modul.
5. Migrasi status pill ad-hoc → `StatusBadge` + `lib/status` (#8).
6. Ubah search picker ke API (#4) — butuh koordinasi BE untuk endpoint yang belum support search param.
7. Evaluasi dialog form berat → halaman (#5) — per kasus, perubahan UX terbesar.
