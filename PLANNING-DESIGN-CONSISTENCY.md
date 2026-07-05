# PLANNING: Konsistensi Bahasa Visual — Anti AI-Slop

> **Status: Fase 0-5 selesai dieksekusi (2026-07-05).** Lihat catatan eksekusi di akhir dokumen.
> Tanggal: 2026-07-05
> Scope: `cilupbah-fe` (web dashboard). Mobile di luar scope.
> Mode: **Redesign - Preserve** — bahasa visual yang ada dipertahankan dan dikunci, bukan diganti.
> Relasi dokumen: melengkapi `AUDIT-UI-CONSISTENCY.md` (lapisan pemakaian komponen), `UX-AUDIT.md` (friksi UX), `PLANNING-UI-CONSISTENCY-GUDANG.md` (flow gudang). Dokumen ini mengaudit lapisan **bahasa visual**: warna, shape, tipografi, spacing, ikon, state, motion.

---

## 1. Design Read

Ini **product UI ERP gudang yang padat data**, bukan landing page. Konsekuensinya:

- Prioritas: keterbacaan, prediktabilitas, sekali belajar ingat selamanya. Bukan wow-factor.
- Dial: variance rendah (layout simetris, grid standar), motion rendah (transisi fungsional saja), density menengah-tinggi.
- "Anti AI-slop" di konteks ini = **tidak ada keputusan visual acak per-file**. Slop-nya bukan gradient ungu, tapi status yang sama berwarna beda di tiap halaman.

### Identitas visual yang SUDAH ada dan DIKUNCI (jangan diubah tanpa keputusan eksplisit)

| Elemen | Standar terkunci |
|---|---|
| Aksen | 1 warna: `--primary` biru (oklch 0.623 0.214 259.8). Tidak ada aksen kedua. |
| Netral | Skala oklch achromatic (chroma 0) dari globals.css. Jangan campur `gray`/`slate`/`zinc` Tailwind. |
| Permukaan | Liquid glass (`liquid-glass`, `.bg-card` override) — sudah konsisten, 82 pemakaian, tanpa campuran solid. |
| Radius | **Dua tier saja**: interaktif = `rounded-full` (button/input/badge/pill), permukaan = `rounded-4xl` ≈26px (card/dialog, selaras glass 24-28px). |
| Ikon | `lucide-react` 100% (satu-satunya library; sudah jadi dependency, pertahankan). |
| Shell halaman | `PageTitle` (76 halaman) + `FilterToolbar` (28) + `ui/data-table`. |
| Shadow | Minimalis: baseline shadcn + `shadow-sm`; sudah konsisten. |
| Tema | Light + dark via token, `next-themes`. |

---

## 2. Temuan Audit (lapisan visual, baru)

| # | Temuan | Prioritas | Skala |
|---|--------|-----------|-------|
| V1 | Status sama, warna beda antar halaman (bypass `lib/status`) | **Tinggi** | 5+ varian utk `pending` saja, ~15 file pill ad-hoc |
| V2 | 372 kemunculan warna palette hardcoded vs 1.668 token semantik | Tinggi | top-10 file terparah, lihat 2.2 |
| V3 | Hierarki tipografi tidak terdefinisi (font-medium 633×, semibold 130×, campur di section header; CardTitle terlalu ringan) | Tinggi | codebase-wide |
| V4 | Radius tier-tengah liar (`rounded-md/lg/xl/2xl` campur utk elemen serupa + 8 arbitrary) | Menengah | codebase-wide |
| V5 | Padding tidak beraturan: `p-3` 259× vs `p-4` 252× tanpa aturan kapan pakai yang mana | Menengah | codebase-wide |
| V6 | Font size arbitrary `text-[10px]`/`text-[11px]` 146× (tidak ada token di bawah `text-xs`) | Menengah | 146 titik |
| V7 | 16 titik `bg-white`/`bg-*-50/100` tanpa `dark:` (rusak di dark mode) | Menengah | `product-media-manager` 5, `video-player` 3, dst |
| V8 | Empty state: 88 string "Belum ada" ad-hoc vs 23 pemakaian `EmptyState` | Menengah | overlap audit lama #12 |
| V9 | Spinner: 139 `animate-spin` manual vs 68 `Loader2` | Menengah | overlap audit lama #9 |
| V10 | Ukuran ikon: `size-4` 381× vs `h-4 w-4` 117× (dua notasi utk hal sama), `h-3 w-3` 142× | Kecil | mekanis |
| V11 | Glass tanpa fallback `prefers-reduced-transparency` | Kecil | globals.css |
| V12 | Dead CSS: class `.icon-chip` (0 pemakaian). Catatan: `@aejkatappaja/phantom-ui` **BUKAN** dead — itu web-component `<phantom-ui loading>` dipakai 40+ file `loading.tsx` via `phantom-provider.tsx` (audit awal keliru). | Kecil | 1 titik |

