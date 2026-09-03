import { createClient, type Client } from "@libsql/client";
import { promises as fs } from "fs";
import path from "path";
import { defaultMenu, isMenuData, normalizeMenu, type MenuData } from "@/lib/menu";

const menuFile = path.join(process.cwd(), "data", "menu.json");
let writeChain: Promise<unknown> = Promise.resolve();
let tursoClient: Client | null | undefined;
let lastCloudError = "";

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

async function ensureTursoSchema(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS menu_state (
      id INTEGER PRIMARY KEY,
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
  return Boolean(tursoConfig());
}

export function getLastCloudError() {
  return lastCloudError;
}

export async function readMenu(): Promise<MenuData> {
  const client = getTurso();
  if (client) {
    try {
      const fromCloud = await readFromTurso(client);
      if (fromCloud) {
        lastCloudError = "";
        return fromCloud;
      }
      const seeded = await writeToTurso(client, defaultMenu);
      lastCloudError = "";
      return seeded;
    } catch (error) {
      lastCloudError =
        error instanceof Error ? error.message : "Turso bağlantısı başarısız.";
      console.error("Turso read failed:", lastCloudError);
      return structuredClone(defaultMenu);
    }
  }

  try {
    const fromFile = await readFromFile();
    if (fromFile) return fromFile;
    return writeToFile(defaultMenu);
  } catch {
    return structuredClone(defaultMenu);
  }
}

export async function writeMenu(data: MenuData): Promise<MenuData> {
  const client = getTurso();
  if (client) {
    try {
      const saved = await writeToTurso(client, data);
      lastCloudError = "";
      return saved;
    } catch (error) {
      lastCloudError =
        error instanceof Error ? error.message : "Turso yazma başarısız.";
      throw error;
    }
  }
  return writeToFile(data);
}
