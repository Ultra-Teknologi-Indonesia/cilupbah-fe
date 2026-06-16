import { fetchClient } from "@/lib/api-client"
import type { ApiList, ApiResponse } from "@/types/api.types"
import type { LookupOption } from "@/types/common"
import type {
  CategoryFormAttributes,
  CategoryNode,
  RawAccount,
  RawBrand,
  RawCategory,
  RawShop,
  RawTax,
  TaxLookup,
} from "@/types/master-produk"

/** Bangun pohon kategori dari respons nested ATAU flat (parent_id). */
function buildCategoryTree(raw: RawCategory[]): CategoryNode[] {
  const hasNested = raw.some((r) => Array.isArray(r.children) && r.children.length)
  if (hasNested) {
    const map = (r: RawCategory): CategoryNode => ({
      id: String(r.id),
      name: r.name,
      children: r.children?.length ? r.children.map(map) : undefined,
    })
    return raw.map(map)
  }

  const byId = new Map<string, CategoryNode>()
  raw.forEach((r) => byId.set(String(r.id), { id: String(r.id), name: r.name, children: [] }))
  const roots: CategoryNode[] = []
  raw.forEach((r) => {
    const node = byId.get(String(r.id))!
    const pid = r.parent_id != null ? String(r.parent_id) : null
    if (pid && byId.has(pid)) byId.get(pid)!.children!.push(node)
    else roots.push(node)
  })
  const prune = (n: CategoryNode): CategoryNode => ({
    id: n.id,
    name: n.name,
    children: n.children && n.children.length ? n.children.map(prune) : undefined,
  })
  return roots.map(prune)
}

async function taxLookup(path: string): Promise<TaxLookup> {
  const res = await fetchClient<ApiList<RawTax>>(path)
  const rateById: Record<string, number> = {}
  const options = (res.data ?? []).map((t) => {
    const value = String(t.id)
    rateById[value] = t.rate
    return { value, label: t.name, hint: `${t.rate}%` }
  })
  return { options, rateById }
}

async function accountOptions(path: string): Promise<LookupOption[]> {
  const res = await fetchClient<ApiList<RawAccount>>(path)
  return (res.data ?? []).map((a) => ({ value: a.account_id, label: a.account_name }))
}

export const MasterDataService = {
  salesTaxes: () => taxLookup("/products/master-data/sales-taxes"),
  purchaseTaxes: () => taxLookup("/products/master-data/purchase-taxes"),
  salesAccounts: () => accountOptions("/products/master-data/sales-accounts"),
  salesReturnAccounts: () => accountOptions("/products/master-data/sales-return-accounts"),
  inventoryAccounts: () => accountOptions("/products/master-data/inventory-accounts"),
  cogsAccounts: () => accountOptions("/products/master-data/cogs-accounts"),

  brands: async (): Promise<LookupOption[]> => {
    const res = await fetchClient<ApiList<RawBrand>>("/brands?all=1")
    return (res.data ?? []).map((b) => ({ value: String(b.id), label: b.name }))
  },

  shops: async (): Promise<LookupOption[]> => {
    const res = await fetchClient<ApiList<RawShop>>("/marketplace/store")
    return (res.data ?? []).map((s) => ({
      value: s.id,
      label: s.shop_name ?? s.shop_id ?? "Toko",
      hint: s.channel?.name ?? s.channel_name ?? undefined,
    }))
  },

  categoryTree: async (): Promise<CategoryNode[]> => {
    const res = await fetchClient<ApiList<RawCategory>>("/categories?all=1")
    return buildCategoryTree(res.data ?? [])
  },

  // Atribut form (spesifikasi + jenis varian) untuk kategori Level-2.
  categoryFormAttributes: async (
    id: string | number
  ): Promise<CategoryFormAttributes> => {
    const res = await fetchClient<ApiResponse<CategoryFormAttributes>>(
      `/categories/${id}/form-attributes`
    )
    return res.data
  },
}
