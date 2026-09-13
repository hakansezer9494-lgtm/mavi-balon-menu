/** Build the guest menu URL for a specific table QR. */
export function tableMenuUrl(origin: string, tableNumber: string) {
  const base = origin.replace(/\/$/, "");
  const table = tableNumber.trim();
  const url = new URL(base || "http://127.0.0.1:43123");
  url.searchParams.set("table", table);
  return url.toString();
}

export function sanitizeTableParam(value: string | null | undefined) {
  return String(value ?? "").trim();
}
