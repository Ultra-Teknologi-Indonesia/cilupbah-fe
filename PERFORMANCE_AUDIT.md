# Audit Performa Frontend — Cilupbah WMS (Next.js 16 App Router)

> Fokus: UX instan (non-blocking), menghindari waterfall/fetch storm, memaksimalkan responsivitas.
> Basis kode: `next@16.2.7`, React Query (TanStack), Axios → proxy `/api/app`, Zustand.
> Tanggal: 2026-07-01.

---

## Ringkasan Eksekutif

Arsitektur data aplikasi ini **100% client-side**: setiap halaman merender shell statis, lalu Client Component menembak React Query (`useQuery`) → Axios → route proxy `/api/app/[...path]` → backend. Tidak ada satupun data yang di-fetch di server (`useSuspenseQuery` = **0**, `"use server"` = **1**, praktis semua fetching pakai `useQuery` = **64 hook**).

Konsekuensi langsung terhadap tiga target Anda:

| Target | Status | Akar Masalah |
|---|---|---|
| SSR non-blocking / streaming | ⚠️ Ilusi | `<Suspense>` dipasang di 21 tempat, tapi **tidak pernah terpicu** karena `useQuery` tidak pernah suspend. Streaming server tidak terjadi. |
| Navigasi & aksi instan | ❌ | `router.push` di 64 titik tanpa `useTransition`; mutasi tanpa `useOptimistic`/optimistic update (`onMutate` hanya **1**). |
| Anti waterfall / fetch storm | ❌ | `invalidateQueries` dipanggil **172×**, mayoritas dengan key akar super-luas (`fulfillmentKeys.all`) → tiap mutasi memicu refetch borongan. |
| Beban Client vs Server | ❌ | **340 dari 523 file** ber-`"use client"`. Boundary client dipasang sangat tinggi. |

Skor kasar: aplikasi ini secara efektif adalah **SPA yang dibungkus Next.js**, kehilangan hampir semua keunggulan RSC/streaming yang menjadi alasan memakai App Router.

---

## 1. SSR Blocking & Streaming

### 1.1 `<Suspense>` adalah dead code (temuan utama)

Pola di setiap page, contoh `src/app/dashboard/pesanan/page.tsx`:

```tsx
export default function PesananPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle .../>
      <Suspense fallback={<TableSkeleton rows={6} cols={6} />}>
        <PesananView />   {/* "use client", pakai useQuery */}
      </Suspense>
    </div>
  )
}
```

`PesananView` memakai `useOrders()` → `useQuery`. **`useQuery` tidak melempar promise**, jadi Suspense boundary **tidak akan pernah menampilkan fallback**. `TableSkeleton` di sini tidak pernah dirender lewat Suspense. Loading state sebenarnya ditangani manual di dalam view (atau tidak sama sekali).

Artinya:
- Server hanya mengirim shell + skeleton via `loading.tsx` (31 file) untuk transisi route, bukan streaming data.
- First contentful data baru muncul setelah: HTML → download JS bundle → hydration → React Query fire → proxy → backend. Ini **4 hop serial** sebelum user lihat data — kebalikan dari "instan".

**Perbaikan (pilih salah satu strategi, konsisten):**

**Opsi A — Streaming sungguhan (rekomendasi untuk halaman read-heavy):** pindahkan fetch awal ke Server Component dan hydrate React Query.

```tsx
// app/dashboard/pesanan/page.tsx  (Server Component, tanpa "use client")
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { OrderService } from "@/services/pesanan/order.service"

export default async function PesananPage() {
  const qc = new QueryClient()
  // prefetch di server — mulai lebih awal, tanpa nunggu bundle client
  await qc.prefetchQuery({
    queryKey: ["pesanan", "list", DEFAULT_PARAMS],
    queryFn: () => OrderService.list(DEFAULT_PARAMS),
  })
  return (
    <div className="flex flex-col gap-6">
      <PageTitle .../>
      <Suspense fallback={<TableSkeleton rows={6} cols={6} />}>
        <HydrationBoundary state={dehydrate(qc)}>
          <PesananView />
        </HydrationBoundary>
      </Suspense>
    </div>
  )
}
```
> Catatan: `OrderService` sekarang lewat Axios ke `/api/app`. Untuk fetch server-side, panggil backend langsung (`BACKEND_URL`) dari service versi server, atau pakai `fetch()` absolut — Axios `baseURL: "/api/app"` (relatif) tidak jalan di server.

