# PLAN — Halaman Master Produk

Status: **Phase 1 (hardcode/mock) in progress** · Owner: FE · Route: `/dashboard/master-produk`

Tujuan: membangun halaman **Master Produk** yang lengkap (semua use case), dimulai
dari layout dengan data hardcode/mock, lalu diintegrasikan ke Backend Laravel
(`Modules/Product`) secara bertahap. Sebagai fondasi, dibuat dulu komponen
**DataTable reusable** yang bisa dipakai modul lain (Pesanan, PO, Stok, dll).

---

## 1. Ringkasan Backend (sumber kebenaran)

Semua endpoint di bawah `/api/v1` (FE memanggil lewat proxy `/api/app/*` →
`route.ts` menambah `Authorization: Bearer <token>` dari cookie). Auth:
`auth:sanctum`.

### 1.1 Listing master (utama untuk halaman ini)
- `GET products/master` — query: `search`, `per_page` (1..500), `page`, `status`
  (`download|in_review|master|archived`), `updated_since` (date).
  Response: `MasterItemResource` + `meta` paginasi.
- `GET products/master/{id}` — detail satu master item.

`MasterItemResource` (per baris):
```
item_group_id, item_name, is_po, is_consignment, item_category_id,
sell_price (harga termurah varian), last_modified, thumbnail,
total_variants, variations[]{label, values[]},
variants[]{item_id, item_code(sku), sell_price, barcode, tax_rate,
           variation_values[]{label,value}, thumbnail, store_names[]},
online_status[]{channel_code, channel_name, store_name, channel_url, error_text}
```

### 1.2 CRUD produk penuh (`apiResource products`)
- `GET products` (list ProductResource), `POST products`, `GET products/{uuid}`,
  `PUT products/{uuid}`, `DELETE products/{uuid}`.
- Aksi status: `POST products/{id}/submit-review|approve|reject|archive|restore`.

`ProductResource`: `id, name, sku, description, status, is_active, primary_image,
price_range{min,max}, channels_count, category{id,name}, brand{id,name},
is_bundle, is_consignment, channel_mappings[], variants[]{id,sku,sell_price,
is_active,channel_prices[],stock{on_hand,reserved,on_order,available}},
verified_at, archived_at, archive_reason, created_at, updated_at`.

### 1.3 Payload create/update (`CreateProductRequest`)
```
brand_id?, category_id*, name*, description?, weight?, length?, width?, height?,
is_active?, is_bundle?, is_consignment?,
specifications[]{attribute_id*, attribute_option_id?, text_value?},
media[]{url*, media_type(image|video), is_primary?, sort_order?},
variation_types[]{attribute_id*, sort_order?},
variants[]{ sku*, sell_price*, is_active?,
  options[]{attribute_id*, value*},
  channel_prices[]{channel_shop_id*(uuid), price*},
  wholesale_prices[]{min_qty*, price*, customer_type?},
  media[]{...} }
```

### 1.4 Lookups & operasi pendukung
- `GET/POST categories`, `GET/POST brands`, `GET/POST attributes` (untuk dropdown
  filter & form).
- Import: `GET products/import/template/single|bundle`,
  `POST products/import/single|bundle`.
- Merge: `products/merge/catalog|suggestions|applied|auto|apply|bulk|...`
  (butuh permission `*-product-merge` / `merge-product`).
- Media upload: `POST media/upload`, dll.
- Channel drafts / raise-products (naikkan produk) — modul terkait, bukan fokus
  halaman ini.

### 1.5 Bentuk response standar
```jsonc
// sukses tunggal
{ "status":"success", "message":"...", "data": {...} }
// sukses paginasi
{ "status":"success", "message":"...", "data":[...],
  "meta": { "current_page":1, "last_page":9, "per_page":20, "total":175 } }
// error
{ "status":"error", "message":"...", "errors": { "field":["msg"] } }
```

---

## 2. Use case yang harus ditangani

