import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    password = "";
  }

  const probe = new Request(request.url, {
    headers: { "x-admin-password": password },
  });

  if (!isAdminAuthorized(probe)) {
    return NextResponse.json({ ok: false, error: "Şifre hatalı." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
