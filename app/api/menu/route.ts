import { NextResponse } from "next/server";
import { isMenuData } from "@/lib/menu";
import { readMenu, writeMenu } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const menu = await readMenu();
  return NextResponse.json(menu);
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  if (!isMenuData(body)) {
    return NextResponse.json({ error: "Menü biçimi hatalı." }, { status: 400 });
  }

  const saved = await writeMenu(body);
  return NextResponse.json(saved);
}