**Opsi B — Tetap client, tapi jujurkan Suspense:** ganti `useQuery` → `useSuspenseQuery` di hook view utama. Ini membuat `<Suspense>` yang sudah terpasang benar-benar berfungsi (skeleton muncul saat fetch), tanpa menulis loading-state manual.

```ts
// src/hooks/pesanan/use-orders.ts
import { useSuspenseQuery } from "@tanstack/react-query"
export function useOrders(params: OrderListParams) {
  return useSuspenseQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => OrderService.list(params),
    staleTime: STALE,
  })
}
```
> Hati-hati: `useSuspenseQuery` tidak boleh dipakai dengan `enabled` kondisional. Untuk query dependen (lihat §3) tetap pakai `useQuery`.

### 1.2 `loading.tsx` + `<Suspense>` redundan

Banyak route punya **keduanya** (`pesanan/loading.tsx` dan `<Suspense>` di page). Karena page tidak async & tidak suspend, `loading.tsx` hanya muncul sekejap saat navigasi route lalu langsung digantikan shell kosong. Setelah menerapkan Opsi A/B, tinjau ulang: jika page jadi async (prefetch server), `loading.tsx` yang menangani transisi route; `<Suspense>` menangani streaming granular. Jangan pertahankan skeleton di dua lapis yang saling menutupi.

### 1.3 Tidak ada `error.tsx` sama sekali (0 file)

Kegagalan proxy/backend melempar ke boundary terdekat — tidak ada. Untuk aplikasi WMS, satu error fetch bisa membuat seluruh subtree blank. Tambahkan minimal `app/dashboard/error.tsx` (Client Component dengan tombol `reset()`), idealnya per-segmen berat.

---

## 2. Navigasi & Aksi Instan

### 2.1 `router.push` tanpa `useTransition` (64 titik)

`useTransition` dipakai **0×**. Navigasi imperatif memblokir UI sampai route baru siap:

```tsx
// pola saat ini (memblokir, tidak ada feedback)
onClick={() => router.push(`/dashboard/produk/${id}`)}
```

**Perbaikan:** bungkus dengan transition agar UI tetap responsif dan bisa menampilkan pending state:

```tsx
const [isPending, startTransition] = useTransition()
// ...
onClick={() => startTransition(() => router.push(`/dashboard/produk/${id}`))}
// tombol: disabled={isPending} + spinner
```

Lebih baik lagi: untuk navigasi murni, ganti `<button onClick={router.push}>` menjadi `<Link href>`. `<Link>` memicu **prefetch otomatis** saat masuk viewport (di Next 16 default prefetch aktif), sehingga tujuan sudah hangat sebelum diklik — sesuatu yang `router.push` tidak lakukan.

### 2.2 Prefetch belum dimanfaatkan

Tidak ditemukan `prefetch={false}` (bagus, default aktif), tapi karena banyak navigasi memakai `router.push` alih-alih `<Link>`, prefetch tidak jalan untuk titik-titik itu. Untuk baris tabel/kartu yang sering diklik (pesanan, produk, picklist), pakai `<Link>` pada elemen row, atau prefetch manual saat hover:

```tsx
onMouseEnter={() => router.prefetch(`/dashboard/produk/${id}`)}
```

### 2.3 Mutasi tanpa optimistic update (`useOptimistic` = 0, `onMutate` = 1)

44 `useMutation`, hampir semuanya pola: klik → tunggu server → `invalidateQueries` → tunggu refetch → UI update. User menunggu **2 round-trip** untuk melihat perubahan. Untuk aksi WMS yang sering & berturut (scan, pindah status picking/packing/shipping) ini terasa lambat.

**Perbaikan — optimistic via `onMutate` (React Query):**

```ts
useMutation({
  mutationFn: FulfillmentService.pickItem,
  onMutate: async (vars) => {
    await qc.cancelQueries({ queryKey: fulfillmentKeys.picklistDetail(vars.picklistId) })
    const prev = qc.getQueryData(fulfillmentKeys.picklistDetail(vars.picklistId))
    qc.setQueryData(fulfillmentKeys.picklistDetail(vars.picklistId), (old) =>
      applyPickOptimistic(old, vars))          // update instan
    return { prev }
  },
  onError: (_e, vars, ctx) =>
    qc.setQueryData(fulfillmentKeys.picklistDetail(vars.picklistId), ctx?.prev), // rollback
  onSettled: (_d, _e, vars) =>
    qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(vars.picklistId) }),
})
```

Jika beberapa aksi dipindah ke Server Actions, gunakan React `useOptimistic` + `startTransition` untuk pola yang sama tanpa React Query.

---

## 3. Penyebab Fetch Storm & Waterfall

