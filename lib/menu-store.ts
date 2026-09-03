import { createClient, type Client } from "@libsql/client";
import { promises as fs } from "fs";
import path from "path";
import { defaultMenu, isMenuData, normalizeMenu, type MenuData } from "@/lib/menu";

const menuFile = path.join(process.cwd(), "data", "menu.json");
let writeChain: Promise<unknown> = Promise.resolve();
let tursoClient: Client | null | undefined;

function getTurso(): Client | null {
  if (tursoClient !== undefined) return tursoClient;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    tursoClient = null;
    return null;
  }
  tursoClient = createClient({ url, authToken });
  return tursoClient;
}

async function ensureTursoSchema(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS menu_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

async function readFromTurso(client: Client): Promise<MenuData | null> {
  await ensureTursoSchema(client);
  const result = await client.execute("SELECT payload FROM menu_state WHERE id = 1");
  const payload = result.rows[0]?.payload;
  if (typeof payload !== "string") return null;
  const parsed = JSON.parse(payload) as unknown;
  if (!isMenuData(parsed)) return null;
  return normalizeMenu(parsed);
}

async function writeToTurso(client: Client, data: MenuData): Promise<MenuData> {
  const normalized = normalizeMenu(data);
  await ensureTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO menu_state (id, payload, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `,
    args: [JSON.stringify(normalized), new Date().toISOString()],
  });
  return normalized;
}

async function readFromFile(): Promise<MenuData | null> {
  try {
    const raw = await fs.readFile(menuFile, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (isMenuData(parsed)) return normalizeMenu(parsed);
  } catch {
    // missing file
  }
  return null;
}

async function writeToFile(data: MenuData): Promise<MenuData> {
  const normalized = normalizeMenu(data);
  const job = writeChain.then(async () => {
    await fs.mkdir(path.dirname(menuFile), { recursive: true });
    await fs.writeFile(menuFile, JSON.stringify(normalized, null, 2), "utf8");
    return normalized;
  });
  writeChain = job.catch(() => undefined);
  return job;
}

export function usingCloudStore() {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export async function readMenu(): Promise<MenuData> {
  const client = getTurso();
  if (client) {
    const fromCloud = await readFromTurso(client);
    if (fromCloud) return fromCloud;
    return writeToTurso(client, defaultMenu);
  }

  const fromFile = await readFromFile();
  if (fromFile) return fromFile;
  return writeToFile(defaultMenu);
}

export async function writeMenu(data: MenuData): Promise<MenuData> {
  const client = getTurso();
  if (client) {
    return writeToTurso(client, data);
  }
  return writeToFile(data);
}
