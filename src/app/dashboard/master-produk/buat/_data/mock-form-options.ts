// Mock master data untuk form Buat Produk (Phase 1 — belum integrasi BE).
// Bentuk meniru 6 endpoint master-data + lookup brand/kategori/toko.

export interface Option {
  value: string
  label: string
  hint?: string
}

export const mockBrands: Option[] = [
  { value: "1", label: "UltraFit" },
  { value: "2", label: "IronCore" },
  { value: "3", label: "ZenFlow" },
  { value: "4", label: "PureGain" },
  { value: "5", label: "FlexWear" },
]

// Pajak (dipakai Pajak Penjualan & Pajak Pembelian).
export const mockTaxes: Option[] = [
  { value: "t0", label: "No Tax", hint: "0%" },
  { value: "t1", label: "PPH 22", hint: "1.5%" },
  { value: "t2", label: "PPN 10%", hint: "10%" },
  { value: "t3", label: "PPN 11%", hint: "11%" },
  { value: "t4", label: "PPN 12%", hint: "12%" },
]

export const TAX_RATE: Record<string, number> = {
  t0: 0,
  t1: 1.5,
  t2: 10,
  t3: 11,
  t4: 12,
}

// Chart of Accounts (sesuai seeder BE), dikelompokkan per tipe.
export const mockSalesAccounts: Option[] = [
  { value: "acc-4-4000", label: "4-4000 - Pendapatan Penjualan" },
  { value: "acc-4-4100", label: "4-4100 - Diskon Penjualan" },
  { value: "acc-4-4200", label: "4-4200 - Retur Penjualan" },
]

export const mockSalesReturnAccounts: Option[] = mockSalesAccounts

export const mockInventoryAccounts: Option[] = [
  { value: "acc-1-1000", label: "1-1000 - Kas" },
  { value: "acc-1-1100", label: "1-1100 - Piutang Usaha" },
  { value: "acc-1-1200", label: "1-1200 - Persediaan Barang" },
]

export const mockCogsAccounts: Option[] = [
  { value: "acc-5-5000", label: "5-5000 - Harga Pokok Penjualan" },
  { value: "acc-6-6000", label: "6-6000 - Beban Operasional" },
]

// Default akun dari account_mappings (akan auto-terisi & berbadge "Default").
export const defaultAccounts = {
  salesAccountId: "acc-4-4000",
  salesReturnAccountId: "acc-4-4200",
  inventoryAccountId: "acc-1-1200",
  cogsAccountId: "acc-5-5000",
}

// Toko marketplace untuk "Toko stok tidak terbatas" (multi-select).
export const mockShops: Option[] = [
  { value: "shop-1", label: "UltraFit Official", hint: "Shopee" },
  { value: "shop-2", label: "UltraFit Store", hint: "Tokopedia" },
  { value: "shop-3", label: "UltraFit ID", hint: "TikTok Shop" },
  { value: "shop-4", label: "UltraFit Flagship", hint: "Lazada" },
]
