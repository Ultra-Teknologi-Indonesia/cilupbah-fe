# Plan — Lengkapi FE Alur Pengelolaan Produk (selaras Jubelio)

## Konteks

Audit (BE + FE) menyimpulkan **backend sudah mendukung 7 tahap**; yang kurang ada di **frontend**:
beberapa entri sidebar menunjuk route yang **belum punya page**. Plan ini hanya soal FE
(membangun page + service + hook yang mengonsumsi endpoint BE yang sudah ada).

Status terverifikasi:

| Tahap | BE | FE sekarang | Aksi plan |
|---|---|---|---|
| 1. Master (buat/edit) | ✅ | ✅ `master-produk/*` + bundle builder | — selesai |
| 2. Upload (kirim ke marketplace) | ✅ | ❌ tak ada page | **FASE U** |
| 3. In Review | ✅ | ⚠️ badge + aksi inline | **FASE R** (filter daftar) |
| 4. Pantauan (monitoring) | ✅ | ⚠️ hanya tab Riwayat per-produk | **FASE M** |
| 5. Produk Channel (koneksi SKU) | ✅ | ⚠️ tab per-produk; tak ada katalog | **FASE L** |
| 6. Naikkan Produk (boost) | ⚠️ infra ada | ❌ tak ada page | **FASE N — OPSIONAL, paling akhir** (di luar parity Jubelio; butuh adapter BE; boleh di-skip) |
| 7. Arsip | ✅ | ✅ `master-produk/arsip` | — selesai |

Konvensi yang dipakai ulang: liquid-glass shell + tabel solid + tabular-nums; TanStack Query v5
(`placeholderData: keepPreviousData`, `enabled`, `invalidateQueries`); Spatie filter (`filter[...]`,
`per_page`, `sort`); pola paginasi `TabPagination`; `SyncStatusBadge` (sudah ada di
`detail/tab-pagination.tsx`) untuk status sinkron.

---

## IA & Navigasi — rekomendasi UX (page vs tab)

**Masalah sidebar sekarang:** 7 tahap Jubelio adalah **pipeline status/proses**, bukan 7 destinasi
terpisah. Sidebar memperlakukannya datar + ada entri yang menyesatkan: "Produk Bundle" jadi item
sendiri (padahal bundle hanya *tipe* produk), "Naikkan Produk" + "Harga & Promosi › Promosi" tumpang
tindih, dan Upload/In Review/Pantauan tak punya entri sama sekali. Banyak item nav → beban kognitif &
banyak halaman setengah jadi.

**Prinsip (UX nav):** tab untuk **view sejenis atas dataset yang sama**; page/route untuk **workflow
atau entitas berbeda** yang perlu deep-link. Tiap tab tetap deep-linkable via `?tab=` (pola yang sudah
dipakai di detail produk — pertahankan; jaga `state-preservation` & `active-state`).

**Struktur yang direkomendasikan — 3 workspace** (mengganti ~6 item Katalog):

| Workspace (sidebar) | Route | Isi | Page vs Tab |
|---|---|---|---|
| **Produk** | `/dashboard/master-produk` | List produk + **tab status**: Semua · Master · Review · Arsip; **filter tipe** Satuan/Varian/Bundle | Master/Review/Arsip = **TAB** (dataset sama, beda status). Bundle = **filter tipe**, bukan item nav. Buat/Edit/Detail tetap route sendiri. |
| **Marketplace** | `/dashboard/marketplace` | **tab**: Upload · Listing (koneksi SKU) · Pantauan | Upload = workflow → boleh sub-route `?tab=upload` (atau route sendiri + entry dari detail). Listing & Pantauan = **TAB** (lensa beda atas data channel-listing yang sama). |
| **Promosi & Iklan** | `/dashboard/promosi` | **tab**: Promosi (voucher/diskon/flash sale) · Iklan/Boost | Lihat FASE N — Tier 1 native semua channel; Tier 2 Shopee native, Lazada/TikTok deep-link. |

Pemetaan tahap → tempat:
- **Master / In Review / Arsip** → tab status di **Produk** (bukan 3 halaman; Arsip page lama boleh
  jadi tab `?status=archived`). Mengurangi nav, cocok dengan mental model pipeline.
- **Upload / Produk Channel / Pantauan** → workspace **Marketplace** (semua menyentuh relasi
  produk↔channel; Listing+Pantauan berbagi data → tab).
- **Naikkan/Boost** → workspace **Promosi & Iklan** (gabung dengan Promosi lama).

