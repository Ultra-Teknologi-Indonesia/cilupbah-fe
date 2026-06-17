import { z } from "zod"

// Skema form Informasi Lokasi (mirror StoreLocationRequest di BE).
// province/city/district hanya untuk cascade UI; yang dipersist hanya villageId.
export const locationFormSchema = z.object({
  locationName: z.string().min(1, "Nama lokasi wajib diisi").max(255),
  locationCode: z.string().min(1, "Kode lokasi wajib diisi").max(50),
  address: z.string().min(1, "Detail alamat wajib diisi"),
  coordinate: z.string().max(100).optional().or(z.literal("")),
  provinceId: z.string().min(1, "Provinsi wajib dipilih"),
  cityId: z.string().min(1, "Kota wajib dipilih"),
  districtId: z.string().min(1, "Kecamatan wajib dipilih"),
  villageId: z.string().min(1, "Kelurahan wajib dipilih"),
  postCode: z.string().min(1, "Kode pos wajib diisi").max(20),
  phone: z.string().min(1, "No. telepon wajib diisi").max(30),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid").max(255),
  defaultWarehouseUser: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  isWarehouse: z.boolean(),
  isActive: z.boolean(),
  isPos: z.boolean(),
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

// Skema builder Layout Gudang (Lantai/Baris/Kolom/Rak).
export const layoutBuilderSchema = z.object({
  floorCode: z.string().min(1).max(10).default("L"),
  qtyFloor: z.coerce.number().int().min(1, "Minimal 1"),
  rowCode: z.string().min(1).max(10).default("B"),
  qtyRow: z.coerce.number().int().min(1, "Minimal 1"),
  columnCode: z.string().min(1).max(10).default("K"),
  qtyColumn: z.coerce.number().int().min(1, "Minimal 1"),
  binCode: z.string().min(1).max(10).default("R"),
  qtyBin: z.coerce.number().int().min(1, "Minimal 1"),
  maxQty: z.coerce.number().int().min(0).optional(),
}).refine(
  (v) => v.qtyFloor * v.qtyRow * v.qtyColumn * v.qtyBin <= 2000,
  { message: "Maksimum kombinasi rak adalah 2000", path: ["qtyBin"] }
)

export type LayoutBuilderValues = z.infer<typeof layoutBuilderSchema>
