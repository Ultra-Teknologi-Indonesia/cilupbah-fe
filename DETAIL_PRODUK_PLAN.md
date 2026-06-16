# Plan — Redesign Halaman Detail Produk (Tabbed + Paginasi Per-Tab)

Tujuan: detail produk bergaya Jubelio — **header ringkas** + **tab** yang tiap tab
**memuat datanya sendiri (lazy) lewat endpoint terpisah & berpaginasi**. Hindari memuat
ratusan varian dalam satu payload detail. **Fokus utama: UX** (lihat bagian C "UX Hardening").
Estetika **liquid glass dipertahankan** — dengan disiplin keterbacaan data.

## Tipe produk → tab pertama berbeda
- **Satuan / Varian** → tab **Variasi** (tabel varian).
- **Bundle** → tab **Komposisi** (SKU + komponen penyusun).
- Tab umum (semua tipe): **Channel · Harga Channel · Buku Harga · Riwayat Upload**.

(`product_type`, `total_variants`, `bundle_components` sudah ada di `ProductResource`.)

---

## 0. Kondisi saat ini (audit)

| Hal | Status |
|---|---|
| `GET /products/{id}` | mengembalikan **semua** varian inline (210 varian → payload berat) |
| Halaman detail FE | `detail/product-detail-view.tsx` + sub-komponen — **belum tab**, belum lazy/paginasi |
| Riwayat Upload | `GET /upload-histories?product_id=` **ADA** (paginated) |
| Komposisi bundle | `bundle_components` **ADA** di detail (B0/B1) — untuk volume kecil cukup inline |
| Endpoint varian per-produk (paginated) | ❌ belum (varian masih inline di detail) |
| Channel/Harga Channel per varian | ❌ belum endpoint khusus |
| Buku Harga (grosir) | ❌ belum (`product_wholesale_prices` ada) |

---

## A. BE — endpoint per-tab berpaginasi (prasyarat FE)

Semua di bawah `auth:sanctum`, paginasi seragam (`?page=&per_page=`, balas `data`+`meta`).
**Tiap endpoint daftar WAJIB dukung `?search=` & `?sort=`** (sortable kolom) sejak awal —
bukan opsional (210 baris tidak bisa di-scan manual).

1. **Ringkas detail** — `GET /products/{id}` **tanpa** varian inline (varian opt-in via
   `?with=variants` utk kompatibilitas, default ringkas): header + `product_type`,
   `total_variants`, `bundle_components` (kecil), flags. Varian pindah ke #2.
2. **Variasi** — `GET /products/{id}/variants?page=&search=&sort=` → varian (sku, options/badges,
   barcode, sell_price, is_active, **stok turunan**). `sort` ∈ {sku, sell_price, stock, -…}.
   Dukung **bulk**: `POST /products/{id}/variants/bulk` (aktif/nonaktif/hapus by ids) + ekspor CSV.
3. **Komposisi** — dari `bundle_components` (inline, kecil) atau
   `GET /products/{id}/composition?page=` bila perlu paginasi. Hanya `is_bundle`.
4. **Channel (listing)** — `GET /products/{id}/channel-listings?page=&channel=` → per varian:
   toko/channel tempat listing **aktif** (logo, nama toko, status). Default **hanya yang listing**.
5. **Harga Channel** — `GET /products/{id}/channel-prices?page=&channel=&listed_only=1` → harga
   internal + override per toko. **Default `listed_only`** (hanya toko tempat varian benar-benar
   dijual) agar matriks tidak meledak jadi 25 kolom.
6. **Buku Harga** — `GET /products/{id}/price-book?page=` → grosir (`product_wholesale_prices`).
7. **Riwayat Upload** — pakai yang ADA: `GET /upload-histories?product_id={id}&page=` +
   aksi **re-upload** per baris error (endpoint reupload sudah ada).

Resource ringkas (jangan over-load relasi) + Spatie pagination. Sertakan `meta.total`
agar FE bisa tampilkan jumlah ("210 varian").

**Test BE per endpoint**: struktur + paginasi + **sort + search** + filter + 404 + (komposisi/harga)
422 bila bukan bundle / tak listing.

---

## B. FE — kerangka tab + lazy paginasi

### B1. Shell & header (liquid glass)
- `app/dashboard/master-produk/[id]/page.tsx` → `ProductDetailView` baru.
- **Header** (`detail/detail-header.tsx`): galeri (thumbnail+utama), harga range, Merek,
  Kategori, **badge tipe produk** (Satuan/Varian/Bundle), Deskripsi **clamp + "Lihat
  Selengkapnya"** (expand keyboard-accessible, animasi). Aksi: **Edit** (1 primary) + menu **⋯**
  (Arsip/Restore/Hapus — **destruktif dipisah visual**) + **✕**. Breadcrumb berhenti di **nama
  produk** (tab BUKAN level breadcrumb).
- **Tabs** (`detail/detail-tabs.tsx`): set tab dinamis dari `product_type`. **Tab strip
  scrollable** + tab aktif auto-scroll ke tampak + edge-fade (6 tab tak muat di layar sempit);
  di **≥1024px boleh rail tab vertikal kiri**. Sinkron ke URL (`?tab=`) + `aria-selected` + fokus
  keyboard. Header & tab bar **sticky** (liquid glass blur di sini = tepat guna).

### B2. Pola data per-tab (INTI: beda endpoint + paginasi sendiri)
- Tiap tab = **hook React Query sendiri** dgn **page/search/sort state sendiri**,
  `enabled: activeTab===id` (lazy), `keepPreviousData` + `staleTime` (re-klik tab tak flash skeleton).
