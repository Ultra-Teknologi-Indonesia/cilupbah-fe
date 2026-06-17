# Planning — Manajemen Gudang › Pengaturan › Lokasi

> Status: disetujui untuk eksekusi. Tanggal: 2026-06-16.
> Lingkup tahap ini: **List Lokasi** (CRUD) + **Halaman Tambah/Edit** (tab **Informasi Lokasi** & **Layout Gudang**).

## 0. Konteks & scope

Manajemen Gudang terdiri dari 5 modul: proses pesanan, barang masuk, barang keluar, laporan gudang, **pengaturan**. Kita mulai dari **Pengaturan**.

Menu Pengaturan ada 5; fokus sekarang: **Lokasi**.
- ✅ List lokasi: lihat, tambah, edit, hapus.
- ✅ Halaman Tambah/Edit → tab **Informasi Lokasi** & **Layout Gudang**.
- ⏸️ Ditunda: tab **Transfer Otomatis**, **Mapping Multi Warehouse**, fitur **Import**, **Grup Lokasi**, 4 menu pengaturan lain, dan modul gudang lain.

## 1. Stack & konvensi FE (mengikuti pola `master-produk`)

- Next.js **16** App Router, React **19**, **react-hook-form + zod** (`@hookform/resolvers`), **@tanstack/react-query**, axios via `fetchClient` (`src/lib/api-client.ts`, baseURL `/api/app` → proxy `src/app/api/app/[...path]/route.ts`), zustand, `@tabler/icons-react`.
- Pola folder: `services/<domain>/*.service.ts` → `hooks/<domain>/use-*.ts` → `app/dashboard/<domain>/{page,buat,[id]/edit}/page.tsx`.
- ⚠️ **Next.js 16 punya breaking changes** (lihat `cilupbah-fe/AGENTS.md`): wajib baca `node_modules/next/dist/docs/` sebelum menulis kode FE.

## 2. Keputusan yang sudah dikunci

| Topik | Keputusan |
|---|---|
| Kolom/filter **Tipe** | Tidak dipakai. `location_type` dihapus dari form (jadi nullable). Filter "Pilih tipe" di-deprioritaskan. |
| **Wilayah** | Cascade Provinsi → Kota → Kecamatan → Kelurahan via `/v1/regions/*`, simpan `village_id`. |
| **Toggle "Gunakan Layout Gudang"** | Setting **global** di BE (tabel settings + endpoint). |
| **Field Informasi baru** | Tambah `phone`, `email`, `coordinate` (Pin Map). Grup Lokasi ditunda. |
| **Default Staff** | Dropdown dari daftar **User** (modul Auth), simpan ke `default_warehouse_user`. |
| **Layout create flow** | Simpan lokasi dulu → lalu `generate` bins (2 langkah). Preview boleh dihitung lokal/endpoint. |

## 3. Kontrak API BE (sudah ada)

| Aksi | Endpoint |
|---|---|
| List | `GET /locations` (paginated) |
| Detail | `GET /locations/{id}` (load `zones`, `bins`, `village`) |
| Create | `POST /locations` |
| Update | `PUT /locations/{id}` |
| Delete | `DELETE /locations/{id}` |
| Region cascade | `GET /v1/regions/provinces` · `/cities/{province_id}` · `/districts/{city_id}` · `/villages/{district_id}` |
| Layout preview (tanpa simpan) | `POST /locations/{id}/bins/preview` → `previewMassGenerate()` |
| Layout generate (simpan) | `POST /locations/{id}/bins/generate` → `massGenerate()` |
| Zones / Bins | `GET /locations/{id}/zones` · `GET /locations/{id}/bins` · `GET /locations/{id}/default-bin` |

### Verifikasi endpoint kode rak (✅ sudah dicek)

Endpoint generate kode rak cocok persis dengan UI Layout Gudang:

