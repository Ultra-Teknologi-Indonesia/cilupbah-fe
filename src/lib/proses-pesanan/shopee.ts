export interface ShopeeInstantCandidate {
  source?: string | null;
  shippingProvider?: string | null;
  shippingType?: string | null;
  isInstant?: boolean;
}

const INSTANT_KEYWORDS = /instant|instan|same[- ]?day|sameday/i;

export function isShopeeInstantOrSameDay(order: ShopeeInstantCandidate): boolean {
  const source = (order.source ?? "").toLowerCase();
  const provider = (order.shippingProvider ?? "").toLowerCase();

  const isShopee = source === "shopee"
    || provider.includes("shopee")
    || provider.includes("spx");
  if (!isShopee) return false;

  const type = (order.shippingType ?? "").toUpperCase();
  if (type === "INSTANT" || type === "SAME_DAY" || type === "SAMEDAY") return true;

  if (INSTANT_KEYWORDS.test(`${order.shippingType ?? ""} ${order.shippingProvider ?? ""}`)) {
    return true;
  }

  return Boolean(order.isInstant);
}

export function shopeeInstantLabel(order: ShopeeInstantCandidate): string {
  const type = (order.shippingType ?? "").toUpperCase();
  if (type === "SAME_DAY" || type === "SAMEDAY" || /same[- ]?day/i.test(order.shippingProvider ?? "")) {
    return "SAME DAY";
  }
  return "INSTANT";
}
