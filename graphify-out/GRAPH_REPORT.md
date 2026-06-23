# Graph Report - cilupbah-fe  (2026-06-23)

## Corpus Check
- 329 files · ~115,360 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1649 nodes · 4685 edges · 93 communities (82 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `43402b6a`
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
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 252 edges
2. `Button()` - 93 edges
3. `Input()` - 45 edges
4. `LiquidGlass` - 34 edges
5. `DialogContent()` - 29 edges
6. `DialogTitle()` - 29 edges
7. `Dialog()` - 28 edges
8. `fetchClient()` - 28 edges
9. `PageTitle()` - 26 edges
10. `ApiResponse` - 26 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `IntegrationStatus()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/integrasi-channel/stores-table.tsx → src/lib/utils.ts
- `CreatableCombobox()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/buat/form-specification-section.tsx → src/lib/utils.ts
- `ProductTypeBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/detail/detail-header.tsx → src/lib/utils.ts
- `StoreMultiSelect()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/download/download-satuan-dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (93 total, 11 thin omitted)

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
Cohesion: 0.06
Nodes (56): ArchiveTable(), Confirm, DownloadMassalDialog(), Props, EditKategoriDialog(), EditKategoriDialogProps, EditMerekDialogProps, FlatLeaf (+48 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (13): DataTableColumnHeaderProps, DataTableViewOptionsProps, Team, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (12): loginSchema, LoginValues, FormControl, FormDescription, FormField(), FormFieldContext, FormFieldContextValue, FormItem (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (14): BuatProdukForm(), FormShippingSection(), CreatableCombobox(), FormSpecificationSection(), FormVariantSection(), MediaUploader(), Preview, SectionItem (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (22): clearLoginSession(), setLoginSession(), useGlassSpecular(), DashboardSidebar(), Logo(), dashboardGroups, findGroupIdForPath(), isLeafGroup() (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (14): ChannelListingItem, ChannelListingRow, ChannelPriceCell, ChannelPriceRow, PageMeta, PriceBookRow, RawChannelListingRow, RawChannelPriceRow (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): useIsMobile(), Separator(), SIDEBAR_TRANSITION, SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput(), SidebarInset() (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (34): DownloadSatuanDialog(), StoreMultiSelect(), SUPPORTED, buildProgressColumns(), STATE_BADGE, STATE_BAR, STATE_LABEL, ListingMarketplaceView() (+26 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (18): CategoryCertification, DraftRow, DraftStatus, HistoryRow, MatchRow, RawCategoryRules, RawDraft, RawHistory (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (28): useConnectedStores(), DataTable(), TYPE_OPTIONS, View, ProgressTab(), StateFilter, MASTER_FILTER, TransactionDetailSheet() (+20 more)

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
Cohesion: 0.06
Nodes (47): DocActions, errMsg(), run(), PickingOrdersTable(), PicklistTable(), ProgressCell(), defaultSubFor(), FulfillmentListParams (+39 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (21): EditMediaItem, buildCreatePayload(), num(), buildUpdatePayload(), num(), VariantMediaEntry, CreateMediaInput, CreateProductPayload (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.14
Nodes (14): ImportErrorSheet(), ImportView(), ImportBatchError, ImportBatchParams, ImportBatchState, ImportService, PageMeta, RawImportBatch (+6 more)

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
Cohesion: 0.24
Nodes (10): LoginForm(), LoginScreen(), metadata, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (12): TeamSwitcher(), DashboardNavigation(), SubRoute, TeamSwitcher(), Sidebar(), SidebarGroupLabel(), SidebarMenuButton(), sidebarMenuButtonVariants (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.16
Nodes (20): BulkUploadResult, DraftParams, HistoryParams, UploadListingParams, channelDraftsKey(), requiredAttributesKey(), uploadHistoriesKey(), uploadListingKey() (+12 more)

### Community 41 - "Community 41"
Cohesion: 0.24
Nodes (8): buttonVariants, Calendar(), Checkbox(), DatePickerProps, DateRangePickerProps, Popover(), PopoverContent(), PopoverTrigger()

### Community 42 - "Community 42"
Cohesion: 0.09
Nodes (28): ChannelService, StoreFlags, Channel, ChannelGroup, ConnectedStore, IntegrationStatus, RawChannel, RawConnectedStore (+20 more)

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (8): RawAccount, RawBrand, RawCategory, RawShop, RawTax, TaxLookup, MasterDataService, LookupOption

### Community 44 - "Community 44"
Cohesion: 0.09
Nodes (26): SortHeader(), SortHeader(), ProgressBar(), ColumnItem(), cn(), ChannelDot(), Breadcrumb(), BreadcrumbEllipsis() (+18 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Konvensi per halaman, M2 · Persediaan, M3 · Penjualan, M4 · Pembelian, M5 · Gudang, M6 · Laporan & Keuangan, 🎯 Milestone 1 — PRODUK (prioritas), Milestone berikutnya (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (11): Catatan & risiko, Endpoint BE (acuan, sudah ada), FASE L — Listing Marketplace (Produk Channel)  🔴 prioritas 2, FASE M — Pantauan / Monitoring  🟠 prioritas 3, FASE N — Naikkan Produk = Promosi & Iklan (boost)  ⚪ OPSIONAL · DIKERJAKAN TERAKHIR, FASE R — In Review (daftar review)  🟢 prioritas 4 (kecil), FASE U — Upload ke marketplace  🔴 prioritas 1, IA & Navigasi — rekomendasi UX (page vs tab) (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.09
Nodes (18): ensurePrimary(), mediaItemsFromDetail(), ProductMediaManager(), SYNC_STYLE, AccountRef, DetailChannelMapping, DetailMedia, DetailSpecification (+10 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (18): AutoLocate(), DEFAULT_CENTER, formatCoordinate(), LocationMapPicker(), LocationMapPickerProps, MAP_STYLES, MapClickHandler(), parseCoordinate() (+10 more)

### Community 49 - "Community 49"
Cohesion: 0.16
Nodes (11): EditProdukLoader(), ProductDetailSkeleton(), DetailTab, ProductDetailView(), BundleStock, TabKomposisi(), BundleComponent, ACTION_LABEL (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (10): apiClient, fetchClient(), WarehouseLayoutSetting, RawSetting, WarehouseSettingService, BundleService, CreateBundlePayload, InventoryService (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.12
Nodes (8): BreadcrumbEntry, PageTitle(), PageTitleProps, activeId(), ProdukTabBar(), Tab, TABS, UploadToChannelView()

### Community 52 - "Community 52"
Cohesion: 0.15
Nodes (21): DataTablePaginationProps, TabChannel(), TabHargaChannel(), PAGE_SIZES, STATUS_LABEL, STATUS_STYLE, SyncStatusBadge(), TabPagination() (+13 more)

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): AuthService, AuthData, LoginRequest, LoginResponse, User, AuthState, useAuthStore

### Community 54 - "Community 54"
Cohesion: 0.21
Nodes (9): BrandItem, ChannelListingResult, ChannelListingVariant, RawChannelListing, RawConnection, DownloadTransactionDetail, UploadListingResult, ApiPaginated (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.13
Nodes (12): createDefaults, LocationFormPage(), LocationFormPageProps, Section, layoutBuilderSchema, LayoutBuilderValues, locationFormSchema, LocationFormValues (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.43
Nodes (4): MasterProductsParams, MasterProductsResult, ProductListService, RawMasterItem

### Community 57 - "Community 57"
Cohesion: 0.19
Nodes (12): CHANNEL_COLORS, PRODUCT_STATUS_META, PRODUCT_STATUS_OPTIONS, StatusBadgeVariant, ProductCardProps, CHANNEL_BG, ProductChannelBadges(), productColumnLabels (+4 more)

### Community 58 - "Community 58"
Cohesion: 0.21
Nodes (11): DeleteLocationDialogProps, LocationTableProps, LocationBinService, GenerateBinsPayload, Location, LocationBin, LocationVillage, RawLocation (+3 more)

### Community 59 - "Community 59"
Cohesion: 0.21
Nodes (9): PantauanParams, PantauanProduct, PantauanService, ProductTypeFilter, RawPantauan, RawReviewChannel, ReviewChannel, pantauanKey() (+1 more)

### Community 60 - "Community 60"
Cohesion: 0.10
Nodes (27): NaikkanDetailParams, NaikkanHistoryParams, NaikkanListParams, NaikkanService, RaiseProductDetail, RawDetail, RawStore, naikkanDetailKey() (+19 more)

### Community 61 - "Community 61"
Cohesion: 0.34
Nodes (11): FormSalesSection(), ShopMultiSelect(), useCogsAccounts(), useInventoryAccounts(), useMasterDataQuery(), usePurchaseTaxes(), useSalesAccounts(), useSalesReturnAccounts() (+3 more)

### Community 62 - "Community 62"
Cohesion: 0.06
Nodes (52): DataTableColumnHeader(), DataTableProps, DataTableFacetedFilter(), DataTableFacetedFilterProps, DataTablePagination(), DataTableToolbar(), DataTableToolbarProps, DataTableViewOptions() (+44 more)

### Community 63 - "Community 63"
Cohesion: 0.05
Nodes (41): useLocations(), BulkActionBar(), CancellationSub, formatCurrency(), OrderCardList(), OrderCardListProps, OrderCard(), CHANNEL_MAP (+33 more)

### Community 64 - "Community 64"
Cohesion: 0.13
Nodes (18): ChannelCode, ChannelLogo(), HAS_ICON, TILE, buildChannelListingColumns(), Ctx, stack(), ChannelListing (+10 more)

### Community 65 - "Community 65"
Cohesion: 0.17
Nodes (12): DownloadView(), TABS, KategoriView(), ComboboxOption, Tabs(), TabsContent(), TabsList(), tabsListVariants (+4 more)

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (7): LocationListParams, LocationPayload, LocationService, BulkUpdateBin, locationKeys, ToggleLocationActiveVars, UpdateLocationVars

### Community 67 - "Community 67"
Cohesion: 0.19
Nodes (10): columns, Props, ImportBatch, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+2 more)

### Community 68 - "Community 68"
Cohesion: 0.23
Nodes (9): ProductBulkActions(), ProductRowActions(), ARCHIVE_KEY, LIST_KEY, useArchiveProduct(), useBulkArchive(), useBulkDelete(), useDeleteProduct() (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): MarkerContent(), MarkerPopup(), MarkerTooltip(), useMarkerContext()

### Community 70 - "Community 70"
Cohesion: 0.36
Nodes (6): ProductCard(), productColumns, Product, ProductListViewProps, ProductVariantDetail(), useVariantStocks()

### Community 71 - "Community 71"
Cohesion: 0.20
Nodes (9): A. BE — Transit & transfer (sesi sebelumnya, sudah merged ke working tree), B. BE — Lokasi (Milestone 1) ✅, C. FE — Lokasi (Milestone 2–5) ✅ (typecheck 0, eslint clean; BELUM diverifikasi runtime), Cara lanjut, Catatan penting / follow-up untuk sesi baru, Repo, Session Handoff — Manajemen Gudang (Lokasi), Update 2026-06-17 (lanjutan) — hardening (+1 more)

### Community 72 - "Community 72"
Cohesion: 0.21
Nodes (12): InformasiTab(), RegionOption, mapRegion(), RawRegion, RegionService, toNumber(), regionKeys, useCities() (+4 more)

### Community 73 - "Community 73"
Cohesion: 0.22
Nodes (14): EditProdukForm(), useObjectUrl(), VariantImageCell(), detailToFormValues(), detailVariantLocks(), reconstructVariants(), s(), ProductDetail (+6 more)

### Community 74 - "Community 74"
Cohesion: 0.25
Nodes (5): CategoryPicker(), FlatCategory, CategoryNode, SelectedCategory, findCategoryPath()

### Community 75 - "Community 75"
Cohesion: 0.19
Nodes (12): BundleBuilder(), BundleComponentValue, FormDetailSection(), HasilTab(), ProductExplorer(), ProductMasterView(), ProductStats(), useBrandOptions() (+4 more)

### Community 76 - "Community 76"
Cohesion: 0.13
Nodes (12): DetailHeader(), GalleryItem, ProductTypeBadge(), TYPE_LABEL, TYPE_STYLE, StatusActions(), formatIDR(), BulkResult (+4 more)

### Community 77 - "Community 77"
Cohesion: 0.21
Nodes (10): ArchiveView(), ArchivedProduct, RawArchivedItem, ArchiveParams, ArchiveResult, ProductArchiveService, ProductDetailService, ARCHIVE_KEY (+2 more)

### Community 78 - "Community 78"
Cohesion: 0.16
Nodes (13): TabRiwayat(), TabVariasi(), BulkVariantAction, ChannelTabParams, PriceBookParams, ProductTabsService, UploadHistoryParams, VariantsParams (+5 more)

### Community 79 - "Community 79"
Cohesion: 0.15
Nodes (10): BinRow, DimensionRowProps, LayoutGudangTab(), LayoutGudangTabProps, UniformDialogProps, WarehouseVisualProps, binCombinationCount(), buildBinPreview() (+2 more)

### Community 80 - "Community 80"
Cohesion: 0.24
Nodes (8): DeleteLocationDialog(), LocationListView(), LocationTable(), useDeleteLocation(), useToggleLocationActive(), settingKey, useSaveWarehouseLayoutSetting(), useWarehouseLayoutSetting()

### Community 81 - "Community 81"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/geojson, @types/node, @types/react (+3 more)

### Community 82 - "Community 82"
Cohesion: 0.20
Nodes (8): WarehouseUser, LookupResponse, RawUser, WarehouseUserService, RawMedia, UploadedMedia, ApiList, ApiValidationError

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (5): BuatBundleForm(), BuatBundleFormValues, useCreateBundle(), buatBundleSchema, buatProdukSchema

### Community 84 - "Community 84"
Cohesion: 0.16
Nodes (17): data, SidebarItem, sidebarItems, Notification, NotificationsPopover(), Avatar(), AvatarBadge(), AvatarFallback() (+9 more)

### Community 85 - "Community 85"
Cohesion: 0.53
Nodes (4): acc(), AccountsCard(), ShippingCard(), yn()

### Community 86 - "Community 86"
Cohesion: 0.40
Nodes (3): ProductPickerDialog(), TABS, UploadMassalView()

### Community 87 - "Community 87"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, strip-comments, strip-comments:dry

### Community 88 - "Community 88"
Cohesion: 0.29
Nodes (3): RichTextEditor(), RichTextEditorProps, turndown

### Community 89 - "Community 89"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 90 - "Community 90"
Cohesion: 0.50
Nodes (3): CategoryRules, CategoryRulesCard(), CategoryRulesCardProps

### Community 91 - "Community 91"
Cohesion: 0.67
Nodes (3): CUSTOMER_TYPE_LABEL, TabBukuHarga(), useProductPriceBook()

## Knowledge Gaps
- **409 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+404 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 44` to `Community 0`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 21`, `Community 33`, `Community 38`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 47`, `Community 48`, `Community 51`, `Community 52`, `Community 55`, `Community 57`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 67`, `Community 68`, `Community 69`, `Community 70`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 79`, `Community 84`, `Community 88`, `Community 91`, `Community 92`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 3` to `Community 4`, `Community 6`, `Community 7`, `Community 10`, `Community 11`, `Community 13`, `Community 21`, `Community 41`, `Community 42`, `Community 44`, `Community 49`, `Community 51`, `Community 52`, `Community 55`, `Community 57`, `Community 60`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 67`, `Community 68`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 79`, `Community 80`, `Community 83`, `Community 84`, `Community 86`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `ApiResponse` connect `Community 54` to `Community 6`, `Community 9`, `Community 11`, `Community 12`, `Community 21`, `Community 32`, `Community 42`, `Community 43`, `Community 50`, `Community 53`, `Community 58`, `Community 59`, `Community 60`, `Community 62`, `Community 63`, `Community 66`, `Community 72`, `Community 76`, `Community 82`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _409 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._