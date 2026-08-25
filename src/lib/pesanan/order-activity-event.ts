"use client";

export const ORDER_ACTIVITY_CHANGED_EVENT = "cilupbah:order-activity-changed";

const STORAGE_KEY = "cilupbah:order-activity-changed";

export type OrderActivityChangedEvent = {
  orderIds: string[];
  occurredAt: string;
};

type Listener = (event: OrderActivityChangedEvent) => void;

function parseEvent(value: string | null): OrderActivityChangedEvent | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("orderIds" in parsed) ||
      !Array.isArray(parsed.orderIds)
    ) {
      return null;
    }

    const orderIds = parsed.orderIds.filter(
      (orderId): orderId is string => typeof orderId === "string",
    );

    return {
      orderIds,
      occurredAt:
        "occurredAt" in parsed && typeof parsed.occurredAt === "string"
          ? parsed.occurredAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function notifyOrderActivityChanged(orderIds: string[]): void {
  if (typeof window === "undefined" || orderIds.length === 0) return;

  const event: OrderActivityChangedEvent = {
    orderIds: [...new Set(orderIds)],
    occurredAt: new Date().toISOString(),
  };

  window.dispatchEvent(
    new CustomEvent<OrderActivityChangedEvent>(ORDER_ACTIVITY_CHANGED_EVENT, {
      detail: event,
    }),
  );

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The backend remains the source of truth if browser storage is unavailable.
  }
}

export function subscribeToOrderActivityChanged(
  listener: Listener,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent<OrderActivityChangedEvent>).detail;
    if (detail?.orderIds?.length) listener(detail);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const parsed = parseEvent(event.newValue);
    if (parsed?.orderIds.length) listener(parsed);
  };

  window.addEventListener(ORDER_ACTIVITY_CHANGED_EVENT, onCustomEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(ORDER_ACTIVITY_CHANGED_EVENT, onCustomEvent);
    window.removeEventListener("storage", onStorage);
  };
}
