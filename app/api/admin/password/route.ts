import { NextResponse } from "next/server";
import {
  changeAdminPassword,
  isAdminAuthorized,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  let currentPassword = "";
  let newPassword = "";
  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    currentPassword = body.currentPassword ?? "";
    newPassword = body.newPassword ?? "";
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  try {
    await changeAdminPassword(currentPassword, newPassword);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Şifre değiştirilemedi.",
      },
      { status: 400 }
    );
  }
}
