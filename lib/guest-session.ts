/** Signed guest QR session (Edge + Node compatible via Web Crypto). */

export const GUEST_SESSION_COOKIE = "mavi_guest_session";
export const GUEST_SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
export const GUEST_SESSION_TTL_SECONDS = 60 * 60;

type GuestSessionPayload = {
  t: string; // table / service id
  e: number; // expiresAt ms
  n: string; // nonce
};

function guestSessionSecret() {
  return (
    process.env.GUEST_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "mavi-balon-dev-guest-session"
  );
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < view.length; i += 1) {
    binary += String.fromCharCode(view[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function guestSessionCookieOptions(maxAgeSeconds = GUEST_SESSION_TTL_SECONDS) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function clearGuestSessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export async function signGuestSession(
  tableNumber: string,
  now = Date.now()
): Promise<string> {
  const table = String(tableNumber || "").trim();
  if (!table) {
    throw new Error("Masa gerekli.");
  }
  const payload: GuestSessionPayload = {
    t: table,
    e: now + GUEST_SESSION_TTL_MS,
    n: crypto.randomUUID(),
  };
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(guestSessionSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  return `${body}.${bytesToBase64Url(signature)}`;
}

export async function verifyGuestSession(
  token: string | null | undefined,
  now = Date.now()
): Promise<{ tableNumber: string; expiresAt: number } | null> {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const key = await hmacKey(guestSessionSecret());
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(body)
    );
    if (!ok) return null;

    const parsed = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body))
    ) as Partial<GuestSessionPayload>;
    const tableNumber = String(parsed.t ?? "").trim();
    const expiresAt = Number(parsed.e);
    if (!tableNumber || !Number.isFinite(expiresAt) || expiresAt <= now) {
      return null;
    }
    return { tableNumber, expiresAt };
  } catch {
    return null;
  }
}

export function readGuestSessionCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === GUEST_SESSION_COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/** Staff menu preview from /portal (browse without table QR). */
export const STAFF_PREVIEW_COOKIE = "mavi_staff_preview";
export const STAFF_PREVIEW_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
export const STAFF_PREVIEW_TTL_SECONDS = 8 * 60 * 60;

type StaffPreviewPayload = {
  s: "staff";
  e: number;
  n: string;
};

export function staffPreviewCookieOptions(
  maxAgeSeconds = STAFF_PREVIEW_TTL_SECONDS
) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function clearStaffPreviewCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export async function signStaffPreview(now = Date.now()): Promise<string> {
  const payload: StaffPreviewPayload = {
    s: "staff",
    e: now + STAFF_PREVIEW_TTL_MS,
    n: crypto.randomUUID(),
  };
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(guestSessionSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  return `${body}.${bytesToBase64Url(signature)}`;
}

export async function verifyStaffPreview(
  token: string | null | undefined,
  now = Date.now()
): Promise<{ expiresAt: number } | null> {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const key = await hmacKey(guestSessionSecret());
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(body)
    );
    if (!ok) return null;

    const parsed = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body))
    ) as Partial<StaffPreviewPayload>;
    const expiresAt = Number(parsed.e);
    if (parsed.s !== "staff" || !Number.isFinite(expiresAt) || expiresAt <= now) {
      return null;
    }
    return { expiresAt };
  } catch {
    return null;
  }
}
