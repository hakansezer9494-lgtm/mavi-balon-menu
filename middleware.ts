import { NextResponse, type NextRequest } from "next/server";
import {
  clearGuestSessionCookieOptions,
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
  signGuestSession,
  signStaffPreview,
  STAFF_PREVIEW_COOKIE,
  staffPreviewCookieOptions,
  verifyGuestSession,
  verifyStaffPreview,
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

  if (isStaffPath(pathname) || pathname.startsWith("/qr-gerekli")) {
    return NextResponse.next();
  }

  // Guest menu (/) — QR session or staff preview (from portal).
  if (pathname === "/") {
    const previewFlag = request.nextUrl.searchParams.get("preview");
    const wantsStaffPreview =
      previewFlag === "1" ||
      previewFlag === "staff" ||
      previewFlag === "yonetici";

    if (wantsStaffPreview) {
      const token = await signStaffPreview();
      const clean = request.nextUrl.clone();
      clean.searchParams.delete("preview");
      const response = NextResponse.redirect(clean);
      response.cookies.set(
        STAFF_PREVIEW_COOKIE,
        token,
        staffPreviewCookieOptions()
      );
      return response;
    }

    const tableFromQr = sanitizeTableParam(
      request.nextUrl.searchParams.get("table")
    );
    const existingGuest = request.cookies.get(GUEST_SESSION_COOKIE)?.value;
    const guestSession = await verifyGuestSession(existingGuest);
    const staffPreview = await verifyStaffPreview(
      request.cookies.get(STAFF_PREVIEW_COOKIE)?.value
    );

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

    if (guestSession || staffPreview) {
      return NextResponse.next();
    }

    const blocked = NextResponse.redirect(new URL("/qr-gerekli", request.url));
    if (existingGuest) {
      blocked.cookies.set(
        GUEST_SESSION_COOKIE,
        "",
        clearGuestSessionCookieOptions()
      );
    }
    return blocked;
  }

  // Any other unknown guest path → QR gate
  return NextResponse.redirect(new URL("/qr-gerekli", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
