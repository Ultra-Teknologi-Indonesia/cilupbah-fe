# Graph Report - cilupbah-fe  (2026-06-23)

## Corpus Check
- 322 files · ~111,116 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1601 nodes · 4518 edges · 90 communities (80 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c660c52`
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
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 245 edges
2. `Button()` - 89 edges
3. `Input()` - 43 edges
4. `LiquidGlass` - 32 edges
5. `fetchClient()` - 28 edges
6. `DialogContent()` - 27 edges
7. `DialogTitle()` - 27 edges
8. `PageTitle()` - 26 edges
9. `Dialog()` - 26 edges
10. `DialogDescription()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `IntegrationStatus()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/integrasi-channel/stores-table.tsx → src/lib/utils.ts
- `ColumnItem()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/kategori-merek/tambah-kategori-dialog.tsx → src/lib/utils.ts
- `DeleteLocationDialogProps` --references--> `Location`  [EXTRACTED]
  src/components/dashboard/manajemen-rak/lokasi/delete-location-dialog.tsx → src/types/manajemen-rak/location.ts
- `LocationTableProps` --references--> `Location`  [EXTRACTED]
  src/components/dashboard/manajemen-rak/lokasi/location-table.tsx → src/types/manajemen-rak/location.ts

## Import Cycles
- None detected.

## Communities (90 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (29): ControlButton(), DEFAULT_ARC_LAYOUT, DEFAULT_ARC_PAINT, defaultStyles, MapArcDatum, MapArcEvent, MapArcLineLayout, MapArcLinePaint (+21 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (23): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (30): dependencies, axios, class-variance-authority, clsx, date-fns, framer-motion, @hookform/resolvers, lucide-react (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (20): ArchiveTable(), RawConnectedStore, TambahAtributDialog(), TambahAtributDialogProps, useCreateCategoryAttribute(), DeleteLocationDialog(), DeleteLocationDialogProps, NaikkanProdukPickerDialog() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (13): DataTableColumnHeaderProps, DataTableViewOptionsProps, Ctx, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (21): loginSchema, LoginValues, FormShippingSection(), FormSpecificationSection(), FormVariantSection(), useObjectUrl(), VariantImageCell(), BuatProdukFormValues (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (21): EditKategoriDialog(), EditKategoriDialogProps, FlatLeaf, ImportSystemDialog(), ImportSystemDialogProps, CategoryAttributeItem, CategoryFormAttributes, ChannelAttributeItem (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (21): clearLoginSession(), setLoginSession(), useGlassSpecular(), DashboardSidebar(), dashboardGroups, findGroupIdForPath(), isLeafGroup(), linkMatchLen() (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (35): CUSTOMER_TYPE_LABEL, SortHeader(), TabBukuHarga(), TabChannel(), TabHargaChannel(), TabRiwayat(), TabVariasi(), BulkVariantAction (+27 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (4): useIsMobile(), SidebarInset(), SidebarProvider(), SidebarTrigger()

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (45): useConnectedStores(), DownloadMassalDialog(), DownloadSatuanDialog(), StoreMultiSelect(), SUPPORTED, buildProgressColumns(), STATE_BADGE, STATE_BAR (+37 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (46): BulkUploadResult, CategoryCertification, CategoryRules, DraftParams, DraftRow, DraftStatus, HistoryParams, HistoryRow (+38 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (29): BundleBuilder(), BundleComponentValue, TYPE_OPTIONS, View, StateFilter, MASTER_FILTER, TransactionDetailSheet(), DownloadTransaction (+21 more)

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
Cohesion: 0.09
Nodes (22): defaultSubFor(), FulfillmentListParams, FulfillmentStage, Packlist, Picklist, RawPacklist, RawPicklist, RawShipment (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.05
Nodes (50): BuatBundleForm(), BuatProdukForm(), EditProdukForm(), MediaUploader(), Preview, EditMediaItem, ensurePrimary(), mediaItemsFromDetail() (+42 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (20): ImportDialog(), Props, ImportErrorSheet(), Props, ImportView(), ProgressBar(), ImportBatch, ImportBatchError (+12 more)

### Community 34 - "Community 34"
Cohesion: 0.40
Nodes (4): CategoryFormAttributes, FormAttribute, FormAttributeChannelStatus, FormAttributeOption

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
Cohesion: 0.11
Nodes (25): LoginForm(), LoginScreen(), CreatableCombobox(), SortHeader(), cn(), metadata, Card(), CardAction() (+17 more)

### Community 39 - "Community 39"
Cohesion: 0.09
Nodes (34): data, SidebarItem, sidebarItems, TeamSwitcher(), DashboardNavigation(), SubRoute, Team, TeamSwitcher() (+26 more)

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (6): EditProdukLoader(), ProductDetailSkeleton(), ACTION_LABEL, productDetailKey(), useProductDetail(), UploadToChannelView()

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (13): buttonVariants, Calendar(), Combobox(), ComboboxOption, ComboboxProps, DatePickerProps, DateRangePickerProps, Popover() (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (8): ChannelService, StoreFlags, useConnectChannel(), useDisconnectStore(), useRefreshToken(), useToggleStoreFlag(), CHANNEL_STORES_KEY, IntegrasiChannelView()

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (8): RawAccount, RawBrand, RawCategory, RawShop, RawTax, TaxLookup, MasterDataService, LookupOption

### Community 44 - "Community 44"
Cohesion: 0.19
Nodes (9): BreadcrumbEntry, PageTitleProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Konvensi per halaman, M2 · Persediaan, M3 · Penjualan, M4 · Pembelian, M5 · Gudang, M6 · Laporan & Keuangan, 🎯 Milestone 1 — PRODUK (prioritas), Milestone berikutnya (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (11): Catatan & risiko, Endpoint BE (acuan, sudah ada), FASE L — Listing Marketplace (Produk Channel)  🔴 prioritas 2, FASE M — Pantauan / Monitoring  🟠 prioritas 3, FASE N — Naikkan Produk = Promosi & Iklan (boost)  ⚪ OPSIONAL · DIKERJAKAN TERAKHIR, FASE R — In Review (daftar review)  🟢 prioritas 4 (kecil), FASE U — Upload ke marketplace  🔴 prioritas 1, IA & Navigasi — rekomendasi UX (page vs tab) (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.12
Nodes (10): SYNC_STYLE, AccountRef, DetailChannelMapping, DetailSpecification, DetailTax, DetailVariant, DetailVariantOption, DetailVariationType (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (16): AutoLocate(), DEFAULT_CENTER, LocationMapPicker(), LocationMapPickerProps, MAP_STYLES, MapClickHandler(), parseCoordinate(), CompassButton() (+8 more)

### Community 49 - "Community 49"
Cohesion: 0.18
Nodes (10): acc(), AccountsCard(), ShippingCard(), yn(), DetailTab, ProductDetailView(), BundleStock, TabKomposisi() (+2 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (18): apiClient, fetchClient(), WarehouseLayoutSetting, WarehouseUser, settingKey, RawSetting, WarehouseSettingService, LookupResponse (+10 more)

### Community 51 - "Community 51"
Cohesion: 0.12
Nodes (7): PageTitle(), DownloadView(), activeId(), ProdukTabBar(), Tab, TABS, UploadMassalView()

### Community 52 - "Community 52"
Cohesion: 0.21
Nodes (18): DataTablePaginationProps, PAGE_SIZES, STATUS_LABEL, STATUS_STYLE, SyncStatusBadge(), TabPagination(), STATUS_OPTIONS, PAGE_SIZES (+10 more)

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): AuthService, AuthData, LoginRequest, LoginResponse, User, AuthState, useAuthStore

### Community 54 - "Community 54"
Cohesion: 0.14
Nodes (16): BrandItem, BrandService, EditMerekDialog(), EditMerekDialogProps, MerekView(), PAGE_SIZE_OPTIONS, TambahMerekDialog(), TambahMerekDialogProps (+8 more)

### Community 55 - "Community 55"
Cohesion: 0.13
Nodes (12): createDefaults, LocationFormPage(), LocationFormPageProps, Section, layoutBuilderSchema, LayoutBuilderValues, locationFormSchema, LocationFormValues (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.14
Nodes (15): ArchivedProduct, RawArchivedItem, ChannelListingResult, DownloadTransactionDetail, ArchiveResult, MasterProductsParams, MasterProductsResult, ProductListService (+7 more)

### Community 57 - "Community 57"
Cohesion: 0.27
Nodes (7): CHANNEL_COLORS, PRODUCT_STATUS_META, PRODUCT_STATUS_OPTIONS, StatusBadgeVariant, ProductStatus, Badge(), badgeVariants

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (12): LocationBinService, GenerateBinsPayload, Location, LocationBin, LocationListParams, LocationPayload, LocationVillage, RawLocation (+4 more)

### Community 59 - "Community 59"
Cohesion: 0.17
Nodes (12): PantauanLens, PantauanParams, PantauanProduct, PantauanService, ProductTypeFilter, RawPantauan, RawReviewChannel, ReviewChannel (+4 more)

### Community 60 - "Community 60"
Cohesion: 0.15
Nodes (19): NaikkanDetailParams, NaikkanHistoryParams, NaikkanListParams, NaikkanService, RaiseProductDetail, RaiseProductStore, RawDetail, RawStore (+11 more)

### Community 61 - "Community 61"
Cohesion: 0.24
Nodes (16): FormDetailSection(), FormSalesSection(), ShopMultiSelect(), HasilTab(), ProductExplorer(), useBrandOptions(), useCategoryTree(), useCogsAccounts() (+8 more)

### Community 62 - "Community 62"
Cohesion: 0.09
Nodes (27): AtributVariasiView(), AtributVariasiViewProps, ChannelAttributeSelect(), ChannelMappingCell(), CHANNELS, KategoriMappingTab(), useCategoryFormAttributes(), useChannelAttributes() (+19 more)

### Community 63 - "Community 63"
Cohesion: 0.17
Nodes (14): CancellationSub, formatCurrency(), OrderCardListProps, OrderCard(), Order, OrderItem, OrderShipping, OrderStatus (+6 more)

### Community 64 - "Community 64"
Cohesion: 0.16
Nodes (13): ChannelCode, ConnectedStore, ChannelGroup(), ChannelLogo(), HAS_ICON, TILE, ConnectMarketplacePanel(), StoreRowActions() (+5 more)

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (11): TABS, KategoriView(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), CHANNEL_OPTIONS (+3 more)

### Community 66 - "Community 66"
Cohesion: 0.19
Nodes (10): LocationListView(), LocationService, BulkUpdateBin, useDeleteLocation(), locationKeys, useLocations(), ToggleLocationActiveVars, useToggleLocationActive() (+2 more)

### Community 67 - "Community 67"
Cohesion: 0.22
Nodes (9): columns, Logo(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+1 more)

### Community 68 - "Community 68"
Cohesion: 0.16
Nodes (16): ArchiveView(), ArchiveParams, ProductArchiveService, ProductBulkActions(), ProductDetailService, ProductRowActions(), ARCHIVE_KEY, useArchivedProducts() (+8 more)

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): MarkerContent(), MarkerPopup(), MarkerTooltip(), useMarkerContext()

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (13): DetailHeader(), ProductCard(), ProductCardProps, ProductChannelBadges(), formatIDR(), productColumnLabels, productColumns, Product (+5 more)

### Community 71 - "Community 71"
Cohesion: 0.20
Nodes (9): A. BE — Transit & transfer (sesi sebelumnya, sudah merged ke working tree), B. BE — Lokasi (Milestone 1) ✅, C. FE — Lokasi (Milestone 2–5) ✅ (typecheck 0, eslint clean; BELUM diverifikasi runtime), Cara lanjut, Catatan penting / follow-up untuk sesi baru, Repo, Session Handoff — Manajemen Gudang (Lokasi), Update 2026-06-17 (lanjutan) — hardening (+1 more)

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (10): InformasiTab(), RegionOption, RawRegion, RegionService, regionKeys, useCities(), useDistricts(), useProvinces() (+2 more)

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (11): DataTableColumnHeader(), DataTable(), DataTableProps, DataTableFacetedFilter(), DataTableFacetedFilterProps, DataTablePagination(), DataTableToolbar(), DataTableToolbarProps (+3 more)

### Community 74 - "Community 74"
Cohesion: 0.25
Nodes (5): CategoryPicker(), FlatCategory, CategoryNode, SelectedCategory, findCategoryPath()

### Community 75 - "Community 75"
Cohesion: 0.13
Nodes (8): MOCK_COUNTS, MOCK_ORDERS, MockOrderService, OrderListParams, OrderTabCounts, OrderService, all, orderKeys

### Community 76 - "Community 76"
Cohesion: 0.17
Nodes (9): GalleryItem, ProductTypeBadge(), TYPE_LABEL, TYPE_STYLE, Confirm, StatusActions(), BulkResult, LifecycleAction (+1 more)

### Community 77 - "Community 77"
Cohesion: 0.20
Nodes (9): BulkActionBar(), OrderCardList(), OrderStatusTabs(), SUB_PILL_CONFIG, TAB_CONFIG, PesananView(), useOrderCounts(), useOrders() (+1 more)

### Community 78 - "Community 78"
Cohesion: 0.22
Nodes (11): Channel, ChannelGroup, IntegrationStatus, RawChannel, StoreIntegration, CHANNEL_CATALOG, DISPLAY_NAME, groupCode() (+3 more)

### Community 79 - "Community 79"
Cohesion: 0.26
Nodes (9): LocationTable(), LocationTableProps, CHANNEL_BG, ChannelDot(), Switch(), Tooltip(), TooltipContent(), TooltipProvider() (+1 more)

### Community 80 - "Community 80"
Cohesion: 0.25
Nodes (7): ChannelCategoryNode, FlatChannelCategory, PetakanKategoriDialog(), PetakanKategoriDialogProps, useChannelCategories(), useMapCategoryToChannel(), useSyncChannelCategories()

### Community 81 - "Community 81"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/geojson, @types/node, @types/react (+3 more)

### Community 82 - "Community 82"
Cohesion: 0.24
Nodes (6): ColumnItem(), Mode, TambahKategoriDialog(), TambahKategoriDialogProps, useCreateKategori(), useSearchKategori()

### Community 83 - "Community 83"
Cohesion: 0.20
Nodes (7): CHANNEL_MAP, CHANNEL_OPTIONS, CONTENT_OPTIONS, EMPTY, FilterState, OrderFilters(), DateRangePicker()

### Community 84 - "Community 84"
Cohesion: 0.27
Nodes (8): Notification, NotificationsPopover(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 85 - "Community 85"
Cohesion: 0.43
Nodes (6): naikkanListKey(), useCreateNaikkan(), useDeleteNaikkan(), useNaikkanList(), buildStoreColumns(), NaikkanStoreView()

### Community 86 - "Community 86"
Cohesion: 0.38
Nodes (3): CountdownTimer(), formatDuration(), buildProdukColumns()

### Community 87 - "Community 87"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, strip-comments, strip-comments:dry

### Community 88 - "Community 88"
Cohesion: 0.29
Nodes (3): RichTextEditor(), RichTextEditorProps, turndown

### Community 89 - "Community 89"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **404 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+399 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 38` to `Community 0`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 21`, `Community 32`, `Community 33`, `Community 39`, `Community 41`, `Community 44`, `Community 47`, `Community 48`, `Community 51`, `Community 52`, `Community 54`, `Community 55`, `Community 57`, `Community 59`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 67`, `Community 68`, `Community 69`, `Community 70`, `Community 73`, `Community 74`, `Community 76`, `Community 77`, `Community 79`, `Community 80`, `Community 82`, `Community 83`, `Community 84`, `Community 88`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 13` to `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 11`, `Community 12`, `Community 32`, `Community 33`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 49`, `Community 51`, `Community 52`, `Community 54`, `Community 55`, `Community 60`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 66`, `Community 67`, `Community 68`, `Community 70`, `Community 73`, `Community 74`, `Community 76`, `Community 77`, `Community 79`, `Community 80`, `Community 82`, `Community 84`, `Community 85`, `Community 86`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `fetchClient()` connect `Community 50` to `Community 32`, `Community 33`, `Community 7`, `Community 72`, `Community 9`, `Community 42`, `Community 11`, `Community 43`, `Community 76`, `Community 12`, `Community 75`, `Community 53`, `Community 54`, `Community 21`, `Community 56`, `Community 58`, `Community 59`, `Community 60`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _404 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._