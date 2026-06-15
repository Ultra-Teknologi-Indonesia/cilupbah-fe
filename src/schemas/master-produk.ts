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
  })
  .superRefine((v, ctx) => {
    if (!v.category)
      ctx.addIssue({ path: ["category"], code: "custom", message: "Kategori wajib dipilih" })
    if (v.isSold && !v.sellPrice?.trim())
      ctx.addIssue({ path: ["sellPrice"], code: "custom", message: "Harga jual wajib diisi" })
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
