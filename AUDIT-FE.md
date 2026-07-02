# Audit Frontend — cilupbah-fe

> Tanggal: 2026-07-02 · Basis: 527 file TS/TSX, Next.js 16.2.7 (App Router), React 19, TanStack Query 5, Axios, Tailwind 4.
> Fokus: praktik yang belum best practice, kebersihan layer, komponen yang perlu refactor, redundansi kode, inkonsistensi UI, dan **penyebab navigasi lambat + fetch storm**.

---

## Progress Perbaikan (update 2026-07-02)

Status: ✅ selesai · 🔶 sebagian · ⬜ belum

| Status | Item | Perubahan |
|---|---|---|
| ✅ | **§1.1 proxy.ts fetch storm** | `src/proxy.ts` tidak lagi memanggil backend `/profile`; kini sinkron, hanya cek keberadaan cookie. Validasi sesi pindah ke interceptor 401 di `src/lib/api-client.ts` (hapus cookie via `clearLoginSession` → redirect login + callbackUrl). Fail-open ikut hilang. Navigasi & prefetch tidak lagi menunggu/menyerbu backend. |
| ✅ | **§1.4 debounce** | Hook bersama baru `src/hooks/use-debounced-value.ts`. Audit ulang menemukan sebagian besar search ternyata sudah debounce manual (`setTimeout`/`appliedSearch`); satu-satunya yang fetch-per-ketikan (`transaction-detail-sheet.tsx`) sudah dipindah ke hook baru. File baru wajib pakai hook ini. |
| ✅ | **§1.5 placeholderData** | `placeholderData: keepPreviousData` ditambahkan ke 13 hook list berpaginasi (semua `use*s` dengan key `[x, "list", params]`). Paginasi tidak lagi flash-skeleton. |
| ✅ | **§1.6 polling saat tab hidden** | Auto-refresh `monitor-stok-view.tsx` kini hanya refetch saat `document.visibilityState === "visible"`. |
| 🔶 | **§1.2 prefetch RSC** | Ditambah 2 halaman: `dashboard/transaksi-pembelian` dan `dashboard/kontak-pemasok` (pola `getServerQueryClient` + `HydrationBoundary`, sama dengan `dashboard/pesanan`). Total kini 5 halaman; sisanya menyusul per halaman (perlu menyamakan query key initial per view). |
| 🔶 | **§2 layering service→komponen** | Aturan ESLint `no-restricted-imports` (warn) ditambahkan di `eslint.config.mjs` untuk blokir impor `@/services/*` dari `src/components/**`. 38 file lama belum dimigrasi ke hooks — jangan tambah pelanggar baru. |
| ✅ | **§4.1 formatter** | `src/lib/format.ts` baru (formatDate/formatDateLong/formatDateTime/formatCurrency/formatNumber, id-ID, aman terhadap null). Codemod memigrasi 26 file; 8 file sisa memakai varian format yang memang berbeda (dibiarkan lokal secara sadar). |
| ✅ | **§4.4 kode mati & deps** | `src/components/sidebar-05/` dihapus (tidak diimpor siapa pun); `@tabler/icons-react` dicabut dari dependencies; `shadcn` (CLI) dipindah ke devDependencies. |
| ✅ | **§5.6 branding** | Header mobile "UltraFit WMS" → "Cilupbah" (`dashboard/layout.tsx`). |
| ✅ | **§6.2 env server-only** | `api-server.ts` & `api/app/[...path]/route.ts` kini membaca `API_URL` (server-only) lebih dulu, fallback ke `NEXT_PUBLIC_API_URL` untuk kompatibilitas. Set `API_URL` di environment deploy lalu hapus var publiknya. |
| ⬜ | **§1.3 invalidasi granular** | Belum — paling aman dikerjakan bersama factory `createCrudHooks` agar konsisten. |
| ⬜ | **§4.2 `ResourceListView<T>`** | Belum — dedup 9+ tab list (~3.000 baris) adalah refactor besar, butuh QA visual per modul. |
| ⬜ | **§4.3 factory `createCrudHooks`** | Belum. |
| ⬜ | **§3 pecah komponen besar** | Belum (`order-card.tsx`, `map.tsx`, `layout-gudang-tab.tsx`, form-page besar). |
| ⬜ | **§5 design system kecil** | Belum (`Surface`, `StatusBadge`, `PageTabs` + state tab di URL, larangan `<img>`). |
| ⬜ | **§6.3 `images.remotePatterns`** | Belum — perlu daftar host CDN/marketplace yang benar-benar dipakai sebelum menyempitkan `"**"`. |