**Baca / tampil**
1. Daftar master produk berpaginasi (server-side pagination).
2. Pencarian (`search`) global by nama/SKU.
3. Filter: status, kategori, merek, PO/konsinyasi/bundle, ada/tidaknya channel.
4. Sort kolom (nama, harga, jumlah varian, terakhir diubah).
5. Tampil/sembunyikan kolom (column visibility) + persist preferensi.
6. Ekspansi baris untuk lihat varian (variations + per-varian SKU/harga/stok).
7. Badge status channel (online/error) per produk.
8. Detail produk (drawer/halaman) — info, varian, channel, stok, riwayat.

**Tulis / aksi**
9. Tambah produk (form multi-step: info → varian → media → channel/harga).
10. Edit produk.
11. Hapus produk (konfirmasi).
12. Aksi status: submit review, approve, reject, archive, restore.
13. Aktif/nonaktif produk (toggle `is_active`).
14. Bulk action: hapus, arsip, ubah status, ekspor terpilih.
15. Import produk (single & bundle) + unduh template.
16. Ekspor daftar (CSV) sesuai filter.

**Status & UX**
17. Loading (skeleton), empty state, error state + retry.
18. Optimistic update + toast (sonner) untuk aksi.
19. URL state: filter/sort/page tersimpan di query string (shareable).
20. Permission-aware (sembunyikan aksi merge/approve bila tak punya hak).

---

## 3. Arsitektur & struktur file (FE)

Mengikuti pola repo: `services/<domain>`, `types/<domain>`, `components/ui`,
TanStack Query (`query-provider` sudah ada), Zustand untuk UI state.

```
src/
├─ components/ui/data-table/            # ★ reusable (Phase 0)
│   ├─ data-table.tsx                   # <DataTable/> generic
│   ├─ data-table-toolbar.tsx           # search + filter + view options
│   ├─ data-table-column-header.tsx     # header sortable/hideable
│   ├─ data-table-pagination.tsx        # paginasi + page size
│   ├─ data-table-view-options.tsx      # toggle kolom
│   ├─ data-table-faceted-filter.tsx    # filter multi-pilih
│   ├─ data-table-bulk-actions.tsx      # bar aksi massal
│   ├─ types.ts                         # FacetedFilter, DataTableProps, dsb
│   └─ index.ts
├─ components/ui/{checkbox,badge,select}.tsx   # primitive baru
│
├─ app/dashboard/master-produk/
│   ├─ page.tsx                         # halaman (Phase 1: mock)
│   ├─ _components/
│   │   ├─ product-columns.tsx          # ColumnDef<Product>
│   │   ├─ product-table.tsx            # rangkai DataTable + toolbar produk
│   │   ├─ product-row-actions.tsx      # dropdown aksi per baris
│   │   ├─ product-bulk-actions.tsx     # aksi massal produk
│   │   ├─ product-status-badge.tsx
│   │   ├─ product-channel-badges.tsx
│   │   └─ product-stats.tsx            # kartu ringkasan atas
│   └─ _data/mock-products.ts           # data hardcode (Phase 1)
│
├─ types/product/product.types.ts       # Phase 2
├─ services/product/product.service.ts  # Phase 2
└─ hooks/use-products.ts                # Phase 2 (TanStack Query)
```

### Kontrak DataTable (reusable)
```ts
<DataTable
  columns={columns}
  data={data}
  // mode
  manualPagination?         // true = server-side (default false → client)
  manualSorting? manualFiltering?
  rowCount?                 // total dari meta (server mode)
  state? onStateChange?     // sorting/filters/pagination/rowSelection terkontrol
  // toolbar
  searchKey? searchPlaceholder?
  facetedFilters?: FacetedFilter[]   // {columnId,title,options[]}
  toolbarActions?           // node kanan toolbar (mis. tombol Tambah/Import)
  // baris
  getRowId?
  renderSubRow?             // ekspansi varian
  bulkActions?              // node bar saat ada seleksi
  onRowClick?
  // status
  isLoading? emptyState? errorState?
  enableRowSelection? enableColumnVisibility?
/>
```
Komponen ini **tidak tahu** soal produk — generik `<TData>`. Modul lain cukup
men-supply `columns` + `data`. Mendukung **client mode** (mock/Phase 1) dan
**server mode** (Phase 2) lewat flag `manual*`.

---

## 4. Fase pengerjaan

