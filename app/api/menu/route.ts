import { NextResponse } from "next/server";
import { adminPasswordConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { isMenuData } from "@/lib/menu";
import {
  getLastCloudError,
  readMenu,
  usingCloudStore,
  writeMenu,
} from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menu = await readMenu();
    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Menü okunamadı.",
        detail: error instanceof Error ? error.message : "unknown",
        cloudStore: usingCloudStore(),
        cloudError: getLastCloudError(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json(
      {
        error: adminPasswordConfigured()
          ? "Yönetim şifresi gerekli."
          : "Canlı ortamda ADMIN_PASSWORD tanımlayın.",
      },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  if (!isMenuData(body)) {
    return NextResponse.json({ error: "Menü biçimi hatalı." }, { status: 400 });
  }

  try {
    const saved = await writeMenu(body);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Menü kaydedilemedi. Turso URL ve read-write token’ı kontrol edin.",
        detail: error instanceof Error ? error.message : "unknown",
        cloudError: getLastCloudError(),
      },
      { status: 500 }
    );
  }
}
