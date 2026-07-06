import { fetchClient } from "@/lib/api-client";
import type { ApiList, ApiResponse } from "@/types/api.types";
import type {
  CategoryFormAttributes,
  CategoryNode,
  RawCategory,
} from "@/types/master-produk";

function buildCategoryTree(raw: RawCategory[]): CategoryNode[] {
  const hasNested = raw.some(
    (r) => Array.isArray(r.children) && r.children.length,
  );
  if (hasNested) {
    const map = (r: RawCategory): CategoryNode => ({
      id: String(r.id),
      name: r.name,
      children: r.children?.length ? r.children.map(map) : undefined,
    });
    return raw.map(map);
  }

  const byId = new Map<string, CategoryNode>();
  raw.forEach((r) =>
    byId.set(String(r.id), { id: String(r.id), name: r.name, children: [] }),
  );
  const roots: CategoryNode[] = [];
  raw.forEach((r) => {
    const node = byId.get(String(r.id))!;
    const pid = r.parent_id != null ? String(r.parent_id) : null;
    if (pid && byId.has(pid)) byId.get(pid)!.children!.push(node);
    else roots.push(node);
  });
  const prune = (n: CategoryNode): CategoryNode => ({
    id: n.id,
    name: n.name,
    children:
      n.children && n.children.length ? n.children.map(prune) : undefined,
  });
  return roots.map(prune);
}

export const MasterDataService = {
  categoryTree: async (): Promise<CategoryNode[]> => {
    const res = await fetchClient<ApiList<RawCategory>>(
      "/categories?all=1&include=children.children.children",
    );
    return buildCategoryTree(res.data ?? []);
  },

  categoryFormAttributes: async (
    id: string | number,
  ): Promise<CategoryFormAttributes> => {
    const res = await fetchClient<ApiResponse<CategoryFormAttributes>>(
      `/categories/${id}/form-attributes`,
    );
    return res.data;
  },
};