**Aksi cepat tetap kontekstual:** tombol "Upload ke channel" & "Naikkan" tetap muncul di **detail
produk** (deep-link ke workspace dengan produk terpilih) — jadi pengguna bisa mulai dari produk atau
dari workspace. (Perbaiki tombol detail yang kini menunjuk route kosong.)

> Catatan: ini keputusan IA; fase U/L/M/R/N di bawah tetap sama isinya, hanya **route-nya
> dikonsolidasikan** ke 3 workspace di atas (mis. L+M jadi tab di `/dashboard/marketplace`).

---

## Endpoint BE (acuan, sudah ada)

**Upload / Draft channel**
- `GET /products/uploadable` — produk siap diupload (belum dimapping ke toko).
- `GET /products/{id}/channel-drafts` · `POST` · `PUT /{draft}` · `DELETE /{draft}` — draft per produk.
- `GET /products/channel-drafts` — daftar semua draft.
- `POST /products/channel-drafts/bulk-upload` — upload massal.
- `POST /products/channel-drafts/{draft}/upload` — upload satu draft.
- `POST /inventory/catalog/listing` — buat draft listing dari katalog.

**Produk Channel / Listing**
- `GET /products/channel-products` — daftar listing (koneksi SKU↔marketplace).
- `GET /products/channel-products/{id}` — detail satu listing.
- `PUT /v1/{channel}/products/{id}/activate` · `/deactivate` · `/stock` · `/price`.
- `DELETE /v1/{channel}/products/{id}/link` — unlink SKU dari channel.

**Pantauan / Monitoring**
- `GET /channel-monitor` · `/channel-monitor/summary` · `/channel-monitor/{shop_id}` ·
  `/channel-monitor/{shop_id}/products`.

**Naikkan Produk (boost)**
- `GET /raise-products` · `GET /{id}` · `POST` · `POST /{id}/raise` ·
  `POST/PATCH/DELETE /{id}/products[/{detailId}]` · `DELETE /{id}`.

> Perlu dikonfirmasi sebelum FASE N: apakah `RaiseProductJob` benar memanggil API boost marketplace
> (adapter), atau baru menandai `applied` (skeleton). Jika skeleton, FASE N = UI + alur dummy sampai
> BE dilengkapi.

---

## FASE U — Upload ke marketplace  🔴 prioritas 1

**Route FE:** `/dashboard/produk/upload` (sekaligus perbaiki target tombol "Naikkan ke channel" di
`detail/status-actions.tsx` yang kini menunjuk `/dashboard/produk/naikkan`).

**Alur:** pilih produk siap-upload → pilih toko/channel tujuan → (opsional) sunting draft per channel
(kategori, atribut wajib, harga, stok) → upload (satuan / massal) → lihat status masuk antrean.

**Service** `services/master-produk/upload.service.ts`
- `uploadable(params)` → `GET /products/uploadable` (search, per_page, page).
- `drafts(productId)` / `createDraft` / `updateDraft` / `deleteDraft` → `/products/{id}/channel-drafts`.
- `bulkUpload(draftIds | productIds + shopIds)` → `/products/channel-drafts/bulk-upload`.
- `uploadDraft(draftId)` → `/products/channel-drafts/{draft}/upload`.

**Hooks** `useUploadableProducts`, `useChannelDrafts`, `useCreateDraft`, `useUploadDraft`,
`useBulkUpload` (mutation → invalidate `uploadable`, `upload-histories`, `channel-monitor`).

**Komponen**
- `upload/upload-view.tsx` — shell + tabel uploadable (checkbox multi-select, search, filter channel,
  paginasi server) + bar aksi massal "Upload ke channel".
- `upload/shop-picker.tsx` — pilih toko/channel tujuan (dari toko aktif).
- `upload/draft-editor.tsx` (opsional fase U#2) — form draft per channel (mapping kategori + atribut
  wajib pakai validator yang sudah ada di BE; harga/stok awal).
- State: selection Set, dialog konfirmasi, toast hasil; setelah upload arahkan ke Pantauan/Riwayat.

**Acceptance:** bisa memilih ≥1 produk + ≥1 toko lalu upload; status pindah ke `in_review/pending`;
muncul di Riwayat Upload & Pantauan. tsc/eslint/build hijau.

---

## FASE L — Listing Marketplace (Produk Channel)  🔴 prioritas 2

**Route FE:** `/dashboard/listing-marketplace` (target nav `listing-marketplace` yang sudah ada).

