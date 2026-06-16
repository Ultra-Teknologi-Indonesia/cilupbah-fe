# Plan — Redesign Halaman Detail Produk (Tabbed + Paginasi Per-Tab)

Tujuan: detail produk bergaya Jubelio — **header ringkas** + **tab** yang tiap tab
**memuat datanya sendiri (lazy) lewat endpoint terpisah & berpaginasi**. Hindari memuat
ratusan varian dalam satu payload detail. Perbaiki UI/UX. Pastikan BE mendukung.

## Tipe produk → tab pertama berbeda
- **Satuan / Varian** → tab **Variasi** (tabel varian).
- **Bundle** → tab **Komposisi** (SKU + komponen penyusun).
- Tab umum (semua tipe): **Channel · Harga Channel · Buku Harga · Riwayat Upload**.

(`product_type` & `total_variants` sudah ada di `ProductResource`.)

---

## 0. Kondisi saat ini (audit)

| Hal | Status |
|---|---|
| `GET /products/{id}` | mengembalikan **semua** varian inline (210 varian → payload berat) |
| Halaman detail FE | `detail/product-detail-view.tsx` + sub-komponen — **belum tab**, belum lazy/paginasi |
| Riwayat Upload | `GET /upload-histories?product_id=` **ADA** (paginated) |
| Endpoint varian per-produk (paginated) | ❌ belum (varian masih inline di detail) |
| Komposisi bundle per-produk | ❌ belum (data `product_bundle_items` ada) |
| Channel per varian (listing) | ❌ belum endpoint khusus |
| Harga Channel (matriks) | ❌ belum endpoint khusus |
| Buku Harga (grosir) | ❌ belum (`product_wholesale_prices` ada) |

---

## A. BE — endpoint per-tab berpaginasi (prasyarat FE)

Semua di bawah `auth:sanctum`, paginasi seragam (`?page=&per_page=`, balas `data`+`meta`).

1. **Ringkas detail** — `GET /products/{id}` **tanpa** varian inline (atau opsi
   `?with=summary`): hanya header (nama, gambar, harga range, merek, kategori, deskripsi,
   `product_type`, `total_variants`, flags). Varian pindah ke endpoint #2. (Hindari regresi:
   buat varian inline opt-in via query, default tetap utk kompatibilitas, lalu FE pindah.)
2. **Variasi** — `GET /products/{id}/variants?page=` → varian (sku, options/badges, barcode,
   sell_price, is_active, stock) berpaginasi + `?search=` opsional.
3. **Komposisi** — `GET /products/{id}/composition?page=` → baris bundle (SKU induk) + komponen
   (`product_bundle_items`: item_code, nama, qty, thumbnail). Hanya untuk `is_bundle`.
4. **Channel (listing)** — `GET /products/{id}/channel-listings?page=&channel=` → per varian:
   daftar toko/channel tempat listing aktif (logo, nama toko, status). Dari
   `product_channel_mappings`/`product_variant_channel_mappings`.
5. **Harga Channel (matriks)** — `GET /products/{id}/channel-prices?page=&channel=` → baris varian
   × kolom channel/toko (harga internal + override per toko). Dari `override_price`.
6. **Buku Harga** — `GET /products/{id}/price-book?page=` → grosir per varian
   (`product_wholesale_prices`: min_qty, price, customer_type).
7. **Riwayat Upload** — pakai yang ADA: `GET /upload-histories?product_id={id}&page=`.

Resource & controller baru: `ProductVariantPageController`, `ProductCompositionController`,
`ProductChannelListingController`, `ProductChannelPriceController`, `ProductPriceBookController`
(atau gabung di `ProductController` sebagai method `variants/composition/...`). Tiap pakai
Spatie pagination + Resource ringkas (jangan over-load relasi).

**Test BE per endpoint**: struktur + paginasi + filter + 404 produk tak ada + (komposisi) 422
bila bukan bundle.

---

## B. FE — kerangka tab + lazy paginasi

