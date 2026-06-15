import type { BuatProdukFormValues } from "@/types/master-produk"

// Field error BE (snake_case / path varian) → field form (camelCase).
export const SERVER_FIELD_MAP: Record<string, keyof BuatProdukFormValues> = {
  name: "name",
  sku: "sku",
  "variants.0.sku": "sku",
  category_id: "category",
  brand_id: "brandId",
  description: "description",
  "variants.0.sell_price": "sellPrice",
  "variants.0.buy_price": "buyPrice",
  "variants.0.min_stock": "minStock",
  "variants.0.safe_stock": "safeStock",
  indent_days: "indentDays",
  weight: "weight",
  length: "length",
  width: "width",
  height: "height",
  purchase_lead_time: "purchaseLeadTime",
  sales_account_id: "salesAccountId",
  sales_return_account_id: "salesReturnAccountId",
  inventory_account_id: "inventoryAccountId",
  cogs_account_id: "cogsAccountId",
}
