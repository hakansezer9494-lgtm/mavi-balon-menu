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
  await client.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
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

async function packagedMenu(): Promise<MenuData> {
  const fromFile = await readFromFile();
  if (fromFile) return fromFile;
  return structuredClone(defaultMenu);
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
      const seed = await packagedMenu();
      const seeded = await writeToTurso(client, seed);
      lastCloudError = "";
      return seeded;
    } catch (error) {
      lastCloudError =
        error instanceof Error ? error.message : "Turso bağlantısı başarısız.";
      console.error("Turso read failed:", lastCloudError);
      return await packagedMenu();
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

const settingsFile = path.join(process.cwd(), "data", "settings.json");

async function readSettingsFile(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(settingsFile, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).filter(
          ([, value]) => typeof value === "string"
        )
      ) as Record<string, string>;
    }
  } catch {
    // missing
  }
  return {};
}

async function writeSettingsFile(settings: Record<string, string>) {
  await fs.mkdir(path.dirname(settingsFile), { recursive: true });
  await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf8");
}

export async function getAppSetting(key: string): Promise<string | null> {
  const client = getTurso();
  if (client) {
    try {
      await ensureTursoSchema(client);
      const result = await client.execute({
        sql: "SELECT value FROM app_settings WHERE key = ?",
        args: [key],
      });
      const value = result.rows[0]?.value;
      return typeof value === "string" ? value : null;
    } catch (error) {
      lastCloudError =
        error instanceof Error ? error.message : "Turso ayar okunamadı.";
      return null;
    }
  }
  const settings = await readSettingsFile();
  return settings[key] ?? null;
}

export async function setAppSetting(key: string, value: string) {
  const client = getTurso();
  if (client) {
    await ensureTursoSchema(client);
    await client.execute({
      sql: `
        INSERT INTO app_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
      args: [key, value],
    });
    return;
  }
  const settings = await readSettingsFile();
  settings[key] = value;
  await writeSettingsFile(settings);
}
