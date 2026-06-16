# Graph Report - cilupbah-fe  (2026-06-16)

## Corpus Check
- 197 files · ~54,657 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 934 nodes · 2364 edges · 51 communities (41 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07e948d8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 189 edges
2. `Button()` - 42 edges
3. `Input()` - 20 edges
4. `BuatProdukFormValues` - 16 edges
5. `compilerOptions` - 16 edges
6. `useSidebar()` - 14 edges
7. `fetchClient()` - 14 edges
8. `Product` - 14 edges
9. `ApiResponse` - 13 edges
10. `Planning — Manajemen Gudang › Pengaturan › Lokasi` - 12 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `IntegrationStatus()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/integrasi-channel/stores-table.tsx → src/lib/utils.ts
- `ProductTypeBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/detail/detail-header.tsx → src/lib/utils.ts
- `SortHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/detail/tab-buku-harga.tsx → src/lib/utils.ts
- `SortHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/detail/tab-variasi.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (51 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (47): clearLoginSession(), setLoginSession(), loginSchema, LoginValues, BundleBuilder(), BundleComponentValue, CategoryPicker(), FormDetailSection() (+39 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (44): dependencies, axios, class-variance-authority, clsx, framer-motion, @hookform/resolvers, lucide-react, next (+36 more)

### Community 3 - "Community 3"
Cohesion: 0.38
Nodes (3): ProductStats(), LiquidGlass, LiquidGlassProps

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (19): DataTableColumnHeader(), DataTableColumnHeaderProps, DataTableViewOptionsProps, Notification, NotificationsPopover(), Team, TeamSwitcher(), AvatarImage() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (61): LoginForm(), LoginScreen(), BuatProdukForm(), EditProdukForm(), FormShippingSection(), FormSpecificationSection(), FormVariantSection(), MediaUploader() (+53 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (41): AuthService, AuthData, LoginRequest, LoginResponse, User, apiClient, fetchClient(), ArchivedProduct (+33 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (19): useGlassSpecular(), DashboardSidebar(), dashboardGroups, findGroupIdForPath(), isLeafGroup(), linkMatchLen(), NavGroup, NavZone (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (54): DataTablePagination(), DataTablePaginationProps, CUSTOMER_TYPE_LABEL, SortHeader(), TabBukuHarga(), TabChannel(), TabHargaChannel(), PAGE_SIZES (+46 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (28): data, SidebarItem, sidebarItems, TeamSwitcher(), DashboardNavigation(), SubRoute, Sidebar(), SIDEBAR_TRANSITION (+20 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (31): DetailHeader(), ProductBulkActions(), ProductCard(), ProductCardProps, ProductCardView(), ProductChannelBadges(), formatIDR(), productColumnLabels (+23 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (27): SyncStatusBadge(), BulkUploadResult, DraftParams, DraftRow, DraftStatus, HistoryParams, HistoryRow, RawDraft (+19 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (14): Confirm, CategoryNode, SelectedCategory, findCategoryPath(), Button(), buttonVariants, Dialog(), DialogClose() (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (6): metadata, RootLayout(), sfPro, QueryProvider(), LiquidGlassFilter(), Toaster()

### Community 15 - "Community 15"
Cohesion: 0.38
Nodes (6): config, guestRoutes, isTokenValid(), protectedRoutes, proxy(), redirectToLogin()

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (16): ArchiveTable(), ArchiveView(), BreadcrumbEntry, PageTitle(), PageTitleProps, ARCHIVE_KEY, useArchivedProducts(), useRestoreProduct() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (20): DataTable(), cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), DialogOverlay() (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.19
Nodes (13): ChannelService, StoreFlags, ChannelCode, RawConnectedStore, useConnectChannel(), useDisconnectStore(), useRefreshToken(), useToggleStoreFlag() (+5 more)

### Community 34 - "Community 34"
Cohesion: 0.14
Nodes (10): useIsMobile(), CHANNEL_COLORS, ChannelDot(), SidebarInset(), SidebarProvider(), SidebarTrigger(), Tooltip(), TooltipContent() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.11
Nodes (17): 0. Kondisi saat ini (audit), A. BE — endpoint per-tab berpaginasi (prasyarat FE), Aksesibilitas (CRITICAL — checklist sebelum rilis), B1. Shell & header (liquid glass), B2. Pola data per-tab (INTI: beda endpoint + paginasi sendiri), B3. Komponen tiap tab, B. FE — kerangka tab + lazy paginasi, C. UX HARDENING (fokus utama) 🎯 (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (15): 0. Konteks & scope, 10. Ditunda (di luar fokus), 1. Stack & konvensi FE (mengikuti pola `master-produk`), 2. Keputusan yang sudah dikunci, 3. Kontrak API BE (sudah ada), 4. Penyesuaian BE yang diperlukan (Milestone 1), 5. FE plumbing (Milestone 2), 6. List page (Milestone 3 — Image #3, final) (+7 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (15): 1.1 Listing master (utama untuk halaman ini), 1.2 CRUD produk penuh (`apiResource products`), 1.3 Payload create/update (`CreateProductRequest`), 1.4 Lookups & operasi pendukung, 1.5 Bentuk response standar, 1. Ringkasan Backend (sumber kebenaran), 2. Use case yang harus ditangani, 3. Arsitektur & struktur file (FE) (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.23
Nodes (9): ConnectedStore, ChannelLogo(), HAS_ICON, TILE, StoreRowActions(), IntegrationStatus(), STATUS_STYLE, StoresTable() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.23
Nodes (10): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), CHANNEL_OPTIONS, TabId, TABS (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.31
Nodes (9): DataTableProps, DataTableFacetedFilter(), DataTableFacetedFilterProps, DataTableToolbar(), DataTableToolbarProps, DataTableViewOptions(), FacetedFilter, FacetedFilterOption (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.16
Nodes (10): SYNC_STYLE, AccountRef, DetailChannelMapping, DetailTax, DetailVariantOption, DetailVariationType, ProductDetail, ProductTypeKind (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.21
Nodes (8): Logo(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (11): Channel, ChannelGroup, IntegrationStatus, RawChannel, StoreIntegration, CHANNEL_CATALOG, DISPLAY_NAME, groupCode() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.19
Nodes (7): ProductTypeBadge(), TYPE_LABEL, TYPE_STYLE, StatusActions(), LifecycleAction, ProductDetailService, ACTION_LABEL

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Konvensi per halaman, M2 · Persediaan, M3 · Penjualan, M4 · Pembelian, M5 · Gudang, M6 · Laporan & Keuangan, 🎯 Milestone 1 — PRODUK (prioritas), Milestone berikutnya (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (11): Catatan & risiko, Endpoint BE (acuan, sudah ada), FASE L — Listing Marketplace (Produk Channel)  🔴 prioritas 2, FASE M — Pantauan / Monitoring  🟠 prioritas 3, FASE N — Naikkan Produk = Promosi & Iklan (boost)  ⚪ OPSIONAL · DIKERJAKAN TERAKHIR, FASE R — In Review (daftar review)  🟢 prioritas 4 (kecil), FASE U — Upload ke marketplace  🔴 prioritas 1, IA & Navigasi — rekomendasi UX (page vs tab) (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.24
Nodes (6): DetailTab, ProductDetailView(), BundleStock, TabKomposisi(), BundleComponent, useProductLifecycle()

### Community 48 - "Community 48"
Cohesion: 0.27
Nodes (8): MatchRow, UploadDestination, uploadListingKey(), useMatchListing(), useUploadListing(), useUploadToStores(), DestinationTable(), MatchState

### Community 49 - "Community 49"
Cohesion: 0.36
Nodes (4): EditProdukLoader(), ProductDetailSkeleton(), productDetailKey(), useProductDetail()

### Community 50 - "Community 50"
Cohesion: 0.53
Nodes (4): acc(), AccountsCard(), ShippingCard(), yn()

## Knowledge Gaps
- **257 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+252 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 32` to `Community 0`, `Community 3`, `Community 4`, `Community 6`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 21`, `Community 33`, `Community 34`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 48`?**
  _High betweenness centrality (0.231) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 13` to `Community 0`, `Community 33`, `Community 32`, `Community 4`, `Community 39`, `Community 6`, `Community 38`, `Community 40`, `Community 9`, `Community 42`, `Community 11`, `Community 44`, `Community 10`, `Community 12`, `Community 47`, `Community 48`, `Community 49`, `Community 21`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `ApiResponse` connect `Community 7` to `Community 0`, `Community 33`, `Community 6`, `Community 9`, `Community 44`, `Community 12`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _257 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06376811594202898 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._