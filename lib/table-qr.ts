/** Guest menu URL for a table / service QR. */

export const TAKEAWAY_TABLE_ID = "ayakta-paket";
export const TAKEAWAY_TABLE_LABEL = "Ayakta/Paket";

export function sanitizeTableParam(value: string | null | undefined) {
  return String(value ?? "").trim();
}

export function isTakeawayTable(table: string | null | undefined) {
  return sanitizeTableParam(table).toLowerCase() === TAKEAWAY_TABLE_ID;
}

/** Human label for QR pickers and kitchen tickets. */
export function tableDisplayName(table: string) {
  const value = sanitizeTableParam(table);
  if (isTakeawayTable(value)) return TAKEAWAY_TABLE_LABEL;
  return value ? `Masa ${value}` : "";
}

export function tableMenuUrl(origin: string, tableNumber: string) {
  const base = origin.replace(/\/$/, "");
  const table = sanitizeTableParam(tableNumber);
  const url = new URL(base || "http://127.0.0.1:43123");
  url.searchParams.set("table", table);
  return url.toString();
}

/** QR selector options: Ayakta/Paket first, then numbered tables. */
export function qrTableOptions(tables: string[]) {
  const numbered = tables
    .map((table) => sanitizeTableParam(table))
    .filter((table) => table && !isTakeawayTable(table));
  return [TAKEAWAY_TABLE_ID, ...numbered];
}

export function sanitizeCustomerName(value: string | null | undefined) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/** Require at least two words (ad + soyad) in one field. */
export function isValidCustomerName(value: string | null | undefined) {
  const name = sanitizeCustomerName(value);
  return name.split(" ").filter(Boolean).length >= 2;
}
