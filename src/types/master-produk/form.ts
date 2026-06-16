import type { z } from "zod"
import type { buatProdukSchema } from "@/schemas/master-produk"


export type BuatProdukFormValues = z.input<typeof buatProdukSchema>