### 3.1 Fetch storm: invalidasi key akar (temuan utama)

`invalidateQueries` dipanggil **172×**. Pola dominan di `src/hooks/proses-pesanan/use-fulfillment.ts` — hampir setiap mutasi:

```ts
onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.all })
```

`fulfillmentKeys.all` adalah key akar. Satu aksi kecil (mis. pick 1 item) meng-**invalidate seluruh cache fulfillment**: list picking, shipping, done, delivered, counts, semua detail yang ter-mount — semua refetch serentak. Di layar proses-pesanan yang menampilkan banyak query sekaligus, ini adalah **fetch storm** klasik: 1 klik → 5–10 request.

**Perbaikan:** invalidasi setepat mungkin. Anda sudah punya key granular (`picklistDetail(id)`) — pakai itu. Untuk daftar, invalidate hanya list yang terpengaruh, bukan `.all`:

```ts
onSuccess: (_d, v) => {
  qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(v.picklistId) })
  qc.invalidateQueries({ queryKey: fulfillmentKeys.counts })   // kalau badge perlu update
}
```
Kombinasikan dengan `setQueryData` optimistic (§2.3) agar tidak perlu refetch daftar sama sekali di banyak kasus.

### 3.2 Waterfall: query dependen berantai

Banyak hook memakai `enabled: !!id` / `enabled: categoryId > 0` (lihat `use-kategori.ts` yang punya rantai `categoryId → channelCode → ...`). Pola ini benar untuk data yang genuinely dependen, **tapi** jika beberapa query independen di satu view masing-masing menunggu state sebelumnya, terjadi waterfall.

- Cek `src/hooks/kategori-merek/use-kategori.ts` (baris 22/48/57/94/145/154/163): pastikan query yang **tidak** saling bergantung tidak di-gate oleh state yang sama secara berurutan.
- Untuk data awal halaman yang independen (mis. `list` + `counts` di pesanan), pastikan keduanya di-mount bersamaan (mereka sudah, via `useOrders` + `useOrderCounts` di komponen yang sama) — **jangan** menaruh `counts` di child yang baru mount setelah `list` selesai.

**Prinsip:** query independen → jalankan paralel (mount bersamaan / `useQueries`). Query dependen → biarkan `enabled`, tapi prefetch sedini mungkin.

### 3.3 Dedup & re-render: `queryKey` dengan objek params

`useOrders(params)` memakai `queryKey: [...all, "list", params]` dengan `params` berupa objek. React Query membandingkan key secara struktural (hashing) sehingga dedup **tetap jalan** — bagus. **Tapi** risikonya di sisi React: jika `params` dibuat inline (`{ tab, page, ... }`) tiap render tanpa memoization, referensi baru tiap render memicu `useQuery` mengevaluasi ulang & komponen re-render berlebih.

Di `PesananView`, `params` sebaiknya di-`useMemo` dari state primitif:

```ts
const params = useMemo<OrderListParams>(
  () => ({ tab, subFilter, query, page, perPage, ...filters }),
  [tab, subFilter, query, page, perPage, filters]
)
const { data } = useOrders(params)
```
Pastikan `filters` sendiri stabil (state, bukan objek literal baru). `query` (search box) sebaiknya **di-debounce** sebelum masuk `params`, kalau tidak tiap ketikan = 1 request.

### 3.4 Proxy `/api/app` menambah 1 hop di jalur kritis

`src/app/api/app/[...path]/route.ts` mem-buffer seluruh respons JSON (`await response.text()` → `JSON.parse` → `NextResponse.json`) sebelum mengirim ke client. Untuk payload besar (list produk/pesanan), ini menambah latensi + memori dan menghilangkan streaming. Pertimbangkan:
- Untuk respons JSON besar, stream `response.body` langsung (seperti yang sudah dilakukan untuk non-JSON) alih-alih buffer penuh, kecuali Anda butuh membaca body untuk transformasi.
- Aktifkan caching di route handler untuk data yang jarang berubah (`Cache-Control`, atau Next 16 Cache Components / `use cache`), sehingga tidak setiap request menembus ke backend.

---

## 4. Beban Client vs Server ("use client" terlalu tinggi)

### 4.1 Angka

- **340 / 523 file** ber-`"use client"` (65%).
- `RootLayout` merender `QueryProvider`, `PhantomProvider`, `Toaster`, `LiquidGlassFilter` — beberapa provider client membungkus seluruh app (wajar untuk QueryProvider), tapi kombinasinya menarik banyak JS ke bundle awal.
- `DashboardLayout` sendiri Server Component (bagus), tapi `SidebarProvider`, `TooltipProvider`, `DashboardSidebar` semua client.

