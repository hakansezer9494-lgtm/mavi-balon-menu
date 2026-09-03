import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getAppSetting, setAppSetting } from "@/lib/menu-store";

const PASSWORD_HASH_KEY = "admin_password_hash";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPasswordHash(password: string, stored: string) {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function safeEqualText(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function getStoredAdminPasswordHash() {
  return getAppSetting(PASSWORD_HASH_KEY);
}

export async function setStoredAdminPasswordHash(password: string) {
  await setAppSetting(PASSWORD_HASH_KEY, hashPassword(password));
}

export async function verifyAdminPassword(password: string) {
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (envPassword && safeEqualText(password, envPassword)) {
    return true;
  }

  const storedHash = await getStoredAdminPasswordHash();
  if (storedHash) {
    return verifyPasswordHash(password, storedHash);
  }

  if (!envPassword) {
    return process.env.NODE_ENV !== "production";
  }
  return false;
}

export async function adminPasswordConfigured() {
  if (await getStoredAdminPasswordHash()) return true;
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export async function isAdminAuthorized(request: Request) {
  const provided =
    request.headers.get("x-admin-password") ??
    new URL(request.url).searchParams.get("password") ??
    "";
  return verifyAdminPassword(provided);
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
) {
  const ok = await verifyAdminPassword(currentPassword);
  if (!ok) {
    throw new Error("Mevcut şifre hatalı.");
  }
  if (newPassword.trim().length < 6) {
    throw new Error("Yeni şifre en az 6 karakter olmalı.");
  }
  await setStoredAdminPasswordHash(newPassword.trim());
}
