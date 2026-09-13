import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  isPaidOrderRetentionDays,
  PAID_ORDER_RETENTION_OPTIONS,
} from "@/lib/order-retention";
import {
  getPaidOrderRetentionDays,
  setPaidOrderRetentionDays,
} from "@/lib/order-retention-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const days = await getPaidOrderRetentionDays();
  return NextResponse.json({
    days,
    options: PAID_ORDER_RETENTION_OPTIONS,
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  let days = NaN;
  try {
    const body = (await request.json()) as { days?: unknown };
    days = Number(body.days);
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  if (!isPaidOrderRetentionDays(days)) {
    return NextResponse.json(
      { error: "Geçersiz saklama süresi." },
      { status: 400 }
    );
  }

  try {
    await setPaidOrderRetentionDays(days);
    return NextResponse.json({ days, ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Saklama süresi kaydedilemedi.",
      },
      { status: 500 }
    );
  }
}
