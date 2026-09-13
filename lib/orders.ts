export type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  note?: string;
};

export type OrderStatus = "new" | "sent" | "paid";

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
    (status === "new" || status === "sent" || status === "paid") &&
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
    input.status === "sent" || input.status === "paid" ? input.status : "new";

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
