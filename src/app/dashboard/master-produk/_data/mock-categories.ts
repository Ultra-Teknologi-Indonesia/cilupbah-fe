// Nested category model: kategori → subkategori → jenis (3 levels).
// Leaf `name`s match Product.categoryName so a picked node filters the list.

export interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    id: "peralatan",
    name: "Peralatan Fitness",
    children: [
      {
        id: "kekuatan",
        name: "Latihan Kekuatan",
        children: [
          { id: "beban-barbel", name: "Beban & Barbel" },
          { id: "aksesoris-latihan", name: "Aksesoris Latihan" },
          { id: "rak-bangku", name: "Rak & Bangku" },
        ],
      },
      {
        id: "kardio-grp",
        name: "Kardio",
        children: [
          { id: "kardio", name: "Kardio" },
          { id: "sepeda-statis", name: "Sepeda Statis" },
        ],
      },
      {
        id: "mobilitas",
        name: "Yoga & Mobilitas",
        children: [
          { id: "yoga-pilates", name: "Yoga & Pilates" },
          { id: "recovery", name: "Recovery" },
        ],
      },
    ],
  },
  {
    id: "nutrisi",
    name: "Nutrisi & Suplemen",
    children: [
      {
        id: "protein",
        name: "Protein",
        children: [{ id: "suplemen", name: "Suplemen" }],
      },
      {
        id: "vitamin",
        name: "Vitamin",
        children: [{ id: "multivitamin", name: "Multivitamin" }],
      },
    ],
  },
  {
    id: "apparel-grp",
    name: "Pakaian & Apparel",
    children: [
      {
        id: "atasan",
        name: "Atasan",
        children: [{ id: "apparel", name: "Apparel" }],
      },
      {
        id: "bawahan",
        name: "Bawahan",
        children: [{ id: "celana-training", name: "Celana Training" }],
      },
    ],
  },
]

/** All leaf category names under a node (the node itself if it is a leaf). */
export function collectLeafNames(node: CategoryNode): string[] {
  if (!node.children?.length) return [node.name]
  return node.children.flatMap(collectLeafNames)
}

/** Ancestor chain (inclusive) to the node with `id`, or null if not found. */
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
