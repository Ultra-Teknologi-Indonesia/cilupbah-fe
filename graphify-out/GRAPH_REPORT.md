# Graph Report - cilupbah-fe  (2026-06-23)

## Corpus Check
- 333 files · ~118,475 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1681 nodes · 4813 edges · 95 communities (84 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ae58357`
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
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 256 edges
2. `Button()` - 97 edges
3. `Input()` - 48 edges
4. `LiquidGlass` - 36 edges
5. `DialogContent()` - 31 edges
6. `DialogTitle()` - 31 edges
7. `Dialog()` - 30 edges
8. `fetchClient()` - 28 edges
9. `PageTitle()` - 26 edges
10. `ApiResponse` - 26 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `LocationTableProps` --references--> `Location`  [EXTRACTED]
  src/components/dashboard/manajemen-rak/lokasi/location-table.tsx → src/types/manajemen-rak/location.ts
- `CreatableCombobox()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/buat/form-specification-section.tsx → src/lib/utils.ts
- `ProductTypeBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/detail/detail-header.tsx → src/lib/utils.ts
- `ProgressBar()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/import/import-view.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (95 total, 11 thin omitted)

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
Cohesion: 0.12
Nodes (14): EditKategoriDialog(), FlatLeaf, ImportSystemDialog(), ImportSystemDialogProps, KategoriListTab(), TambahKategoriDialog(), useCreateKategori(), useDeleteKategori() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (21): TeamSwitcher(), DashboardNavigation(), SubRoute, Team, TeamSwitcher(), DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (16): clearLoginSession(), setLoginSession(), LoginForm(), loginSchema, LoginValues, FormControl, FormDescription, FormField() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (15): BuatProdukForm(), EditProdukForm(), FormShippingSection(), FormSpecificationSection(), FormVariantSection(), MediaUploader(), Preview, SectionItem (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (28): useGlassSpecular(), DashboardSidebar(), Logo(), dashboardGroups, findGroupIdForPath(), isLeafGroup(), linkMatchLen(), NavGroup (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (25): STATUS_OPTIONS, TabRiwayat(), BulkVariantAction, ChannelListingItem, ChannelListingRow, ChannelPriceCell, ChannelPriceRow, ChannelTabParams (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (19): useIsMobile(), CHANNEL_BG, ChannelDot(), SIDEBAR_TRANSITION, SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput() (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (14): buildProgressColumns(), STATE_BADGE, STATE_BAR, STATE_LABEL, ChannelSearchItem, channelSearchRowId(), DownloadState, DownloadTransactionDetailParams (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (42): BulkUploadResult, CategoryCertification, CategoryRules, DraftParams, DraftRow, DraftStatus, HistoryParams, HistoryRow (+34 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (19): CategoryPicker(), TYPE_OPTIONS, View, FilterShell(), FilterToolbar(), ProductCardView(), Query, View (+11 more)

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
Cohesion: 0.05
Nodes (43): errMsg(), run(), Courier, FulfillmentListParams, FulfillmentOrder, FulfillmentStage, Packlist, PACKLIST_STATUS_LABEL (+35 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (23): EditMediaItem, buildCreatePayload(), num(), buildUpdatePayload(), num(), VariantMediaEntry, CreateMediaInput, CreateProductPayload (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (21): Props, columns, ImportErrorSheet(), Props, ImportView(), ProgressBar(), ImportBatch, ImportBatchError (+13 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (12): createDefaults, LocationFormPage(), LocationFormPageProps, Section, layoutBuilderSchema, LayoutBuilderValues, locationFormSchema, LocationFormValues (+4 more)

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
Cohesion: 0.26
Nodes (9): LoginScreen(), metadata, Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (8): EditMerekDialog(), MerekView(), PAGE_SIZE_OPTIONS, TambahMerekDialog(), useBrands(), useCreateBrand(), useDeleteBrand(), useUpdateBrand()

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (12): BinRow, DimensionRowProps, LayoutGudangTab(), LayoutGudangTabProps, UniformDialogProps, WarehouseVisualProps, binCombinationCount(), buildBinPreview() (+4 more)

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (15): CreatableCombobox(), buttonVariants, Calendar(), ComboboxOption, ComboboxProps, DatePickerProps, DateRangePickerProps, Popover() (+7 more)

### Community 42 - "Community 42"
Cohesion: 0.13
Nodes (20): ChannelService, StoreFlags, Channel, ChannelGroup, RawConnectedStore, CHANNEL_CATALOG, DISPLAY_NAME, groupCode() (+12 more)

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (8): RawAccount, RawBrand, RawCategory, RawShop, RawTax, TaxLookup, MasterDataService, LookupOption

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (14): ChannelInfo, FlatKategori, PAGE_SIZE_OPTIONS, KategoriMappingTab(), useKategoriMapping(), LocationTableProps, Table(), TableBody() (+6 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Konvensi per halaman, M2 · Persediaan, M3 · Penjualan, M4 · Pembelian, M5 · Gudang, M6 · Laporan & Keuangan, 🎯 Milestone 1 — PRODUK (prioritas), Milestone berikutnya (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (11): Catatan & risiko, Endpoint BE (acuan, sudah ada), FASE L — Listing Marketplace (Produk Channel)  🔴 prioritas 2, FASE M — Pantauan / Monitoring  🟠 prioritas 3, FASE N — Naikkan Produk = Promosi & Iklan (boost)  ⚪ OPSIONAL · DIKERJAKAN TERAKHIR, FASE R — In Review (daftar review)  🟢 prioritas 4 (kecil), FASE U — Upload ke marketplace  🔴 prioritas 1, IA & Navigasi — rekomendasi UX (page vs tab) (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.12
Nodes (12): SYNC_STYLE, AccountRef, DetailChannelMapping, DetailSpecification, DetailTax, DetailVariant, DetailVariantOption, DetailVariationType (+4 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (18): AutoLocate(), DEFAULT_CENTER, formatCoordinate(), LocationMapPicker(), LocationMapPickerProps, MAP_STYLES, MapClickHandler(), parseCoordinate() (+10 more)

### Community 49 - "Community 49"
Cohesion: 0.13
Nodes (15): EditProdukLoader(), acc(), AccountsCard(), ShippingCard(), yn(), ProductDetailSkeleton(), DetailTab, ProductDetailView() (+7 more)

### Community 50 - "Community 50"
Cohesion: 0.13
Nodes (15): apiClient, fetchClient(), WarehouseLayoutSetting, WarehouseUser, RawSetting, WarehouseSettingService, LookupResponse, RawUser (+7 more)

### Community 51 - "Community 51"
Cohesion: 0.11
Nodes (7): PageTitle(), DownloadView(), activeId(), ProdukTabBar(), Tab, TABS, UploadMassalView()

### Community 52 - "Community 52"
Cohesion: 0.17
Nodes (23): DataTablePaginationProps, TabChannel(), TabHargaChannel(), PAGE_SIZES, STATUS_LABEL, STATUS_STYLE, TabPagination(), PAGE_SIZES (+15 more)

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): AuthService, AuthData, LoginRequest, LoginResponse, User, AuthState, useAuthStore

### Community 54 - "Community 54"
Cohesion: 0.17
Nodes (11): BrandItem, BrandService, ChannelListing, ChannelListingResult, ChannelListingVariant, RawChannelListing, RawConnection, DownloadTransactionDetail (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.21
Nodes (13): DeleteLocationDialogProps, Location, LocationBin, LocationListParams, LocationPayload, LocationVillage, RawLocation, RawLocationBin (+5 more)

### Community 56 - "Community 56"
Cohesion: 0.21
Nodes (8): MasterProductsParams, MasterProductsResult, ProductListService, ProductChannelStatus, ProductVariant, RawMasterItem, RawMasterOnlineStatus, RawMasterVariant

### Community 57 - "Community 57"
Cohesion: 0.17
Nodes (13): DataTableColumnHeader(), CHANNEL_COLORS, PRODUCT_STATUS_META, PRODUCT_STATUS_OPTIONS, StatusBadgeVariant, ProductCardProps, ProductChannelBadges(), productColumnLabels (+5 more)

### Community 58 - "Community 58"
Cohesion: 0.13
Nodes (16): EditKategoriDialogProps, EditMerekDialogProps, TambahAtributDialogProps, TambahMerekDialogProps, UbahPackerDialog(), UbahPackerDialogProps, BuatPicklistDialog(), BuatPicklistDialogProps (+8 more)

### Community 59 - "Community 59"
Cohesion: 0.14
Nodes (16): PantauanLens, PantauanParams, PantauanProduct, PantauanService, ProductTypeFilter, RawPantauan, RawReviewChannel, ReviewChannel (+8 more)

### Community 60 - "Community 60"
Cohesion: 0.08
Nodes (31): NaikkanDetailParams, NaikkanHistoryParams, NaikkanListParams, NaikkanService, RaiseProductDetail, RaiseProductStore, RawDetail, RawStore (+23 more)

### Community 61 - "Community 61"
Cohesion: 0.26
Nodes (15): FormDetailSection(), FormSalesSection(), ShopMultiSelect(), ProductExplorer(), useBrandOptions(), useCategoryTree(), useCogsAccounts(), useInventoryAccounts() (+7 more)

### Community 62 - "Community 62"
Cohesion: 0.16
Nodes (11): AtributVariasiView(), AtributVariasiViewProps, ChannelAttributeSelect(), ChannelMappingCell(), CHANNELS, TambahAtributDialog(), useCategoryFormAttributes(), useChannelAttributes() (+3 more)

### Community 63 - "Community 63"
Cohesion: 0.05
Nodes (41): useLocations(), BulkActionBar(), CancellationSub, formatCurrency(), OrderCardList(), OrderCardListProps, OrderCard(), CHANNEL_MAP (+33 more)

### Community 64 - "Community 64"
Cohesion: 0.14
Nodes (17): ChannelCode, ConnectedStore, IntegrationStatus, RawChannel, StoreIntegration, SyncStatusBadge(), ChannelLogo(), HAS_ICON (+9 more)

### Community 65 - "Community 65"
Cohesion: 0.19
Nodes (11): KategoriView(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), CHANNEL_OPTIONS, TabId (+3 more)

### Community 66 - "Community 66"
Cohesion: 0.11
Nodes (25): PacklistTable(), DocActions, PicklistTable(), defaultSubFor(), stageConfig(), ProsesPesananView(), all, fulfillmentKeys (+17 more)

### Community 67 - "Community 67"
Cohesion: 0.27
Nodes (11): ListingMarketplaceView(), ChannelListingParams, ChannelProductService, channelProductsKey(), UnlinkInput, useBulkUnlinkListing(), useChannelProducts(), useDownloadChannel() (+3 more)

### Community 68 - "Community 68"
Cohesion: 0.23
Nodes (11): ProductBulkActions(), ProductDetailService, ProductRowActions(), useRestoreProduct(), ARCHIVE_KEY, LIST_KEY, useArchiveProduct(), useBulkArchive() (+3 more)

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): MarkerContent(), MarkerPopup(), MarkerTooltip(), useMarkerContext()

### Community 70 - "Community 70"
Cohesion: 0.26
Nodes (8): InventoryService, ProductCard(), productColumns, Product, ProductListViewProps, ProductVariantDetail(), useVariantStocks(), Skeleton()

### Community 71 - "Community 71"
Cohesion: 0.20
Nodes (9): A. BE — Transit & transfer (sesi sebelumnya, sudah merged ke working tree), B. BE — Lokasi (Milestone 1) ✅, C. FE — Lokasi (Milestone 2–5) ✅ (typecheck 0, eslint clean; BELUM diverifikasi runtime), Cara lanjut, Catatan penting / follow-up untuk sesi baru, Repo, Session Handoff — Manajemen Gudang (Lokasi), Update 2026-06-17 (lanjutan) — hardening (+1 more)

### Community 72 - "Community 72"
Cohesion: 0.10
Nodes (27): BreadcrumbEntry, PageTitleProps, SortHeader(), SortHeader(), StoreMultiSelect(), IntegrationStatus(), ColumnItem(), cn() (+19 more)

### Community 73 - "Community 73"
Cohesion: 0.27
Nodes (11): useObjectUrl(), VariantImageCell(), detailToFormValues(), detailVariantLocks(), reconstructVariants(), s(), buildCombos(), comboKey() (+3 more)

### Community 74 - "Community 74"
Cohesion: 0.11
Nodes (13): BuatBundleForm(), FlatCategory, CategoryFormAttributes, FormAttribute, FormAttributeChannelStatus, FormAttributeOption, CategoryNode, SelectedCategory (+5 more)

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (4): ProductMasterView(), ProductStats(), SORT_FIELD, useProductListQuery()

### Community 76 - "Community 76"
Cohesion: 0.13
Nodes (11): DetailHeader(), GalleryItem, ProductTypeBadge(), TYPE_LABEL, TYPE_STYLE, StatusActions(), BulkResult, LifecycleAction (+3 more)

### Community 77 - "Community 77"
Cohesion: 0.24
Nodes (8): ArchiveView(), ArchivedProduct, RawArchivedItem, ArchiveParams, ArchiveResult, ProductArchiveService, ARCHIVE_KEY, useArchivedProducts()

### Community 78 - "Community 78"
Cohesion: 0.24
Nodes (8): DeleteLocationDialog(), LocationListView(), LocationTable(), useDeleteLocation(), useToggleLocationActive(), settingKey, useSaveWarehouseLayoutSetting(), useWarehouseLayoutSetting()

### Community 79 - "Community 79"
Cohesion: 0.15
Nodes (18): useConnectedStores(), DownloadMassalDialog(), DownloadSatuanDialog(), SUPPORTED, ProgressTab(), StateFilter, MASTER_FILTER, TransactionDetailSheet() (+10 more)

### Community 80 - "Community 80"
Cohesion: 0.17
Nodes (16): ArchiveTable(), Confirm, ImportDialog(), Mode, TambahKategoriDialogProps, useImportFile(), Props, ConfirmDialogProps (+8 more)

### Community 81 - "Community 81"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/geojson, @types/node, @types/react (+3 more)

### Community 82 - "Community 82"
Cohesion: 0.21
Nodes (12): InformasiTab(), RegionOption, mapRegion(), RawRegion, RegionService, toNumber(), regionKeys, useCities() (+4 more)

### Community 83 - "Community 83"
Cohesion: 0.35
Nodes (9): DataTableColumnHeaderProps, DataTableViewOptionsProps, TABS, Button(), DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuSeparator() (+1 more)

### Community 84 - "Community 84"
Cohesion: 0.18
Nodes (9): data, SidebarItem, sidebarItems, SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupContent(), SidebarHeader() (+1 more)

### Community 85 - "Community 85"
Cohesion: 0.25
Nodes (7): ChannelCategoryNode, FlatChannelCategory, PetakanKategoriDialog(), PetakanKategoriDialogProps, useChannelCategories(), useMapCategoryToChannel(), useSyncChannelCategories()

### Community 86 - "Community 86"
Cohesion: 0.33
Nodes (10): DataTable(), DataTableProps, DataTableFacetedFilter(), DataTableFacetedFilterProps, DataTablePagination(), DataTableToolbar(), DataTableToolbarProps, DataTableViewOptions() (+2 more)

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
Cohesion: 0.39
Nodes (6): CategoryAttributeItem, CategoryFormAttributes, ChannelAttributeItem, KategoriItem, KategoriMappingItem, KategoriService

### Community 91 - "Community 91"
Cohesion: 0.67
Nodes (3): CUSTOMER_TYPE_LABEL, TabBukuHarga(), useProductPriceBook()

### Community 92 - "Community 92"
Cohesion: 0.40
Nodes (5): BundleBuilder(), BundleComponentValue, HasilTab(), useMasterProducts(), ProductPickerDialog()

### Community 93 - "Community 93"
Cohesion: 0.40
Nodes (4): ensurePrimary(), mediaItemsFromDetail(), ProductMediaManager(), DetailMedia

## Knowledge Gaps
- **415 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 72` to `Community 0`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 21`, `Community 33`, `Community 34`, `Community 38`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 47`, `Community 48`, `Community 51`, `Community 52`, `Community 57`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 66`, `Community 68`, `Community 69`, `Community 70`, `Community 75`, `Community 76`, `Community 79`, `Community 80`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 88`, `Community 91`, `Community 92`, `Community 93`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 83` to `Community 3`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 13`, `Community 33`, `Community 34`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 49`, `Community 52`, `Community 57`, `Community 58`, `Community 59`, `Community 60`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 66`, `Community 68`, `Community 72`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 78`, `Community 79`, `Community 80`, `Community 85`, `Community 86`, `Community 92`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `ApiResponse` connect `Community 54` to `Community 32`, `Community 6`, `Community 40`, `Community 9`, `Community 42`, `Community 11`, `Community 43`, `Community 76`, `Community 12`, `Community 82`, `Community 50`, `Community 53`, `Community 21`, `Community 55`, `Community 90`, `Community 59`, `Community 60`, `Community 63`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._