**Alur:** katalog semua listing channel (koneksi SKU↔marketplace) lintas produk; kelola tiap listing:
aktif/nonaktif, update stok/harga override, unlink.

**Service** `services/master-produk/channel-product.service.ts`
- `list(params)` → `GET /products/channel-products` (search, `filter[channel]`, `filter[status]`,
  sort, per_page).
- `show(id)` → `GET /products/channel-products/{id}`.
- `activate(channel,id)` / `deactivate(channel,id)` / `updateStock` / `updatePrice` / `unlink`
  → endpoint `/v1/{channel}/products/{id}/*`.

**Hooks** `useChannelProducts`, `useChannelProduct`, mutations `useActivateListing`,
`useDeactivateListing`, `useUpdateListingStock`, `useUpdateListingPrice`, `useUnlinkListing`
(invalidate `channel-products`, `channel-monitor`).

**Komponen**
- `listing-marketplace/listing-view.tsx` — shell + tabel (Produk/SKU | Channel/Toko | external SKU |
  harga sinkron | stok sinkron | `SyncStatusBadge`) + filter channel/status + paginasi.
- `listing-marketplace/listing-row-actions.tsx` — menu aksi per baris (aktif/nonaktif, edit
  stok/harga override, unlink) + konfirmasi.
- Reuse `SyncStatusBadge`. Reuse pola tabel dari `detail/tab-channel.tsx`.

**Acceptance:** daftar listing tampil & terfilter; aksi aktif/nonaktif/unlink/override jalan +
optimistic/invalidate; status terupdate. Hijau.

---

## FASE M — Pantauan / Monitoring  🟠 prioritas 3

**Route FE:** `/dashboard/produk/pantauan` (+ tambah entri nav di grup Katalog).

**Alur:** ringkasan kesehatan sinkron per toko (kartu summary) → drill-down per toko → daftar produk
toko itu dengan status sinkron + last_synced_at + error.

**Service** `services/master-produk/channel-monitor.service.ts`
- `summary()` → `/channel-monitor/summary`.
- `index(params)` → `/channel-monitor`.
- `shopDetail(shopId)` → `/channel-monitor/{shop_id}`.
- `shopProducts(shopId, params)` → `/channel-monitor/{shop_id}/products`.

**Hooks** `useMonitorSummary`, `useMonitorIndex`, `useShopMonitor`, `useShopProducts`.

**Komponen**
- `pantauan/pantauan-view.tsx` — grid kartu summary (total synced/pending/failed/deactivated per
  toko) + pilih toko.
- `pantauan/shop-products-table.tsx` — tabel produk toko (SKU | status | last_synced | error) +
  filter status + aksi cepat "upload ulang" (reuse `useReuploadHistory`) bila gagal.

**Acceptance:** summary akurat; drill-down per toko menampilkan produk + status; bisa retry yang gagal.
Hijau.

---

## FASE R — In Review (daftar review)  🟢 prioritas 4 (kecil)

Tidak ada endpoint khusus; manfaatkan yang ada:
- Tambah filter status `in_review` di daftar master (`products/master?status=in_review`) — kemungkinan
  sudah didukung `ProductListService` (cek `status`/`filter`), cukup tambah tab/segmented filter di
  `product-master-view`.
- Atau tampilkan kolom "menunggu review channel" dari Pantauan (status `in_review`/`pending`).

**Acceptance:** pengguna bisa melihat daftar produk yang menunggu persetujuan marketplace dari satu
tempat (master filter atau Pantauan). Hijau.

---

## FASE N — Naikkan Produk = Promosi & Iklan (boost)  ⚪ OPSIONAL · DIKERJAKAN TERAKHIR

> **Status: opsional & paling akhir.** Bukan bagian parity Jubelio (lihat catatan di bawah) dan
> bergantung adapter BE yang belum ada. **Jangan dimulai** sebelum U–R selesai & distabilkan, dan
> hanya bila diputuskan untuk dibangun. Boleh juga di-skip sepenuhnya.

> **PENTING — temuan dari spec Jubelio (`dist (2).yaml`, `dist (3).yaml`):** spec Jubelio **TIDAK
> memiliki** endpoint `raise/naikkan/boost/promote/ads` sama sekali. Yang ada hanya alur **Upload
> Product Listing** (`/inventory/catalog/for-listing/{id}` → `/inventory/catalog/listing` →
> `/inventory/catalog/upload`). Artinya: dalam terminologi Jubelio, **"naikkan produk" = mengunggah/
> mem-publish produk ke marketplace (FASE U)**, BUKAN boost/iklan. Modul BE `RaiseProduct` adalah
> **ekstensi non-Jubelio** (tanpa padanan di spec). Maka boost/iklan di bawah ini adalah
> **diferensiator di luar Jubelio** — bangun hanya bila memang diinginkan, terpisah dari klaim
> "parity Jubelio".

