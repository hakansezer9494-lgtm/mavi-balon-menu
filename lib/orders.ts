export type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  note?: string;
};

export type OrderStatus = "new" | "sent" | "paid" | "cancelled";

export type Order = {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

/** Default selectable tables for guests. Empty selection until user picks one. */
export const DEFAULT_TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) =>
  String(i + 1)
);

export function orderItemsTotal(items: OrderItem[]) {
  return items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
}

/** Same product + note lines stack; different notes stay separate. */
export function mergeOrderItems(
  existing: OrderItem[],
  incoming: OrderItem[]
): OrderItem[] {
  const map = new Map<string, OrderItem>();
  const keyOf = (item: OrderItem) =>
    `${item.productId}::${(item.note || "").trim()}`;

  for (const item of [...existing, ...incoming]) {
    const key = keyOf(item);
    const prev = map.get(key);
    if (prev) {
      map.set(key, {
        ...prev,
        quantity: prev.quantity + item.quantity,
        unitPrice: item.unitPrice || prev.unitPrice,
        name: item.name || prev.name,
      });
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
}

export function isOrderItem(value: unknown): value is OrderItem {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.productId === "string" &&
    typeof row.name === "string" &&
    typeof row.unitPrice === "number" &&
    Number.isFinite(row.unitPrice) &&
    typeof row.quantity === "number" &&
    Number.isFinite(row.quantity) &&
    row.quantity > 0
  );
}

export function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  const status = row.status;
  return (
    typeof row.id === "string" &&
    typeof row.tableNumber === "string" &&
    Array.isArray(row.items) &&
    row.items.every(isOrderItem) &&
    typeof row.total === "number" &&
    (status === "new" ||
      status === "sent" ||
      status === "paid" ||
      status === "cancelled") &&
    typeof row.createdAt === "string" &&
    typeof row.updatedAt === "string"
  );
}

export function normalizeOrder(input: Partial<Order> & { items: OrderItem[] }): Order {
  const items = input.items
    .filter(isOrderItem)
    .map((item) => ({
      productId: item.productId,
      name: item.name.trim(),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      note: item.note?.trim() || undefined,
    }))
    .filter((item) => item.name && item.quantity > 0);

  const now = new Date().toISOString();
  const status: OrderStatus =
    input.status === "sent" ||
    input.status === "paid" ||
    input.status === "cancelled"
      ? input.status
      : "new";

  return {
    id: String(input.id || crypto.randomUUID()),
    tableNumber: String(input.tableNumber || "").trim(),
    items,
    total: orderItemsTotal(items),
    status,
    createdAt: String(input.createdAt || now),
    updatedAt: String(input.updatedAt || now),
  };
}

function istanbulParts(date: Date) {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
  };
}

/** Convert an Istanbul wall-clock time to a UTC Date. */
function istanbulWallTimeToDate(
  year: number,
  month: number,
  day: number,
  hour: number
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, 0, 0);
  const shown = istanbulParts(new Date(utcGuess));
  const shownAsUtc = Date.UTC(
    shown.year,
    shown.month - 1,
    shown.day,
    shown.hour,
    0,
    0
  );
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, 0, 0);
  return new Date(utcGuess + (desiredAsUtc - shownAsUtc));
}

/**
 * Retention window for orders (Istanbul):
 * - Before 03:00: still the previous service day (from that day's 08:00).
 * - From 03:00 onward: previous day is cleared; keep orders since today's 03:00
 *   so early-morning tickets are not wiped before the 08:00 service open.
 */
export function getBusinessDayStart(now = new Date()): Date {
  const parts = istanbulParts(now);
  let year = parts.year;
  let month = parts.month;
  let day = parts.day;

  if (parts.hour < 3) {
    const previous = istanbulWallTimeToDate(year, month, day, 12);
    previous.setUTCDate(previous.getUTCDate() - 1);
    const prevParts = istanbulParts(previous);
    year = prevParts.year;
    month = prevParts.month;
    day = prevParts.day;
    return istanbulWallTimeToDate(year, month, day, 8);
  }

  // Overnight clear at 03:00 — retain anything placed after that.
  return istanbulWallTimeToDate(year, month, day, 3);
}

export function isWithinCurrentBusinessDay(
  isoDate: string,
  now = new Date()
): boolean {
  const created = Date.parse(isoDate);
  if (!Number.isFinite(created)) return false;
  return created >= getBusinessDayStart(now).getTime();
}
