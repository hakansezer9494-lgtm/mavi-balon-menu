import { getAppSetting, setAppSetting } from "@/lib/menu-store";
import {
  DEFAULT_PAID_ORDER_RETENTION_DAYS,
  isPaidOrderRetentionDays,
  type PaidOrderRetentionDays,
} from "@/lib/order-retention";

const RETENTION_KEY = "paid_order_retention_days";

export async function getPaidOrderRetentionDays(): Promise<PaidOrderRetentionDays> {
  const raw = await getAppSetting(RETENTION_KEY);
  const parsed = Number(raw);
  return isPaidOrderRetentionDays(parsed)
    ? parsed
    : DEFAULT_PAID_ORDER_RETENTION_DAYS;
}

export async function setPaidOrderRetentionDays(days: number) {
  if (!isPaidOrderRetentionDays(days)) {
    throw new Error("Geçersiz saklama süresi.");
  }
  await setAppSetting(RETENTION_KEY, String(days));
}
