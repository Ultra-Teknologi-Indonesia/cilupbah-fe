import type { BuatProdukFormValues } from "@/types/master-produk";

export const SERVER_FIELD_MAP: Record<string, keyof BuatProdukFormValues> = {
  name: "name",
  sku: "sku",
  "variants.0.sku": "sku",
  category_id: "category",
  description: "description",
  "variants.0.sell_price": "sellPrice",
  weight: "weight",
};
