import type { CategoryNode } from "@/types/master-produk"

/** Semua nama kategori daun di bawah sebuah node (node itu sendiri bila daun). */
export function collectLeafNames(node: CategoryNode): string[] {
  if (!node.children?.length) return [node.name]
  return node.children.flatMap(collectLeafNames)
}

/** Rantai leluhur (inklusif) menuju node dengan `id`, atau null bila tak ada. */
export function findCategoryPath(
  nodes: CategoryNode[],
  id: string,
  trail: CategoryNode[] = []
): CategoryNode[] | null {
  for (const node of nodes) {
    const path = [...trail, node]
    if (node.id === id) return path
    if (node.children) {
      const found = findCategoryPath(node.children, id, path)
      if (found) return found
    }
  }
  return null
}
