import { createClient, type Client } from "@libsql/client";
import { promises as fs } from "fs";
import path from "path";
import {
  getBusinessDayStart,
  isOrder,
  isWithinCurrentBusinessDay,
  normalizeOrder,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

const ordersFile = path.join(process.cwd(), "data", "orders.json");
let writeChain: Promise<unknown> = Promise.resolve();
let tursoClient: Client | null | undefined;
let lastError = "";

function cleanEnv(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

function tursoConfig() {
  let url = cleanEnv(process.env.TURSO_DATABASE_URL);
  const authToken = cleanEnv(process.env.TURSO_AUTH_TOKEN);
  if (!url || !authToken) return null;
  if (url.startsWith("https://")) {
    url = `libsql://${url.slice("https://".length)}`;
  }
  return { url, authToken };
}

function getTurso(): Client | null {
  if (tursoClient !== undefined) return tursoClient;
  const config = tursoConfig();
  if (!config) {
    tursoClient = null;
    return null;
  }
  tursoClient = createClient(config);
  return tursoClient;
}

async function ensureSchema(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      table_number TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS orders_created_at_idx
    ON orders (created_at DESC)
  `);
}

function rowToOrder(row: Record<string, unknown>): Order | null {
  try {
    const itemsJson = row.items_json;
    const items =
      typeof itemsJson === "string" ? JSON.parse(itemsJson) : [];
    const order = normalizeOrder({
      id: String(row.id ?? ""),
      tableNumber: String(row.table_number ?? ""),
      items: Array.isArray(items) ? items : [],
      total: Number(row.total) || 0,
      status: row.status as OrderStatus,
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(row.updated_at ?? ""),
    });
    return isOrder(order) ? order : null;
  } catch {
    return null;
  }
}

async function readFromFile(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ordersFile, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => (isOrder(row) ? normalizeOrder(row) : null))
      .filter((row): row is Order => row !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

async function writeToFile(orders: Order[]) {
  const job = writeChain.then(async () => {
    await fs.mkdir(path.dirname(ordersFile), { recursive: true });
    await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), "utf8");
  });
  writeChain = job.catch(() => undefined);
  await job;
}

export function getLastOrderStoreError() {
  return lastError;
}

async function purgeExpiredOrders(): Promise<void> {
  const cutoff = getBusinessDayStart().toISOString();
  const client = getTurso();
  if (client) {
    try {
      await ensureSchema(client);
      await client.execute({
        sql: `DELETE FROM orders WHERE created_at < ?`,
        args: [cutoff],
      });
      lastError = "";
      return;
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Eski siparişler silinemedi.";
      console.error("Order purge (Turso) failed:", lastError);
    }
  }

  const current = await readFromFile();
  const next = current.filter((order) =>
    isWithinCurrentBusinessDay(order.createdAt)
  );
  if (next.length !== current.length) {
    await writeToFile(next);
  }
}

export async function listOrders(): Promise<Order[]> {
  await purgeExpiredOrders();
  const client = getTurso();
  if (client) {
    try {
      await ensureSchema(client);
      const cutoff = getBusinessDayStart().toISOString();
      const result = await client.execute({
        sql: `SELECT id, table_number, items_json, total, status, created_at, updated_at
         FROM orders
         WHERE created_at >= ?
         ORDER BY created_at DESC
         LIMIT 200`,
        args: [cutoff],
      });
      lastError = "";
      return result.rows
        .map((row) => rowToOrder(row as Record<string, unknown>))
        .filter((row): row is Order => row !== null);
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Siparişler okunamadı.";
      console.error("Order list (Turso) failed:", lastError);
      return (await readFromFile()).filter((order) =>
        isWithinCurrentBusinessDay(order.createdAt)
      );
    }
  }
  return (await readFromFile()).filter((order) =>
    isWithinCurrentBusinessDay(order.createdAt)
  );
}

/** Tables that still have unpaid orders in the current business day. */
export async function listOccupiedTables(): Promise<string[]> {
  const orders = await listOrders();
  const occupied = new Set<string>();
  for (const order of orders) {
    if (order.status !== "paid" && order.tableNumber) {
      occupied.add(order.tableNumber);
    }
  }
  return [...occupied].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return a.localeCompare(b, "tr");
  });
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "updatedAt" | "status" | "total"> & {
    status?: OrderStatus;
  }
): Promise<Order> {
  const order = normalizeOrder({
    ...input,
    status: input.status ?? "new",
  });
  if (!order.tableNumber) {
    throw new Error("Masa numarası gerekli.");
  }
  if (order.items.length === 0) {
    throw new Error("Sepet boş.");
  }

  const openOrders = await listOrders();
  const tableBusy = openOrders.some(
    (existing) =>
      existing.tableNumber === order.tableNumber && existing.status !== "paid"
  );
  if (tableBusy) {
    throw new Error(
      "Bu masada ödenmemiş sipariş var. Ödenmeden yeni sipariş alınamaz."
    );
  }

  const client = getTurso();
  if (client) {
    try {
      await ensureSchema(client);
      await client.execute({
        sql: `
          INSERT INTO orders
            (id, table_number, items_json, total, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          order.id,
          order.tableNumber,
          JSON.stringify(order.items),
          order.total,
          order.status,
          order.createdAt,
          order.updatedAt,
        ],
      });
      lastError = "";
      return order;
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Sipariş kaydedilemedi.";
      throw new Error(lastError);
    }
  }

  const current = await readFromFile();
  await writeToFile([order, ...current]);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const updatedAt = new Date().toISOString();
  const client = getTurso();
  if (client) {
    try {
      await ensureSchema(client);
      await client.execute({
        sql: `UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`,
        args: [status, updatedAt, id],
      });
      const result = await client.execute({
        sql: `SELECT id, table_number, items_json, total, status, created_at, updated_at
              FROM orders WHERE id = ?`,
        args: [id],
      });
      lastError = "";
      const row = result.rows[0];
      return row ? rowToOrder(row as Record<string, unknown>) : null;
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Sipariş güncellenemedi.";
      throw new Error(lastError);
    }
  }

  const current = await readFromFile();
  const next = current.map((order) =>
    order.id === id ? { ...order, status, updatedAt } : order
  );
  await writeToFile(next);
  return next.find((order) => order.id === id) ?? null;
}

export async function getOrder(id: string): Promise<Order | null> {
  const client = getTurso();
  if (client) {
    try {
      await ensureSchema(client);
      const result = await client.execute({
        sql: `SELECT id, table_number, items_json, total, status, created_at, updated_at
              FROM orders WHERE id = ?`,
        args: [id],
      });
      const row = result.rows[0];
      return row ? rowToOrder(row as Record<string, unknown>) : null;
    } catch {
      // fall through
    }
  }
  const all = await readFromFile();
  return all.find((order) => order.id === id) ?? null;
}