### B1. Shell & header
- `app/dashboard/master-produk/[id]/page.tsx` → `ProductDetailView` baru.
- **Header** (komponen `detail/detail-header.tsx`): galeri gambar (thumbnail + utama),
  harga (range), Merek, Kategori, badge **tipe produk** (Satuan/Varian/Bundle), Deskripsi
  dgn **"Lihat Selengkapnya"** (clamp + expand), tombol **Edit** + menu **⋯** (arsip/restore/
  hapus) + **✕** (kembali). Breadcrumb: Katalog › Produk › Master › Detail › {tab}.
- **Tabs** (`detail/detail-tabs.tsx`): set tab dinamis dari `product_type`
  (Variasi|Komposisi, Channel, Harga Channel, Buku Harga, Riwayat Upload). Tab sinkron ke URL
  (`?tab=`) agar bisa di-share & breadcrumb mengikuti.

### B2. Pola data per-tab (INTI: beda endpoint + paginasi sendiri)
- Tiap tab = **hook React Query sendiri** dgn **page state sendiri**, `enabled: activeTab===id`
  (lazy — hanya fetch saat tab dibuka), `keepPreviousData` agar paginasi mulus.
- Komponen paginasi seragam `DataTablePagination` (sudah ada) + "Baris per halaman".
- Service per tab di `services/master-produk/product-detail-tabs.service.ts`; hooks di
  `hooks/master-produk/use-product-tabs.ts`.
- Skeleton + empty-state + error-state per tab (Riwayat Upload menampilkan pesan error sync —
  render rapi sebagai badge merah + tooltip pesan).

### B3. Komponen tiap tab
- `tab-variasi.tsx` — tabel varian (thumbnail, nama, sku, **badge opsi** Warna/Ukuran, barcode,
  harga, aksi ⋯/hapus). Paginasi.
- `tab-komposisi.tsx` — kartu SKU bundle + daftar komponen (thumbnail, nama, kode, qty).
- `tab-channel.tsx` — per varian: chip toko/channel (pakai `ChannelLogo` yg sudah ada) +
  "+N toko lainnya" (popover daftar). Filter channel (dropdown).
- `tab-harga-channel.tsx` — matriks: kolom sticky "Produk" + kolom per toko; scroll horizontal
  dgn indikator. Filter channel.
- `tab-buku-harga.tsx` — grosir per varian (min qty → harga, tipe pelanggan).
- `tab-riwayat-upload.tsx` — Aktivitas/Tanggal/Channel/Keterangan + status sukses/gagal.

---

## C. Perbaikan UI/UX (target)
- **Konsistensi**: primary biru, kartu liquid-glass, radius & spacing seragam, font SF.
- **Header lengket** (sticky) saat scroll tab panjang; tab bar sticky di bawah header.
- **Badge opsi varian** berwarna lembut (Warna/Ukuran) — bukan teks polos.
- **Skeleton** per tab + **empty state** beraset (mis. "Belum ada listing channel").
- **Error sync** (Riwayat Upload) → badge merah + pesan ringkas + tooltip teks penuh
  (mis. "duplicate key… ", "Cannot read properties of undefined").
- **Affordance scroll** pada matriks Harga Channel (gradient kanan + hint geser).
- **Paginasi** seragam + "Baris per halaman" + lompat ke halaman (utk 210 baris).
- **Aksesibilitas**: fokus keyboard pada tab, `aria-selected`, kontras cukup.
- **URL state**: `?tab=` + `?page=` per tab (share/back konsisten).

---

## Urutan & dependensi
```
A (BE endpoints) ─► B1 (shell+header) ─► B2 (pola data) ─► B3 (tab satu per satu) ─► C (polish)
```
- Mulai BE #2 (Variasi) + #7 (Riwayat sudah ada) → FE bisa jalan paling cepat.
- Tab Komposisi bergantung data bundle (selaras BUNDLE_PRODUCT_PLAN B0/B1).
- Tiap endpoint+tab: implement → test (BE) / tsc+build (FE) → commit → push.

## Catatan
- **Jangan** memuat 210 varian di `GET /products/{id}` — itu sumber lambat; pindahkan ke
  endpoint Variasi berpaginasi (poin A#1/#2).
- Tab dipilih dari `product_type` (sudah diekspos BE): bundle→Komposisi, lainnya→Variasi.