| UI | Request field | Output |
|---|---|---|
| Lantai + Kode `L` | `qty_floor` + `floor_code` | `L1, L2, …` |
| Baris + Kode `B` | `qty_row` + `row_code` | `B1, B2, …` |
| Kolom + Kode `K` | `qty_column` + `column_code` | `K1, K2, …` |
| Rak + Kode `R` | `qty_bin` + `bin_code` | `R1, R2, …` |
| Final code | `generateFinalCode()` | `L1-B1-K1-R1` |
| Maks. 2000 | validator | cap 2000 kombinasi |

- `preview` = hitung kode **tanpa simpan** (tidak butuh `locationId`).
- `generate` = simpan bin, idempotent (`firstOrCreateByFinalCode`).
- ⚠️ Route preview/generate ber-nested di `locations/{locationId}` (`whereUuid`). Untuk "Tambah Lokasi" (belum ada id) → pakai pendekatan **create lokasi → generate bins**.

## 4. Penyesuaian BE yang diperlukan (Milestone 1)

1. **Migration `locations`**: + `phone` (string), `email` (string), `coordinate` (string `"(lat,lng)"`); `location_type` → **nullable**.
2. **`Location` model**: tambah `phone`, `email`, `coordinate` ke `$fillable` (+ casts bila perlu).
3. **`LocationResource`**: expose `is_system`, `is_locked`, `phone`, `email`, `coordinate` (selain field eksisting).
4. **`StoreLocationRequest` / `UpdateLocationRequest`**: `phone` (required), `email` (required|email), `coordinate` (nullable); hapus `location_type` dari required (nullable).
5. **Setting global `use_warehouse_layout`**: tabel settings + `GET`/`PUT`.
6. **List search**: param `search` (nama/kode) di `LocationRepository::getAllPaginated`.
7. **Endpoint list User** (untuk Default Staff) — cek dulu apakah sudah ada di modul Auth; jika belum, tambahkan.
8. **Test** dengan `php artisan test` (JANGAN `migrate:fresh --env=testing` — mengganggu DB dev `cilupbah`).

> Catatan: lokasi sistem sudah punya guard — `is_system` (tidak bisa hapus, selalu aktif) & `is_locked` (tidak bisa edit), di `LocationService::delete/update`. Seeder sudah membuat **Gudang Pusat** (`is_system`) & **Transit** (`is_system` + `is_locked`).

## 5. FE plumbing (Milestone 2)

```
src/services/pengaturan/location.types.ts      # tipe Location + payload
src/services/pengaturan/location.schema.ts     # zod schema (mirror request BE)
src/services/pengaturan/location.service.ts    # fetchClient calls
src/hooks/pengaturan/use-locations.ts          # list (useQuery + search/pagination)
src/hooks/pengaturan/use-location-detail.ts
src/hooks/pengaturan/use-create-location.ts
src/hooks/pengaturan/use-update-location.ts
src/hooks/pengaturan/use-delete-location.ts
src/hooks/pengaturan/use-toggle-location-active.ts
src/hooks/pengaturan/use-regions.ts            # cascade provinsi/kota/kecamatan/kelurahan
src/hooks/pengaturan/use-warehouse-users.ts    # daftar staff (Default Staff)
src/hooks/pengaturan/use-warehouse-layout-setting.ts  # toggle global
src/hooks/pengaturan/use-generate-bins.ts      # preview + generate layout
```

## 6. List page (Milestone 3 — Image #3, final)

```
src/app/dashboard/pengaturan/lokasi/page.tsx
src/components/dashboard/pengaturan/lokasi/location-table.tsx
src/components/dashboard/pengaturan/lokasi/delete-location-dialog.tsx
src/components/dashboard/pengaturan/lokasi/layout-toggle.tsx
```

- Header: `PageTitle` + breadcrumb (Dashboard › Pengaturan › Lokasi).
- Toolbar: search "Cari lokasi" + tombol "Tambah baru". (Import & filter "Pilih tipe" = ditunda.)
- Toggle global **"Gunakan Layout Gudang"** (ikon info).
- Tabel: checkbox, **Nama Lokasi** (link → edit), **Tipe** (tampilkan `location_type`/fallback), **Aktif** (switch), aksi **Hapus**. Footer Total.
- **State terkunci**:
  - `is_system` (Pusat): ikon gembok, tanpa tombol hapus, switch Aktif **disabled** (selalu aktif), tetap bisa edit.
  - `is_locked` (Transit): ikon gembok, tanpa hapus, Aktif disabled, **edit read-only/diblok**.