Verifikasi: `tsc --noEmit` bersih, `next build` sukses (79 route), ESLint bersih pada file yang diubah, alur logout dicek tetap benar (cookie dihapus sebelum redirect sehingga guard guest-route baru tidak memantulkan balik).

---

## Daftar Isi

1. [KRITIS — Navigasi lambat & fetch storm](#1-kritis--navigasi-lambat--fetch-storm)
2. [Komponen tidak bersih dari service (pelanggaran layering)](#2-komponen-tidak-bersih-dari-service)
3. [Komponen terlalu besar / perlu refactor](#3-komponen-terlalu-besar--perlu-refactor)
4. [Kode redundan — seharusnya reusable & single source of truth](#4-kode-redundan)
5. [Inkonsistensi UI](#5-inkonsistensi-ui)
6. [Praktik Next.js yang belum best practice](#6-praktik-nextjs-yang-belum-best-practice)
7. [Roadmap perbaikan berprioritas](#7-roadmap-perbaikan-berprioritas)

---

## 1. KRITIS — Navigasi lambat & fetch storm

### 1.1 `src/proxy.ts` — validasi token blocking ke backend pada SETIAP navigasi ⚠️ AKAR MASALAH UTAMA

`src/proxy.ts:10-21` — setiap request ke route yang match (`matcher` mencakup **semua halaman** kecuali `/api` dan aset statis) memanggil:

```ts
async function isTokenValid(token: string): Promise<boolean> {
  const res = await fetch(`${base}/api/v1/profile`, { ..., cache: "no-store" });
  ...
}
```

Dampaknya berlapis:

1. **Setiap navigasi menunggu satu round-trip penuh ke backend** (`/api/v1/profile`, `no-store`, tanpa cache apa pun) *sebelum* Next.js mulai merender halaman tujuan. Jika backend 200–500 ms, semua navigasi terasa "berat" sebesar itu — ini yang membuat navigasi tidak responsif.
2. **Prefetch `<Link>` ikut memicunya.** Sidebar punya **34 link** (`src/components/dashboard/sidebar/nav-data.ts`) yang semuanya `<Link>` dengan prefetch default (`nav-main.tsx:149,174,200`, `sidebar-rail-nav.tsx:70,98,140,210`). Saat sidebar dirender/di-hover, Next mem-prefetch route → setiap prefetch melewati proxy → **puluhan panggilan `/api/v1/profile` ke backend sekaligus**. Inilah *fetch storm* yang terlihat di network tab / log backend.
3. **Fail-open**: `catch { return true }` dan non-401 → `true` (`proxy.ts:16-20`). Selain menutupi outage backend, ini juga celah keamanan (backend down = semua token dianggap valid).

**Rekomendasi:**
- Di middleware, cukup cek **keberadaan/exp token secara lokal** (decode JWT tanpa panggilan jaringan). Biarkan `/api/app/[...path]/route.ts` yang sudah meneruskan 401 menjadi sumber kebenaran; tangani 401 di `api-client` (redirect ke login).
- Jika validasi remote wajib, cache hasilnya per token (mis. cookie `token_verified` ber-TTL pendek, atau LRU in-memory) dan **jangan** jalankan untuk request prefetch (`request.headers.get("next-router-prefetch")` / `purpose: prefetch`).
- Perbaiki fail-open → fail-closed dengan pengecualian error jaringan yang eksplisit.

### 1.2 Hampir semua halaman client-rendered → waterfall fetch di klien

- **29 dari 79 `page.tsx` bertanda `"use client"`**, dan sisanya pun umumnya hanya membungkus view client. Total **344 file** ber-`"use client"`.
- Infrastruktur prefetch server **sudah ada dan bagus** (`src/lib/api-server.ts` + `getServerQueryClient()` + `setServerFetcher`) tetapi **hanya dipakai 3 halaman**: `dashboard/proses-pesanan/picking`, `dashboard/pesanan`, `dashboard/produk/master`.
- Akibatnya pola tiap navigasi: unduh chunk JS → mount React → hook `useQuery` jalan → axios → `/api/app/[...path]` (hop tambahan) → backend. Konten baru muncul setelah 2 round-trip berurutan **setelah** halaman selesai mount — ditambah blokade §1.1 di depannya.

**Rekomendasi:** jadikan pola `HydrationBoundary` + `prefetchQuery` (yang sudah terbukti di 3 halaman itu) sebagai standar untuk semua halaman list/detail utama; halaman yang murni statis (mis. `pengaturan/page.tsx`) biarkan sebagai Server Component tanpa `"use client"`.

### 1.3 Invalidasi query terlalu luas → burst refetch setelah mutasi

Pola `queryClient.invalidateQueries({ queryKey: ["outbound-transfer"] })` (8 tempat), `["stock-opname"]` (6), `["purchase-order"]` (6), `["kategori"]` (5), `["master-produk"]` (3), dst. Invalidasi pada prefix root membatalkan **semua** list + detail + lookup di bawah key itu sekaligus; semua query aktif refetch berbarengan → gelombang request setiap habis aksi (approve/delete/update).

**Rekomendasi:** invalidasi setargeted mungkin (`["stock-opname", "list"]`, `setQueryData` untuk detail), atau gunakan `refetchType: "active"` secara sadar.

### 1.4 Search tanpa debounce yang konsisten

- ±22 input search men-set state yang langsung menjadi bagian `queryKey` → **satu fetch per ketikan**.
- Debounce *ada* tapi diimplementasi ulang manual via `useEffect + setTimeout` di **34 file** (mis. `posisi-stok-view.tsx:171-183`) — tidak ada hook `useDebounce` bersama (grep `*debounce*` di `src/hooks` = 0 file). Halaman yang lupa menyalin pola itu otomatis jadi sumber fetch storm.

**Rekomendasi:** buat `src/hooks/use-debounced-value.ts` tunggal, wajibkan untuk semua search/filter yang men-trigger query.

### 1.5 Paginasi tanpa `placeholderData` → refetch kasar + UI flash

Hanya **9 file** memakai `placeholderData`/`keepPreviousData`. Selebihnya, ganti halaman/filter = data lama dibuang → skeleton penuh → layout shift, dan pengguna cenderung mengklik ulang (memicu request tambahan).

**Rekomendasi:** `placeholderData: keepPreviousData` sebagai default di hook list (mudah kalau hook CRUD di-factory-kan, lihat §4.3).

### 1.6 Polling & auto-refresh (perlu diaudit batasnya)

- `monitor-stok-view.tsx:217` — `setInterval(refetch, autoRefresh * 1000)`; pastikan berhenti saat tab tidak terlihat (`document.visibilityState`) — saat ini tidak.
- `use-import.ts:29`, `use-download.ts:30` — `refetchInterval` kondisional (pola sudah benar, sekadar dicatat sebagai sumber traffic berkala).
- `destination-table.tsx:165-172` — auto-run match per halaman data dengan guard `useRef` + `eslint-disable exhaustive-deps`; rapuh, lebih aman dimodelkan sebagai query dengan key `storeIds`.

---

## 2. Komponen tidak bersih dari service

**38 file komponen** mengimpor `@/services/*` langsung, melompati layer `hooks/` yang sudah ada. Ini menciptakan dua jalur akses data (hook vs service langsung), menyulitkan caching/invalidasi konsisten, dan membuat komponen tak bisa dites tanpa jaringan.

Daftar lengkap (hasil `grep -rl "from \"@/services" src/components`):

| Area | File |
|---|---|
| Auth | `auth/login-form.tsx` |
| Sidebar | `dashboard/sidebar/sidebar-rail-nav.tsx` (logout langsung panggil service + `window.location.href`) |
| Kategori-Merek | `petakan-kategori-dialog.tsx` |
| Barang Masuk | `putaway-process-view.tsx` |
| Kontak Pemasok | `import-pemasok-view.tsx` |
| Proses Pesanan | `picking/ad-hoc-picking-view.tsx`, `picking/picklist-table.tsx`, `packing/packlist-table.tsx` |
| Persediaan | `posisi-stok-view.tsx` (bangun `useQuery` inline dengan `InventoryStockService` — `posisi-stok-view.tsx:30,159,164`) |
| Manajemen Rak | `lokasi/layout-gudang-tab.tsx` |
| Master Produk | 24 file: `product-explorer.tsx`, seluruh folder `naikkan/` (6), `detail/` (6), `download/` (4), `import/` (3), `upload/` (2), `upload-to-channel/` (2), `pantauan/` (2), `listing-marketplace/` (2) |

Catatan khusus: file `*-columns.tsx` (definisi kolom tabel) ikut mengimpor service — definisi kolom seharusnya murni presentasional; aksi per-baris dioper lewat props/callback.

**Rekomendasi:** aturan lint `no-restricted-imports` untuk `@/services/*` di dalam `src/components/**`, lalu migrasi bertahap ke hooks (module `master-produk` prioritas karena terbanyak).

---

## 3. Komponen terlalu besar / perlu refactor

25+ komponen di atas 400 baris. Yang paling mendesak:

| File | Baris | Masalah |
|---|---|---|
| `components/ui/map.tsx` | 1.854 | 12 `useEffect` dalam satu file; gabungan renderer, kontrol, dan state MapLibre. Untungnya hanya diimpor via `location-map-picker.tsx` yang sudah `next/dynamic`. Pecah per concern (layer, kontrol, interaksi). |
| `manajemen-rak/lokasi/layout-gudang-tab.tsx` | 1.072 | Tab tunggal berisi canvas + form + fetch (impor service langsung). |
| `pesanan/order-card.tsx` | 910 | Sebuah *card* berisi 20+ ikon, `Dialog`, `ConfirmDialog`, `Select`, `BuatPicklistDialog`, mapping status, dan formatter lokal. Pecah: `OrderCardHeader/Items/Actions`, angkat dialog ke level list. |
| `barang-masuk/putaway-process-view.tsx` | 880 | View + wizard + service call campur. |
| `pesanan/order-detail-view.tsx` | 799 | Sama seperti order-card: view + aksi + format. |
| `proses-pesanan/shared/fulfillment-orders-table.tsx` | 743 | Tabel + filter + aksi + formatter. |
| `kontak-pelanggan/pelanggan-form-page.tsx` (732), `kontak-pemasok/kontak-form-page.tsx` (568), `transaksi-pembelian/pesanan-form-page.tsx` (561), `pengaturan/pengguna/user-form-page.tsx` (436) | | Empat "form page" dengan struktur mirip — kandidat abstraksi form-section bersama. |
| `picking-proses-view.tsx` (592), `packing-proses-view.tsx` (577), `packing-detail-view.tsx` (524), `ad-hoc-picking-view.tsx` (521) | | Alur picking/packing paralel yang banyak berbagi struktur. |

Pola pecahannya seragam: **container (hook + state) → presentational (props murni) → dialogs/aksi terpisah**.

---

## 4. Kode redundan

### 4.1 Formatter diduplikasi puluhan kali

- `function formatDate(...)` didefinisikan ulang **32×** (contoh: `retur-pembelian-tab.tsx:46`, `transfer-out-detail-view.tsx:57`, `pesanan-list-view.tsx:32`, `opname-tab.tsx:61`, …). Ada juga 30 file lain memakai `toLocaleDateString` langsung, plus sebagian memakai `date-fns` (`order-card.tsx:5`). **Tiga cara memformat tanggal** dalam satu app → format tampilan tak dijamin seragam.
- `Intl.NumberFormat` (rupiah) diinstansiasi lokal di **15 file** (`product-columns.tsx`, `order-card.tsx`, `hpp-report-view.tsx`, …).

**Fix:** `src/lib/format.ts` berisi `formatDate`, `formatDateTime`, `formatRupiah`, `formatNumber` — lalu codemod penggantian.

### 4.2 Komponen "list tab" fotokopi ±400 baris

`penyesuaian-tab.tsx`, `opname-tab.tsx`, `transfer-tab.tsx`, `cadang-tab.tsx`, `revaluasi-tab.tsx` (transaksi-stok) — struktur, impor, state filter, `formatDate`, toolbar, ConfirmDialog, export CSV **identik**, hanya beda kolom + hook. Pola yang sama terulang di `barang-keluar/` (`retur-pembelian-tab`, `transfer-keluar-tab`) dan `barang-masuk/` (`penerimaan-barang-tab`, `transfer-masuk-tab`). Estimasi >3.000 baris duplikat.

**Fix:** satu komponen generik `ResourceListView<T>` (props: columns, hook list, filter config, aksi baris) — perubahan UX list cukup di satu tempat.

### 4.3 Hooks CRUD fotokopi

`use-stock-adjustments.ts` dan `use-stock-opname.ts` (dan mayoritas dari 61 hook) berpola identik: `useXList`, `useXDetail`, `useCreateX`, `useDeleteX` + toast + invalidate. **Fix:** factory `createCrudHooks({ key, service })` yang sekaligus menstandardisasi `staleTime`, `placeholderData`, dan granularitas invalidasi (menyelesaikan §1.3 & §1.5 sekaligus).

### 4.4 Kode mati & duplikat struktural

- **`src/components/sidebar-05/` (± 4 file, app-sidebar 526 baris) tidak diimpor siapa pun** — hapus. `team-switcher.tsx` di dalamnya duplikat dari `dashboard/sidebar/team-switcher.tsx`.
- Dua service inventory paralel: `services/persediaan/inventory.service.ts` vs `services/master-produk/inventory.service.ts` — dua bentuk respons untuk domain stok yang sama.
- `@tabler/icons-react` di `package.json` hanya dipakai oleh sidebar-05 yang mati → ikut terhapus.
- Dependensi ganda Radix: paket payung `radix-ui` **dan** `@radix-ui/react-label`/`react-slot`; `shadcn` (CLI) tercantum sebagai *dependency* runtime — pindahkan ke devDependencies/hapus.

### 4.5 Utilitas kecil yang belum dishare

- Debounce manual di 34 file (lihat §1.4).
- Parsing query string manual `new URLSearchParams(window.location.search)` (`login-form.tsx:64`, `integrasi-channel-view.tsx:55`) padahal ada `useSearchParams`.
- `FilterToolbar` milik `master-produk` diimpor lintas modul oleh `transaksi-stok` (`penyesuaian-tab.tsx:21`) — promosikan ke `components/ui/` atau `components/dashboard/shared/`.

---

## 5. Inkonsistensi UI

| # | Temuan | Bukti |
|---|---|---|
| 5.1 | **Dua sistem "surface"**: `LiquidGlass` (63 file) vs `Card` shadcn (2 file) vs div polos — halaman berbeda punya kedalaman/tekstur berbeda. | grep LiquidGlass/Card |
| 5.2 | **Badge**: komponen `Badge` dipakai di banyak tabel, tetapi pill dirakit manual `<span className="rounded-full bg-primary/10 px-2 …">` di sidebar & card (`nav-main.tsx:160-163`). | |
| 5.3 | **Tabel**: 34 file pakai `DataTable` bersama, **13 file** merakit `ui/table` mentah sendiri (paginasi/sort/empty-state jadi beda-beda). | |
| 5.4 | **Tab**: tiap halaman merakit pill-tab sendiri dengan `useState` lokal (`transaksi-stok/page.tsx:44-66`) — gaya visual berbeda antar halaman **dan state tab hilang saat refresh/navigasi** karena tidak disimpan di URL (`?tab=`). | |
| 5.5 | **Gambar**: 16 `<img>` mentah vs `next/image` di tempat lain (tanpa optimasi/lazy). | |
| 5.6 | **Branding**: header mobile menulis "UltraFit WMS" (`dashboard/layout.tsx:47`) sementara metadata & login "Cilupbah Superapps". | |
| 5.7 | **Format tanggal/uang tidak seragam** sebagai efek §4.1 (ada `dd/MM/yyyy`, `toLocaleDateString("id-ID")`, dan date-fns dengan locale berbeda). | |
| 5.8 | Latar glow dashboard ditulis inline 3 blok `style={{background: radial-gradient…}}` di layout (`dashboard/layout.tsx:14-38`) — sulit dijaga konsisten dengan theme token. | |

**Rekomendasi:** tetapkan design-system kecil: `Surface` (pembungkus LiquidGlass/Card), `StatusBadge` (map status→warna terpusat di `lib/status.ts`), `PageTabs` (pill-tab + sinkron `useSearchParams`), dan larang `<img>` via lint `@next/next/no-img-element`.

---

## 6. Praktik Next.js yang belum best practice

> Konteks: `AGENTS.md` sudah mengingatkan Next versi ini berbeda dari konvensi lama — beberapa poin di bawah adalah konvensi App Router yang belum dimanfaatkan.

1. **RSC nyaris tak dipakai untuk data** — lihat §1.2. `"use client"` di level `page.tsx` (29 halaman) menghilangkan streaming/SSR untuk seluruh subtree; cukup tandai leaf yang interaktif.
2. **`NEXT_PUBLIC_API_URL` dipakai sebagai URL backend server-side** (`api-server.ts:9`, `proxy.ts:11`, `api/app/[...path]/route.ts:4`). Prefix `NEXT_PUBLIC_` membocorkan origin backend ke bundle klien padahal semua trafik klien lewat proxy `/api/app`. Gunakan env server-only (`API_URL`).
3. **`images.remotePatterns: hostname "**"`** (`next.config.ts`) menjadikan image optimizer proxy terbuka untuk host mana pun — batasi ke host CDN/marketplace yang dipakai.
4. **Fail-open auth** di `proxy.ts:16-20` (lihat §1.1).
5. **`window.location.href` untuk logout** (`sidebar-rail-nav.tsx:132`) dan **parsing `window.location.search` manual** — gunakan `router`/`useSearchParams`; full reload membuang seluruh state & cache klien.
6. `loading.tsx`/`error.tsx` baru ada 32 buah untuk 79 route — halaman tanpa `loading.tsx` menampilkan freeze saat transisi server (begitu RSC dipakai lebih luas, ini wajib dilengkapi).
7. `optimizePackageImports` baru mencakup `lucide-react` — pertimbangkan menambah paket ikon/util lain bila dipakai (dan hapus `@tabler/icons-react`, §4.4).
8. State filter/tab/paginasi disimpan di `useState` lokal, bukan URL — kembali dari halaman detail = kehilangan posisi list (back-button UX buruk; juga membuat prefetch/link-sharing tidak mungkin).

---

## 7. Roadmap perbaikan berprioritas

| Prioritas | Aksi | Dampak | Effort |
|---|---|---|---|
| **P0** | Hilangkan fetch `/profile` blocking dari `proxy.ts` (validasi lokal + skip prefetch + fail-closed) | Navigasi langsung terasa cepat; fetch storm prefetch hilang | Kecil (1 file) |
| **P0** | Hook `useDebouncedValue` bersama + terapkan ke semua search | Menghapus fetch-per-ketikan | Kecil |
| **P1** | `placeholderData: keepPreviousData` + invalidasi granular via factory `createCrudHooks` | Paginasi halus, burst refetch pasca-mutasi hilang | Sedang |
| **P1** | Perluas pola prefetch RSC (`getServerQueryClient` + `HydrationBoundary`) dari 3 → semua halaman list utama | Konten muncul saat navigasi selesai, bukan setelahnya | Sedang |
| **P1** | Lint `no-restricted-imports` services→components; migrasi 38 file (mulai `master-produk`) | Layering bersih, testable | Sedang |
| **P2** | `lib/format.ts` (tanggal/rupiah) + codemod 32+15 duplikat | Single source of truth format | Kecil |
| **P2** | `ResourceListView<T>` generik untuk 9+ tab list fotokopi | −3.000 baris duplikat | Besar |
| **P2** | Hapus `sidebar-05/`, `@tabler/icons-react`, rapikan dependensi Radix/shadcn | Bundle & maintenance | Kecil |
| **P3** | Pecah `order-card.tsx`, `map.tsx`, `layout-gudang-tab.tsx`, form-page besar | Maintainability | Besar |
| **P3** | Design system kecil: `Surface`, `StatusBadge`, `PageTabs` (+state di URL), larang `<img>` | UI konsisten | Sedang |
| **P3** | Env server-only untuk backend URL; batasi `images.remotePatterns` | Keamanan | Kecil |
