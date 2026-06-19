import type { z } from "zod"
import type { buatProdukSchema, buatBundleSchema } from "@/schemas/master-produk"


export type BuatProdukFormValues = z.input<typeof buatProdukSchema>
export type BuatBundleFormValues = z.input<typeof buatBundleSchema>