Yang **TIDAK** bermasalah (tidak perlu disentuh): gradient (13, semua fungsional di ui primitives), arbitrary hex (7, semua justified: brand color channel + color-mix), emoji (0), gradient text (0), motion (4 file, sudah `useReducedMotion`), shadow, library ikon, shell halaman, wording toast ("Berhasil …"/"Gagal …" sudah seragam).

### 2.1 V1 — Status color: satu status, lima warna

Sumber kebenaran: `lib/status.ts` (`pending` → variant `orange` → `bg-orange-500/12 text-orange-700 dark:text-orange-400`). Pelanggar:

| File | Warna dipakai |
|---|---|
| `permintaan-restock-view.tsx:41` | `bg-amber-100 text-amber-800` |
| `laporan-retur-view.tsx:52` | `bg-amber-100 text-amber-700` |
| `shipment-detail-view.tsx:60` | `bg-amber-500/10 text-amber-600` |
| `channel-listing.tsx:15` | `text-amber-600 dark:text-amber-400` |

Ini temuan visual paling merusak: user melihat status yang sama dengan warna berbeda tergantung halaman. Sudah tercatat sebagai #8 di audit lama; angka di sini mengkonfirmasi + menambah daftar file.

### 2.2 V2 — Hardcoded palette, top-10 file

`order-detail-view.tsx` (20), `stock-position-detail-view.tsx` (13), `import-pemasok-view.tsx` (13), `fulfillment-orders-table.tsx` (12), `monitor-kronologi-table.tsx` (11), `order-card.tsx` (10), `lib/fulfillment.ts` (9), `packing-proses-view.tsx` (8), `packing-detail-view.tsx` (8), `opname-detail.tsx` (7).

Pola dominan: `text-emerald-600 dark:text-emerald-400` (sukses), `text-amber-600 dark:text-amber-400` (warning), `text-red-*` (error) — semuanya sudah punya padanan token (`--success`, `--warning`, `--destructive`) yang tersedia di globals.css tapi tidak dipakai.

---

## 3. Aturan Desain (kunci, berlaku untuk semua kode FE baru)

Bagian ini adalah "konstitusi" anti-slop. Setiap PR/perubahan FE wajib mematuhinya.

### 3.1 Warna

1. **Status apapun** → `StatusBadge` + registrasi di `lib/status.ts`. Dilarang membuat pill `rounded-full` manual untuk status. (Pengecualian sah: `channel-badge`, `sub-status-pills`, `pill-tabs`.)
2. Makna semantik → token: sukses `text-success`/`bg-success`, peringatan `warning`, bahaya `destructive`, netral `muted-foreground`. Dilarang `emerald/amber/red/green-*` baru untuk makna semantik.
3. Warna palette mentah hanya sah untuk: brand color channel (Shopee/Lazada/TikTok di `channel-logo.tsx`), dan visualisasi data multi-seri (chart) — itu pun lewat `--chart-*`.
4. Semua `bg-white`, `bg-gray-*`, `bg-*-50/100` baru wajib punya padanan `dark:` atau diganti token (`bg-background`, `bg-muted`).
5. Satu aksen. Tidak menambah warna aksen kedua, tidak ada gradient dekoratif baru, tidak ada glow.

### 3.2 Shape (radius)

