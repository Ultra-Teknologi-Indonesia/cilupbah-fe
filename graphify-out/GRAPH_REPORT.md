# Graph Report - cilupbah-fe  (2026-06-17)

## Corpus Check
- 231 files · ~68,341 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1124 nodes · 2875 edges · 70 communities (59 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16e40200`
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
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 200 edges
2. `Button()` - 49 edges
3. `Input()` - 24 edges
4. `fetchClient()` - 20 edges
5. `ApiResponse` - 18 edges
6. `BuatProdukFormValues` - 16 edges
7. `compilerOptions` - 16 edges
8. `ApiPaginated` - 15 edges
9. `PageTitle()` - 14 edges
10. `useSidebar()` - 14 edges

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

## Communities (70 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (29): ControlButton(), DEFAULT_ARC_LAYOUT, DEFAULT_ARC_PAINT, defaultStyles, MapArcDatum, MapArcEvent, MapArcLineLayout, MapArcLinePaint (+21 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (45): dependencies, axios, class-variance-authority, clsx, framer-motion, @hookform/resolvers, lucide-react, maplibre-gl (+37 more)

### Community 3 - "Community 3"
Cohesion: 0.27
Nodes (11): ListingMarketplaceView(), ChannelListingParams, ChannelProductService, channelProductsKey(), UnlinkInput, useBulkUnlinkListing(), useChannelProducts(), useDownloadChannel() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (19): DataTableColumnHeader(), DataTableColumnHeaderProps, DataTableViewOptionsProps, Team, TeamSwitcher(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (54): clearLoginSession(), setLoginSession(), loginSchema, LoginValues, BundleBuilder(), BundleComponentValue, CategoryPicker(), FormDetailSection() (+46 more)

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (6): StoreFlags, BundleService, CreateBundlePayload, ApiList, ApiResponse, ApiValidationError

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (20): useGlassSpecular(), DashboardSidebar(), Logo(), dashboardGroups, findGroupIdForPath(), isLeafGroup(), linkMatchLen(), NavGroup (+12 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (54): DataTablePaginationProps, CUSTOMER_TYPE_LABEL, SortHeader(), TabBukuHarga(), TabChannel(), TabHargaChannel(), PAGE_SIZES, STATUS_LABEL (+46 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (26): useIsMobile(), cn(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+18 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (21): buildCreatePayload(), num(), buildUpdatePayload(), num(), CreateMediaInput, CreateProductPayload, CreateProductResult, CreateVariantInput (+13 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (33): DataTable(), BulkUploadResult, DraftParams, DraftRow, DraftStatus, HistoryParams, HistoryRow, MatchRow (+25 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (16): DimensionRowProps, LayoutGudangTab(), LayoutGudangTabProps, binCombinationCount(), buildBinPreview(), BinPreviewItem, Label(), Skeleton() (+8 more)

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
Cohesion: 0.24
Nodes (15): Confirm, StatusActions(), Button(), buttonVariants, Dialog(), DialogClose(), DialogContent(), DialogDescription() (+7 more)

### Community 32 - "Community 32"
Cohesion: 0.35
Nodes (8): DataTableProps, DataTableFacetedFilter(), DataTableFacetedFilterProps, DataTableToolbar(), DataTableToolbarProps, DataTableViewOptions(), FacetedFilter, FacetedFilterOption

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (25): Channel, ChannelCode, ChannelGroup, ConnectedStore, IntegrationStatus, RawChannel, RawConnectedStore, StoreIntegration (+17 more)

### Community 34 - "Community 34"
Cohesion: 0.19
Nodes (13): BuatProdukForm(), EditProdukForm(), FormShippingSection(), MediaUploader(), Preview, SectionItem, SectionNav(), SectionStatus (+5 more)

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
Cohesion: 0.32
Nodes (6): LocationListParams, LocationPayload, LocationService, locationKeys, ToggleLocationActiveVars, UpdateLocationVars

### Community 39 - "Community 39"
Cohesion: 0.17
Nodes (10): BreadcrumbEntry, PageTitle(), PageTitleProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (10): ChannelService, useConnectChannel(), useDisconnectStore(), useRefreshToken(), useToggleStoreFlag(), CHANNEL_STORES_KEY, useConnectedStores(), ChannelGroup() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (13): ShopMultiSelect(), ProductVariantPopover(), Checkbox(), ComboboxOption, ComboboxProps, Popover(), PopoverContent(), PopoverDescription() (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.16
Nodes (17): data, SidebarItem, sidebarItems, Notification, NotificationsPopover(), Avatar(), AvatarBadge(), AvatarFallback() (+9 more)

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (8): RawAccount, RawBrand, RawCategory, RawShop, RawTax, TaxLookup, MasterDataService, LookupOption

### Community 44 - "Community 44"
Cohesion: 0.26
Nodes (9): DataTablePagination(), ProductBulkActions(), ProductCardView(), productColumns, Product, ProductListViewProps, ProductTable(), ProductVariantDetail() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Konvensi per halaman, M2 · Persediaan, M3 · Penjualan, M4 · Pembelian, M5 · Gudang, M6 · Laporan & Keuangan, 🎯 Milestone 1 — PRODUK (prioritas), Milestone berikutnya (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (11): Catatan & risiko, Endpoint BE (acuan, sudah ada), FASE L — Listing Marketplace (Produk Channel)  🔴 prioritas 2, FASE M — Pantauan / Monitoring  🟠 prioritas 3, FASE N — Naikkan Produk = Promosi & Iklan (boost)  ⚪ OPSIONAL · DIKERJAKAN TERAKHIR, FASE R — In Review (daftar review)  🟢 prioritas 4 (kecil), FASE U — Upload ke marketplace  🔴 prioritas 1, IA & Navigasi — rekomendasi UX (page vs tab) (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.07
Nodes (28): EditProdukLoader(), acc(), AccountsCard(), ShippingCard(), yn(), ProductDetailSkeleton(), DetailTab, ProductDetailView() (+20 more)

### Community 48 - "Community 48"
Cohesion: 0.16
Nodes (14): DEFAULT_CENTER, LocationMapPicker(), LocationMapPickerProps, MapClickHandler(), parseCoordinate(), CompassButton(), Map, MapArc() (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.23
Nodes (9): LocationBinService, GenerateBinsPayload, LocationBin, LocationVillage, RawLocationBin, WarehouseLayoutSetting, GenerateBinsVars, RawSetting (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (10): DeleteLocationDialog(), LocationListView(), LocationTable(), useDeleteLocation(), useLocations(), useToggleLocationActive(), settingKey, useSaveWarehouseLayoutSetting() (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (4): WarehouseUser, useWarehouseUsers(), RawUser, WarehouseUserService

### Community 52 - "Community 52"
Cohesion: 0.21
Nodes (10): ArchivedProduct, RawArchivedItem, ChannelListingResult, ArchiveResult, MasterProductsParams, MasterProductsResult, ProductListService, RawMasterItem (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): AuthService, AuthData, LoginRequest, LoginResponse, User, AuthState, useAuthStore

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (9): apiClient, fetchClient(), ChannelListing, ChannelListingVariant, RawChannelListing, RawConnection, RegionOption, RawRegion (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.13
Nodes (12): createDefaults, LocationFormPage(), LocationFormPageProps, Section, layoutBuilderSchema, LayoutBuilderValues, locationFormSchema, LocationFormValues (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (4): DetailHeader(), ProductCard(), formatIDR(), DetailVariant

### Community 57 - "Community 57"
Cohesion: 0.15
Nodes (12): ProductTypeBadge(), TYPE_LABEL, TYPE_STYLE, AccountRef, DetailTax, DetailVariantOption, DetailVariationType, ProductDetail (+4 more)

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (11): CHANNEL_COLORS, PRODUCT_STATUS_META, StatusBadgeVariant, ProductCardProps, ChannelDot(), ProductChannelBadges(), productColumnLabels, ProductRowActions() (+3 more)

### Community 59 - "Community 59"
Cohesion: 0.24
Nodes (8): ArchiveTable(), ArchiveView(), ArchiveParams, ProductArchiveService, ProductDetailService, ARCHIVE_KEY, useArchivedProducts(), useRestoreProduct()

### Community 60 - "Community 60"
Cohesion: 0.24
Nodes (10): LoginForm(), LoginScreen(), metadata, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+2 more)

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (10): FormVariantSection(), detailToFormValues(), detailVariantLocks(), reconstructVariants(), s(), buildCombos(), comboKey(), comboLabel() (+2 more)

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (3): CategoryNode, SelectedCategory, findCategoryPath()

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (10): TeamSwitcher(), DashboardNavigation(), SubRoute, SidebarGroupLabel(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarMenuSub(), SidebarMenuSubButton() (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (5): DeleteLocationDialogProps, LocationTableProps, Location, RawLocation, LocationListResult

### Community 66 - "Community 66"
Cohesion: 0.40
Nodes (4): CategoryFormAttributes, FormAttribute, FormAttributeChannelStatus, FormAttributeOption

### Community 67 - "Community 67"
Cohesion: 0.50
Nodes (3): InventoryService, RawStockRow, VariantStock

### Community 68 - "Community 68"
Cohesion: 0.40
Nodes (4): ProductChannelStatus, ProductVariant, RawMasterOnlineStatus, RawMasterVariant

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): MarkerContent(), MarkerPopup(), MarkerTooltip(), useMarkerContext()

## Knowledge Gaps
- **305 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+300 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 10` to `Community 0`, `Community 4`, `Community 6`, `Community 8`, `Community 9`, `Community 12`, `Community 13`, `Community 14`, `Community 21`, `Community 33`, `Community 34`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 47`, `Community 48`, `Community 50`, `Community 55`, `Community 56`, `Community 57`, `Community 58`, `Community 60`, `Community 63`, `Community 64`, `Community 69`?**
  _High betweenness centrality (0.254) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 21` to `Community 4`, `Community 6`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 32`, `Community 33`, `Community 34`, `Community 40`, `Community 42`, `Community 44`, `Community 47`, `Community 50`, `Community 55`, `Community 57`, `Community 58`, `Community 59`, `Community 61`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `ApiResponse` connect `Community 7` to `Community 67`, `Community 6`, `Community 38`, `Community 9`, `Community 43`, `Community 11`, `Community 12`, `Community 49`, `Community 52`, `Community 53`, `Community 54`, `Community 57`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _305 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._