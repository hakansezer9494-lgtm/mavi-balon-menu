import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  clampGuestSessionTtlMinutes,
  DEFAULT_GUEST_SESSION_TTL_MINUTES,
  GUEST_SESSION_TTL_OPTIONS,
} from "@/lib/guest-session-ttl";
import {
  getGuestSessionTtlMinutes,
  setGuestSessionTtlMinutes,
} from "@/lib/guest-session-ttl-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const minutes = await getGuestSessionTtlMinutes();
  return NextResponse.json({
    minutes,
    defaultMinutes: DEFAULT_GUEST_SESSION_TTL_MINUTES,
    options: GUEST_SESSION_TTL_OPTIONS,
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
      { error: "Geçersiz oturum süresi." },
      { status: 400 }
    );
  }

  try {
    const saved = await setGuestSessionTtlMinutes(
      clampGuestSessionTtlMinutes(minutes)
    );
    return NextResponse.json({ minutes: saved, ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Oturum süresi kaydedilemedi.",
      },
      { status: 500 }
    );
  }
}
