export interface ImportRowRaw {
  Nama: string
  Tipe: string
  "PKP/Non PKP": string
  NPWP: string
  NIK: string
  Kategori: string
  Termin: string
  "No. Telepon": string
  Email: string
  "Detail Alamat": string
  Provinsi: string
  Kota: string
  Kecamatan: string
  Kelurahan: string
}

export interface ImportRowMapped {
  name: string
  type: "CUSTOMER" | "SUPPLIER" | "BOTH"
  tax_type?: "PKP" | "NON_PKP"
  tax_id?: string
  nik?: string
  category_id?: string
  payment_term?: number
  phone?: string
  email?: string
  address?: string
  province?: string
  city?: string
}

export interface ImportValidRow {
  row: number
  raw: ImportRowRaw
  mapped: ImportRowMapped
}

export interface ImportInvalidRow {
  row: number
  raw: ImportRowRaw
  errors: string[]
  /** Nama kolom yang nilainya tidak valid, untuk disorot di tabel preview. */
  error_fields: string[]
}

export interface ImportValidateResult {
  valid: ImportValidRow[]
  invalid: ImportInvalidRow[]
  total: number
  valid_count: number
  invalid_count: number
}

export interface ImportSaveResult {
  created: number
}
