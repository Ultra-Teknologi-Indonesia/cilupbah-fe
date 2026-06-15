# Milestone Halaman FE — Cilupbah

Status & roadmap halaman dashboard. **Prioritas: Produk (Katalog).**

> Audit: sidebar (`nav-data.ts`) menaut ke **76 link**, tetapi baru **6 halaman dashboard**
> yang jadi — sisanya (~70) masih 404.

---

## ✅ Sudah ada

| Halaman | Route | Status |
|---------|-------|--------|
| Dashboard | `/dashboard` | ada |
| Master Produk (list) | `/dashboard/master-produk` | terintegrasi BE |
| Buat Produk Satuan | `/dashboard/master-produk/buat` | terintegrasi BE |
| Integrasi Channel | `/dashboard/integrasi-channel` | terintegrasi BE (Fase 0–3) |
| Pengaturan | `/dashboard/pengaturan` | ada |
| Bantuan | `/dashboard/bantuan` | ada |

---

## 🎯 Milestone 1 — PRODUK (prioritas)

Melengkapi siklus katalog: buat → lihat → edit → review/approve → kelola.

| # | Status | Halaman | Route | BE siap? | Effort |
|---|--------|---------|-------|----------|--------|
| 1.1 | ✅ Selesai | **Detail Produk** | `/dashboard/master-produk/[id]` | ✅ `GET /products/{id}` | M |
| 1.2 | ✅ Selesai | **Edit Produk** | `/dashboard/master-produk/[id]/edit` | ✅ `PUT /products/{id}` | M |
| 1.3 | ⏭️ Skip | **Review & Approval** (internal) | — | approve/reject sudah di **Detail**; tak ada gerbang maker–checker | — |
| 1.4 | ✅ Selesai | **Arsip Produk** | `/dashboard/master-produk/arsip` | ✅ `GET /products/archives`, `restore` | S |
| 1.5 | ⬜ Belum | **Kategori** (tree kategori→sub→jenis) | `/dashboard/kategori-merek/kategori` | ✅ `categories` CRUD | M |
| 1.6 | ⬜ Belum | **Merek** | `/dashboard/kategori-merek/merek` | ✅ `brands` CRUD | S |
| 1.7 | ⬜ Belum | **Produk Bundle** (list + buat) | `/dashboard/produk/bundle` | ✅ `inventory/items` (bundle) | L |
| 1.8 | ⬜ Belum | **Naikkan Produk** (upload ke channel) | `/dashboard/produk/naikkan` | ✅ `raise-products` | L |
| 1.9 | ⬜ Belum | **Listing Marketplace** | `/dashboard/listing-marketplace` | ✅ `products/channel-products` | M |
| 1.10 | ⬜ Belum | **Harga & Promosi** (Daftar Harga + Promosi) | `/dashboard/harga-promosi/*` | ✅ `price-lists` | M |

**Sudah jalan:** Detail (1.1), Edit (1.2), Arsip (1.4) — CRUD produk + lifecycle (approve/reject/archive/restore) dari halaman Detail.

### Sprint berikutnya (disarankan)
1.5 Kategori + 1.6 Merek (tata kelola katalog), lalu 1.9 Listing Marketplace.

---

## Milestone berikutnya

### M2 · Persediaan
- Posisi Stok: `/posisi-stok` (+ `/produk`, `/gudang`, `/restock`, `/habis`)
- Transaksi Stok: `/transaksi-stok` (+ `/penyesuaian`, `/transfer/{masuk,keluar,transit}`, `/opname`)
- Monitor Stok: `/monitor-stok`
- Stok Terpesan: `/stok-terpesan`

### M3 · Penjualan
- Pesanan: `/pesanan` (+ `/siap-proses`, `/siap-picking`, `/dalam-pengiriman`, `/selesai`, `/dibatalkan`)
- Retur Penjualan: `/retur-penjualan` (+ `/menunggu`, `/diterima`, `/penyelesaian`)
- Kontak Pelanggan: `/kontak-pelanggan`
- Kasir (POS): `/kasir-pos`

### M4 · Pembelian
- Purchase Order: `/purchase-order` (+ `/semua`, `/progress`)
- Retur Pembelian: `/retur-pembelian`
- Kontak Pemasok: `/kontak-pemasok`

### M5 · Gudang
- Barang Masuk (Inbound): `/barang-masuk` (+ `/daftar`, `/putaway/{belum,proses,selesai}`, `/laporan`)
- Barang Keluar (Outbound): `/barang-keluar` (+ `/picklist`, `/packlist`, `/jadwal`)
- Manajemen Rak: `/manajemen-rak` (+ `/denah`, `/lokasi`)

### M6 · Laporan & Keuangan
- Laporan: `/laporan/{penjualan,pembelian,inventori,gudang,keuangan}`
- Jurnal: `/jurnal` (+ `/manual`, `/rutin`)
- Kas & Bank: `/kas-bank` · Peta Akun: `/peta-akun`
- Piutang: `/piutang` (+ `/invoice`, `/pembayaran`)
- Hutang: `/hutang` (+ `/bill`, `/pembayaran`)
- Aset: `/aset`

---

## Konvensi per halaman

Mengikuti pola yang sudah jadi (Master Produk & Integrasi Channel):

- **Struktur:** `types/<domain>` → `services/<domain>` → `lib/<domain>` (mapper) →
  `hooks/<domain>` (React Query) → `components/dashboard/<domain>` (presentational).
- **Data:** TanStack Query (query + mutation optimistic), proxy `/api/app/*`.
- **UI:** liquid-glass, `variant="primary"` (biru), SF Pro; state **skeleton / empty / error**;
  tabel server-driven (pagination/sort/filter) atau grouped-table sesuai kasus.
- **A11y/UX:** aria-label, `color-not-only`, `reduced-motion`, konfirmasi aksi destruktif.

Effort: **S** = kecil (≤0.5 hari), **M** = sedang (~1 hari), **L** = besar (≥2 hari) — estimasi kasar.
