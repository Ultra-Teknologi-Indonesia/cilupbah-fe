import { z } from "zod"

export const buatProdukSchema = z
  .object({
    name: z.string().trim().min(1, "Nama produk wajib diisi").max(255),
    sku: z.string().trim().min(1, "SKU wajib diisi").max(50),
    category: z
      .object({ id: z.string(), name: z.string(), path: z.array(z.string()) })
      .nullable(),
    brandId: z.string().nullable(),
    brandOther: z.string().max(255).optional(),
    description: z.string().max(10000).optional(),
    isBundle: z.boolean(),
    isConsignment: z.boolean(),
    isPreorder: z.boolean(),
    indentDays: z.string().optional(),
    isStored: z.boolean(),
    isSold: z.boolean(),
    isPurchased: z.boolean(),
    sellPrice: z.string().optional(),
    salesTaxId: z.string().nullable(),
    salesAccountId: z.string().nullable(),
    salesReturnAccountId: z.string().nullable(),
    buyPrice: z.string().optional(),
    purchaseTaxId: z.string().nullable(),
    inventoryAccountId: z.string().nullable(),
    cogsAccountId: z.string().nullable(),
    purchaseLeadTime: z.string().optional(),
    minStock: z.string().optional(),
    safeStock: z.string().optional(),
    unlimitedShopIds: z.array(z.string()),
    weight: z.string().min(1, "Berat wajib diisi"),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    packageContents: z.string().max(2000).optional(),
    // Jenis varian (≤2), tiap jenis punya ≥1 nilai opsi.
    variationTypes: z
      .array(
        z.object({
          attributeId: z.number(),
          name: z.string(),
          values: z
            .array(z.string().trim().min(1, "Opsi tidak boleh kosong"))
            .min(1, "Minimal 1 opsi"),
        })
      )
      .max(2, "Maksimal 2 jenis varian"),
    // Kombinasi varian (cartesian) — diisi builder; tiap baris punya SKU.
    variants: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        options: z.array(z.object({ attributeId: z.number(), value: z.string() })),
        sku: z.string().trim().min(1, "SKU varian wajib diisi").max(50),
        sellPrice: z.string().optional(),
      })
    ),
    // Spesifikasi dinamis per kategori.
    specifications: z.array(
      z.object({
        attributeId: z.number(),
        value: z.string().optional(),
      })
    ),
  })
  .superRefine((v, ctx) => {
    if (!v.category)
      ctx.addIssue({ path: ["category"], code: "custom", message: "Kategori wajib dipilih" })
    const hasVariants = v.variationTypes.length > 0
    // Harga jual: untuk produk satuan di header; untuk multivarian diisi per varian.
    if (v.isSold && !hasVariants && !v.sellPrice?.trim())
      ctx.addIssue({ path: ["sellPrice"], code: "custom", message: "Harga jual wajib diisi" })
    if (hasVariants && v.variants.length === 0)
      ctx.addIssue({ path: ["variants"], code: "custom", message: "Lengkapi kombinasi varian" })
    if (v.isPreorder && !v.indentDays?.trim())
      ctx.addIssue({ path: ["indentDays"], code: "custom", message: "Lama indent wajib diisi" })
    const descText = (v.description ?? "").replace(/<[^>]*>/g, "").trim()
    if (descText.length > 0 && descText.length < 30)
      ctx.addIssue({ path: ["description"], code: "custom", message: "Minimal 30 karakter" })
    const min = Number(v.minStock || 0)
    const safe = Number(v.safeStock || 0)
    if (v.safeStock?.trim() && safe < min)
      ctx.addIssue({ path: ["safeStock"], code: "custom", message: "Tidak boleh < batas stok menipis" })
  })
