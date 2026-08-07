

const BASE_LABELS: Record<string, string> = {
  name: "Nama Produk",
  sku: "SKU Produk",
  category_id: "Kategori",
  description: "Deskripsi",
  weight: "Berat",
  brand: "Merek",
  length: "Panjang Paket",
  width: "Lebar Paket",
  height: "Tinggi Paket",
  indent_days: "Lama Indent",
  sales_account_id: "Akun Penjualan",
  sales_return_account_id: "Akun Retur Penjualan",
  inventory_account_id: "Akun Persediaan",
  cogs_account_id: "Akun HPP",
  media: "Foto/Video Produk",
};

const SUB_LABELS: Record<string, string> = {
  sku: "SKU",
  sell_price: "Harga Jual",
  weight: "Berat",
  barcode: "Barcode",
  value: "Nilai",
  text_value: "Nilai",
  attribute_id: "Jenis",
  name: "Nama",
  url: "Berkas",
  media_uuid: "Berkas",
};

const GROUP_LABELS: Record<string, string> = {
  variants: "Varian",
  media: "Foto/Video",
  variation_types: "Jenis Varian",
  specifications: "Spesifikasi",
};

const isIndex = (s?: string) => !!s && /^\d+$/.test(s);

export function humanizeServerErrorKey(key: string): string {
  if (BASE_LABELS[key]) return BASE_LABELS[key];

  const parts = key.split(".");
  const group = GROUP_LABELS[parts[0]];

  if (group && isIndex(parts[1])) {
    const idx = Number(parts[1]) + 1;

    if (parts.length === 2) return `${group} #${idx}`;

    if (parts[0] === "variants" && parts[2] === "options" && isIndex(parts[3])) {
      const optIdx = Number(parts[3]) + 1;
      const leaf = parts[4] ? (SUB_LABELS[parts[4]] ?? parts[4]) : null;
      return `Varian #${idx} · Opsi #${optIdx}${leaf ? ` (${leaf})` : ""}`;
    }

    const leaf = SUB_LABELS[parts[2]] ?? parts[2];
    return `${group} #${idx}: ${leaf}`;
  }

  return key.replace(/_/g, " ").replace(/\./g, " › ");
}

function mapToRhfPath(key: string, singleVariant: boolean): string | null {
  const direct: Record<string, string> = {
    name: "name",
    sku: "sku",
    category_id: "category",
    description: "description",
    weight: "weight",
  };
  if (direct[key]) return direct[key];

  const parts = key.split(".");

  if (parts[0] === "variants" && isIndex(parts[1])) {
    const i = parts[1];
    const leaf = parts[2];

    if (singleVariant && i === "0") {
      if (leaf === "sku") return "sku";
      if (leaf === "sell_price") return "sellPrice";
      if (leaf === "weight") return "weight";
    }

    if (leaf === "sku") return `variants.${i}.sku`;
    if (leaf === "sell_price") return `variants.${i}.sellPrice`;
    if (leaf === "weight") return `variants.${i}.weight`;
    if (leaf === "options" && isIndex(parts[3])) {
      return `variants.${i}.options.${parts[3]}.value`;
    }
    return `variants.${i}.sku`;
  }

  if (parts[0] === "variation_types" && isIndex(parts[1])) {
    return `variationTypes.${parts[1]}.name`;
  }

  if (parts[0] === "specifications" && isIndex(parts[1])) {
    return `specifications.${parts[1]}.value`;
  }

  return null;
}

export interface ServerErrorItem {
  label: string;
  message: string;
}

export interface HumanizedServerErrors {
  alertItems: ServerErrorItem[];
  fieldErrors: { path: string; message: string }[];
  firstPath?: string;
}

export function humanizeServerErrors(
  errors: Record<string, string[]> | undefined,
  opts: { singleVariant: boolean },
): HumanizedServerErrors {
  const alertItems: ServerErrorItem[] = [];
  const fieldErrors: { path: string; message: string }[] = [];
  let firstPath: string | undefined;

  if (!errors || typeof errors !== "object") {
    return { alertItems, fieldErrors };
  }

  for (const [key, messages] of Object.entries(errors)) {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    if (!message) continue;

    alertItems.push({ label: humanizeServerErrorKey(key), message });

    const path = mapToRhfPath(key, opts.singleVariant);
    if (path) {
      fieldErrors.push({ path, message });
      firstPath ??= path;
    }
  }

  return { alertItems, fieldErrors, firstPath };
}
