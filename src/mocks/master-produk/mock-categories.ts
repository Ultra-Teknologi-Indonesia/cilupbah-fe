import type { CategoryNode } from "@/types/master-produk";

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
];

// Util pohon kategori dipindah ke "@/lib/master-produk/category-tree".