Dua tier + satu pengecualian:

| Elemen | Radius |
|---|---|
| Interaktif: button, input, badge, pill, combobox trigger | `rounded-full` |
| Permukaan: card, dialog, popover, glass panel | `rounded-4xl` (ikuti primitive; jangan set manual) |
| Tile/thumbnail/elemen dalam kartu (gambar produk, cell preview, chip area) | `rounded-xl` — satu-satunya nilai tier-tengah yang diizinkan |

Dilarang: `rounded-md`, `rounded-lg`, `rounded-2xl`, `rounded-3xl`, `rounded-[arbitrary]` di kode view baru. Yang lama disapu bertahap (Fase 4).

### 3.3 Tipografi

| Level | Kelas | Catatan |
|---|---|---|
| Page title | `text-2xl font-bold tracking-tight` | Hanya via `PageTitle`. Dilarang bikin h1 sendiri. |
| Section/Card title | `text-base font-semibold` | `CardTitle` dinaikkan dari `font-medium` → `font-semibold` (satu edit di `ui/card.tsx`). |
| Sub-section | `text-sm font-semibold` | |
| Body | `text-sm` | Default dashboard. |
| Metadata/caption | `text-xs text-muted-foreground` | |
| Micro (badge count, label mono) | `text-2xs` (token baru, 11px) | Ganti `text-[10px]`/`text-[11px]` — daftarkan `--text-2xs: 0.6875rem` di `@theme` globals.css. |

`font-medium` untuk emphasis inline (nilai penting di cell), bukan untuk judul.

### 3.4 Spacing

| Konteks | Nilai |
|---|---|
| Kartu/permukaan standar | `p-4`; konten dalam kartu `gap-4`/`space-y-4` |
| Baris/cell/chip compact (dalam tabel, list rapat) | `p-3` hanya untuk konteks compact ini |
| Dialog & wrapper besar | `p-6 gap-6` (sudah konsisten, pertahankan) |
| Antar section halaman | `space-y-6` |

### 3.5 Ikon

- Library: `lucide-react` saja. Tidak ada SVG ikon hand-rolled baru (pengecualian existing: `map.tsx`, `layout-gudang-tab.tsx` — kebutuhan kanvas).
- Notasi ukuran: **selalu `size-*`**, jangan `h-* w-*`. Skala: `size-3.5` inline dalam teks/cell, `size-4` default (button/menu/toolbar), `size-5` emphasis, `size-6+` hanya empty-state/ilustrasi.
- `strokeWidth` tidak diset per-ikon (default 2), kecuali ikon besar empty-state boleh `1.5`.

### 3.6 State (empty / loading)

- Empty data → komponen `EmptyState`, wording "Belum ada …". Hasil pencarian kosong → "Tidak ditemukan …". Dilarang `<p>Belum ada…</p>` telanjang di view baru.
- Initial load halaman/tabel → `PageSkeleton`/`Skeleton`. Aksi tombol (mutasi) → `Loader2` di dalam button. Dilarang `animate-spin` pada div/border manual.

### 3.7 Motion & glass

- Motion hanya fungsional: transisi sidebar, enter dialog/sheet, feedback tombol. Tidak ada animasi infinite dekoratif. Semua motion baru lewat `useReducedMotion`.
- Glass hanya lewat class/komponen yang ada (`LiquidGlass`, `liquid-glass-subtle`, `.bg-card`). Dilarang meracik `backdrop-blur` ad-hoc baru.
- Tambahkan fallback `@media (prefers-reduced-transparency: reduce)` → permukaan solid (Fase 5).

### 3.8 Copy UI

- Karakter `—` hanya sah sebagai **placeholder nilai kosong di cell tabel**. Dilarang di kalimat, judul, label, toast (gunakan koma/titik).
- Separator metadata `·` maksimal 1 per baris.
- Toast: "Berhasil <aksi>" / "Gagal <aksi>" (pola existing, pertahankan).
- Tanpa emoji di UI.

---

## 4. Roadmap Eksekusi

Prinsip: fase disusun dari dampak-visual-terbesar dan risiko-terkecil. Tiap fase punya verifikasi mekanis (grep) supaya regresi ketahuan.