| Fase | Isi | Status |
|------|-----|--------|
| **0** | Primitive (checkbox/badge/select) + **DataTable reusable** | ⏳ sekarang |
| **1** | Halaman `/dashboard/master-produk` dengan **mock data** — semua kolom, filter, toolbar, row/bulk actions, expand varian, stats. Aksi pakai toast dummy. **Review layout di sini.** | ⏳ sekarang |
| **2** | Integrasi BE: `types`, `service`, `useProducts` (TanStack Query), ganti mock → `GET products/master`, server pagination/sort/filter, detail drawer (`products/{id}`). | ⬜ |
| **3** | Mutations: create/edit (form multi-step), delete, aksi status, bulk, toggle aktif — optimistic + invalidate query. | ⬜ |
| **4** | Import/ekspor, merge (permission-gated), URL state, kolom persist, polish a11y. | ⬜ |

Prinsip: Phase 1 hanya UI; tidak ada panggilan jaringan. Saat Phase 2, struktur
data mock dibuat **identik** dengan `MasterItemResource` agar swap mock→API
minimal.

---

## 5. Model data FE (selaras BE, dipakai sejak mock)

```ts
type ProductStatus = "download" | "in_review" | "master" | "archived";

interface ProductVariant {
  itemId: string; sku: string; sellPrice: number | null;
  barcode: string | null; taxRate: number | null;
  variationValues: { label: string; value: string }[];
  storeNames: { storeName: string }[];
  stock?: { onHand: number; available: number };  // dari ProductResource
}
interface ProductChannelStatus {
  channelCode: string | null; channelName: string | null;
  storeName: string | null; channelUrl: string | null; errorText: string | null;
}
interface Product {                      // ← row master
  itemGroupId: string; itemName: string; status: ProductStatus;
  isPo: boolean; isConsignment: boolean; isBundle: boolean;
  categoryId: number | null; categoryName?: string; brandName?: string;
  sellPrice: number | null; totalVariants: number; lastModified: string;
  thumbnail: string | null;
  variations: { label: string; values: string[] }[];
  variants: ProductVariant[];
  onlineStatus: ProductChannelStatus[];
}
```
> Catatan: `status`, `categoryName`, `brandName` tidak ada di `MasterItemResource`
> mentah — saat Phase 2 diisi via join/lookup atau pindah ke `GET products`
> (ProductResource) bila butuh status. Keputusan diambil di Phase 2.

---

## 6. Kolom tabel (default)

`select · thumbnail+nama(+SKU/varian) · kategori · merek · status · harga ·
varian(jumlah) · channel(badges) · diperbarui · actions`

- Expand row → tabel varian (SKU, nilai variasi, harga, stok, toko).
- View options: sembunyikan kategori/merek/channel/diperbarui.
- Faceted filter: Status, Kategori, Merek, Tipe (PO/Konsinyasi/Bundle).

---

## 7. Keputusan & asumsi

1. **Endpoint listing** = `GET products/master` (paling cocok untuk katalog;
   sudah membawa varian, channel, thumbnail). CRUD pakai `apiResource products`.
2. **Pagination server-side** sejak Phase 2 (BE sudah paginasi).
3. **DataTable** mendukung client & server mode dalam satu komponen (flag
   `manual*`) → reusable untuk tabel kecil (client) & besar (server).
4. **Faceted filter & view options** memakai `DropdownMenu` (sudah ada) — tanpa
   menambah `cmdk/Popover` agar dependensi minimal.
5. **State filter/sort/page** akan disinkron ke URL query (Phase 4) memakai
   `useSearchParams` (Next App Router).
6. Aksi **merge / approve / reject** ditampilkan bersyarat permission (Phase 4).

---

## 8. Risiko / catatan

- `AGENTS.md`: versi Next di repo punya breaking changes — komponen client
  mengikuti pola file `components/ui/*` yang sudah jalan (acuan paling aman).
- `MasterItemResource` tidak memuat `status`/brand — perlu disepakati di Phase 2
  (extend resource BE atau gabung sumber). Ditandai sebagai open question.
- Volume varian besar → render sub-row secara lazy saat di-expand.
