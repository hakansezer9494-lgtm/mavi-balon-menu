import { promises as fs } from "fs";
import path from "path";
import { defaultMenu, isMenuData, normalizeMenu, type MenuData } from "@/lib/menu";

const menuFile = path.join(process.cwd(), "data", "menu.json");

let writeChain: Promise<unknown> = Promise.resolve();

export async function readMenu(): Promise<MenuData> {
  try {
    const raw = await fs.readFile(menuFile, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (isMenuData(parsed)) {
      return normalizeMenu(parsed);
    }
  } catch {
    // first run or unreadable file
  }
  return writeMenu(defaultMenu);
}

export async function writeMenu(data: MenuData): Promise<MenuData> {
  const normalized = normalizeMenu(data);
  const job = writeChain.then(async () => {
    await fs.mkdir(path.dirname(menuFile), { recursive: true });
    await fs.writeFile(menuFile, JSON.stringify(normalized, null, 2), "utf8");
    return normalized;
  });
  writeChain = job.catch(() => undefined);
  return job;
}
