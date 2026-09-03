import { NextResponse } from "next/server";
import { adminPasswordConfigured } from "@/lib/admin-auth";
import { usingCloudStore } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    authRequired: adminPasswordConfigured() || process.env.NODE_ENV === "production",
    cloudStore: usingCloudStore(),
  });
}
