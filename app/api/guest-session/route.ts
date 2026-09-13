import { NextResponse } from "next/server";
import {
  clearGuestSessionCookieOptions,
  GUEST_SESSION_COOKIE,
  readGuestSessionCookie,
  verifyGuestSession,
} from "@/lib/guest-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = readGuestSessionCookie(request.headers.get("cookie"));
  const session = await verifyGuestSession(token);
  if (!session) {
    return NextResponse.json({ active: false }, { status: 401 });
  }
  return NextResponse.json({
    active: true,
    tableNumber: session.tableNumber,
    expiresAt: session.expiresAt,
  });
}

/** End guest session (after order or manual logout). */
export async function DELETE() {
  const response = NextResponse.json({ ok: true, active: false });
  response.cookies.set(GUEST_SESSION_COOKIE, "", clearGuestSessionCookieOptions());
  return response;
}
