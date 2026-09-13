import { NextResponse, type NextRequest } from "next/server";
import {
  clearGuestSessionCookieOptions,
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
  signGuestSession,
  verifyGuestSession,
} from "@/lib/guest-session";
import { sanitizeTableParam } from "@/lib/table-qr";

function isStaffPath(pathname: string) {
  return (
    pathname.startsWith("/yonetim") ||
    pathname.startsWith("/portal") ||
    pathname === "/qr" ||
    pathname.startsWith("/qr/") ||
    pathname === "/qr-gerekli" ||
    pathname.startsWith("/qr-gerekli/")
  );
}

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.webmanifest"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isStaffPath(pathname)) {
    return NextResponse.next();
  }

  // Guest menu (/) — QR session required.
  if (pathname === "/") {
    const tableFromQr = sanitizeTableParam(
      request.nextUrl.searchParams.get("table")
    );
    const existing = request.cookies.get(GUEST_SESSION_COOKIE)?.value;
    const session = await verifyGuestSession(existing);

    if (tableFromQr) {
      const token = await signGuestSession(tableFromQr);
      const response = NextResponse.next();
      response.cookies.set(
        GUEST_SESSION_COOKIE,
        token,
        guestSessionCookieOptions()
      );
      return response;
    }

    if (session) {
      return NextResponse.next();
    }

    const blocked = NextResponse.redirect(new URL("/qr-gerekli", request.url));
    if (existing) {
      blocked.cookies.set(
        GUEST_SESSION_COOKIE,
        "",
        clearGuestSessionCookieOptions()
      );
    }
    return blocked;
  }

  // Any other unknown guest path → QR gate
  if (!pathname.startsWith("/qr-gerekli")) {
    return NextResponse.redirect(new URL("/qr-gerekli", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