Riset API marketplace (sumber resmi, mid-2026) menunjukkan "boost" itu **dua tier** dengan
ketersediaan API berbeda — ini menentukan apa yang bisa native vs deep-link:

**Tier 1 — Promosi non-berbayar (voucher/diskon/flash sale).** Tersedia via **open API ketiga
channel** → bangun native untuk semua:
- Shopee: Voucher / Discount / Add-on Deal / Bundle Deal / Shop Flash Sale (Open API v2).
- Lazada: `/promotion/voucher/*`, Free Shipping, Early Bird, Store Flash Sale.
- TikTok Shop: Promotion API (coupon + flash-deal/discount activities).

**Tier 2 — Iklan berbayar (true boost / discoverability).** Ketersediaan API berbeda tajam:
- **Shopee — native via Open API v2 `/ads/*`** (create/edit manual CPC product ads + GMS auto
  campaign + reporting/saldo/rekomendasi keyword). Paling lengkap → bisa in-app penuh (minta scope Ads).
- **Lazada — Sponsor Solutions API ada tapi gated/partner.** MVP: **deep-link** ke marketing console;
  native menyusul bila dapat akses partner.
- **TikTok — GMV Max via TikTok Business/Marketing API terpisah & gated** (bukan Shop Open API; sejak
  Jul 2025 GMV Max satu-satunya tipe ads Sales). MVP: **deep-link** ke Ads Manager.

**Implikasi UI (lihat juga §IA):** "Naikkan Produk" sebaiknya jadi workspace **Promosi & Iklan**:
- Tab **Promosi** (voucher/diskon/flash sale) — native semua channel.
- Tab **Iklan/Boost** — Shopee native (form kampanye + budget + keyword + laporan); Lazada/TikTok
  tampilkan kartu "Kelola di Seller Center" + deep-link (sampai akses ads partner ada).

**Prasyarat BE:** `RaiseProduct` saat ini tampak skeleton (menandai `applied`, tanpa adapter ads
nyata). Perlu BE: (a) adapter promosi per channel (Tier 1), (b) adapter Shopee Ads (`/ads/*`) untuk
Tier 2 Shopee, (c) penyimpanan deep-link/credential ads untuk Lazada/TikTok. **FASE N FE menunggu
keputusan ini**; bisa dimulai dengan Tier 1 (promosi) lebih dulu karena API-nya jelas tersedia.

**Route FE:** `/dashboard/promosi` (gabung dengan entri nav "Harga & Promosi › Promosi" yang sudah ada).
**Service** `raise-product.service.ts` → `raise-products*` + `/raise`; ditambah service promosi/ads
saat BE siap.
**Acceptance:** Tier 1 — buat voucher/diskon/flash sale per channel; Tier 2 — Shopee kampanye ads +
laporan, Lazada/TikTok deep-link. (Tergantung adapter BE.)

---

## Urutan & prioritas

```
U (Upload) → L (Listing Marketplace) → M (Pantauan) → R (In Review)        [inti]
                                                                  └─ N (Naikkan) [OPSIONAL, paling akhir]
```
- **U + L** paling bernilai (menutup alur publish + kelola koneksi SKU end-to-end di FE).
- **M** melengkapi monitoring lintas produk.
- **R** kecil (filter/tab), bisa diselipkan.
- **N (Naikkan/Boost)** — **opsional & dikerjakan paling akhir**, hanya bila diputuskan dibangun;
  bukan parity Jubelio + butuh adapter BE. Lingkup inti = U–R; N boleh di-skip.

Tiap fase: service → hooks → page/komponen → wire nav → `tsc`/`eslint`/`rtk next build` hijau →
commit. Tidak menyentuh BE kecuali FASE N (bila adapter boost perlu dilengkapi).

## Catatan & risiko
- Banyak entri nav lain juga stub (stok, penjualan, pembelian, gudang) — di luar lingkup alur produk;
  tidak digarap di plan ini.
- Validator atribut channel & mapping kategori sudah ada di BE (dipakai saat upload draft) — FASE U#2
  tinggal mengonsumsi, tak perlu logika baru.
- `RaiseProduct` kedalaman integrasi marketplace = satu-satunya ketidakpastian BE.
```
