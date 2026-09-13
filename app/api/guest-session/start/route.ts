import { NextResponse } from "next/server";
import {
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
  signGuestSession,
} from "@/lib/guest-session";
import { getGuestSessionTtlMinutes } from "@/lib/guest-session-ttl-store";
import { sanitizeTableParam } from "@/lib/table-qr";

export const dynamic = "force-dynamic";

/**
 * QR ile gelen misafir oturumunu ayarlanan dakika TTL ile kurar
 * ve menüye yönlendirir (middleware Edge'de ayar okuyamaz).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const table = sanitizeTableParam(url.searchParams.get("table"));
  if (!table) {
    return NextResponse.redirect(new URL("/qr-gerekli", request.url));
  }

  const minutes = await getGuestSessionTtlMinutes();
  const ttlMs = minutes * 60_000;
  const ttlSeconds = minutes * 60;
  const token = await signGuestSession(table, Date.now(), ttlMs);

  const destination = new URL("/", request.url);
  destination.searchParams.set("table", table);
  const response = NextResponse.redirect(destination);
  response.cookies.set(
    GUEST_SESSION_COOKIE,
    token,
    guestSessionCookieOptions(ttlSeconds)
  );
  return response;
}