### Fase 0 — Kodifikasi aturan (0.5 hari, tanpa risiko)
- Tulis ringkasan Bagian 3 ke `cilupbah-fe/CLAUDE.md` (atau `docs/design-rules.md` + pointer) supaya semua sesi/agent berikutnya mengikutinya.
- Tambah token `--text-2xs` di globals.css.
- Naikkan `CardTitle` → `font-semibold` (1 edit, `ui/card.tsx:40`).
- **Verifikasi**: `tsc` bersih; visual spot-check 2-3 halaman.

### Fase 1 — Unifikasi warna status (V1; 1-2 hari) ← dampak visual terbesar
- Registrasi semua status yang belum ada ke `lib/status.ts`, migrasi ~15 file pill ad-hoc + 2 file hardcode (`import-pemasok-view`, `progress-columns`) ke `StatusBadge`. (= eksekusi item #8 audit lama.)
- **Verifikasi**: `grep -rn "bg-amber-100\|bg-emerald-100\|bg-red-100" src/components --include="*.tsx"` menyusut ke 0 di konteks status; satu status → satu warna di semua halaman.

### Fase 2 — Sapu warna semantik + dark mode (V2, V7; 2-3 hari)
- Top-10 file hardcoded → token (`text-success`/`text-warning`/`text-destructive`/`text-muted-foreground`). Mulai dari `order-detail-view.tsx` (20 titik).
- 16 titik `bg-white` tanpa `dark:` → token/`dark:`.
- **Verifikasi**: hitung ulang hardcoded (target: 372 → <100, sisanya justified); buka tiap halaman tersentuh di dark mode.

### Fase 3 — Tipografi & spacing (V3, V5, V6; 2 hari)
- Sapu section header ke skala 3.3 (semibold), migrasi `text-[10px]/[11px]` → `text-2xs`.
- Normalisasi `p-3`→`p-4` di kartu non-compact (per modul, sambil menyentuh file fase 2 kalau overlap).
- **Verifikasi**: `grep -c "text-\[1[01]px\]"` = 0; spot-check hierarki di 5 halaman lintas modul.

### Fase 4 — Radius & ikon (V4, V10; 1-2 hari, mekanis)
- `h-4 w-4`→`size-4` dkk (codemod/sed aman), radius tier-tengah → `rounded-xl`, hapus arbitrary.
- **Verifikasi**: `grep -c "h-4 w-4"` = 0; `grep "rounded-\[" ` = 0 (kecuali justified).

### Fase 5 — State & higiene (V8, V9, V11, V12; 1-2 hari)
- Empty state ad-hoc → `EmptyState` (88 titik, per modul); spinner manual → `Loader2`. (= eksekusi item #9 & #12 audit lama.)
- Hapus `.icon-chip` (dead CSS); tambah fallback `prefers-reduced-transparency`. (`@aejkatappaja/phantom-ui` DIPERTAHANKAN — bukan dead code.)
- **Verifikasi**: `grep "animate-spin"` hanya tersisa di `Loader2` wrapper; `pnpm build` bersih.

### Di luar scope dokumen ini
- Item #5 audit lama (form berat di dialog → halaman) — keputusan UX per kasus, bukan visual.
- Format uang (#7 audit lama) — masuk sapu Fase 2 kalau file overlap, selain itu ikut dokumen lama.
- Mobile (`cilupbah-mobile`) — sesuai aturan project, tidak disentuh.

---

## 5. Guardrail Berkelanjutan

Supaya slop tidak balik lagi setelah sapu:

1. **Checklist grep pra-commit** (bisa jadi script `scripts/design-lint.sh`):
   - warna semantik hardcoded baru: `grep -rn "text-emerald-\|text-amber-\|bg-amber-100\|bg-emerald-100" src --include="*.tsx"`
   - font arbitrary: `grep -rn "text-\[1[01]px\]" src`
   - notasi ikon lama: `grep -rn "h-4 w-4\|h-5 w-5" src`
   - `bg-white` tanpa `dark:` di baris yang sama.
2. **Aturan di CLAUDE.md** (Fase 0) — agent/dev berikutnya membaca aturan sebelum menulis UI.
3. **Review question tunggal**: "elemen ini pakai token/komponen shared yang mana?" — kalau jawabannya "bikin sendiri", itu red flag.

---

## Catatan Eksekusi (2026-07-05)

Fase 0-5 dieksekusi penuh atas ~90 file di seluruh `src/components` dan `src/app`. Ringkasan:

- **Fase 0**: token `--text-2xs` ditambahkan, `CardTitle` → `font-semibold`, domain `stock-replenishment` didaftarkan ke `lib/status.ts`, `docs/design-rules.md` dibuat + pointer di `CLAUDE.md`.
- **Fase 1**: seluruh manual `STATUS_BADGE`/`STATUS_STYLE` map (permintaan-restock, laporan-retur, dll) dimigrasi ke `StatusBadge`. 0 manual status map tersisa (kecuali yang sudah token-based seperti `tab-pagination.tsx`, dan pengecualian sah channel/brand/pill-tabs).
- **Fase 2**: warna semantik hardcoded disapu ke token (`text-success`/`warning`/`destructive`/`muted-foreground`) lintas ~50 file. Sisa 3 titik adalah **legenda kategorikal sah** (9 jenis transaksi/tipe produk berbeda warna by design, bukan makna sukses/gagal) — didokumentasikan, bukan pelanggaran.
- **Fase 3**: seluruh `text-[10px]`/`text-[11px]` (0 tersisa) → `text-2xs`; heading section disamakan ke `font-semibold`.
- **Fase 4**: seluruh notasi ikon `h-N w-N` → `size-N` (0 tersisa, disapu global via sed karena murni notasional); radius tier-tengah dirapikan ke `rounded-xl` di tile/thumbnail.
- **Fase 5**: beberapa empty-state ad-hoc dikonversi ke `EmptyState`; `.icon-chip` (dead CSS) dihapus; fallback `prefers-reduced-transparency` ditambahkan untuk semua permukaan glass.

**Pengecualian sah yang tetap dipertahankan** (jangan "diperbaiki" lagi):
- `bg-white` di `video-player.tsx` (kontrol player mengambang di atas video), `login-form.tsx` (`hover:bg-white/10` tint kaca translucent), `channel-logo.tsx` (backdrop di belakang logo brand SVG), `pdf-viewer.tsx` (kanvas halaman dokumen tetap putih di semua tema).
- Peta warna kategorikal multi-nilai (`CATEGORY_COLOR`/`CATEGORY_STYLE` di `monitor-kronologi-table.tsx`, `stock-position-detail-view.tsx`; `decisionColor` di `order-card.tsx`; tipe bundle/single/varian di `detail-header.tsx`) — legenda >2 warna untuk membedakan kategori, bukan status sukses/gagal/peringatan.
- Warna brand channel (Shopee/Lazada/TikTok) di `channel-logo.tsx`, `product-channel-badges.tsx`.

**Verifikasi**: `tsc --noEmit` bersih di seluruh proyek setelah setiap batch; grep ground-truth akhir menunjukkan 0 sisa `text-[10/11px]`, 0 notasi ikon lama, 0 manual status map, dan hanya sisa yang terverifikasi sah untuk warna semantik/`bg-white`. Smoke test visual di `/login` (glass card, gradient wash, aksen tunggal) tanpa error console.

**Penting — bukan tindakan sesi ini**: selama eksekusi, sesi/proses lain (co-authored "Claude Opus 4.8" dan "Claude Sonnet 5" pada commit `8f3a4c1`, `f7180f5`, `c43807d`) meng-commit DAN push seluruh working tree ke `origin/main` di tengah proses, termasuk pekerjaan Fase 0 sesi ini plus perubahan tak terkait (dialog hapus-pesanan baru, filter tanggal Transfer Masuk, courier picker). Sesi ini tidak melakukan commit/push apa pun — sesuai aturan git safety, itu memerlukan izin eksplisit yang belum diberikan untuk aksi tersebut.
