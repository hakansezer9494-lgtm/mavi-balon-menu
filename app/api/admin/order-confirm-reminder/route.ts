import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  clampOrderConfirmReminderMinutes,
  DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES,
  ORDER_CONFIRM_REMINDER_OPTIONS,
} from "@/lib/order-confirm-reminder";
import {
  getOrderConfirmReminderMinutes,
  setOrderConfirmReminderMinutes,
} from "@/lib/order-confirm-reminder-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const minutes = await getOrderConfirmReminderMinutes();
  return NextResponse.json({
    minutes,
    defaultMinutes: DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES,
    options: ORDER_CONFIRM_REMINDER_OPTIONS,
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  let minutes = NaN;
  try {
    const body = (await request.json()) as { minutes?: unknown };
    minutes = Number(body.minutes);
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  if (!Number.isFinite(minutes)) {
    return NextResponse.json(
      { error: "Geçersiz hatırlatma süresi." },
      { status: 400 }
    );
  }

  try {
    const saved = await setOrderConfirmReminderMinutes(
      clampOrderConfirmReminderMinutes(minutes)
    );
    return NextResponse.json({ minutes: saved, ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Hatırlatma süresi kaydedilemedi.",
      },
      { status: 500 }
    );
  }
}
