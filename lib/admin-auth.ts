import { timingSafeEqual } from "crypto";

export function adminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function isAdminAuthorized(request: Request) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) {
    // Local/dev without a password stays open. Production must set ADMIN_PASSWORD.
    return process.env.NODE_ENV !== "production";
  }

  const provided =
    request.headers.get("x-admin-password") ??
    new URL(request.url).searchParams.get("password") ??
    "";

  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}