- Interaksi: toggle Aktif → `PUT is_active`; Hapus → dialog konfirmasi → `DELETE` (tampilkan error BE bila ada stok/transaksi/lokasi sistem).

## 7. Tambah/Edit (Milestone 4 — Image #10/#11)

```
src/app/dashboard/pengaturan/lokasi/buat/page.tsx
src/app/dashboard/pengaturan/lokasi/[id]/edit/page.tsx
src/components/dashboard/pengaturan/lokasi/location-form.tsx       # shell + sub-nav kiri
src/components/dashboard/pengaturan/lokasi/informasi-tab.tsx
src/components/dashboard/pengaturan/lokasi/layout-gudang-tab.tsx
```

- **Sub-nav kiri**: Informasi Lokasi, Layout Gudang. (Transfer Otomatis & Mapping Multi Warehouse = ditunda, tampil disabled/placeholder.)
- Header: judul "Tambah/Edit Lokasi" + tombol Simpan/Batal.

### Tab Informasi Lokasi (#11)

| Field UI | Wajib | Kolom BE |
|---|---|---|
| Nama Lokasi | ✓ | `location_name` |
| Kode Lokasi | ✓ | `location_code` (unik) |
| Detail Alamat | ✓ | `address` |
| Pin Lokasi (map) | — | `coordinate` |
| Provinsi / Kota / Kecamatan / Kelurahan | ✓ | cascade → `village_id` |
| Kode Pos | ✓ | `post_code` |
| No. Telepon | ✓ | `phone` |
| Email | ✓ | `email` |
| Default Staff | — | `default_warehouse_user` (dropdown User) |

- Validasi zod = mirror `StoreLocationRequest`.
- Aturan: Pusat (`is_system`) editable tapi Aktif terkunci true; Transit (`is_locked`) form read-only.

### Tab Layout Gudang (#10)

- Builder sub-tab Lantai / Baris / Kolom / Rak: input jumlah + kode (default L/B/K/R) → "Buat".
- Preview kode rak (tabel + "Cari rak", maks 2000) — hitung lokal atau via `preview`.
- Simpan: **create lokasi → `generate` bins**. Edit: prefill dari `bins`; hapus bin ditolak BE bila masih ada stok.
- Tampil bila setting global `use_warehouse_layout` ON.

## 8. Sub-keputusan saat eksekusi Milestone 4

- **Map picker**: react-leaflet (gratis, tanpa API key) vs Google Maps (perlu API key). → tanyakan saat mulai Milestone 4.
- **Format `coordinate`**: string `"(lat,lng)"` (ikut Jubelio) vs dua kolom `lat`/`lng`. → default string.

## 9. Urutan & status

1. [x] Milestone 1 — BE (migration, resource, request, setting, search, user list, test) ✅ 2026-06-17
2. [x] Milestone 2 — FE plumbing ✅ 2026-06-17
3. [x] Milestone 3 — List page ✅ 2026-06-17
4. [x] Milestone 4 — Tambah/Edit (Informasi + Layout) ✅ 2026-06-17
5. [x] Milestone 5 — Navigasi ✅ 2026-06-17 (IA berubah: Lokasi pindah ke **Gudang › Manajemen Rak & Lokasi › Lokasi Gudang**, route `/dashboard/manajemen-rak/lokasi`; nav-data sudah wired; ditambah redirect index `/dashboard/manajemen-rak` → `/lokasi`)

## 10. Ditunda (di luar fokus)

Import lokasi, Grup Lokasi, Pin Map lanjutan, Transfer Otomatis, Mapping Multi Warehouse, 4 menu pengaturan lain, modul gudang lain (proses pesanan / barang masuk / barang keluar / laporan).
