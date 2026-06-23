# Graph Report - cilupbah-fe  (2026-06-23)

## Corpus Check
- 333 files · ~118,666 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1682 nodes · 4816 edges · 106 communities (93 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9efae4c8`
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
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]

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
- `IntegrationStatus()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/integrasi-channel/stores-table.tsx → src/lib/utils.ts
- `CreatableCombobox()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/buat/form-specification-section.tsx → src/lib/utils.ts
- `ProductTypeBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/detail/detail-header.tsx → src/lib/utils.ts
- `SortHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/dashboard/master-produk/detail/tab-buku-harga.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (106 total, 13 thin omitted)

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
Cohesion: 0.13
Nodes (11): EditKategoriDialog(), FlatLeaf, ImportSystemDialog(), ImportSystemDialogProps, TambahKategoriDialog(), useCreateKategori(), useEnabledCategories(), useEnableKategori() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (18): DataTableColumnHeader(), DataTableColumnHeaderProps, DataTableViewOptionsProps, TeamSwitcher(), Team, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (15): clearLoginSession(), setLoginSession(), loginSchema, LoginValues, FormControl, FormDescription, FormField(), FormFieldContext (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (20): BuatBundleForm(), BuatProdukForm(), EditProdukForm(), FormDetailSection(), FormShippingSection(), FormSpecificationSection(), FormVariantSection(), MediaUploader() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (28): useGlassSpecular(), DashboardSidebar(), Logo(), dashboardGroups, findGroupIdForPath(), isLeafGroup(), linkMatchLen(), NavGroup (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (28): TabChannel(), TabHargaChannel(), TabVariasi(), BulkVariantAction, ChannelListingItem, ChannelListingRow, ChannelPriceCell, ChannelPriceRow (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (4): useIsMobile(), SidebarInset(), SidebarProvider(), SidebarTrigger()

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (34): buildProgressColumns(), STATE_BADGE, STATE_BAR, STATE_LABEL, ProgressTab(), TransactionDetailSheet(), ListingMarketplaceView(), ChannelListingParams (+26 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (18): CategoryCertification, DraftRow, DraftStatus, HistoryRow, MatchRow, RawCategoryRules, RawDraft, RawHistory (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (28): ArchiveTable(), CategoryPicker(), useConnectedStores(), DataTable(), HasilTab(), TYPE_OPTIONS, View, StateFilter (+20 more)

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
Cohesion: 0.08
Nodes (21): Courier, PacklistStatus, Picker, PICKING_ORDER_STAGE, PicklistStatus, RawCourier, RawFulfillmentOrder, RawPacklist (+13 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (20): EditMediaItem, buildCreatePayload(), num(), buildUpdatePayload(), num(), VariantMediaEntry, CreateMediaInput, CreateProductPayload (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (18): Props, columns, ImportErrorSheet(), Props, ImportView(), ImportBatch, ImportBatchError, ImportBatchParams (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (13): LayoutGudangTab(), createDefaults, LocationFormPage(), LocationFormPageProps, Section, layoutBuilderSchema, LayoutBuilderValues, locationFormSchema (+5 more)

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
Cohesion: 0.24
Nodes (8): EditMerekDialog(), MerekView(), PAGE_SIZE_OPTIONS, TambahMerekDialog(), useBrands(), useCreateBrand(), useDeleteBrand(), useUpdateBrand()

### Community 40 - "Community 40"
Cohesion: 0.12
Nodes (18): ChannelInfo, KategoriMappingTab(), useKategoriMapping(), BinRow, DimensionRowProps, LayoutGudangTabProps, UniformDialogProps, WarehouseVisualProps (+10 more)

### Community 41 - "Community 41"
Cohesion: 0.14
Nodes (20): CreatableCombobox(), DownloadSatuanDialog(), StoreMultiSelect(), SUPPORTED, useDownloadProduct(), buttonVariants, Calendar(), Checkbox() (+12 more)

### Community 42 - "Community 42"
Cohesion: 0.07
Nodes (39): ChannelService, StoreFlags, Channel, ChannelCode, ChannelGroup, ConnectedStore, IntegrationStatus, RawChannel (+31 more)

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (8): RawAccount, RawBrand, RawCategory, RawShop, RawTax, TaxLookup, MasterDataService, LookupOption

### Community 44 - "Community 44"
Cohesion: 0.40
Nodes (5): DeleteLocationDialogProps, LocationTableProps, Location, RawLocation, LocationListResult

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Konvensi per halaman, M2 · Persediaan, M3 · Penjualan, M4 · Pembelian, M5 · Gudang, M6 · Laporan & Keuangan, 🎯 Milestone 1 — PRODUK (prioritas), Milestone berikutnya (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (11): Catatan & risiko, Endpoint BE (acuan, sudah ada), FASE L — Listing Marketplace (Produk Channel)  🔴 prioritas 2, FASE M — Pantauan / Monitoring  🟠 prioritas 3, FASE N — Naikkan Produk = Promosi & Iklan (boost)  ⚪ OPSIONAL · DIKERJAKAN TERAKHIR, FASE R — In Review (daftar review)  🟢 prioritas 4 (kecil), FASE U — Upload ke marketplace  🔴 prioritas 1, IA & Navigasi — rekomendasi UX (page vs tab) (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.12
Nodes (17): ensurePrimary(), mediaItemsFromDetail(), ProductMediaManager(), AccountRef, DetailMedia, DetailSpecification, DetailTax, DetailVariantOption (+9 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (18): AutoLocate(), DEFAULT_CENTER, formatCoordinate(), LocationMapPicker(), LocationMapPickerProps, MAP_STYLES, MapClickHandler(), parseCoordinate() (+10 more)

### Community 49 - "Community 49"
Cohesion: 0.18
Nodes (10): acc(), AccountsCard(), ShippingCard(), yn(), DetailTab, ProductDetailView(), BundleStock, TabKomposisi() (+2 more)

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (9): WarehouseUser, LookupResponse, RawUser, WarehouseUserService, MediaService, RawMedia, UploadedMedia, ApiList (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (5): ArchiveView(), DownloadView(), useArchivedProducts(), activeId(), ProdukTabBar()

### Community 52 - "Community 52"
Cohesion: 0.17
Nodes (19): DataTablePaginationProps, PAGE_SIZES, STATUS_LABEL, STATUS_STYLE, SyncStatusBadge(), TabPagination(), STATUS_OPTIONS, PAGE_SIZES (+11 more)

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): AuthService, AuthData, LoginRequest, LoginResponse, User, AuthState, useAuthStore

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (9): ChannelListing, ChannelListingResult, ChannelListingVariant, RawChannelListing, RawConnection, DownloadTransactionDetail, UploadListingResult, ApiPaginated (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.25
Nodes (7): LocationListParams, LocationPayload, LocationService, BulkUpdateBin, locationKeys, ToggleLocationActiveVars, UpdateLocationVars

### Community 56 - "Community 56"
Cohesion: 0.43
Nodes (4): MasterProductsParams, MasterProductsResult, ProductListService, RawMasterItem

### Community 57 - "Community 57"
Cohesion: 0.15
Nodes (14): CHANNEL_COLORS, PRODUCT_STATUS_META, PRODUCT_STATUS_OPTIONS, StatusBadgeVariant, ProductCard(), ProductCardProps, ProductChannelBadges(), formatIDR() (+6 more)

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (7): UbahPackerDialog(), BuatPicklistDialog(), UbahPickerDialog(), useAssignPacker(), useAssignPicker(), useCreatePicklist(), usePickers()

### Community 59 - "Community 59"
Cohesion: 0.19
Nodes (10): PantauanLens, PantauanParams, PantauanProduct, PantauanService, ProductTypeFilter, RawPantauan, RawReviewChannel, ReviewChannel (+2 more)

### Community 60 - "Community 60"
Cohesion: 0.09
Nodes (28): NaikkanDetailParams, NaikkanHistoryParams, NaikkanListParams, NaikkanService, RaiseProductDetail, RaiseProductStore, RawDetail, RawStore (+20 more)

### Community 61 - "Community 61"
Cohesion: 0.34
Nodes (11): FormSalesSection(), ShopMultiSelect(), useCogsAccounts(), useInventoryAccounts(), useMasterDataQuery(), usePurchaseTaxes(), useSalesAccounts(), useSalesReturnAccounts() (+3 more)

### Community 62 - "Community 62"
Cohesion: 0.14
Nodes (13): AtributVariasiView(), AtributVariasiViewProps, ChannelAttributeSelect(), ChannelMappingCell(), CHANNELS, CategoryAttributeItem, TambahAtributDialog(), useCategoryFormAttributes() (+5 more)

### Community 63 - "Community 63"
Cohesion: 0.05
Nodes (39): useLocations(), BulkActionBar(), CancellationSub, formatCurrency(), OrderCardList(), OrderCardListProps, OrderCard(), CHANNEL_MAP (+31 more)

### Community 64 - "Community 64"
Cohesion: 0.14
Nodes (23): BulkUploadResult, DraftParams, HistoryParams, UploadListingParams, channelDraftsKey(), requiredAttributesKey(), uploadHistoriesKey(), uploadListingKey() (+15 more)

### Community 65 - "Community 65"
Cohesion: 0.24
Nodes (10): TABS, Tab, TABS, Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger() (+2 more)

### Community 66 - "Community 66"
Cohesion: 0.18
Nodes (14): FulfillmentListParams, FulfillmentOrder, CreateShipmentPayload, OutboundService, all, fulfillmentKeys, useCouriers(), useCreateShipment() (+6 more)

### Community 67 - "Community 67"
Cohesion: 0.18
Nodes (9): EditProdukLoader(), ProductDetailSkeleton(), ACTION_LABEL, productDetailKey(), useProductDetail(), CHANNEL_OPTIONS, TabId, TABS (+1 more)

### Community 68 - "Community 68"
Cohesion: 0.18
Nodes (9): BulkResult, LifecycleAction, ProductDetailService, ProductRowActions(), useRestoreProduct(), ARCHIVE_KEY, LIST_KEY, useArchiveProduct() (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): MarkerContent(), MarkerPopup(), MarkerTooltip(), useMarkerContext()

### Community 70 - "Community 70"
Cohesion: 0.35
Nodes (8): ProductBulkActions(), productColumns, Product, ProductListViewProps, ProductVariantDetail(), useBulkArchive(), useBulkDelete(), useVariantStocks()

### Community 71 - "Community 71"
Cohesion: 0.20
Nodes (9): A. BE — Transit & transfer (sesi sebelumnya, sudah merged ke working tree), B. BE — Lokasi (Milestone 1) ✅, C. FE — Lokasi (Milestone 2–5) ✅ (typecheck 0, eslint clean; BELUM diverifikasi runtime), Cara lanjut, Catatan penting / follow-up untuk sesi baru, Repo, Session Handoff — Manajemen Gudang (Lokasi), Update 2026-06-17 (lanjutan) — hardening (+1 more)

### Community 72 - "Community 72"
Cohesion: 0.13
Nodes (11): BreadcrumbEntry, PageTitle(), PageTitleProps, KategoriView(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+3 more)

### Community 73 - "Community 73"
Cohesion: 0.27
Nodes (11): useObjectUrl(), VariantImageCell(), detailToFormValues(), detailVariantLocks(), reconstructVariants(), s(), buildCombos(), comboKey() (+3 more)

### Community 74 - "Community 74"
Cohesion: 0.29
Nodes (4): FlatCategory, CategoryNode, SelectedCategory, findCategoryPath()

### Community 75 - "Community 75"
Cohesion: 0.21
Nodes (8): BundleBuilder(), BundleComponentValue, ProductMasterView(), ProductStats(), useMasterProducts(), SORT_FIELD, useProductListQuery(), ProductPickerDialog()

### Community 76 - "Community 76"
Cohesion: 0.17
Nodes (9): DetailHeader(), GalleryItem, ProductTypeBadge(), TYPE_LABEL, TYPE_STYLE, StatusActions(), VideoPlayer(), VideoPlayerProps (+1 more)

### Community 77 - "Community 77"
Cohesion: 0.31
Nodes (6): ArchivedProduct, RawArchivedItem, ArchiveParams, ArchiveResult, ProductArchiveService, ARCHIVE_KEY

### Community 78 - "Community 78"
Cohesion: 0.19
Nodes (15): DeleteLocationDialog(), LocationListView(), LocationTable(), useDeleteLocation(), useToggleLocationActive(), settingKey, useSaveWarehouseLayoutSetting(), useWarehouseLayoutSetting() (+7 more)

### Community 79 - "Community 79"
Cohesion: 0.16
Nodes (11): MASTER_FILTER, OrderStatusTabs(), useOrderCounts(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 80 - "Community 80"
Cohesion: 0.12
Nodes (26): Confirm, EditKategoriDialogProps, EditMerekDialogProps, TambahAtributDialogProps, Mode, TambahKategoriDialogProps, TambahMerekDialogProps, Props (+18 more)

### Community 81 - "Community 81"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/geojson, @types/node, @types/react (+3 more)

### Community 82 - "Community 82"
Cohesion: 0.35
Nodes (7): InformasiTab(), regionKeys, useCities(), useDistricts(), useProvinces(), useVillages(), useWarehouseUsers()

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (6): DocActions, PicklistTable(), ProgressCell(), Picklist, PICKLIST_STATUS_LABEL, usePicklists()

### Community 84 - "Community 84"
Cohesion: 0.09
Nodes (41): SortHeader(), ProgressBar(), ColumnItem(), cn(), data, SidebarItem, sidebarItems, DashboardNavigation() (+33 more)

### Community 85 - "Community 85"
Cohesion: 0.25
Nodes (7): ChannelCategoryNode, FlatChannelCategory, PetakanKategoriDialog(), PetakanKategoriDialogProps, useChannelCategories(), useMapCategoryToChannel(), useSyncChannelCategories()

### Community 86 - "Community 86"
Cohesion: 0.35
Nodes (9): DataTableProps, DataTableFacetedFilter(), DataTableFacetedFilterProps, DataTablePagination(), DataTableToolbar(), DataTableToolbarProps, DataTableViewOptions(), FacetedFilter (+1 more)

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
Cohesion: 0.23
Nodes (10): CategoryFormAttributes, ChannelAttributeItem, FlatKategori, KategoriItem, KategoriMappingItem, KategoriListTab(), PAGE_SIZE_OPTIONS, KategoriService (+2 more)

### Community 91 - "Community 91"
Cohesion: 0.50
Nodes (4): CUSTOMER_TYPE_LABEL, SortHeader(), TabBukuHarga(), useProductPriceBook()

### Community 92 - "Community 92"
Cohesion: 0.19
Nodes (11): defaultSubFor(), FulfillmentStage, STAGE_CONFIG, stageConfig(), StageSub, ProsesPesananView(), StageTabs(), SubStatusPills() (+3 more)

### Community 93 - "Community 93"
Cohesion: 0.23
Nodes (9): LocationBinService, GenerateBinsPayload, LocationBin, LocationVillage, RawLocationBin, WarehouseLayoutSetting, GenerateBinsVars, RawSetting (+1 more)

### Community 94 - "Community 94"
Cohesion: 0.29
Nodes (6): BrandItem, BrandService, apiClient, fetchClient(), BundleService, CreateBundlePayload

### Community 95 - "Community 95"
Cohesion: 0.47
Nodes (7): errMsg(), run(), esc(), printReport(), renderKeyValue(), renderTable(), renderValue()

### Community 96 - "Community 96"
Cohesion: 0.36
Nodes (6): Shipment, SHIPMENT_STATUS_LABEL, useCancelShipment(), useHandOverShipment(), useShipments(), ShipmentTable()

### Community 97 - "Community 97"
Cohesion: 0.40
Nodes (5): RegionOption, mapRegion(), RawRegion, RegionService, toNumber()

### Community 99 - "Community 99"
Cohesion: 0.40
Nodes (4): CategoryFormAttributes, FormAttribute, FormAttributeChannelStatus, FormAttributeOption

### Community 100 - "Community 100"
Cohesion: 0.50
Nodes (3): InventoryService, RawStockRow, VariantStock

### Community 101 - "Community 101"
Cohesion: 0.50
Nodes (3): CategoryRules, CategoryRulesCard(), CategoryRulesCardProps

### Community 102 - "Community 102"
Cohesion: 0.50
Nodes (4): PacklistTable(), Packlist, PACKLIST_STATUS_LABEL, usePacklists()

### Community 103 - "Community 103"
Cohesion: 0.67
Nodes (3): TabRiwayat(), useProductUploadHistories(), useReuploadHistory()

## Knowledge Gaps
- **415 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 84` to `Community 0`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 33`, `Community 34`, `Community 38`, `Community 40`, `Community 41`, `Community 42`, `Community 47`, `Community 48`, `Community 52`, `Community 57`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 66`, `Community 69`, `Community 70`, `Community 72`, `Community 74`, `Community 75`, `Community 76`, `Community 78`, `Community 79`, `Community 80`, `Community 83`, `Community 85`, `Community 86`, `Community 88`, `Community 91`, `Community 92`, `Community 96`, `Community 98`, `Community 102`, `Community 105`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 80` to `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 13`, `Community 33`, `Community 34`, `Community 39`, `Community 40`, `Community 41`, `Community 42`, `Community 49`, `Community 52`, `Community 57`, `Community 60`, `Community 62`, `Community 63`, `Community 65`, `Community 66`, `Community 67`, `Community 70`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 78`, `Community 79`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 90`, `Community 96`, `Community 102`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `ApiResponse` connect `Community 54` to `Community 6`, `Community 9`, `Community 11`, `Community 12`, `Community 21`, `Community 32`, `Community 42`, `Community 43`, `Community 50`, `Community 53`, `Community 55`, `Community 59`, `Community 60`, `Community 63`, `Community 68`, `Community 90`, `Community 93`, `Community 94`, `Community 97`, `Community 100`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._