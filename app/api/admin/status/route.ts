import { NextResponse } from "next/server";
import { adminPasswordConfigured } from "@/lib/admin-auth";
import { MENU_CATALOG_REVISION } from "@/lib/menu";
import {
  getLastCloudError,
  readMenu,
  usingCloudStore,
} from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  let readable = false;
  let cloudError = "";
  let catalogRevision: number | null = null;
  try {
    const menu = await readMenu();
    readable = true;
    cloudError = getLastCloudError();
    catalogRevision = menu.catalogRevision ?? 0;
  } catch (error) {
    cloudError = error instanceof Error ? error.message : "unknown";
  }

  return NextResponse.json({
    authRequired:
      (await adminPasswordConfigured()) || process.env.NODE_ENV === "production",
    cloudStore: usingCloudStore(),
    readable,
    cloudError: cloudError || null,
    catalogRevision,
    packageCatalogRevision: MENU_CATALOG_REVISION,
  });
}