### 4.2 `PhantomProvider` — impor sisi-efek yang menambah beban

```tsx
useEffect(() => { import("@aejkatappaja/phantom-ui") }, [])
```
Ini memuat paket UI pihak-ketiga di **setiap** halaman setelah mount. Jika `phantom-ui` besar, ia bersaing dengan hidrasi konten utama. Pastikan: (a) benar-benar dibutuhkan global, (b) di-`import()` hanya di rute yang memakainya, bukan di root.

### 4.3 Boundary client terlalu tinggi — pola view monolitik

Pola berulang: `page.tsx` (server) → `XxxView` (`"use client"`) yang berisi **seluruh** halaman (filter, tabel, dialog, bulk action). Contoh `PesananView` meng-import `OrderStatusTabs`, `OrderFilters`, `OrderCardList`, `BulkActionBar` — semua ikut ke bundle client meski sebagian bisa server-rendered.

**Perbaikan — turunkan boundary:**
- Bagian statis/presentasional (header, deskripsi kolom, empty-state, layout kartu tanpa interaksi) bisa tetap Server Component; hanya bagian interaktif (filter input, tombol aksi, checkbox seleksi) yang `"use client"`.
- Gunakan pola *server shell + island*: `page` (server) merender struktur & data awal, sisipkan Client Component kecil hanya di titik interaktif via `children`/slot props.
- Dialog berat (scan, detail shipment) → `dynamic(() => import(...), { ssr: false })` agar tidak masuk bundle awal, dimuat saat dibuka.

### 4.4 Konfigurasi React Query global

`staleTime: 60_000`, `refetchOnWindowFocus: false` — masuk akal. Tapi banyak hook meng-override `staleTime: 30_000`. Untuk data WMS yang berubah cepat (stok, status pesanan) 30–60s wajar; untuk data master (kategori, merek, lokasi) naikkan `staleTime`/`gcTime` agar tidak refetch tiap navigasi. Tinjau juga `refetchInterval` di `use-import.ts` & `use-download.ts` (polling) — pastikan berhenti (`refetchInterval: false`) begitu job selesai agar tidak polling selamanya di background.

---

## Rencana Aksi (prioritas dampak/effort)

### P0 — Dampak tinggi, effort rendah
1. **Perbaiki fetch storm:** ganti `invalidateQueries({ queryKey: fulfillmentKeys.all })` → key granular di `use-fulfillment.ts` dan hook mutasi lain. (~172 titik, tapi pola mekanis.)
2. **`useMemo` + debounce params** di view yang meneruskan objek params ke `useQuery` (mulai `PesananView`, `ProductMasterView`). Hentikan re-render/refetch per-keystroke.
3. **Tambah `error.tsx`** minimal di `app/dashboard/`.

### P1 — Dampak tinggi, effort menengah
4. **Optimistic updates** (`onMutate`/`setQueryData`) untuk aksi beruntun di proses-pesanan (pick/pack/ship/scan). Hilangkan tunggu 2 round-trip.
5. **`useTransition` + `<Link>`** untuk 64 titik `router.push`; prefetch on-hover untuk row tabel.
6. **Jujurkan Suspense:** pilih Opsi A (prefetch server + Hydration) untuk 3–5 halaman terberat, atau Opsi B (`useSuspenseQuery`) untuk sisanya. Hapus skeleton ganda.

### P2 — Struktural
7. **Turunkan boundary `"use client"`:** pecah view monolitik jadi server-shell + island; `dynamic(ssr:false)` untuk dialog berat.
8. **Streaming proxy** untuk JSON besar + caching di route handler / Cache Components.
9. Audit `PhantomProvider` global import; pindahkan ke rute yang memakainya.

---

## Lampiran — Bukti Terukur

| Metrik | Nilai | File/Bukti |
|---|---|---|
| `"use client"` | 340 file | `grep -rl` di `src` |
| `useSuspenseQuery` | 0 | seluruh `src` |
| `useQuery` | 64 hook | seluruh `src` |
| `<Suspense>` terpasang | 21 file | tidak terpicu (§1.1) |
| `loading.tsx` | 31 file | sebagian redundan dg Suspense |
| `error.tsx` | 0 | tidak ada error boundary |
| `useMutation` | 44 | `onMutate` hanya 1, `useOptimistic` 0 |
| `invalidateQueries` | 172 | mayoritas key akar `.all` |
| `router.push`/`replace` | 64 | `useTransition` 0 |
| `refetchInterval` (polling) | 2 | `use-import.ts`, `use-download.ts` |
