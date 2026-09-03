import { NextResponse } from "next/server";
import { adminPasswordConfigured } from "@/lib/admin-auth";
import {
  getLastCloudError,
  readMenu,
  usingCloudStore,
} from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  let readable = false;
  let cloudError = "";
  try {
    await readMenu();
    readable = true;
    cloudError = getLastCloudError();
  } catch (error) {
    cloudError = error instanceof Error ? error.message : "unknown";
  }

  return NextResponse.json({
    authRequired: adminPasswordConfigured() || process.env.NODE_ENV === "production",
    cloudStore: usingCloudStore(),
    readable,
    cloudError: cloudError || null,
  });
}
