// Tipe untuk laporan Harga Pokok Penjualan (HPP)
// Sesuai response BE: GET /api/app/reports/hpp

export interface HppReportPeriod {
  date_from: string
  date_to: string
  location_id: string | null
}

export interface HppReportData {
  persediaan_awal: number
  pembelian_bruto: number
  ongkos_angkut: number
  retur_pembelian: number
  potongan_pembelian: number
  pembelian_bersih: number
  barang_tersedia: number
  persediaan_akhir: number
  hpp: number
  hpp_periode_snapshot: number
}

export interface HppReportPayload {
  report_type: "hpp"
  generated_at: string
  period: HppReportPeriod
  data: HppReportData
}

export interface HppReportParams {
  date_from: string
  date_to: string
  location_id?: string
}
