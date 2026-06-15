import type { z } from "zod"
import type { buatProdukSchema } from "@/schemas/master-produk"

/** Nilai form Buat Produk — sumber kebenaran tunggal dari skema zod. */
export type BuatProdukFormValues = z.input<typeof buatProdukSchema>
