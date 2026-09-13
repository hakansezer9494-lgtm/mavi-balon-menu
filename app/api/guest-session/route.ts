import { NextResponse } from "next/server";
import {
  clearGuestSessionCookieOptions,
  GUEST_SESSION_COOKIE,
  readGuestSessionCookie,
  STAFF_PREVIEW_COOKIE,
  verifyGuestSession,
  verifyStaffPreview,
} from "@/lib/guest-session";

export const dynamic = "force-dynamic";

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");
  const guestToken = readGuestSessionCookie(cookie);
  const guest = await verifyGuestSession(guestToken);
  if (guest) {
    return NextResponse.json({
      active: true,
      staffPreview: false,
      tableNumber: guest.tableNumber,
      expiresAt: guest.expiresAt,
    });
  }

  const staff = await verifyStaffPreview(readCookie(cookie, STAFF_PREVIEW_COOKIE));
  if (staff) {
    return NextResponse.json({
      active: true,
      staffPreview: true,
      tableNumber: "",
      expiresAt: staff.expiresAt,
    });
  }

  return NextResponse.json({ active: false, staffPreview: false }, { status: 401 });
}

/** End guest session (after order or manual logout). */
export async function DELETE() {
  const response = NextResponse.json({ ok: true, active: false });
  response.cookies.set(GUEST_SESSION_COOKIE, "", clearGuestSessionCookieOptions());
  return response;
}