- Paginasi seragam `DataTablePagination` + "Baris per halaman" + lompat halaman, **selalu tampak**
  (sticky footer atau paginasi atas+bawah) + tampilkan `meta.total`.
- Service: `services/master-produk/product-detail-tabs.service.ts`; hooks: `use-product-tabs.ts`.
- Skeleton (meniru layout baris → hindari CLS) + empty-state + error-state per tab.
- **Semua hover punya padanan tap + keyboard** (touch tak ada hover): tooltip, popover "+N toko",
  hint geser matriks.

### B3. Komponen tiap tab
- `tab-variasi.tsx` — tabel varian. **Wajib: search (SKU/opsi), kolom sortable** (`aria-sort`),
  **checkbox + bulk action bar** (aktif/nonaktif/hapus/ekspor). Kolom: thumbnail, nama, sku,
  **badge opsi** Warna/Ukuran (warna lembut), barcode, harga, stok, aksi ⋯. Paginasi.
  **Mobile 375px: fallback kartu** (stacked), bukan scroll-x lebar.
- `tab-komposisi.tsx` — kartu SKU bundle + daftar komponen (thumbnail, nama, kode, qty, **stok
  komponen**). Peringatan bila komponen habis.
- `tab-channel.tsx` — per varian: chip toko/channel (`ChannelLogo`) + "+N toko" (popover/tap).
  Filter channel. Default **listing aktif saja**.
- `tab-harga-channel.tsx` — **toggle Matriks ⟷ Daftar**:
  - **Daftar (default)**: klik 1 varian → **panel samping** harga per toko (ringan kognitif).
  - **Matriks (power user)**: kolom **sticky "Produk"** + header row sticky + kolom per toko
    (default `listed_only`), gradient tepi + **kontrol geser eksplisit**. Filter channel.
- `tab-buku-harga.tsx` — grosir per varian (min qty → harga, tipe pelanggan).
- `tab-riwayat-upload.tsx` — Aktivitas/Tanggal/Channel/Keterangan + status. Baris error →
  badge merah + pesan ringkas + **tombol "Re-upload"** (recovery) + tooltip/expand teks penuh.

---

## C. UX HARDENING (fokus utama) 🎯

### P1 — Liquid glass tanpa mengorbankan keterbacaan data
Glass (blur+translucent) **bagus untuk chrome, berisiko untuk tabel padat** (kontras < 4.5:1,
mata lelah pada 210 baris).
- **Glass hanya untuk shell**: header, tab bar, kartu, modal, panel samping, popover.
- **Permukaan tabel solid/opasitas tinggi** (bukan blur) + border halus → angka/SKU tetap tajam.
- **`tabular-nums`** untuk semua kolom angka (harga/stok/qty) → kolom tak goyang antar baris.
- Row-hover highlight + zebra halus untuk melacak baris panjang.
- Kontras teks ≥ 4.5:1 diuji di light **dan** dark (glass sering lolos di satu mode saja).

### P1 — Matriks Harga Channel
- Default **Daftar + panel** (bukan matriks 25 kolom). Matriks = opsi, **`listed_only` default**.
- Sticky header row + kolom pertama; affordance geser eksplisit + gradient tepi.

### P2 — Skala 210 varian (jadikan wajib, bukan opsional)
- **Search** first-class + **sort kolom** (`aria-sort`) + **bulk-select** (action bar).
- **Total count** terlihat + paginasi selalu tampak; `keepPreviousData` untuk transisi mulus.

### P2 — Sentuh & mobile
- Padanan **tap + keyboard** untuk semua hover/tooltip/popover.
- Tabel Variasi → **kartu** di mobile; matriks → utamakan mode Daftar di mobile.

### P3 — Polish
- Error Riwayat Upload → **retry/re-upload** di baris (recovery path), bukan sekadar pesan.
- Menu ⋯ → **pisahkan aksi destruktif** (Arsip/Hapus) dari lainnya.
- Skeleton meniru baris (anti-CLS); bila "Baris per halaman" ≥ 50 → **virtualisasi**.
- Breadcrumb tak memasukkan `{tab}`.
- Animasi 150–300ms, hormati `prefers-reduced-motion`; tab transition crossfade halus.

### Aksesibilitas (CRITICAL — checklist sebelum rilis)
- Kontras 4.5:1 (light+dark), fokus keyboard pada tab & baris aksi, `aria-selected`/`aria-sort`,
  warna bukan satu-satunya penanda status (badge + ikon/teks), target sentuh ≥ 44px.

---

## Urutan & dependensi
```
A (BE endpoints + sort/search/bulk) ─► B1 (shell+header glass) ─► B2 (pola data) ─► B3 (tab satu per satu) ─► C (UX hardening menyatu di tiap tab)
```
- Mulai BE #2 (Variasi: + sort/search/bulk) + #7 (Riwayat sudah ada) → FE jalan paling cepat.
- Komposisi pakai `bundle_components` yang sudah ada (selaras BUNDLE_PRODUCT_PLAN B0/B1).
- Tiap endpoint+tab: implement → test (BE) / tsc+build (FE) → commit → push.
- **C bukan fase terpisah** — diterapkan menyatu saat membangun tiap tab (glass-shell/solid-table,
  search/sort/bulk, padanan tap, retry, tabular-nums).

## Catatan
- **Jangan** memuat 210 varian di `GET /products/{id}` — pindah ke endpoint Variasi berpaginasi.
- Tab dipilih dari `product_type`: bundle→Komposisi, lainnya→Variasi.
- Liquid glass = identitas visual; **keterbacaan data > efek** bila berbenturan.
